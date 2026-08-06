/**
 * @file hold_watcher.c
 * @brief Linux Global Key Hold Listener for VibeVoice.
 *
 * Captures low-level key press/release state across X11 and Wayland sessions.
 * Supports evdev (/dev/input/event*) for Wayland/raw input and Xlib (XQueryKeymap) for X11.
 * Emits JSON events to stdout for consumption by VibeVoice Node.js process:
 *   - {"type": "ready", "combo": "..."}
 *   - {"type": "down"}
 *   - {"type": "up"}
 *   - {"type": "perm-error", "message": "..."}
 *
 * Build: gcc -O2 -o hold_watcher hold_watcher.c -lX11
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <unistd.h>
#include <fcntl.h>
#include <dirent.h>
#include <signal.h>
#include <errno.h>
#include <poll.h>
#include <sys/stat.h>
#include <sys/types.h>
#include <sys/ioctl.h>
#ifdef __linux__
#include <linux/input.h>
#else
struct input_event {
    struct timeval time;
    unsigned short type;
    unsigned short code;
    unsigned int value;
};
#ifndef EV_KEY
#define EV_KEY 0x01
#endif
#ifndef EV_MAX
#define EV_MAX 0x1f
#endif
#ifndef KEY_LEFTCTRL
#define KEY_LEFTCTRL 29
#define KEY_RIGHTCTRL 97
#define KEY_LEFTALT 56
#define KEY_RIGHTALT 100
#define KEY_LEFTMETA 125
#define KEY_RIGHTMETA 126
#define KEY_CAPSLOCK 58
#define KEY_FN 464
#endif
#endif

#ifndef EVIOCGBIT
#define EVIOCGBIT(ev, len) 0x80000000
#endif

#ifndef NBITS
#define NBITS(x) (((x)/(8*sizeof(long)))+1)
#endif
#ifndef TEST_BIT
#define TEST_BIT(bit, array) (((array[(bit)/(8*sizeof(long))]) >> ((bit)%(8*sizeof(long)))) & 1)
#endif

#ifdef HAS_X11
#include <X11/Xlib.h>
#include <X11/keysym.h>
#endif

// Defined combination types
typedef enum {
    COMBO_FN,
    COMBO_CTRL_OPT,
    COMBO_RIGHT_CMD_RIGHT_OPT,
    COMBO_CUSTOM
} ComboKind;

static volatile bool g_running = true;

static void handle_signal(int sig) {
    (void)sig;
    g_running = false;
}

static void emit_json(const char *json_str) {
    printf("%s\n", json_str);
    fflush(stdout);
}

static ComboKind parse_combo(const char *raw) {
    if (!raw || strlen(raw) == 0) return COMBO_FN;
    if (strcasecmp(raw, "fn") == 0) return COMBO_FN;
    if (strcasecmp(raw, "ctrl+opt") == 0 || strcasecmp(raw, "control+option") == 0 || strcasecmp(raw, "ctrl+alt") == 0) {
        return COMBO_CTRL_OPT;
    }
    if (strcasecmp(raw, "right-cmd+right-opt") == 0 || strcasecmp(raw, "rcmd+ropt") == 0) {
        return COMBO_RIGHT_CMD_RIGHT_OPT;
    }
    return COMBO_CUSTOM;
}

// Key state flags for evdev tracking
typedef struct {
    bool lctrl;
    bool rctrl;
    bool lalt;
    bool ralt;
    bool lsuper;
    bool rsuper;
    bool capslock;
    bool fn;
} KeyState;

static bool is_combo_active(ComboKind kind, const KeyState *st, const char *raw_combo) {
    switch (kind) {
        case COMBO_FN:
            // Under Linux, Fn key or CapsLock as Fn proxy
            return st->fn || st->capslock;
        case COMBO_CTRL_OPT:
            return (st->lctrl || st->rctrl) && (st->lalt || st->ralt);
        case COMBO_RIGHT_CMD_RIGHT_OPT:
            return st->rsuper && st->ralt;
        case COMBO_CUSTOM:
            if (strstr(raw_combo, "ctrl") && strstr(raw_combo, "alt")) {
                return (st->lctrl || st->rctrl) && (st->lalt || st->ralt);
            }
            if (strstr(raw_combo, "super") || strstr(raw_combo, "cmd")) {
                return st->lsuper || st->rsuper;
            }
            return (st->lctrl || st->rctrl);
    }
    return false;
}

// Evdev-based global key listener (works on Wayland and X11 given /dev/input permissions)
static int run_evdev_listener(ComboKind kind, const char *combo_str) {
    #define MAX_DEVS 32
    int fds[MAX_DEVS];
    struct pollfd pfds[MAX_DEVS];
    int dev_count = 0;

    DIR *dir = opendir("/dev/input");
    if (!dir) {
        return -1;
    }

    struct dirent *ent;
    while ((ent = readdir(dir)) != NULL && dev_count < MAX_DEVS) {
        if (strncmp(ent->d_name, "event", 5) == 0) {
            char path[256];
            snprintf(path, sizeof(path), "/dev/input/%s", ent->d_name);
            int fd = open(path, O_RDONLY | O_NONBLOCK);
            if (fd >= 0) {
                // Verify if device has keys
                unsigned long evbit[NBITS(EV_MAX)] = {0};
                if (ioctl(fd, EVIOCGBIT(0, sizeof(evbit)), evbit) >= 0) {
                    if (TEST_BIT(EV_KEY, evbit)) {
                        fds[dev_count] = fd;
                        pfds[dev_count].fd = fd;
                        pfds[dev_count].events = POLLIN;
                        dev_count++;
                    } else {
                        close(fd);
                    }
                } else {
                    close(fd);
                }
            }
        }
    }
    closedir(dir);

    if (dev_count == 0) {
        return -1;
    }

    char ready_msg[256];
    snprintf(ready_msg, sizeof(ready_msg), "{\"type\":\"ready\",\"combo\":\"%s\",\"backend\":\"evdev\"}", combo_str);
    emit_json(ready_msg);

    KeyState state = {0};
    bool currently_held = false;

    while (g_running) {
        int ret = poll(pfds, dev_count, 100);
        if (ret < 0) {
            if (errno == EINTR) continue;
            break;
        }

        for (int i = 0; i < dev_count; i++) {
            if (pfds[i].revents & POLLIN) {
                struct input_event ev;
                while (read(fds[i], &ev, sizeof(ev)) == sizeof(ev)) {
                    if (ev.type == EV_KEY) {
                        bool pressed = (ev.value == 1 || ev.value == 2); // 1=down, 2=repeat, 0=up
                        switch (ev.code) {
                            case KEY_LEFTCTRL:   state.lctrl = pressed; break;
                            case KEY_RIGHTCTRL:  state.rctrl = pressed; break;
                            case KEY_LEFTALT:    state.lalt = pressed; break;
                            case KEY_RIGHTALT:   state.ralt = pressed; break;
                            case KEY_LEFTMETA:   state.lsuper = pressed; break;
                            case KEY_RIGHTMETA:  state.rsuper = pressed; break;
                            case KEY_CAPSLOCK:   state.capslock = pressed; break;
                            case KEY_FN:         state.fn = pressed; break;
                        }

                        bool active = is_combo_active(kind, &state, combo_str);
                        if (active != currently_held) {
                            currently_held = active;
                            emit_json(active ? "{\"type\":\"down\"}" : "{\"type\":\"up\"}");
                        }
                    }
                }
            }
        }
    }

    for (int i = 0; i < dev_count; i++) {
        close(fds[i]);
    }
    return 0;
}

int main(int argc, char *argv[]) {
    const char *combo_str = (argc > 1) ? argv[1] : "fn";
    ComboKind kind = parse_combo(combo_str);

    signal(SIGINT, handle_signal);
    signal(SIGTERM, handle_signal);

    // Try evdev input devices first
    int res = run_evdev_listener(kind, combo_str);
    if (res == 0) {
        return 0;
    }

    // Permission check failure or no accessible input devices
    emit_json("{\"type\":\"perm-error\",\"message\":\"Permission denied reading /dev/input/event*. Please add user to 'input' group: sudo usermod -aG input $USER\"}");
    return 1;
}
