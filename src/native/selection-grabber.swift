import Foundation
import AppKit
import Carbon

let bundleArg = CommandLine.arguments.dropFirst().first ?? ""

if !bundleArg.isEmpty {
  if let app = NSRunningApplication.runningApplications(withBundleIdentifier: bundleArg).first {
    app.activate()
    // WHY: app activation is async; CGEvent before focus completes targets old app, not target.
    usleep(180_000)
  }
}

func resolveCKeycode() -> CGKeyCode {
  guard let source = TISCopyCurrentKeyboardInputSource()?.takeRetainedValue(),
        let layoutDataPtr = TISGetInputSourceProperty(source, kTISPropertyUnicodeKeyLayoutData) else {
    return 0x08
  }
  let layoutData = unsafeBitCast(layoutDataPtr, to: CFData.self)
  let bytes = CFDataGetBytePtr(layoutData)
  let layout = unsafeBitCast(bytes, to: UnsafePointer<UCKeyboardLayout>.self)

  var deadKeyState: UInt32 = 0
  var chars = [UniChar](repeating: 0, count: 4)
  var length: Int = 0
  for keyCode in 0..<128 {
    let result = UCKeyTranslate(
      layout,
      UInt16(keyCode),
      UInt16(kUCKeyActionDown),
      0,
      UInt32(LMGetKbdType()),
      OptionBits(kUCKeyTranslateNoDeadKeysBit),
      &deadKeyState,
      4,
      &length,
      &chars
    )
    if result == noErr && length > 0 && chars[0] == UniChar(UnicodeScalar("c").value) {
      return CGKeyCode(keyCode)
    }
  }
  return 0x08
}

let pasteboard = NSPasteboard.general
let originalChangeCount = pasteboard.changeCount

var snapshot: [(types: [NSPasteboard.PasteboardType], data: [NSPasteboard.PasteboardType: Data])] = []
if let items = pasteboard.pasteboardItems {
  for item in items {
    var data: [NSPasteboard.PasteboardType: Data] = [:]
    for type in item.types {
      if let d = item.data(forType: type) { data[type] = d }
    }
    snapshot.append((types: item.types, data: data))
  }
}

let cKey = resolveCKeycode()
let cmdKey: CGKeyCode = 0x37
let source = CGEventSource(stateID: .privateState)

guard
  let cmdDown = CGEvent(keyboardEventSource: source, virtualKey: cmdKey, keyDown: true),
  let cDown = CGEvent(keyboardEventSource: source, virtualKey: cKey, keyDown: true),
  let cUp = CGEvent(keyboardEventSource: source, virtualKey: cKey, keyDown: false),
  let cmdUp = CGEvent(keyboardEventSource: source, virtualKey: cmdKey, keyDown: false)
else {
  FileHandle.standardError.write("selection-grabber: CGEvent creation failed\n".data(using: .utf8)!)
  exit(1)
}

cmdDown.flags = .maskCommand
cDown.flags = .maskCommand
cUp.flags = .maskCommand
cmdUp.flags = []

let tap: CGEventTapLocation = .cghidEventTap
cmdDown.post(tap: tap)
usleep(15_000)
cDown.post(tap: tap)
usleep(15_000)
cUp.post(tap: tap)
usleep(15_000)
cmdUp.post(tap: tap)

// WHY: target app needs time to write selection to pasteboard before we read it.
usleep(220_000)

var captured = ""
if pasteboard.changeCount != originalChangeCount {
  captured = pasteboard.string(forType: .string) ?? ""
}

pasteboard.clearContents()
for entry in snapshot {
  let item = NSPasteboardItem()
  for (type, data) in entry.data {
    item.setData(data, forType: type)
  }
  pasteboard.writeObjects([item])
}

if !captured.isEmpty {
  FileHandle.standardOutput.write(captured.data(using: .utf8)!)
}

exit(0)
