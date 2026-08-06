# VibeVoice Cross-Platform Expansion Plan (macOS · Windows · Linux)

Created by **Abuzar Khan**

This document outlines a detailed, production-grade architectural plan to expand **VibeVoice** from a macOS-native application into a fully multi-platform desktop suite for **Windows (10/11)** and **Linux (X11 & Wayland)**.

---

## 📐 1. Architecture Overview: Native Abstraction Layer (NAL)

Currently, VibeVoice uses Node.js child processes (`spawn`) to communicate with macOS-specific Swift and C binaries via JSON streams. To support Windows and Linux without modifying the React UI or Electron IPC handlers, we will introduce a **Native Abstraction Layer (NAL)** in `src/main/native-adapter/`.

```
                        ┌───────────────────────────────┐
                        │   VibeVoice Renderer (React)  │
                        └───────────────┬───────────────┘
                                        │ (Electron IPC)
                        ┌───────────────▼───────────────┐
                        │   VibeVoice Main (Node.js)    │
                        └───────────────┬───────────────┘
                                        │
                        ┌───────────────▼───────────────┐
                        │ Native Abstraction Layer (NAL)│
                        └───────┬───────┬───────┬───────┘
                                │       │       │
            ┌───────────────────┘       │       └───────────────────┐
            ▼                           ▼                           ▼
  ┌───────────────────┐       ┌───────────────────┐       ┌───────────────────┐
  │   macOS Engine    │       │  Windows Engine   │       │   Linux Engine    │
  │   (Swift / C)     │       │   (C# / C++)      │       │   (C / Rust)      │
  └───────────────────┘       └───────────────────┘       └───────────────────┘
```

---

## 📊 2. OS Technology Mapping Matrix

| Subsystem | macOS (Current) | Windows 10/11 (Planned) | Linux (X11 & Wayland) |
| :--- | :--- | :--- | :--- |
| **Global Key Hold Watcher** | CoreGraphics `CGEventTap` | Win32 `SetWindowsHookEx` (`WH_KEYBOARD_LL`) in C# | `evdev` / `libinput` / `XGrabKey` in C/Rust |
| **Speech-to-Text (STT)** | Apple `SFSpeechRecognizer` | `Windows.Media.SpeechRecognition` (WinRT) | `whisper.cpp` (Embedded C++ local inference) |
| **Selection Grabber** | Accessibility `AXUIElement` | UI Automation API (`IUIAutomationTextRange`) | `xclip` / `xsel` (X11) or `wl-paste -p` (Wayland) |
| **Text Keystroke Injector** | Quartz `CGEventCreateKeyboardEvent` | Win32 `SendInput` API | `xdotool` (X11) or `wtype` / `ydotool` (Wayland) |
| **Text-to-Speech (TTS)** | `AVSpeechSynthesizer` | `System.Speech.Synthesis` / SAPI 5 | `piper-tts` / `speech-dispatcher` / `espeak-ng` |
| **Key Encryption** | Apple Keychain (`safeStorage`) | DPAPI (`safeStorage`) | `libsecret` / GNOME Keyring (`safeStorage`) |

---

## 🛠️ 3. Subsystem Implementation Strategy

### 3.1 Windows Subsystem Strategy (C# / .NET 8 / Win32)

1. **Global Hold Watcher (`src/native/win32/HoldWatcher.cs`)**:
   - Implement a lightweight C# console application using `SetWindowsHookExW` for low-level keyboard hooks.
   - Listen for `WM_KEYDOWN` and `WM_KEYUP` for modifier keys (`VK_LCONTROL`, `VK_LMENU`, `VK_NONCONVERT`).
   - Emit JSON events over `Console.WriteLine()` to stdout.

2. **Speech Recognition (`src/native/win32/SpeechRecognizer.cs`)**:
   - Utilize WinRT `Windows.Media.SpeechRecognition.SpeechRecognizer` or System.Speech.
   - Stream audio RMS levels and recognition results (`SpeechRecognitionResult`) to stdout.

3. **Selection Grabber & Keystroke Injector (`src/native/win32/TextInjector.cs`)**:
   - Use `UIAutomationClient` (`IUIAutomation`) to fetch selected text from the active element.
   - Use Win32 `SendInput()` with `VK_CONTROL` + `V` to inject text into focused input controls.

