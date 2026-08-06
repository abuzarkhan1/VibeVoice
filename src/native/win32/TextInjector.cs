using System;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;

namespace VibeVoice.Native.Win32
{
    /// <summary>
    /// Windows Native Helper for UI Automation selection reading and Win32 SendInput Ctrl+V injection.
    /// Supports both --grab mode (read selected text) and stdin injection mode (paste text).
    /// </summary>
    internal static class TextInjector
    {
        private const uint INPUT_KEYBOARD = 1;
        private const uint KEYEVENTF_EXTENDEDKEY = 0x0001;
        private const uint KEYEVENTF_KEYUP = 0x0002;
        private const uint KEYEVENTF_UNICODE = 0x0004;

        private const ushort VK_CONTROL = 0x11;
        private const ushort VK_C = 0x43;
        private const ushort VK_V = 0x56;

        private const uint CF_UNICODETEXT = 13;

        [StructLayout(LayoutKind.Sequential)]
        private struct INPUT
        {
            public uint type;
            public InputUnion U;
        }

        [StructLayout(LayoutKind.Explicit)]
        private struct InputUnion
        {
            [FieldOffset(0)] public MOUSEINPUT mi;
            [FieldOffset(0)] public KEYBDINPUT ki;
            [FieldOffset(0)] public HARDWAREINPUT hi;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct KEYBDINPUT
        {
            public ushort wVk;
            public ushort wScan;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct MOUSEINPUT
        {
            public int dx;
            public int dy;
            public uint mouseData;
            public uint dwFlags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct HARDWAREINPUT
        {
            public uint uMsg;
            public ushort wParamL;
            public ushort wParamH;
        }

        [DllImport("user32.dll", SetLastError = true)]
        private static extern uint SendInput(uint nInputs, INPUT[] pInputs, int cbSize);

        [DllImport("user32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool OpenClipboard(IntPtr hWndNewOwner);

        [DllImport("user32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool CloseClipboard();

        [DllImport("user32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool EmptyClipboard();

        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr GetClipboardData(uint uFormat);

        [DllImport("user32.dll", SetLastError = true)]
        private static extern IntPtr SetClipboardData(uint uFormat, IntPtr hMem);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern IntPtr GlobalAlloc(uint uFlags, UIntPtr dwBytes);

        [DllImport("kernel32.dll", SetLastError = true)]
        private static extern IntPtr GlobalLock(IntPtr hMem);

        [DllImport("kernel32.dll", SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool GlobalUnlock(IntPtr hMem);

        private const uint GMEM_MOVEABLE = 0x0002;

        public static void Main(string[] args)
        {
            bool isGrabMode = args.Contains("--grab") || args.Contains("-g");

            if (isGrabMode)
            {
                GrabSelectedText();
            }
            else
            {
                InjectTextFromStdin();
            }
        }

        /// <summary>
        /// Reads currently selected text from focused control using UI Automation with Win32 Ctrl+C fallback.
        /// </summary>
        private static void GrabSelectedText()
        {
            string capturedText = string.Empty;

            // Attempt UI Automation selection retrieval first
            try
            {
                capturedText = GetTextViaUIAutomation();
            }
            catch
            {
                capturedText = string.Empty;
            }

            // Fallback: Synthesize Ctrl+C and read clipboard if UI Automation returns empty
            if (string.IsNullOrEmpty(capturedText))
            {
                capturedText = GrabViaClipboardCopy();
            }

            if (!string.IsNullOrEmpty(capturedText))
            {
                Console.Write(capturedText);
                Console.Out.Flush();
            }
        }

        private static string GetTextViaUIAutomation()
        {
            // Lightweight COM UIAutomation call via dynamic runtime if available
            try
            {
                Type uiAutomationType = Type.GetTypeFromCLSID(new Guid("ff48dba4-60ef-4201-aa87-54103ee359e0"));
                if (uiAutomationType != null)
                {
                    dynamic uiAutomation = Activator.CreateInstance(uiAutomationType);
                    dynamic focusedElement = uiAutomation.GetFocusedElement();
                    if (focusedElement != null)
                    {
                        // Check TextPattern (ID 10014)
                        dynamic textPattern = focusedElement.GetCurrentPattern(10014);
                        if (textPattern != null)
                        {
                            dynamic selectionRanges = textPattern.GetSelection();
                            if (selectionRanges != null && selectionRanges.Length > 0)
                            {
                                return selectionRanges[0].GetText(-1);
                            }
                        }
                    }
                }
            }
            catch
            {
                // Fall back to Win32 keyboard copy
            }
            return string.Empty;
        }

        private static string GrabViaClipboardCopy()
        {
            string previousClipboard = GetClipboardUnicodeText();

            // Synthesize Ctrl+C
            SendControlKey(VK_C);

            // Wait for application to write selection to clipboard
            Thread.Sleep(200);

            string currentClipboard = GetClipboardUnicodeText();
            string captured = string.Empty;

            if (currentClipboard != previousClipboard)
            {
                captured = currentClipboard;
            }

            // Restore previous clipboard state
            SetClipboardUnicodeText(previousClipboard);

            return captured;
        }

        /// <summary>
        /// Reads text from standard input and injects it into focused window via Ctrl+V SendInput.
        /// </summary>
        private static void InjectTextFromStdin()
        {
            string textToInject = Console.In.ReadToEnd();
            if (string.IsNullOrEmpty(textToInject))
            {
                return;
            }

            string previousClipboard = GetClipboardUnicodeText();

            SetClipboardUnicodeText(textToInject);

            // Synthesize Ctrl+V key combination via SendInput
            SendControlKey(VK_V);

            // Wait for target window to digest paste message
            Thread.Sleep(500);

            // Restore original clipboard state
            SetClipboardUnicodeText(previousClipboard);
        }

        private static void SendControlKey(ushort key)
        {
            INPUT[] inputs = new INPUT[4];

            // Ctrl Down
            inputs[0].type = INPUT_KEYBOARD;
            inputs[0].U.ki.wVk = VK_CONTROL;

            // Target Key Down
            inputs[1].type = INPUT_KEYBOARD;
            inputs[1].U.ki.wVk = key;

            // Target Key Up
            inputs[2].type = INPUT_KEYBOARD;
            inputs[2].U.ki.wVk = key;
            inputs[2].U.ki.dwFlags = KEYEVENTF_KEYUP;

            // Ctrl Up
            inputs[3].type = INPUT_KEYBOARD;
            inputs[3].U.ki.wVk = VK_CONTROL;
            inputs[3].U.ki.dwFlags = KEYEVENTF_KEYUP;

            SendInput((uint)inputs.Length, inputs, Marshal.SizeOf(typeof(INPUT)));
        }

        private static string GetClipboardUnicodeText()
        {
            if (!OpenClipboard(IntPtr.Zero)) return string.Empty;

            try
            {
                IntPtr hData = GetClipboardData(CF_UNICODETEXT);
                if (hData == IntPtr.Zero) return string.Empty;

                IntPtr pText = GlobalLock(hData);
                if (pText == IntPtr.Zero) return string.Empty;

                try
                {
                    return Marshal.PtrToStringUni(pText) ?? string.Empty;
                }
                finally
                {
                    GlobalUnlock(hData);
                }
            }
            finally
            {
                CloseClipboard();
            }
        }

        private static void SetClipboardUnicodeText(string text)
        {
            if (text == null) text = string.Empty;

            if (!OpenClipboard(IntPtr.Zero)) return;

            try
            {
                EmptyClipboard();

                byte[] bytes = Encoding.Unicode.GetBytes(text + "\0");
                UIntPtr size = new UIntPtr((uint)bytes.Length);

                IntPtr hGlobal = GlobalAlloc(GMEM_MOVEABLE, size);
                if (hGlobal == IntPtr.Zero) return;

                IntPtr target = GlobalLock(hGlobal);
                if (target != IntPtr.Zero)
                {
                    try
                    {
                        Marshal.Copy(bytes, 0, target, bytes.Length);
                    }
                    finally
                    {
                        GlobalUnlock(hGlobal);
                    }

                    SetClipboardData(CF_UNICODETEXT, hGlobal);
                }
            }
            finally
            {
                CloseClipboard();
            }
        }
    }
}
