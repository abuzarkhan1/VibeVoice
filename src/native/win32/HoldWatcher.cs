using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Threading;

namespace VibeVoice.Native.Win32
{
    /// <summary>
    /// Low-level Win32 keyboard hook for global modifier hotkey detection.
    /// Emits JSON events ('ready', 'down', 'up', 'perm-error') to standard output.
    /// </summary>
    internal static class HoldWatcher
    {
        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private const int WM_KEYUP = 0x0101;
        private const int WM_SYSKEYDOWN = 0x0104;
        private const int WM_SYSKEYUP = 0x0105;

        private const int VK_CONTROL = 0x11;
        private const int VK_LCONTROL = 0xA2;
        private const int VK_RCONTROL = 0xA3;

        private const int VK_MENU = 0x12; // Alt key
        private const int VK_LMENU = 0xA4;
        private const int VK_RMENU = 0xA5;

        private const int VK_NONCONVERT = 0x1D; // Fn / Non-convert fallback key
        private const int VK_LWIN = 0x5B;
        private const int VK_RWIN = 0x5C;

        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

        [StructLayout(LayoutKind.Sequential)]
        private struct KBDLLHOOKSTRUCT
        {
            public uint vkCode;
            public uint scanCode;
            public uint flags;
            public uint time;
            public IntPtr dwExtraInfo;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct MSG
        {
            public IntPtr hwnd;
            public uint message;
            public IntPtr wParam;
            public IntPtr lParam;
            public uint time;
            public POINT pt;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct POINT
        {
            public int x;
            public int y;
        }

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern int GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool TranslateMessage(ref MSG lpMsg);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr DispatchMessage(ref MSG lpMsg);

        [DllImport("user32.dll")]
        private static extern short GetAsyncKeyState(int vKey);

        private enum ComboKind
        {
            Fn,
            CtrlOpt,
            RightCmdRightOpt
        }

        private static ComboKind _comboSpec = ComboKind.Fn;
        private static string _rawCombo = "fn";
        private static IntPtr _hookID = IntPtr.Zero;
        private static LowLevelKeyboardProc _proc = HookCallback;
        private static bool _held = false;

        private static bool _leftCtrlDown = false;
        private static bool _rightCtrlDown = false;
        private static bool _leftAltDown = false;
        private static bool _rightAltDown = false;
        private static bool _fnKeyDown = false;

        public static void Main(string[] args)
        {
            if (args.Length > 0 && !string.IsNullOrWhiteSpace(args[0]))
            {
                _rawCombo = args[0].Trim().ToLowerInvariant();
            }

            _comboSpec = ParseCombo(_rawCombo);

            Console.CancelKeyPress += (sender, e) =>
            {
                Cleanup();
                Environment.Exit(0);
            };

            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule)
            {
                _hookID = SetWindowsHookEx(WH_KEYBOARD_LL, _proc, GetModuleHandle(curModule.ModuleName), 0);
            }

            if (_hookID == IntPtr.Zero)
            {
                EmitJson(new
                {
                    type = "perm-error",
                    message = "Failed to set low-level Win32 keyboard hook. SetWindowsHookEx returned null."
                });
                Environment.Exit(1);
                return;
            }

            EmitJson(new
            {
                type = "ready",
                combo = _rawCombo
            });

            // Standard Win32 Message Pump required for low-level hooks
            MSG msg;
            while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0)
            {
                TranslateMessage(ref msg);
                DispatchMessage(ref msg);
            }

            Cleanup();
        }

        private static ComboKind ParseCombo(string raw)
        {
            switch (raw)
            {
                case "fn":
                    return ComboKind.Fn;
                case "ctrl+opt":
                case "control+option":
                case "ctrl+alt":
                case "control+alt":
                    return ComboKind.CtrlOpt;
                case "right-cmd+right-opt":
                case "rcmd+ropt":
                case "right-ctrl+right-alt":
                case "rctrl+ralt":
                    return ComboKind.RightCmdRightOpt;
                default:
                    return ComboKind.Fn;
            }
        }

        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0)
            {
                int msg = wParam.ToInt32();
                bool isDown = (msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN);
                bool isUp = (msg == WM_KEYUP || msg == WM_SYSKEYUP);

                if (isDown || isUp)
                {
                    KBDLLHOOKSTRUCT hookStruct = Marshal.PtrToStructure<KBDLLHOOKSTRUCT>(lParam);
                    uint vk = hookStruct.vkCode;

                    UpdateKeyState(vk, isDown);

                    bool active = IsComboActive();
                    if (active != _held)
                    {
                        _held = active;
                        EmitJson(new { type = _held ? "down" : "up" });
                    }
                }
            }

            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }

        private static void UpdateKeyState(uint vk, bool isDown)
        {
            switch (vk)
            {
                case VK_LCONTROL:
                    _leftCtrlDown = isDown;
                    break;
                case VK_RCONTROL:
                    _rightCtrlDown = isDown;
                    break;
                case VK_CONTROL:
                    if (isDown) _leftCtrlDown = true;
                    else { _leftCtrlDown = false; _rightCtrlDown = false; }
                    break;
                case VK_LMENU:
                    _leftAltDown = isDown;
                    break;
                case VK_RMENU:
                    _rightAltDown = isDown;
                    break;
                case VK_MENU:
                    if (isDown) _leftAltDown = true;
                    else { _leftAltDown = false; _rightAltDown = false; }
                    break;
                case VK_NONCONVERT:
                    _fnKeyDown = isDown;
                    break;
            }
        }

        private static bool IsComboActive()
        {
            bool ctrlDown = _leftCtrlDown || _rightCtrlDown || (GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0;
            bool altDown = _leftAltDown || _rightAltDown || (GetAsyncKeyState(VK_MENU) & 0x8000) != 0;

            switch (_comboSpec)
            {
                case ComboKind.Fn:
                    return _fnKeyDown || ctrlDown || altDown;

                case ComboKind.CtrlOpt:
                    return ctrlDown && altDown;

                case ComboKind.RightCmdRightOpt:
                    bool rCtrl = _rightCtrlDown || (GetAsyncKeyState(VK_RCONTROL) & 0x8000) != 0;
                    bool rAlt = _rightAltDown || (GetAsyncKeyState(VK_RMENU) & 0x8000) != 0;
                    return rCtrl && rAlt;

                default:
                    return false;
            }
        }

        private static void Cleanup()
        {
            if (_hookID != IntPtr.Zero)
            {
                UnhookWindowsHookEx(_hookID);
                _hookID = IntPtr.Zero;
            }
        }

        private static void EmitJson(object payload)
        {
            try
            {
                string json = JsonSerializer.Serialize(payload);
                Console.WriteLine(json);
                Console.Out.Flush();
            }
            catch
            {
                // Suppress output errors during process shutdown
            }
        }
    }
}