4. **Text-to-Speech Engine (`src/native/win32/TTSSpeaker.cs`)**:
   - Use `System.Speech.Synthesis.SpeechSynthesizer`.
   - Subscribe to `SpeakProgress` event to stream exact word character start and length indices for real-time React word highlighting.

---

### 3.2 Linux Subsystem Strategy (C / Rust / Shell Hooks)

1. **Global Hold Watcher (`src/native/linux/hold_watcher.c`)**:
   - **X11**: Use `XRecordRegisterRegisterClients` or `XGrabKey` to capture global key state without focus.
   - **Wayland**: Read directly from `/dev/input/event*` via `libinput` / `evdev` (requires user `input` group membership).

2. **Speech Recognition (`src/native/linux/speech_recognizer.cpp`)**:
   - Embed lightweight `whisper.cpp` compiled natively with GGML model weights (e.g. `tiny.en` / `base.en`).
   - Reads audio from ALSA / PulseAudio / PipeWire live stream and emits JSON transcription fragments to stdout.

3. **Selection Grabber & Injector (`src/native/linux/text_injector.sh`)**:
   - **X11**: `xclip -o -selection primary` for selection reading; `xdotool key ctrl+v` for injection.
   - **Wayland**: `wl-paste -p` for primary selection; `wtype` or `ydotool` for key injection.

4. **Text-to-Speech Engine (`src/native/linux/tts_speaker.py` / `piper`)**:
   - Use `Piper-TTS` (fast local neural TTS) or `speech-dispatcher`.
   - Emit word boundary timestamps to stdout.

---

## 📁 4. Project Directory Re-organization

```
src/native/
├── darwin/               # macOS Swift & C Binaries (Current)
│   ├── hold-watcher.swift
│   ├── speech-recognizer.swift
│   ├── selection-grabber.swift
│   ├── tts-speaker.swift
│   ├── text-injector.swift
│   └── tap-spawn.c
├── win32/                # Windows C# / Win32 Binaries (Planned)
│   ├── HoldWatcher.cs
│   ├── SpeechRecognizer.cs
│   └── TextInjector.cs
└── linux/                # Linux C / Rust / Shell Helpers (Planned)
    ├── hold_watcher.c
    ├── whisper_engine.cpp
    └── text_injector.sh
```

---

## 🔄 5. Multi-Platform Build Pipeline (`scripts/build-native.mjs`)

Update `scripts/build-native.mjs` to dynamically detect `process.platform`:

- **`darwin`**: Compiles Swift files via `/usr/bin/swiftc` and C via `/usr/bin/clang`.
- **`win32`**: Compiles C# files via `dotnet publish` or `csc.exe` into lightweight standalone executables.
- **`linux`**: Compiles C/C++ files via `gcc`/`g++` or CMake.

---

## 📦 6. Packaging & Installer Distribution (`electron-builder.yml`)

Update `electron-builder.yml` to specify platform artifact outputs:

- **macOS**: `.dmg` and `.app` bundles (Apple Silicon `arm64` + Intel `x64`).
- **Windows**: NSIS `.exe` installer + portable `.exe`.
- **Linux**: AppImage + Debian `.deb` + Snap packages.

```yaml
appId: com.vibevoice.app
productName: VibeVoice

mac:
  target: [dmg, zip]
  category: public.app-category.productivity

win:
  target: [nsis, portable]
  icon: build/icon.ico

linux:
  target: [AppImage, deb]
  icon: build/icons/
  category: Utility
```

---

## 🎯 7. Execution Roadmap Summary

1. **Phase 1**: Refactor `src/main/dictation/` and `src/main/speech/` into platform adapter interfaces.
2. **Phase 2**: Implement Windows C# native helpers (`Win32` & `WinRT`).
3. **Phase 3**: Implement Linux native helpers (`X11`/`Wayland` & `whisper.cpp`).
4. **Phase 4**: Configure cross-platform CI/CD build matrix on GitHub Actions (`ubuntu-latest`, `windows-latest`, `macos-latest`).

*Planned and designed by Abuzar Khan.*
