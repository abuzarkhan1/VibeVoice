# VibeVoice

A native macOS desktop launcher for voice dictation, text-to-speech, and quick AI prompts. Built with Electron, Vite, React 19, TypeScript, and native Swift/C helpers.

Created by **Abuzar Khan**.

---

## 🚀 Key Features

- **🎙️ Instant Voice Dictation (STT)**: Hold the `Fn` key (or custom hotkey), speak, and release. VibeVoice transcribes your speech locally/natively and automatically pastes the text into your currently focused text box.
- **✨ Optional AI Cleanup Pass**: Automatically routes raw dictation transcripts through your default AI model (Anthropic Claude, OpenAI GPT, or Google Gemini) to fix grammar, remove filler words ("um", "uh"), and format capitalization before pasting.
- **🔊 Text-to-Speech (TTS) with Word Highlighting**: Highlight any text on your Mac and press `⌘ + Shift + S`. VibeVoice reads the text aloud using native `AVSpeechSynthesizer` with a floating player overlay and real-time word-by-word highlighting.
- **🤖 Global AI Prompt Bar**: Press `⌘ + Shift + P` from any application to summon a floating AI prompt launcher to ask questions, transform text, or generate code on the fly.
- **🔐 Encrypted Key Storage**: API keys are securely encrypted on disk using native macOS Keychain encryption via Electron `safeStorage`.

---

## 🏗️ Architecture & Component Design

### 1. High-Level System Architecture

```mermaid
graph TB
    subgraph Client ["Renderer Process (React 19 + Tailwind CSS)"]
        UI_Settings["Settings App (General, Dictation, Speech, AI Tabs)"]
        UI_Whisper["Whisper Overlay (Live Waveform Visualizer)"]
        UI_Speak["Speak Overlay (TTS Player & Word Highlighter)"]
        UI_Prompt["Prompt Panel (Global AI Prompt Bar)"]
    end

    subgraph Core ["Main Process (Electron / Node.js Engine)"]
        Tray["Status Tray & Global Hotkeys"]
        IPC["IPC Bridge & Safety Handlers"]
        SettingsStore["AES Encrypted Settings Store"]
        AIRouter["Multi-Provider AI Router"]
        Orchestrator["Dictation & TTS Orchestrators"]
    end

    subgraph Native ["Native macOS Helper Layer (Swift & C)"]
        HW["hold-watcher (CoreGraphics Event Tap)"]
        SR["SpeechRecognizer.app (macOS Speech Framework)"]
        SG["selection-grabber (macOS Accessibility AXUIElement)"]
        TS["tts-speaker (AVSpeechSynthesizer + Word Timing)"]
        TI["text-injector (Synthetic Keystroke & Paste Event)"]
        Spawn["tap-spawn (C Process Spawner)"]
    end

    UI_Settings <--> IPC
    UI_Whisper <--> IPC
    UI_Speak <--> IPC
    UI_Prompt <--> IPC

    IPC <--> SettingsStore
    IPC <--> AIRouter
    Tray --> Orchestrator

    Orchestrator <--> HW
    Orchestrator <--> SR
    Orchestrator <--> SG
    Orchestrator <--> TS
    Orchestrator <--> TI
    HW <--> Spawn
```

---

### 2. Voice Dictation & AI Cleanup Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant HW as hold-watcher (Swift)
    participant Main as Main Process (Orchestrator)
    participant UI as Whisper Overlay (React)
    participant SR as SpeechRecognizer.app (Swift)
    participant AI as AI Provider (Anthropic/OpenAI/Gemini)
    participant TI as text-injector (Swift)
    actor TargetApp as Active macOS App

    User->>HW: Hold Fn key down
    HW->>Main: Send JSON {"type": "down"}
    Main->>UI: Show overlay & broadcast "recording" state
    Main->>SR: Spawn native speech recognizer process
    loop Live Recording
        SR->>Main: Stream audio RMS level & partial transcripts
        Main->>UI: Update waveform visualizer & live text
    end
    User->>HW: Release Fn key
    HW->>Main: Send JSON {"type": "up"}
    Main->>SR: Send stop signal & await final transcript
    SR-->>Main: Return final transcribed text
    opt If AI Cleanup Enabled
        Main->>AI: Send prompt + transcript for cleanup
        AI-->>Main: Return polished text
    end
    Main->>UI: Hide overlay & reset state
    Main->>TI: Inject text to focused application
    TI->>TargetApp: Write to Clipboard + Trigger ⌘V Paste
