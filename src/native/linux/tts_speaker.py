#!/usr/bin/env python3
"""
@file tts_speaker.py
@brief Linux Text-To-Speech (TTS) Engine Bridge for VibeVoice.

Supports Piper-TTS, speech-dispatcher (speechd), and espeak-ng backends.
Reads line-delimited JSON commands from stdin:
  - {"cmd": "speak", "text": "...", "voice": "...", "rate": 200}
  - {"cmd": "pause"}
  - {"cmd": "resume"}
  - {"cmd": "stop"}
  - {"cmd": "exit"}

Emits line-delimited JSON events to stdout for real-time UI synchronization:
  - {"type": "ready"}
  - {"type": "start", "text": "..."}
  - {"type": "word", "start": 0, "length": 5}
  - {"type": "done"}
  - {"type": "paused"}
  - {"type": "resumed"}
"""

import sys
import os
import json
import time
import re
import signal
import threading
import subprocess
import shutil

# Global state lock and stop flags
speech_lock = threading.Lock()
stop_requested = threading.Event()
pause_requested = threading.Event()
current_thread = None


def emit(data):
    """Emit JSON payload to stdout."""
    try:
        sys.stdout.write(json.dumps(data) + "\n")
        sys.stdout.flush()
    except Exception:
        pass


def find_word_boundaries(text):
    """Find character start index and length for each word in text."""
    words = []
    pattern = re.compile(r'\S+')
    for match in pattern.finditer(text):
        words.append({
            "start": match.start(),
            "length": match.end() - match.start(),
            "word": match.group()
        })
    return words


class PiperTTSBackend:
    """Piper-TTS Fast Neural Local Speech Synthesizer."""
    def __init__(self):
        self.piper_bin = shutil.which("piper")

    def is_available(self):
        return self.piper_bin is not None

    def speak(self, text, voice, rate_wpm, word_callback):
        if not self.piper_bin:
            return False

        words = find_word_boundaries(text)
        total_words = len(words)
        if total_words == 0:
            return True

        # Calculate estimated duration per word based on WPM
        wpm = max(50, min(rate_wpm, 500))
        sec_per_word = 60.0 / wpm

        # Run piper process outputting to aplay or paplay
        cmd = [self.piper_bin, "--model", voice if voice.endswith(".onnx") else f"{voice}.onnx", "--output-raw"]
        player_bin = shutil.which("aplay") or shutil.which("paplay")

        try:
            piper_proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
            player_proc = subprocess.Popen([player_bin, "-r", "22050", "-f", "S16_LE", "-c", "1"], stdin=piper_proc.stdout, stderr=subprocess.DEVNULL) if player_bin else None

            if piper_proc.stdin:
                piper_proc.stdin.write(text.encode('utf-8'))
                piper_proc.stdin.close()

            for w in words:
                if stop_requested.is_set():
                    if player_proc: player_proc.kill()
                    piper_proc.kill()
                    break

                while pause_requested.is_set():
                    time.sleep(0.05)

                word_callback(w["start"], w["length"])
                time.sleep(sec_per_word)

            if player_proc: player_proc.wait()
            piper_proc.wait()
            return True
        except Exception:
            return False


class SpeechDispatcherBackend:
    """speech-dispatcher (spd-say / python-speechd) backend."""
    def __init__(self):
        self.spd_bin = shutil.which("spd-say")

    def is_available(self):
        return self.spd_bin is not None

    def speak(self, text, voice, rate_wpm, word_callback):
        if not self.spd_bin:
            return False

        words = find_word_boundaries(text)
        wpm = max(50, min(rate_wpm, 500))
        sec_per_word = 60.0 / wpm

        # Rate mapping for spd-say (-100 to +100)
        rate_val = int(((wpm - 200) / 200.0) * 100)
        rate_val = max(-100, min(rate_val, 100))

        cmd = [self.spd_bin, "-r", str(rate_val), text]
        if voice and voice != "Samantha":
            cmd.extend(["-y", voice])

        try:
            proc = subprocess.Popen(cmd, stderr=subprocess.DEVNULL)
            for w in words:
                if stop_requested.is_set():
                    subprocess.run([self.spd_bin, "-S"], stderr=subprocess.DEVNULL)
                    proc.kill()
                    break

                while pause_requested.is_set():
                    time.sleep(0.05)

                word_callback(w["start"], w["length"])
                time.sleep(sec_per_word)

            proc.wait()
            return True
        except Exception:
            return False


