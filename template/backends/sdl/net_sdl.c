/*
 * backends/sdl/net_sdl.c — UDP socket implementation for nc_log on Linux.
 *
 * log.c calls these three functions; it has no platform #ifdef.
 * sendto uses MSG_DONTWAIT so the main loop never blocks on a stalled network.
 */

#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <netinet/in.h>

static int g_sock = -1;
static struct sockaddr_in g_dest;

/*
 * Open a UDP socket aimed at host:port.
 * Returns 0 on success, -1 on failure (nc_log will fall back to stdout-only).
 */
int net_open(const char *host, unsigned short port)
{
    if (!host) return -1;

    g_sock = socket(AF_INET, SOCK_DGRAM, 0);
    if (g_sock < 0) {
        perror("nc_log: socket");
        return -1;
    }

    memset(&g_dest, 0, sizeof(g_dest));
    g_dest.sin_family      = AF_INET;
    g_dest.sin_port        = htons(port);
    if (inet_pton(AF_INET, host, &g_dest.sin_addr) != 1) {
        fprintf(stderr, "nc_log: invalid host '%s'\n", host);
        close(g_sock);
        g_sock = -1;
        return -1;
    }
    return 0;
}

/*
 * Send buf[len] to the configured destination.
 * Non-blocking: MSG_DONTWAIT means it drops rather than blocks.
 * Returns 0 on success, -1 on error (caller may ignore).
 */
int net_send(const unsigned char *buf, int len)
{
    if (g_sock < 0) return -1;
    ssize_t sent = sendto(g_sock, buf, (size_t)len, MSG_DONTWAIT,
                          (struct sockaddr *)&g_dest, sizeof(g_dest));
    return (sent == len) ? 0 : -1;
}

void net_close(void)
{
    if (g_sock >= 0) {
        close(g_sock);
        g_sock = -1;
    }
}
