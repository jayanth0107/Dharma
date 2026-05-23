// ధర్మ — Shared TTS (Text-to-Speech) service
// Language-aware: Telugu voice for Telugu, English voice for English
// On web: falls back to English text if no Telugu voice available

import { useState, useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as ExpoSpeech from 'expo-speech';

// ── Web voice management ──
let teluguVoice = null;
let englishVoice = null;
let voicesLoaded = false;

// ── Mobile voice management ──
// expo-speech.speak({ language: 'te-IN' }) does NOT guarantee Telugu
// audio — if the device doesn't have a Telugu TTS voice installed,
// Android silently picks the default voice (usually English). Result:
// user picks Telugu in the app, hears English audio. Fix is to query
// the available voices once, cache the Telugu voice identifier, and
// pass it explicitly to ExpoSpeech.speak(). When no Telugu voice is
// installed, we fall back to English text + raise the fallback note.
let mobileTeluguVoiceId = null;
let mobileVoicesLoaded = false;
let mobileVoiceLoadPromise = null;

function loadMobileVoices() {
  if (Platform.OS === 'web') return Promise.resolve();
  if (mobileVoicesLoaded) return Promise.resolve();
  if (mobileVoiceLoadPromise) return mobileVoiceLoadPromise;
  mobileVoiceLoadPromise = (async () => {
    try {
      const voices = await ExpoSpeech.getAvailableVoicesAsync();
      // Pick the highest-quality Telugu voice when multiple are present.
      const teVoices = (voices || []).filter((v) => {
        const lng = (v.language || '').toLowerCase().replace('_', '-');
        return lng.startsWith('te');
      });
      if (teVoices.length > 0) {
        const enhanced = teVoices.find((v) => (v.quality || '').toLowerCase() === 'enhanced');
        mobileTeluguVoiceId = (enhanced || teVoices[0]).identifier || null;
      }
    } catch {}
    mobileVoicesLoaded = true;
  })();
  return mobileVoiceLoadPromise;
}

// Kick off voice detection eagerly on first import so the cache is
// ready by the time a user taps Listen.
if (Platform.OS !== 'web') {
  loadMobileVoices();
}

/** True when Telugu TTS is usable (web: voice loaded; mobile: voice id detected). */
export function hasTeluguVoiceMobile() {
  if (Platform.OS === 'web') return false;
  return mobileVoicesLoaded && mobileTeluguVoiceId != null;
}

function loadWebVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return;
  voicesLoaded = true;
  teluguVoice =
    voices.find(v => v.lang === 'te-IN') ||
    voices.find(v => v.lang.startsWith('te')) ||
    voices.find(v => v.name.toLowerCase().includes('telugu')) ||
    null;
  englishVoice =
    voices.find(v => v.lang === 'en-IN') ||
    voices.find(v => v.lang === 'en-US') ||
    voices.find(v => v.lang.startsWith('en')) ||
    null;
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  loadWebVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadWebVoices;
  }
}

/** Check if Telugu voice is available on web */
export function hasTeluguVoice() {
  if (Platform.OS !== 'web') return true; // mobile always has it via OS
  if (!voicesLoaded) loadWebVoices();
  return teluguVoice != null;
}

/** Get list of available voice languages (for debug) */
export function getAvailableVoiceInfo() {
  if (Platform.OS !== 'web') return { platform: 'mobile', teluguAvailable: true };
  if (!voicesLoaded) loadWebVoices();
  return {
    platform: 'web',
    teluguAvailable: teluguVoice != null,
    teluguVoiceName: teluguVoice?.name || null,
    englishVoiceName: englishVoice?.name || null,
    hint: teluguVoice ? null : 'To hear Telugu: Windows Settings → Time & Language → Language → Add Telugu (తెలుగు) → Download speech pack',
  };
}

function webSpeak(text, voice, langCode, rate, onDone) {
  if (typeof window === 'undefined' || !window.speechSynthesis) { onDone?.(); return; }
  try {
    window.speechSynthesis.cancel();
    if (!voicesLoaded) loadWebVoices();

    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = langCode;
    utt.rate = rate;
    if (voice) utt.voice = voice;

    utt.onend = () => { onDone?.(); };
    utt.onerror = (e) => {
      if (e?.error !== 'interrupted') onDone?.();
    };

    window.speechSynthesis.speak(utt);

    // Chrome workaround: resume periodically to prevent pause after 15s
    if (window._dharmaSpeechTimer) clearInterval(window._dharmaSpeechTimer);
    window._dharmaSpeechTimer = setInterval(() => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else {
        clearInterval(window._dharmaSpeechTimer);
      }
    }, 10000);
  } catch { onDone?.(); }
}

