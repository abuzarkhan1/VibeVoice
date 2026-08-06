using System;
using System.IO;
using System.Linq;
using System.Speech.Synthesis;
using System.Text.Json;
using System.Threading;

namespace VibeVoice.Native.Win32
{
    /// <summary>
    /// Windows System.Speech.Synthesis TTS engine wrapper.
    /// Reads stdin JSON commands and streams word boundary & state events to stdout JSON lines.
    /// </summary>
    internal static class TTSSpeaker
    {
        private static SpeechSynthesizer _synth;
        private static string _defaultVoice = "Microsoft David Desktop";
        private static int _defaultRateWpm = 200;
        private static string _currentText = string.Empty;

        public static void Main(string[] args)
        {
            if (args.Length > 0 && !string.IsNullOrWhiteSpace(args[0]))
            {
                _defaultVoice = args[0];
            }
            if (args.Length > 1 && int.TryParse(args[1], out int rate))
            {
                _defaultRateWpm = rate;
            }

            Console.CancelKeyPress += (sender, e) =>
            {
                StopSpeech();
                Environment.Exit(0);
            };

            try
            {
                _synth = new SpeechSynthesizer();
                _synth.SetOutputToDefaultAudioDevice();

                _synth.SpeakStarted += (s, e) =>
                {
                    EmitJson(new { type = "start", text = _currentText });
                };

                _synth.SpeakProgress += (s, e) =>
                {
                    EmitJson(new
                    {
                        type = "word",
                        start = e.CharacterPosition,
                        length = e.CharacterCount
                    });
                };

                _synth.SpeakCompleted += (s, e) =>
                {
                    EmitJson(new { type = "done" });
                };

                EmitJson(new { type = "ready" });
            }
            catch (Exception ex)
            {
                EmitJson(new
                {
                    type = "error",
                    message = "Failed to initialize Windows TTS speaker: " + ex.Message
                });
                Environment.Exit(1);
                return;
            }

            // Stdin command loop
            string line;
            while ((line = Console.ReadLine()) != null)
            {
                HandleCommand(line);
            }

            StopSpeech();
        }

        private static void HandleCommand(string jsonLine)
        {
            if (string.IsNullOrWhiteSpace(jsonLine)) return;

            try
            {
                using (JsonDocument doc = JsonDocument.Parse(jsonLine))
                {
                    JsonElement root = doc.RootElement;
                    if (!root.TryGetProperty("cmd", out JsonElement cmdElem)) return;

                    string cmd = cmdElem.GetString();
                    switch (cmd)
                    {
                        case "speak":
                            if (!root.TryGetProperty("text", out JsonElement textElem)) return;
                            string text = textElem.GetString();
                            if (string.IsNullOrWhiteSpace(text)) return;

                            _currentText = text;
                            _synth.SpeakAsyncCancelAll();

                            string voiceName = _defaultVoice;
                            if (root.TryGetProperty("voice", out JsonElement voiceElem) && voiceElem.ValueKind == JsonValueKind.String)
                            {
                                voiceName = voiceElem.GetString();
                            }

                            int wpm = _defaultRateWpm;
                            if (root.TryGetProperty("rate", out JsonElement rateElem))
                            {
                                if (rateElem.ValueKind == JsonValueKind.Number)
                                    wpm = rateElem.GetInt32();
                            }

                            SelectVoice(voiceName);
                            SetRateFromWpm(wpm);

                            _synth.SpeakAsync(text);
                            break;

                        case "pause":
                            _synth.Pause();
                            EmitJson(new { type = "paused" });
                            break;

                        case "resume":
                            _synth.Resume();
                            EmitJson(new { type = "resumed" });
                            break;

                        case "stop":
                            _synth.SpeakAsyncCancelAll();
                            EmitJson(new { type = "done" });
                            break;

                        case "exit":
                            _synth.SpeakAsyncCancelAll();
                            Environment.Exit(0);
                            break;
                    }
                }
            }
            catch
            {
                // Suppress JSON parse errors on invalid input lines
            }
        }

        private static void SelectVoice(string requestedVoice)
        {
            if (string.IsNullOrWhiteSpace(requestedVoice)) return;

            try
            {
                var installedVoices = _synth.GetInstalledVoices();
                var match = installedVoices.FirstOrDefault(v => v.VoiceInfo.Name.Equals(requestedVoice, StringComparison.OrdinalIgnoreCase)
                                                              || v.VoiceInfo.Name.Contains(requestedVoice, StringComparison.OrdinalIgnoreCase));

                if (match != null && match.Enabled)
                {
                    _synth.SelectVoice(match.VoiceInfo.Name);
                }
                else
                {
                    // Fall back to default or first enabled voice
                    var fallback = installedVoices.FirstOrDefault(v => v.Enabled);
                    if (fallback != null)
                    {
                        _synth.SelectVoice(fallback.VoiceInfo.Name);
                    }
                }
            }
            catch
            {
                // Suppress voice selection errors
            }
        }

        private static void SetRateFromWpm(int wpm)
        {
            // System.Speech.Synthesis.SpeechSynthesizer.Rate accepts integers from -10 to +10
            // Baseline 175 WPM = Rate 0. Each step roughly maps to ~15 WPM.
            const int baselineWpm = 175;
            int relativeRate = (int)Math.Round((wpm - baselineWpm) / 15.0);
            _synth.Rate = Math.Min(Math.Max(relativeRate, -10), 10);
        }

        private static void StopSpeech()
        {
            if (_synth != null)
            {
                try
                {
                    _synth.SpeakAsyncCancelAll();
                    _synth.Dispose();
                }
                catch
                {
                    // Suppress cleanup errors
                }
                _synth = null;
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
                // Suppress output errors
            }
        }
    }
}
