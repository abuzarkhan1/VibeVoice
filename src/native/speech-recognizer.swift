import Foundation
import Speech
import AVFoundation

let rawArgs = Array(CommandLine.arguments.dropFirst())
let authOnly = rawArgs.contains("--auth-only")
let lang = rawArgs.first(where: { !$0.hasPrefix("--") }) ?? "en-US"

func emit(_ dict: [String: Any]) {
  if let data = try? JSONSerialization.data(withJSONObject: dict, options: []),
     let str = String(data: data, encoding: .utf8) {
    FileHandle.standardOutput.write((str + "\n").data(using: .utf8)!)
  }
}

guard let recognizer = SFSpeechRecognizer(locale: Locale(identifier: lang)) else {
  emit(["type": "error", "message": "Speech recognizer not available for language \(lang)"])
  exit(1)
}
guard recognizer.isAvailable else {
  emit(["type": "error", "message": "Speech recognizer not available on this system"])
  exit(1)
}

let authSemaphore = DispatchSemaphore(value: 0)
var authStatus: SFSpeechRecognizerAuthorizationStatus = .notDetermined
SFSpeechRecognizer.requestAuthorization { status in
  authStatus = status
  authSemaphore.signal()
}
authSemaphore.wait()

func micStatusString(_ s: AVAuthorizationStatus) -> String {
  switch s {
  case .authorized: return "granted"
  case .denied: return "denied"
  case .restricted: return "restricted"
  case .notDetermined: return "not-determined"
  @unknown default: return "unknown"
  }
}

func requestMicrophoneAccess() -> AVAuthorizationStatus {
  let current = AVCaptureDevice.authorizationStatus(for: .audio)
  if current != .notDetermined { return current }
  let semaphore = DispatchSemaphore(value: 0)
  AVCaptureDevice.requestAccess(for: .audio) { _ in semaphore.signal() }
  semaphore.wait()
  return AVCaptureDevice.authorizationStatus(for: .audio)
}

let micStatus = authOnly
  ? AVCaptureDevice.authorizationStatus(for: .audio)
  : requestMicrophoneAccess()

if authOnly {
  var payload: [String: Any] = [
    "type": "auth",
    "speech": String(describing: authStatus),
    "microphone": micStatusString(micStatus)
  ]
  if authStatus != .authorized || micStatus != .authorized {
    payload["error"] = "Permission not granted"
  }
  emit(payload)
  exit(0)
}

switch authStatus {
case .authorized:
  break
case .denied:
  emit(["type": "error", "code": "speech-denied", "message": "Speech Recognition permission denied. Open System Settings → Privacy & Security → Speech Recognition."])
  exit(1)
case .restricted:
  emit(["type": "error", "code": "speech-restricted", "message": "Speech Recognition is restricted on this device."])
  exit(1)
case .notDetermined:
  emit(["type": "error", "code": "speech-not-determined", "message": "Speech Recognition authorization not determined."])
  exit(1)
@unknown default:
  emit(["type": "error", "code": "speech-unknown", "message": "Unknown Speech Recognition status."])
  exit(1)
}

if micStatus != .authorized {
  emit(["type": "error", "code": "mic-denied", "message": "Microphone permission required. Open System Settings → Privacy & Security → Microphone."])
  exit(1)
}

let audioEngine = AVAudioEngine()
var isRunning = true

var currentRequest: SFSpeechAudioBufferRecognitionRequest?
var currentTask: SFSpeechRecognitionTask?

func startRecognition() {
  currentTask?.cancel()
  currentRequest?.endAudio()

  let request = SFSpeechAudioBufferRecognitionRequest()
  request.shouldReportPartialResults = true
  if #available(macOS 13, *) {
    request.addsPunctuation = true
  }
  currentRequest = request

  currentTask = recognizer.recognitionTask(with: request) { result, error in
    if let result = result {
      let text = result.bestTranscription.formattedString
      emit([
        "type": result.isFinal ? "final" : "partial",
        "text": text
      ])
      if result.isFinal {
        DispatchQueue.main.async {
          if isRunning { startRecognition() }
        }
      }
    }
    if let error = error {
      let ns = error as NSError
      if ns.code == 203 || ns.code == 216 {
        DispatchQueue.main.async {
          if isRunning { startRecognition() }
        }
        return
      }
      emit(["type": "error", "message": error.localizedDescription])
      isRunning = false
    }
  }
}

let sigInt = DispatchSource.makeSignalSource(signal: SIGINT, queue: .main)
sigInt.setEventHandler { isRunning = false }
sigInt.resume()
signal(SIGINT, SIG_IGN)
let sigTerm = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
sigTerm.setEventHandler { isRunning = false }
sigTerm.resume()
signal(SIGTERM, SIG_IGN)

let inputNode = audioEngine.inputNode
let format = inputNode.outputFormat(forBus: 0)
var lastRmsEmit: TimeInterval = 0

inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
  currentRequest?.append(buffer)

  guard let channelData = buffer.floatChannelData?[0] else { return }
  let frameCount = Int(buffer.frameLength)
  var sum: Float = 0
  for i in 0..<frameCount {
    let sample = channelData[i]
    sum += sample * sample
  }
  let rms = sqrt(sum / Float(max(frameCount, 1)))
  let now = Date().timeIntervalSince1970
  if now - lastRmsEmit > 0.05 {
    lastRmsEmit = now
    emit(["type": "audio-rms", "value": Double(min(max(rms * 4.0, 0.0), 1.0))])
  }
}

audioEngine.prepare()
do {
  try audioEngine.start()
  emit(["type": "ready"])
} catch {
  emit(["type": "error", "message": "Failed to start audio engine: \(error.localizedDescription)"])
  exit(1)
}

startRecognition()

while isRunning {
  RunLoop.current.run(until: Date(timeIntervalSinceNow: 0.1))
}

audioEngine.stop()
inputNode.removeTap(onBus: 0)
currentRequest?.endAudio()
RunLoop.current.run(until: Date(timeIntervalSinceNow: 1.5))
currentTask?.cancel()
exit(0)