function webStop() {
  if (typeof window !== 'undefined') {
    if (window._dharmaSpeechTimer) clearInterval(window._dharmaSpeechTimer);
    if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch {}
  }
}

// ── Unified speak / stop ──

function doStop() {
  if (Platform.OS === 'web') {
    webStop();
  } else {
    try { ExpoSpeech.stop(); } catch {}
  }
}

/**
 * Core speak function.
 * On web: if Telugu requested but no Telugu voice → speaks English text instead.
 */
function doSpeak(textTe, textEn, lang, onDone) {
  doStop();

  if (Platform.OS === 'web') {
    if (!voicesLoaded) loadWebVoices();

    if (lang === 'te' && teluguVoice) {
      // Telugu voice available → speak Telugu text
      const text = textTe || textEn;
      if (!text) { onDone?.(); return; }
      webSpeak(text, teluguVoice, 'te-IN', 0.85, onDone);
    } else {
      // No Telugu voice OR English requested → always speak English text
      const text = textEn || textTe;
      if (!text) { onDone?.(); return; }
      webSpeak(text, englishVoice, 'en-IN', 0.8, onDone);
    }
  } else {
    // Mobile — query installed voices, pass voice id explicitly when
    // a Telugu voice is available. Otherwise fall back to English text
    // + English voice so the user actually gets audio they understand
    // instead of an "English voice reading Telugu glyphs" hybrid.
    const teluguReady = mobileVoicesLoaded && mobileTeluguVoiceId != null;
    if (lang === 'te' && teluguReady) {
      const text = textTe || textEn;
      if (!text) { onDone?.(); return; }
      try {
        ExpoSpeech.speak(text, {
          language: 'te-IN',
          voice: mobileTeluguVoiceId,
          rate: 0.85,
          onDone, onError: onDone, onStopped: onDone,
        });
      } catch { onDone?.(); }
    } else {
      // English path — also the fallback path when Telugu was
      // requested but no Telugu voice is installed on the device.
      const text = textEn || textTe;
      if (!text) { onDone?.(); return; }
      try {
        ExpoSpeech.speak(text, {
          language: 'en-IN',
          rate: 0.8,
          onDone, onError: onDone, onStopped: onDone,
        });
      } catch { onDone?.(); }
    }
  }
}

export function stopSpeech() { doStop(); }

/**
 * useSpeaker — React hook for speak/stop toggle.
 *
 *   const { isSpeaking, toggle, speakerIcon } = useSpeaker();
 *   toggle(textTe, textEn, lang)
 *
 * On web without Telugu voice: always reads English text in English voice.
 * On mobile: reads Telugu text in Telugu voice when lang='te'.
 */
export function useSpeaker() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [fallbackNote, setFallbackNote] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; doStop(); };
  }, []);

  const toggle = useCallback((textTe, textEn, lang = 'te') => {
    if (isSpeaking) {
      doStop();
      if (mountedRef.current) setIsSpeaking(false);
    } else {
      // Detect fallback on BOTH platforms:
      //  • web — Telugu voice not loaded by speechSynthesis
      //  • mobile — Telugu voice not installed on device (cached
      //    flag from loadMobileVoices). When the cache isn't ready
      //    yet (first tap), assume Telugu IS available (optimistic)
      //    and the next tap will set the banner correctly once the
      //    voice list resolves.
      const willFallback = lang === 'te' && (
        (Platform.OS === 'web' && !hasTeluguVoice()) ||
        (Platform.OS !== 'web' && mobileVoicesLoaded && mobileTeluguVoiceId == null)
      );
      doSpeak(textTe, textEn, lang, () => {
        if (mountedRef.current) setIsSpeaking(false);
      });
      if (mountedRef.current) {
        setIsSpeaking(true);
        if (willFallback) setFallbackNote(true);
      }
    }
  }, [isSpeaking]);

  const stop = useCallback(() => {
    doStop();
    if (mountedRef.current) setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    toggle,
    stop,
    isAvailable: true,
    speakerIcon: isSpeaking ? 'stop-circle' : 'volume-high',
    // When true: Telugu was requested but English is being read (no Telugu voice on web)
    fallbackNote,
    dismissFallbackNote: () => setFallbackNote(false),
  };
}
