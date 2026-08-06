using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Speech.Recognition;
using System.Text.Json;
using System.Threading;

namespace VibeVoice.Native.Win32
{
    /// <summary>
    /// Windows WinRT / System.Speech Recognition engine wrapper.
    /// Streams JSON events ('ready', 'partial', 'final', 'audio-rms', 'error', 'auth') to stdout.
    /// </summary>
    internal static class SpeechRecognizer
    {
        private static SpeechRecognitionEngine _engine;
        private static bool _isRunning = true;
        private static DateTime _lastRmsEmit = DateTime.MinValue;
        private static readonly object _lock = new object();

        public static void Main(string[] args)
        {
            bool authOnly = args.Contains("--auth-only");
            string lang = args.FirstOrDefault(a => !a.StartsWith("--")) ?? "en-US";

            if (authOnly)
            {
                EmitJson(new
                {
                    type = "auth",
                    speech = "authorized",
                    microphone = "granted"
                });
                Environment.Exit(0);
                return;
            }

            Console.CancelKeyPress += (sender, e) =>
            {
                _isRunning = false;
                StopEngine();
                Environment.Exit(0);
            };

            try
            {
                CultureInfo culture;
                try
                {
                    culture = new CultureInfo(lang);
                }
                catch
                {
                    culture = CultureInfo.CurrentCulture;
                }

                RecognizerInfo recognizerInfo = SpeechRecognitionEngine.InstalledRecognizers()
                    .FirstOrDefault(r => r.Culture.Equals(culture) || r.Culture.TwoLetterISOLanguageName.Equals(culture.TwoLetterISOLanguageName))
                    ?? SpeechRecognitionEngine.InstalledRecognizers().FirstOrDefault();

                if (recognizerInfo != null)
                {
                    _engine = new SpeechRecognitionEngine(recognizerInfo);
                }
                else
                {
                    _engine = new SpeechRecognitionEngine(culture);
                }

                // Load Dictation Grammar for freeform speech recognition
                DictationGrammar dictationGrammar = new DictationGrammar();
                _engine.LoadGrammar(dictationGrammar);

                // Subscribe to Speech Recognition events
                _engine.SpeechHypothesized += OnSpeechHypothesized;
                _engine.SpeechRecognized += OnSpeechRecognized;
                _engine.AudioLevelUpdated += OnAudioLevelUpdated;
                _engine.RecognizeCompleted += OnRecognizeCompleted;

                // Set default input audio device (Microphone)
                _engine.SetInputToDefaultAudioDevice();

                // Start continuous asynchronous speech recognition
                _engine.RecognizeAsync(RecognizeMode.Multiple);

                EmitJson(new { type = "ready" });
            }
            catch (Exception ex)
            {
                EmitJson(new
                {
                    type = "error",
                    code = "speech-init-failed",
                    message = "Failed to initialize Windows speech recognition engine: " + ex.Message
                });
                Environment.Exit(1);
                return;
            }

            // Keep process running until cancelled
            while (_isRunning)
            {
                Thread.Sleep(100);
            }

            StopEngine();
        }

        private static void OnSpeechHypothesized(object sender, SpeechHypothesizedEventArgs e)
        {
            if (e.Result != null && !string.IsNullOrWhiteSpace(e.Result.Text))
            {
                EmitJson(new
                {
                    type = "partial",
                    text = e.Result.Text
                });
            }
        }

        private static void OnSpeechRecognized(object sender, SpeechRecognizedEventArgs e)
        {
            if (e.Result != null && !string.IsNullOrWhiteSpace(e.Result.Text))
            {
                EmitJson(new
                {
                    type = "final",
                    text = e.Result.Text
                });
            }
        }

        private static void OnAudioLevelUpdated(object sender, AudioLevelUpdatedEventArgs e)
        {
            DateTime now = DateTime.UtcNow;
            if ((now - _lastRmsEmit).TotalMilliseconds >= 50)
            {
                _lastRmsEmit = now;
                // AudioLevel is 0-100; normalize to 0.0 - 1.0 double range
                double rmsNormalized = Math.Min(Math.Max(e.AudioLevel / 100.0, 0.0), 1.0);
                EmitJson(new
                {
                    type = "audio-rms",
                    value = rmsNormalized
                });
            }
        }

        private static void OnRecognizeCompleted(object sender, RecognizeCompletedEventArgs e)
        {
            if (_isRunning && _engine != null)
            {
                try
                {
                    _engine.RecognizeAsync(RecognizeMode.Multiple);
                }
                catch
                {
                    // Engine already listening or shutting down
                }
            }
        }

        private static void StopEngine()
        {
            lock (_lock)
            {
                if (_engine != null)
                {
                    try
                    {
                        _engine.RecognizeAsyncStop();
                        _engine.Dispose();
                    }
                    catch
                    {
                        // Suppress cleanup exceptions
                    }
                    _engine = null;
                }
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
