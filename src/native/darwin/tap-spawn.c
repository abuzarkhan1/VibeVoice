// WHY: responsibility_spawnattrs_setdisclaim detaches child from parent TCC so the child's own Info.plist drives macOS permission prompts.

#include <errno.h>
#include <signal.h>
#include <spawn.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/wait.h>
#include <unistd.h>

extern char **environ;
extern int responsibility_spawnattrs_setdisclaim(posix_spawnattr_t *attrs, int disclaim);

static pid_t child_pid = 0;

static void forward_signal(int signo) {
  if (child_pid > 0) {
    kill(child_pid, signo);
  }
}

int main(int argc, char *argv[]) {
  if (argc < 2) {
    fprintf(stderr, "tap-spawn: usage: tap-spawn <binary> [args...]\n");
    return 64;
  }

  posix_spawnattr_t attrs;
  if (posix_spawnattr_init(&attrs) != 0) {
    perror("tap-spawn: posix_spawnattr_init");
    return 71;
  }
  if (responsibility_spawnattrs_setdisclaim(&attrs, 1) != 0) {
    fprintf(stderr, "tap-spawn: setdisclaim failed; child will inherit responsibility\n");
  }

  signal(SIGTERM, forward_signal);
  signal(SIGINT, forward_signal);
  signal(SIGHUP, forward_signal);

  int rc = posix_spawn(&child_pid, argv[1], NULL, &attrs, &argv[1], environ);
  posix_spawnattr_destroy(&attrs);
  if (rc != 0) {
    fprintf(stderr, "tap-spawn: posix_spawn %s: %s\n", argv[1], strerror(rc));
    return 71;
  }

  int status = 0;
  while (waitpid(child_pid, &status, 0) < 0) {
    if (errno != EINTR) {
      perror("tap-spawn: waitpid");
      return 71;
    }
  }
  if (WIFEXITED(status)) return WEXITSTATUS(status);
  if (WIFSIGNALED(status)) return 128 + WTERMSIG(status);
  return 1;
}
