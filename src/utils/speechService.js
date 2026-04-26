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
    // Mobile — OS handles Telugu/English voices natively
    const text = lang === 'te' ? (textTe || textEn) : (textEn || textTe);
    if (!text) { onDone?.(); return; }
    const langCode = lang === 'te' ? 'te-IN' : 'en-IN';
    const rate = lang === 'te' ? 0.85 : 0.8;
    try {
      ExpoSpeech.speak(text, {
        language: langCode,
        rate,
        onDone,
        onError: onDone,
        onStopped: onDone,
      });
    } catch { onDone?.(); }
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
      // Check if we're falling back to English on web
      const willFallback = Platform.OS === 'web' && lang === 'te' && !hasTeluguVoice();
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
