#!/usr/bin/env bash
# ==============================================================================
# @file text_injector.sh
# @brief Linux Text Injector & Selection Grabber Helper for VibeVoice.
#
# Supports both X11 (xclip, xsel, xdotool) and Wayland (wl-paste, wl-copy, wtype, ydotool).
#
# Usage:
#   1) Selection Grabber:
#      ./text_injector.sh --grab
#   2) Text Injector (stdin):
#      echo "Hello VibeVoice" | ./text_injector.sh
#   3) Text Injector (argument):
#      ./text_injector.sh --inject "Hello VibeVoice"
# ==============================================================================

set -euo pipefail

# Determine display server session type (X11 vs Wayland)
detect_session_type() {
  if [[ "${XDG_SESSION_TYPE:-}" == "wayland" ]] || [[ -n "${WAYLAND_DISPLAY:-}" ]]; then
    echo "wayland"
  else
    echo "x11"
  fi
}

SESSION_TYPE=$(detect_session_type)

# ------------------------------------------------------------------------------
# Selection Grabber Mode
# ------------------------------------------------------------------------------
grab_selection() {
  if [[ "$SESSION_TYPE" == "wayland" ]]; then
    if command -v wl-paste >/dev/null 2>&1; then
      # Try primary selection first, then standard clipboard
      wl-paste -p 2>/dev/null || wl-paste 2>/dev/null || true
    else
      echo "[text_injector] Error: wl-paste is required for Wayland selection grabbing." >&2
      exit 1
    fi
  else
    if command -v xclip >/dev/null 2>&1; then
      xclip -o -selection primary 2>/dev/null || xclip -o -selection clipboard 2>/dev/null || true
    elif command -v xsel >/dev/null 2>&1; then
      xsel -o -p 2>/dev/null || xsel -o -b 2>/dev/null || true
    else
      echo "[text_injector] Error: xclip or xsel is required for X11 selection grabbing." >&2
      exit 1
    fi
  fi
}

# ------------------------------------------------------------------------------
# Text Injection Mode
# ------------------------------------------------------------------------------
inject_text() {
  local text_to_inject="$1"
  if [[ -z "$text_to_inject" ]]; then
    exit 0
  fi

  if [[ "$SESSION_TYPE" == "wayland" ]]; then
    # Wayland Injection Flow
    if ! command -v wl-copy >/dev/null 2>&1; then
      echo "[text_injector] Error: wl-copy is missing. Please install wl-clipboard." >&2
      exit 1
    fi

    # Snapshot current clipboard
    local prev_clipboard=""
    if command -v wl-paste >/dev/null 2>&1; then
      prev_clipboard=$(wl-paste -n 2>/dev/null || true)
    fi

    # Set new clipboard content
    echo -n "$text_to_inject" | wl-copy

    # Trigger Ctrl+V key injection
    if command -v wtype >/dev/null 2>&1; then
      wtype -M ctrl -k v -m ctrl
    elif command -v ydotool >/dev/null 2>&1; then
      ydotool key 29:1 47:1 47:0 29:0
    elif command -v xdotool >/dev/null 2>&1; then
      xdotool key --clearmodifiers ctrl+v
    else
      echo "[text_injector] Warning: Neither wtype nor ydotool found for Wayland key simulation." >&2
    fi

    # Restore previous clipboard after target application paste window
    sleep 0.5
    if [[ -n "$prev_clipboard" ]]; then
      echo -n "$prev_clipboard" | wl-copy || true
    fi

  else
    # X11 Injection Flow
    if ! command -v xclip >/dev/null 2>&1 && ! command -v xsel >/dev/null 2>&1; then
      echo "[text_injector] Error: xclip or xsel missing. Please install xclip." >&2
      exit 1
    fi

    # Snapshot current clipboard
    local prev_clipboard=""
    if command -v xclip >/dev/null 2>&1; then
      prev_clipboard=$(xclip -o -selection clipboard 2>/dev/null || true)
      echo -n "$text_to_inject" | xclip -selection clipboard
    else
      prev_clipboard=$(xsel -o -b 2>/dev/null || true)
      echo -n "$text_to_inject" | xsel -i -b
    fi

    # Trigger Ctrl+V via xdotool
    if command -v xdotool >/dev/null 2>&1; then
      xdotool key --clearmodifiers ctrl+v
    else
      echo "[text_injector] Warning: xdotool missing for X11 key simulation." >&2
    fi

    # Restore previous clipboard
    sleep 0.5
    if [[ -n "$prev_clipboard" ]]; then
      if command -v xclip >/dev/null 2>&1; then
        echo -n "$prev_clipboard" | xclip -selection clipboard || true
      else
        echo -n "$prev_clipboard" | xsel -i -b || true
      fi
    fi
  fi
}

# ------------------------------------------------------------------------------
# Entry Point
# ------------------------------------------------------------------------------
main() {
  if [[ "${1:-}" == "--grab" ]]; then
    grab_selection
  elif [[ "${1:-}" == "--inject" ]]; then
    inject_text "${2:-}"
  else
    # Read from stdin
    local input_text
    input_text=$(cat)
    inject_text "$input_text"
  fi
}

main "$@"
