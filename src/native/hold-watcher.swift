import Foundation
import CoreGraphics
import AppKit

let combo = (CommandLine.arguments.dropFirst().first ?? "fn").lowercased()

func emit(_ dict: [String: Any]) {
  guard let data = try? JSONSerialization.data(withJSONObject: dict, options: []),
        let str = String(data: data, encoding: .utf8) else { return }
  FileHandle.standardOutput.write((str + "\n").data(using: .utf8)!)
}

let NX_DEVICELCMDKEYMASK: UInt64 = 0x00000008
let NX_DEVICERCMDKEYMASK: UInt64 = 0x00000010
let NX_DEVICELALTKEYMASK: UInt64 = 0x00000020
let NX_DEVICERALTKEYMASK: UInt64 = 0x00000040

enum ComboKind {
  case fn
  case ctrlOpt
  case rightCmdRightOpt
}

func parseCombo(_ raw: String) -> ComboKind {
  switch raw {
  case "fn":
    return .fn
  case "ctrl+opt", "control+option":
    return .ctrlOpt
  case "right-cmd+right-opt", "rcmd+ropt":
    return .rightCmdRightOpt
  default:
    return .fn
  }
}

let spec = parseCombo(combo)

var held = false

func isComboActive(_ flags: CGEventFlags) -> Bool {
  switch spec {
  case .fn:
    return flags.contains(.maskSecondaryFn)
  case .ctrlOpt:
    return flags.contains([.maskControl, .maskAlternate])
  case .rightCmdRightOpt:
    // WHY: CGEventFlags.maskCommand/maskAlternate don't distinguish left vs right; device-specific NX bits do.
    let raw = flags.rawValue
    return (raw & NX_DEVICERCMDKEYMASK) != 0 && (raw & NX_DEVICERALTKEYMASK) != 0
  }
}

let mask = (1 << CGEventType.flagsChanged.rawValue)

let callback: CGEventTapCallBack = { _, type, event, _ in
  if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
    return Unmanaged.passUnretained(event)
  }
  if type == .flagsChanged {
    let active = isComboActive(event.flags)
    if active != held {
      held = active
      emit(["type": active ? "down" : "up"])
    }
  }
  return Unmanaged.passUnretained(event)
}

guard let tap = CGEvent.tapCreate(
  tap: .cgSessionEventTap,
  place: .headInsertEventTap,
  options: .listenOnly,
  eventsOfInterest: CGEventMask(mask),
  callback: callback,
  userInfo: nil
) else {
  emit([
    "type": "perm-error",
    "message": "Accessibility permission required. Open System Settings → Privacy & Security → Accessibility."
  ])
  exit(1)
}

let runLoopSource = CFMachPortCreateRunLoopSource(nil, tap, 0)
CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
CGEvent.tapEnable(tap: tap, enable: true)

emit(["type": "ready", "combo": combo])

let sigInt = DispatchSource.makeSignalSource(signal: SIGINT, queue: .main)
sigInt.setEventHandler { exit(0) }
sigInt.resume()
signal(SIGINT, SIG_IGN)
let sigTerm = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
sigTerm.setEventHandler { exit(0) }
sigTerm.resume()
signal(SIGTERM, SIG_IGN)

CFRunLoopRun()
