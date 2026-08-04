import Foundation
import AppKit
import Carbon

let text = String(data: FileHandle.standardInput.readDataToEndOfFile(), encoding: .utf8) ?? ""
if text.isEmpty { exit(0) }

func resolveVKeycode() -> CGKeyCode {
  guard let source = TISCopyCurrentKeyboardInputSource()?.takeRetainedValue(),
        let layoutDataPtr = TISGetInputSourceProperty(source, kTISPropertyUnicodeKeyLayoutData) else {
    return 0x09
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
    if result == noErr && length > 0 && chars[0] == UniChar(UnicodeScalar("v").value) {
      return CGKeyCode(keyCode)
    }
  }
  return 0x09
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

pasteboard.clearContents()
pasteboard.setString(text, forType: .string)

let vKey = resolveVKeycode()
let cmdKey: CGKeyCode = 0x37
// WHY: privateState ignores real-keyboard modifier state, so a held Shift doesn't leak into the synthesized Cmd+V.
let source = CGEventSource(stateID: .privateState)

guard
  let cmdDown = CGEvent(keyboardEventSource: source, virtualKey: cmdKey, keyDown: true),
  let vDown = CGEvent(keyboardEventSource: source, virtualKey: vKey, keyDown: true),
  let vUp = CGEvent(keyboardEventSource: source, virtualKey: vKey, keyDown: false),
  let cmdUp = CGEvent(keyboardEventSource: source, virtualKey: cmdKey, keyDown: false)
else {
  FileHandle.standardError.write("text-injector: CGEvent creation failed\n".data(using: .utf8)!)
  exit(1)
}

cmdDown.flags = .maskCommand
vDown.flags = .maskCommand
vUp.flags = .maskCommand
cmdUp.flags = []

let tap: CGEventTapLocation = .cghidEventTap
cmdDown.post(tap: tap)
usleep(10_000)
vDown.post(tap: tap)
usleep(10_000)
vUp.post(tap: tap)
usleep(10_000)
cmdUp.post(tap: tap)

usleep(700_000)

if pasteboard.changeCount == originalChangeCount + 1 {
  pasteboard.clearContents()
  for entry in snapshot {
    let item = NSPasteboardItem()
    for (type, data) in entry.data {
      item.setData(data, forType: type)
    }
    pasteboard.writeObjects([item])
  }
}

exit(0)
