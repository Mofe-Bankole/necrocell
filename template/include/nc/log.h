/**
 * nc/log.h — UDP network logging.
 *
 * Sends NCLG packets to a host listener (mcp/log-listener.ts) over UDP.
 * On SDL builds, also prints to stdout.
 * Non-blocking: if the socket is not ready, the message is dropped silently.
 *
 * NCLG packet layout (all multi-byte fields big-endian on the wire):
 *
 *   Offset  Size  Field
 *   0       4     magic: 'N','C','L','G' (0x4E434C47)
 *   4       1     version: 1
 *   5       1     level: NcLogLevel (1=INFO, 2=WARN, 3=ERROR)
 *   6       2     app_len: length of app_name string (no NUL)
 *   8       8     t_us: monotonic timestamp, microseconds (u64)
 *   16      2     msg_len: length of message string (no NUL)
 *   18      app_len   app_name bytes
 *   18+app_len  msg_len   message bytes
 *
 * Minimum packet size: 18 bytes. No NUL terminators included in lengths.
 * Fields are written byte-by-byte (never via struct cast) so the layout is
 * identical on the big-endian PPU and little-endian host.
 */
#ifndef NC_LOG_H
#define NC_LOG_H

#include <stdint.h>

/** Log severity levels. */
typedef enum {
    NC_LOG_INFO  = 1, /**< Informational message. */
    NC_LOG_WARN  = 2, /**< Warning — something unexpected happened. */
    NC_LOG_ERROR = 3  /**< Error — an operation failed. */
} NcLogLevel;

/**
 * Initialise the log subsystem.
 * Must be called before nc_log. Called by sys_init.
 * @param host      Destination IP string (e.g. "192.168.1.10"), or NULL to
 *                  disable UDP (messages are still printed on SDL builds).
 * @param port      Destination UDP port (e.g. 4210).
 * @param app_name  Sent in every packet; truncated to 255 bytes.
 * @return 0 on success. On socket failure with host != NULL, falls back to
 *         stdout-only and returns a non-zero code (not fatal).
 */
int  nc_log_init(const char *host, uint16_t port, const char *app_name);

/** Release the UDP socket. Safe to call even if nc_log_init was not called. */
void nc_log_shutdown(void);

/**
 * Format and send a log message.
 * @param level  NC_LOG_INFO, NC_LOG_WARN, or NC_LOG_ERROR.
 * @param fmt    printf-style format string.
 * Non-blocking: drops the message if the socket is not ready.
 */
void nc_log(NcLogLevel level, const char *fmt, ...);

#endif /* NC_LOG_H */