class EspeakBackend:
    """espeak-ng / espeak fallback backend."""
    def __init__(self):
        self.espeak_bin = shutil.which("espeak-ng") or shutil.which("espeak")

    def is_available(self):
        return self.espeak_bin is not None

    def speak(self, text, voice, rate_wpm, word_callback):
        if not self.espeak_bin:
            return False

        words = find_word_boundaries(text)
        wpm = max(50, min(rate_wpm, 500))
        sec_per_word = 60.0 / wpm

        cmd = [self.espeak_bin, "-s", str(int(wpm)), text]
        try:
            proc = subprocess.Popen(cmd, stderr=subprocess.DEVNULL)
            for w in words:
                if stop_requested.is_set():
                    proc.kill()
                    break

                while pause_requested.is_set():
                    time.sleep(0.05)

                word_callback(w["start"], w["length"])
                time.sleep(sec_per_word)

            proc.wait()
            return True
        except Exception:
            return False


piper_backend = PiperTTSBackend()
spd_backend = SpeechDispatcherBackend()
espeak_backend = EspeakBackend()


def perform_speech(text, voice, rate):
    """Execute speech synthesis across available Linux backends with word events."""
    stop_requested.clear()
    pause_requested.clear()

    emit({"type": "start", "text": text})

    def word_cb(start, length):
        emit({"type": "word", "start": start, "length": length})

    handled = False
    if piper_backend.is_available():
        handled = piper_backend.speak(text, voice, rate, word_cb)
    if not handled and spd_backend.is_available():
        handled = spd_backend.speak(text, voice, rate, word_cb)
    if not handled and espeak_backend.is_available():
        handled = espeak_backend.speak(text, voice, rate, word_cb)

    if not handled:
        # Fallback timed word emission for synthetic/test environments
        words = find_word_boundaries(text)
        sec_per_word = 60.0 / max(50, min(rate, 500))
        for w in words:
            if stop_requested.is_set():
                break
            while pause_requested.is_set():
                time.sleep(0.05)
            word_cb(w["start"], w["length"])
            time.sleep(sec_per_word)

    emit({"type": "done"})


def handle_command(cmd_obj, default_voice, default_rate):
    """Handle incoming command object."""
    global current_thread

    cmd = cmd_obj.get("cmd", "")
    if cmd == "speak":
        text = cmd_obj.get("text", "").strip()
        if not text:
            return

        # Stop any active speaking thread
        stop_requested.set()
        if current_thread and current_thread.is_alive():
            current_thread.join(timeout=0.2)

        voice = cmd_obj.get("voice", default_voice)
        rate = float(cmd_obj.get("rate", default_rate))

        current_thread = threading.Thread(
            target=perform_speech,
            args=(text, voice, rate),
            daemon=True
        )
        current_thread.start()

    elif cmd == "pause":
        pause_requested.set()
        emit({"type": "paused"})

    elif cmd == "resume":
        pause_requested.clear()
        emit({"type": "resumed"})

    elif cmd == "stop":
        stop_requested.set()

    elif cmd == "exit":
        stop_requested.set()
        if current_thread and current_thread.is_alive():
            current_thread.join(timeout=1.0)
        sys.exit(0)


def signal_handler(sig, frame):
    stop_requested.set()
    if current_thread and current_thread.is_alive():
        current_thread.join(timeout=1.0)
    sys.exit(0)


def main():
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    default_voice = sys.argv[1] if len(sys.argv) > 1 else "en-us"
    default_rate = float(sys.argv[2]) if len(sys.argv) > 2 else 200.0

    emit({"type": "ready"})

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            cmd_obj = json.loads(line)
            handle_command(cmd_obj, default_voice, default_rate)
        except Exception as e:
            pass


if __name__ == "__main__":
    main()