```

---

### 3. Text-to-Speech (TTS) Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Hotkey as Global Shortcut (⌘⇧S)
    participant SG as selection-grabber (Swift)
    participant Engine as TTS Engine (Node.js)
    participant TS as tts-speaker (Swift)
    participant UI as Speak Overlay (React)

    User->>Hotkey: Press ⌘ + Shift + S
    Hotkey->>SG: Execute native AXUIElement selection grab
    SG-->>Engine: Return highlighted text string
    Engine->>Engine: Split text into sentence/clause chunks
    Engine->>UI: Open floating player overlay
    Engine->>TS: Spawn AVSpeechSynthesizer process (voice, rate)
    loop Speaking Chunks
        TS->>TS: Synthesize audio output
        TS->>UI: Stream word boundary markers {"start": X, "length": Y}
        UI->>UI: Render live word-by-word highlight
    end
    TS-->>Engine: Stream finished signal
    Engine->>UI: Hide player overlay & reset
```

---

### 4. Multi-Provider AI Architecture & Key Security

```mermaid
graph LR
    subgraph Security ["Security Layer"]
        Keychain["macOS Keychain"]
        SafeStorage["Electron safeStorage API"]
        EncryptedStore["Encrypted Store File (JSON)"]
        Keychain <--> SafeStorage <--> EncryptedStore
    end

    subgraph Router ["AI Provider Router"]
        Manager["AI Provider Manager"]
        Anthropic["Anthropic Service (Claude 3.5 Sonnet / Haiku)"]
        OpenAI["OpenAI Service (GPT-4o / GPT-4o-mini)"]
        Gemini["Google Gemini Service (Gemini 1.5 Flash / Pro)"]
        Manager --> Anthropic
        Manager --> OpenAI
        Manager --> Gemini
    end

    EncryptedStore --> Manager
```

---

## 🛠️ Technology Stack

- **Framework**: Electron 39 + Vite 7 + React 19
- **Languages**: TypeScript 5, Swift 5, C (Clang)
- **Styling**: Vanilla CSS, Tailwind CSS v4, Lucide Icons, Radix UI
- **Native OS APIs**: CoreGraphics `CGEventTap`, macOS Speech Framework, `AVSpeechSynthesizer`, Accessibility `AXUIElement`
- **Build System**: `electron-vite`, `electron-builder`, `esbuild`

---

## 💻 Development & Building

### Requirements
- **OS**: macOS (Apple Silicon or Intel)
- **Node.js**: v20+
- **Package Manager**: `pnpm` (v10+)
- **Build Tools**: Xcode Command Line Tools (`clang`, `swiftc`)

### Quick Start

```sh
# 1. Clone & Install dependencies
git clone https://github.com/abuzarkhan1/VibeVoice.git
cd VibeVoice
pnpm install

# 2. Start native compilation and development server
pnpm dev

# 3. Run type-checking
pnpm typecheck

# 4. Build native binaries & production bundle
pnpm build

# 5. Package macOS Application (.dmg / .app)
pnpm build:mac
```

---

## 🔒 macOS System Permissions

VibeVoice requires three macOS permissions to operate as a desktop utility:
1. **Accessibility** (`System Settings → Privacy & Security → Accessibility`): Required to detect `Fn` hold events and paste text into external apps.
2. **Microphone** (`System Settings → Privacy & Security → Microphone`): Required for voice dictation audio capture.
3. **Speech Recognition** (`System Settings → Privacy & Security → Speech Recognition`): Required for native macOS speech-to-text.

---

## 📄 Author & License

Created by **Abuzar Khan**. All rights reserved.
