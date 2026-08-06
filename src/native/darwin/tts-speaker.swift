import Foundation
import AVFoundation

let args = Array(CommandLine.arguments.dropFirst())
let defaultVoice = args.first ?? "Samantha"
let defaultRate = Float(args.dropFirst().first ?? "200") ?? 200

func emit(_ dict: [String: Any]) {
  guard let data = try? JSONSerialization.data(withJSONObject: dict, options: []),
        let str = String(data: data, encoding: .utf8) else { return }
  FileHandle.standardOutput.write((str + "\n").data(using: .utf8)!)
}

func resolveVoice(_ wanted: String) -> AVSpeechSynthesisVoice? {
  if let byIdentifier = AVSpeechSynthesisVoice(identifier: wanted) {
    return byIdentifier
  }
  let all = AVSpeechSynthesisVoice.speechVoices()
  if let match = all.first(where: { $0.name == wanted }) {
    return match
  }
  return AVSpeechSynthesisVoice(language: "en-US")
}

class SpeakerDelegate: NSObject, AVSpeechSynthesizerDelegate {
  func speechSynthesizer(_ synth: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
    emit(["type": "start", "text": utterance.speechString])
  }
  func speechSynthesizer(_ synth: AVSpeechSynthesizer, willSpeakRangeOfSpeechString range: NSRange, utterance: AVSpeechUtterance) {
    emit(["type": "word", "start": range.location, "length": range.length])
  }
  func speechSynthesizer(_ synth: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
    emit(["type": "done"])
  }
  func speechSynthesizer(_ synth: AVSpeechSynthesizer, didPause utterance: AVSpeechUtterance) {
    emit(["type": "paused"])
  }
  func speechSynthesizer(_ synth: AVSpeechSynthesizer, didContinue utterance: AVSpeechUtterance) {
    emit(["type": "resumed"])
  }
  func speechSynthesizer(_ synth: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
    emit(["type": "done"])
  }
}

let delegate = SpeakerDelegate()
let synth = AVSpeechSynthesizer()
synth.delegate = delegate

func handleCommand(_ jsonLine: String) {
  let trimmed = jsonLine.trimmingCharacters(in: .whitespacesAndNewlines)
  guard !trimmed.isEmpty,
        let data = trimmed.data(using: .utf8),
        let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { return }
  let cmd = obj["cmd"] as? String ?? ""
  switch cmd {
  case "speak":
    guard let text = obj["text"] as? String, !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }
    synth.stopSpeaking(at: .immediate)
    let utterance = AVSpeechUtterance(string: text)
    let voiceName = obj["voice"] as? String ?? defaultVoice
    let wpm: Float
    if let n = obj["rate"] as? Double { wpm = Float(n) }
    else if let n = obj["rate"] as? Int { wpm = Float(n) }
    else { wpm = defaultRate }
    if let v = resolveVoice(voiceName) { utterance.voice = v }
    let baseline: Float = 175
    let scaled = AVSpeechUtteranceDefaultSpeechRate * (wpm / baseline)
    utterance.rate = max(AVSpeechUtteranceMinimumSpeechRate, min(AVSpeechUtteranceMaximumSpeechRate, scaled))
    synth.speak(utterance)
  case "pause":
    synth.pauseSpeaking(at: .word)
  case "resume":
    synth.continueSpeaking()
  case "stop":
    synth.stopSpeaking(at: .immediate)
  case "exit":
    synth.stopSpeaking(at: .immediate)
    exit(0)
  default:
    break
  }
}

var buffer = ""
let stdin = FileHandle.standardInput
stdin.readabilityHandler = { handle in
  let data = handle.availableData
  if data.count == 0 {
    DispatchQueue.main.async { exit(0) }
    return
  }
  guard let str = String(data: data, encoding: .utf8) else { return }
  buffer += str
  while let nlRange = buffer.range(of: "\n") {
    let line = String(buffer[..<nlRange.lowerBound])
    buffer = String(buffer[nlRange.upperBound...])
    DispatchQueue.main.async { handleCommand(line) }
  }
}

emit(["type": "ready"])

let sigInt = DispatchSource.makeSignalSource(signal: SIGINT, queue: .main)
sigInt.setEventHandler { synth.stopSpeaking(at: .immediate); exit(0) }
sigInt.resume()
signal(SIGINT, SIG_IGN)
let sigTerm = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
sigTerm.setEventHandler { synth.stopSpeaking(at: .immediate); exit(0) }
sigTerm.resume()
signal(SIGTERM, SIG_IGN)

RunLoop.current.run()
