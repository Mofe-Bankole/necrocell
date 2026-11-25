/*
 * src/log.c — nc_log: NCLG packet encoding + formatting.
 *
 * This file has no platform #ifdef.  Socket I/O is delegated to
 * backends/{sdl,ps3}/net_*.c via net_open/net_send/net_close.
 *
 * NCLG wire layout (all multi-byte fields big-endian):
 *   [0..3]  magic 'N','C','L','G'
 *   [4]     version 1
 *   [5]     level (NcLogLevel)
 *   [6..7]  app_len (u16 BE)
 *   [8..15] t_us (u64 BE, monotonic microseconds)
 *   [16..17] msg_len (u16 BE)
 *   [18 .. 18+app_len-1]            app_name bytes (no NUL)
 *   [18+app_len .. 18+app_len+msg_len-1]  message bytes (no NUL)
 */

#include "../include/nc/log.h"

#include <stdio.h>
#include <stdarg.h>
#include <string.h>
#include <stdint.h>

/* Provided by the backend net_*.c */
int  net_open(const char *host, unsigned short port);
int  net_send(const unsigned char *buf, int len);
void net_close(void);

/* Provided by sys_*.c (monotonic clock) */
uint64_t sys_time_us(void);

#define MAX_APP_NAME 255
#define MAX_MSG      511
#define MAX_PKT      (18 + MAX_APP_NAME + MAX_MSG + 2)

static char     g_app_name[MAX_APP_NAME + 1];
static uint16_t g_app_len;
static int      g_udp_ok;   /* 1 if net_open succeeded */

int nc_log_init(const char *host, uint16_t port, const char *app_name)
{
    if (!app_name) app_name = "app";

    size_t n = strlen(app_name);
    if (n > MAX_APP_NAME) n = MAX_APP_NAME;
    memcpy(g_app_name, app_name, n);
    g_app_name[n] = '\0';
    g_app_len = (uint16_t)n;

    g_udp_ok = 0;
    if (host) {
        g_udp_ok = (net_open(host, port) == 0) ? 1 : 0;
    }
    return g_udp_ok || (!host) ? 0 : -1;
}

void nc_log_shutdown(void)
{
    if (g_udp_ok) {
        net_close();
        g_udp_ok = 0;
    }
}

void nc_log(NcLogLevel level, const char *fmt, ...)
{
    char msg[MAX_MSG + 1];
    va_list ap;
    va_start(ap, fmt);
    int msg_len = vsnprintf(msg, sizeof(msg), fmt, ap);
    va_end(ap);
    if (msg_len < 0) msg_len = 0;
    if (msg_len > MAX_MSG) msg_len = MAX_MSG;

    /* Always print to stdout (on SDL the user can see it in the terminal). */
    const char *lstr = (level == NC_LOG_ERROR) ? "ERROR"
                     : (level == NC_LOG_WARN)  ? "WARN"
                                               : "INFO";
    printf("[%s] [%s] %s\n", g_app_name, lstr, msg);
    fflush(stdout);

    if (!g_udp_ok) return;

    uint64_t t_us = sys_time_us();

    /* Build packet byte-by-byte (handles PPU big-endian and host little-endian). */
    unsigned char pkt[MAX_PKT];
    int p = 0;

    /* magic */
    pkt[p++] = 'N'; pkt[p++] = 'C'; pkt[p++] = 'L'; pkt[p++] = 'G';
    /* version */
    pkt[p++] = 1;
    /* level */
    pkt[p++] = (unsigned char)level;
    /* app_len (u16 BE) */
    pkt[p++] = (unsigned char)(g_app_len >> 8);
    pkt[p++] = (unsigned char)(g_app_len & 0xFF);
    /* t_us (u64 BE) */
    pkt[p++] = (unsigned char)((t_us >> 56) & 0xFF);
    pkt[p++] = (unsigned char)((t_us >> 48) & 0xFF);
    pkt[p++] = (unsigned char)((t_us >> 40) & 0xFF);
    pkt[p++] = (unsigned char)((t_us >> 32) & 0xFF);
    pkt[p++] = (unsigned char)((t_us >> 24) & 0xFF);
    pkt[p++] = (unsigned char)((t_us >> 16) & 0xFF);
    pkt[p++] = (unsigned char)((t_us >>  8) & 0xFF);
    pkt[p++] = (unsigned char)( t_us        & 0xFF);
    /* msg_len (u16 BE) */
    uint16_t ml = (uint16_t)msg_len;
    pkt[p++] = (unsigned char)(ml >> 8);
    pkt[p++] = (unsigned char)(ml & 0xFF);
    /* app_name bytes */
    memcpy(pkt + p, g_app_name, g_app_len); p += g_app_len;
    /* message bytes */
    memcpy(pkt + p, msg, (size_t)msg_len);  p += msg_len;

    net_send(pkt, p);
}
