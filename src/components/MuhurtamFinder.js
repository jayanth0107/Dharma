// Dharma Daily — Muhurtam Finder (Premium Feature)
// Helps users find auspicious days for events like weddings,
// griha pravesham, travel, new ventures, etc.
// Uses panchangam calculations to suggest best dates.
// Includes PDF generation and WhatsApp/native sharing.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, Platform,
  Share, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getDailyPanchangam, DEFAULT_LOCATION } from '../utils/panchangamCalculator';
import { trackEvent } from '../utils/analytics';
import { SectionShareRow } from './SectionShareRow';

// Event types with their auspicious conditions
const EVENT_TYPES = [
  {
    id: 'wedding',
    telugu: 'వివాహం',
    english: 'Wedding',
    icon: 'ring',
    color: Colors.kumkum,
    goodTithis: [2, 3, 5, 7, 10, 11, 13],
    goodNakshatras: [3, 4, 11, 12, 14, 16, 20, 21, 26],
    avoidWeekdays: [2, 6],
  },
  {
    id: 'griha_pravesham',
    telugu: 'గృహ ప్రవేశం',
    english: 'House Warming',
    icon: 'home-heart',
    color: Colors.tulasiGreen,
    goodTithis: [1, 2, 3, 5, 7, 10, 11, 13],
    goodNakshatras: [3, 5, 6, 7, 11, 12, 14, 16, 20, 21, 26],
    avoidWeekdays: [2, 6],
  },
  {
    id: 'travel',
    telugu: 'ప్రయాణం',
    english: 'Travel',
    icon: 'airplane-takeoff',
    color: '#4A90D9',
    goodTithis: [1, 2, 3, 5, 7, 10, 11, 13],
    goodNakshatras: [1, 3, 5, 7, 11, 12, 14, 16, 20, 21, 25, 26],
    avoidWeekdays: [2],
  },
  {
    id: 'business',
    telugu: 'వ్యాపారం ప్రారంభం',
    english: 'New Business',
    icon: 'store',
    color: Colors.gold,
    goodTithis: [1, 2, 3, 5, 7, 10, 11, 13],
    goodNakshatras: [1, 3, 7, 11, 12, 14, 16, 20, 21, 25, 26],
    avoidWeekdays: [2, 6],
  },
  {
    id: 'vehicle',
    telugu: 'వాహనం కొనుగోలు',
    english: 'Vehicle Purchase',
    icon: 'car',
    color: Colors.saffron,
    goodTithis: [2, 3, 5, 7, 10, 11, 13],
    goodNakshatras: [1, 3, 7, 11, 12, 14, 21, 25, 26],
    avoidWeekdays: [2, 6],
  },
  {
    id: 'education',
    telugu: 'విద్యారంభం',
    english: 'Start Education',
    icon: 'school',
    color: '#6B3FA0',
    goodTithis: [1, 2, 3, 5, 7, 10, 11, 13],
    goodNakshatras: [1, 3, 5, 7, 11, 14, 16, 20, 21, 25, 26],
    avoidWeekdays: [2, 6],
  },
];

const WEEKDAY_NAMES_TE = ['ఆదివారం', 'సోమవారం', 'మంగళవారం', 'బుధవారం', 'గురువారం', 'శుక్రవారం', 'శనివారం'];
const WEEKDAY_NAMES_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Analyze a date for muhurtam suitability for a given event type
 */
function analyzeDateForEvent(date, eventType, location) {
  const panchangam = getDailyPanchangam(date, location);
  if (!panchangam) return null;

  const dayOfWeek = date.getDay();
  const tithiIndex = panchangam.tithi?.id || 0;
  const nakshatraIndex = panchangam.nakshatra?.id || 0;

  let score = 0;
  const reasons = [];
  const warnings = [];

  if (eventType.goodTithis.includes(tithiIndex)) {
    score += 30;
    reasons.push(`శుభ తిథి: ${panchangam.tithi.telugu}`);
  } else {
    score -= 20;
    warnings.push(`తిథి అనుకూలం కాదు: ${panchangam.tithi.telugu}`);
  }

  if (eventType.goodNakshatras.includes(nakshatraIndex)) {
    score += 35;
    reasons.push(`శుభ నక్షత్రం: ${panchangam.nakshatra.telugu}`);
  } else {
    score -= 15;
    warnings.push(`నక్షత్రం అనుకూలం కాదు: ${panchangam.nakshatra.telugu}`);
  }

  if (eventType.avoidWeekdays.includes(dayOfWeek)) {
    score -= 25;
    warnings.push(`${WEEKDAY_NAMES_TE[dayOfWeek]} — ఈ కార్యానికి అనుకూలం కాదు`);
  } else {
    score += 15;
    reasons.push(`${WEEKDAY_NAMES_TE[dayOfWeek]} — అనుకూలం`);
  }

  const badYogas = [0, 5, 8, 9, 12, 13, 16, 18, 26];
  const yogaIndex = panchangam.yoga?.id || 0;
  if (!badYogas.includes(yogaIndex)) {
    score += 10;
    reasons.push(`యోగం: ${panchangam.yoga.telugu}`);
  } else {
    score -= 10;
    warnings.push(`యోగం అనుకూలం కాదు: ${panchangam.yoga.telugu}`);
  }

  if (panchangam.tithi.paksha === 'శుక్ల') {
    score += 5;
    reasons.push('శుక్ల పక్షం — వృద్ధి');
  }

  const normalizedScore = Math.max(0, Math.min(100, score + 50));

  return {
    date,
    dateStr: date.toISOString().split('T')[0],
    score: normalizedScore,
    rating: normalizedScore >= 75 ? 'excellent' : normalizedScore >= 50 ? 'good' : normalizedScore >= 30 ? 'fair' : 'avoid',
    ratingTelugu: normalizedScore >= 75 ? 'అత్యుత్తమం' : normalizedScore >= 50 ? 'మంచిది' : normalizedScore >= 30 ? 'సాధారణం' : 'నివారించండి',
    reasons,
    warnings,
    panchangam,
  };
}

/**
 * Find best dates in a range for a given event
 */
function findBestDates(eventType, location, startDate, daysToSearch = 90) {
  const results = [];
  const seen = new Set();
  const start = new Date(startDate);

  for (let i = 0; i < daysToSearch; i++) {
    const checkDate = new Date(start);
    checkDate.setDate(checkDate.getDate() + i);
    const analysis = analyzeDateForEvent(checkDate, eventType, location);
    if (analysis && analysis.score >= 50) {
      // Deduplicate by date string
      if (!seen.has(analysis.dateStr)) {
        seen.add(analysis.dateStr);
        results.push(analysis);
      }
    }
  }

  // Sort chronologically (date order) — more intuitive than score order
  results.sort((a, b) => a.date - b.date);
  return results.slice(0, 20);
}

// ─── PDF Generation ───────────────────────────────────────────────

/**
 * Build a beautiful HTML template for the muhurtam PDF
 */
function buildMuhurtamPdfHtml(eventType, results, locationName) {
  const generatedDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const ratingColorMap = {
    excellent: '#2E7D32',
    good: '#4A90D9',
    fair: '#E8751A',
    avoid: '#C41E3A',
  };

  const dateRows = results.map((item, idx) => {
    const d = item.date;
    const dateEn = d.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const dateTe = d.toLocaleDateString('te-IN', {
      weekday: 'long', month: 'long', day: 'numeric',
    });

    const reasonsHtml = item.reasons.map(r => `<li style="color:#2E7D32;">✓ ${r}</li>`).join('');
    const warningsHtml = item.warnings.map(w => `<li style="color:#E8751A;">⚠ ${w}</li>`).join('');

    const p = item.panchangam;

    return `
      <div style="page-break-inside: avoid; border: 1px solid #e0d5c5; border-radius: 12px; padding: 16px; margin-bottom: 12px; background: ${idx % 2 === 0 ? '#FFFDF8' : '#FFF8F0'};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #2C1810;">${idx + 1}. ${dateEn}</div>
            <div style="font-size: 14px; color: #5A4A3A; margin-top: 2px;">${dateTe}</div>
          </div>
          <div style="background: ${ratingColorMap[item.rating]}; color: white; padding: 4px 14px; border-radius: 16px; font-weight: 700; font-size: 13px;">
            ${item.ratingTelugu} — ${item.score}%
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px;">
          <tr style="background: #F5E6D3;">
            <td style="padding: 6px 10px; font-weight: 700; border-radius: 6px 0 0 6px;">తిథి / Tithi</td>
            <td style="padding: 6px 10px;">${p.tithi?.telugu || ''} (${p.tithi?.english || ''})</td>
            <td style="padding: 6px 10px; font-weight: 700;">నక్షత్రం / Nakshatra</td>
            <td style="padding: 6px 10px; border-radius: 0 6px 6px 0;">${p.nakshatra?.telugu || ''} (${p.nakshatra?.english || ''})</td>
          </tr>
          <tr>
            <td style="padding: 6px 10px; font-weight: 700;">యోగం / Yoga</td>
            <td style="padding: 6px 10px;">${p.yoga?.telugu || ''} (${p.yoga?.english || ''})</td>
            <td style="padding: 6px 10px; font-weight: 700;">కరణం / Karana</td>
            <td style="padding: 6px 10px;">${p.karana?.telugu || ''} (${p.karana?.english || ''})</td>
          </tr>
          <tr style="background: #F5E6D3;">
            <td style="padding: 6px 10px; font-weight: 700; border-radius: 6px 0 0 6px;">సూర్యోదయం</td>
            <td style="padding: 6px 10px;">${p.sunrise || ''}</td>
            <td style="padding: 6px 10px; font-weight: 700;">సూర్యాస్తమయం</td>
            <td style="padding: 6px 10px; border-radius: 0 6px 6px 0;">${p.sunset || ''}</td>
          </tr>
        </table>

        <div style="display: flex; gap: 20px; margin-top: 6px;">
          <div style="flex: 1;">
            <div style="font-size: 12px; font-weight: 700; color: #2E7D32; margin-bottom: 4px;">శుభ కారణాలు:</div>
            <ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.6;">${reasonsHtml}</ul>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 12px; font-weight: 700; color: #E8751A; margin-bottom: 4px;">హెచ్చరికలు:</div>
            <ul style="margin: 0; padding-left: 16px; font-size: 12px; line-height: 1.6;">${warningsHtml || '<li style="color:#999;">లేవు</li>'}</ul>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="te">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page { margin: 20mm 15mm; }
    body {
      font-family: 'Noto Sans Telugu', 'Segoe UI', sans-serif;
      color: #2C1810;
      background: #FFFFFF;
      line-height: 1.5;
      margin: 0; padding: 0;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #2E7D32, #1B5E20); padding: 24px 30px; border-radius: 16px; margin-bottom: 20px; text-align: center;">
    <div style="font-size: 28px; font-weight: 800; color: #FFD700; letter-spacing: 2px;">🙏 ధర్మ Daily</div>
    <div style="font-size: 20px; font-weight: 700; color: #FFFFFF; margin-top: 8px;">ముహూర్తం నివేదిక — Muhurtam Report</div>
    <div style="font-size: 14px; color: rgba(255,255,255,0.8); margin-top: 6px;">
      ${eventType.telugu} / ${eventType.english}
    </div>
  </div>

  <!-- Info Bar -->
  <div style="display: flex; justify-content: space-between; padding: 12px 16px; background: #F5E6D3; border-radius: 10px; margin-bottom: 16px; font-size: 13px;">
    <div><strong>స్థానం / Location:</strong> ${locationName || 'Hyderabad'}</div>
    <div><strong>తేదీ / Generated:</strong> ${generatedDate}</div>
    <div><strong>మొత్తం శుభ దినాలు:</strong> ${results.length}</div>
  </div>

  <!-- Results -->
  <div style="font-size: 16px; font-weight: 700; color: #2C1810; margin-bottom: 12px; border-bottom: 2px solid #E8751A; padding-bottom: 6px;">
    🗓️ శుభ ముహూర్తాలు — Auspicious Dates (Top ${results.length})
  </div>

  ${dateRows}

  <!-- Footer -->
  <div style="margin-top: 24px; padding: 16px; background: #F5E6D3; border-radius: 10px; text-align: center; page-break-inside: avoid;">
    <div style="font-size: 14px; color: #E8751A; font-weight: 600; font-style: italic;">సర్వే జనాః సుఖినో భవంతు</div>
    <div style="font-size: 11px; color: #8A7A6A; margin-top: 6px;">
      Generated by ధర్మ Daily App — Telugu Panchangam & Muhurtam Finder
    </div>
    <div style="font-size: 10px; color: #AAA; margin-top: 4px;">
      Note: This is for reference only. Please consult a qualified pandit for important events.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Generate PDF and share it (native) or download (web)
 */
async function generateAndSharePdf(eventType, results, locationName) {
  if (Platform.OS === 'web') {
    // Web: open HTML in new window for printing
    const html = buildMuhurtamPdfHtml(eventType, results, locationName);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
    return { success: true, method: 'web-print' };
  }

  // Native: use expo-print + expo-sharing
  try {
    const Print = require('expo-print');
    const Sharing = require('expo-sharing');

    const html = buildMuhurtamPdfHtml(eventType, results, locationName);
    const fileName = `Muhurtam_${eventType.english.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`;

    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Share the PDF file via native share sheet (WhatsApp, Telegram, Email, etc.)
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `${eventType.telugu} ముహూర్తం నివేదిక`,
        UTI: 'com.adobe.pdf',
      });
      return { success: true, method: 'native-share', uri };
    } else {
      // Fallback: use RN Share with file URI
      await Share.share({
        url: uri,
        title: `${eventType.telugu} ముహూర్తం నివేదిక`,
      });
      return { success: true, method: 'rn-share', uri };
    }
  } catch (err) {
    console.warn('PDF generation failed:', err);
    return { success: false, error: err?.message || 'PDF generation failed' };
  }
}

/**
 * Build share text that matches the on-screen display exactly
 */
function buildShareText(eventType, results, locationName) {
  const header = `🙏 ధర్మ Daily — ముహూర్తం నివేదిక\n` +
    `📋 ${eventType.telugu} / ${eventType.english}\n` +
    `📍 ${locationName || 'Hyderabad'}\n` +
    `📅 ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}\n` +
    `${results.length} శుభ దినాలు (90 రోజుల్లో)\n` +
    `━━━━━━━━━━━━━━━━\n\n`;

  const dateLines = results.map((item, idx) => {
    const d = item.date;
    const dayNameTe = WEEKDAY_NAMES_TE[d.getDay()];
    const dateTe = d.toLocaleDateString('te-IN', { month: 'long', day: 'numeric' });
    const dateEn = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const star = item.rating === 'excellent' ? '⭐' : item.rating === 'good' ? '✅' : '🔸';

    const p = item.panchangam;
    return `${star} ${idx + 1}. ${dateTe} (${dateEn}), ${dayNameTe}\n` +
      `   ${item.ratingTelugu} — ${item.score}%\n` +
      `   తిథి: ${p.tithi?.telugu || ''}\n` +
      `   నక్షత్రం: ${p.nakshatra?.telugu || ''}\n` +
      `   యోగం: ${p.yoga?.telugu || ''}\n`;
  }).join('\n');

  const footer = `\n━━━━━━━━━━━━━━━━\n` +
    `ధర్మ Daily App — Telugu Panchangam\n` +
    `🙏 సర్వే జనాః సుఖినో భవంతు`;

  return header + dateLines + footer;
}


// ─── Components ───────────────────────────────────────────────────

/**
 * MuhurtamFinderCard — Compact card shown in main feed
 */
export function MuhurtamFinderCard({ onOpen, isPremium = false }) {
  return (
    <TouchableOpacity
      style={mStyles.card}
      onPress={() => {
        onOpen();
        trackEvent('muhurtam_finder_tap', { isPremium });
      }}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['rgba(46,125,50,0.08)', 'rgba(212,160,23,0.08)']}
        style={mStyles.cardGradient}
      >
        <View style={mStyles.cardIcon}>
          <MaterialCommunityIcons name="calendar-star" size={28} color={Colors.tulasiGreen} />
        </View>
        <View style={mStyles.cardContent}>
          <Text style={mStyles.cardTitle}>ముహూర్తం ఫైండర్</Text>
          <Text style={mStyles.cardDesc}>వివాహం, గృహ ప్రవేశం, ప్రయాణం... శుభ దినాలు తెలుసుకోండి</Text>
        </View>
        {isPremium ? (
          <Ionicons name="chevron-forward" size={20} color={Colors.tulasiGreen} />
        ) : (
          <View style={mStyles.premiumLock}>
            <MaterialCommunityIcons name="crown" size={16} color={Colors.gold} />
            <Text style={mStyles.premiumText}>Premium</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

/**
 * ShareBar — Single share button with consent modal (same as home screen sections)
 */
function ShareBar({ eventType, results, locationName }) {
  if (!results || results.length === 0) return null;

  return (
    <SectionShareRow
      section="muhurtam_finder"
      buildText={() => buildShareText(eventType, results, locationName)}
      insideModal
    />
  );
}

/**
 * MuhurtamFinderModal — Full finder experience
 */
export function MuhurtamFinderModal({ visible, onClose, location, isPremium = false, onOpenPremium }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  const locationName = location?.area
    ? `${location.area}, ${location.name}`
    : location?.name || 'Hyderabad';

  const handleEventSelect = (eventType) => {
    setSelectedEvent(eventType);
    setSearching(true);
    setResults([]);
    setSelectedResult(null);

    setTimeout(() => {
      const found = findBestDates(eventType, location || DEFAULT_LOCATION, new Date(), 90);
      setResults(found);
      setSearching(false);
      trackEvent('muhurtam_search', { event: eventType.id, resultsCount: found.length });
    }, 50);
  };

  const handleClose = () => {
    setSelectedEvent(null);
    setResults([]);
    setSelectedResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={s.overlay}>
        <View style={s.modal}>
          {/* Header */}
          <LinearGradient
            colors={[Colors.tulasiGreen, '#1B5E20']}
            style={s.modalHeader}
          >
            <MaterialCommunityIcons name="calendar-star" size={28} color="#F5D77A" />
            <Text style={s.modalTitle}>ముహూర్తం ఫైండర్</Text>
            <Text style={s.modalSub}>రాబోయే 90 రోజుల శుభ దినాలు</Text>
            <TouchableOpacity style={s.closeX} onPress={handleClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </LinearGradient>

          {!isPremium ? (
            /* Premium Lock Overlay */
            <View style={s.premiumOverlay}>
              <MaterialCommunityIcons name="lock" size={48} color={Colors.gold} />
              <Text style={s.premiumOverlayTitle}>Premium అవసరం</Text>
              <Text style={s.premiumOverlayDesc}>
                ముహూర్తం ఫైండర్ ప్రీమియం ఫీచర్. శుభ దినాలు కనుగొనడానికి ప్రీమియం యాక్టివేట్ చేయండి.
              </Text>
              <View style={s.premiumPlans}>
                {[
                  { label: 'Monthly', telugu: 'నెలవారీ', price: '₹49', duration: '30 రోజులు' },
                  { label: 'Yearly', telugu: 'వార్షిక', price: '₹299', duration: '365 రోజులు', badge: '49% ఆదా' },
                  { label: 'Lifetime', telugu: 'లైఫ్‌టైమ్', price: '₹999', duration: 'శాశ్వతం', badge: 'Best Value' },
                ].map((plan) => (
                  <View key={plan.label} style={s.premiumPlanCard}>
                    {plan.badge && <Text style={s.premiumPlanBadge}>{plan.badge}</Text>}
                    <Text style={s.premiumPlanTelugu}>{plan.telugu}</Text>
                    <Text style={s.premiumPlanPrice}>{plan.price}</Text>
                    <Text style={s.premiumPlanDuration}>{plan.duration}</Text>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={s.premiumActivateBtn}
                onPress={() => {
                  handleClose();
                  if (onOpenPremium) onOpenPremium();
                }}
              >
                <LinearGradient
                  colors={[Colors.saffron, Colors.gold]}
                  style={s.premiumActivateBtnGradient}
                >
                  <MaterialCommunityIcons name="crown" size={18} color="#FFF" />
                  <Text style={s.premiumActivateBtnText}>Premium యాక్టివేట్ చేయండి</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : !selectedEvent ? (
            /* Event Type Selector */
            <FlatList
              data={EVENT_TYPES}
              keyExtractor={(item) => item.id}
              numColumns={2}
              contentContainerStyle={{ padding: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.eventCard}
                  onPress={() => handleEventSelect(item)}
                >
                  <View style={[s.eventIcon, { backgroundColor: item.color + '15' }]}>
                    <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
                  </View>
                  <Text style={s.eventTelugu}>{item.telugu}</Text>
                  <Text style={s.eventEnglish}>{item.english}</Text>
                </TouchableOpacity>
              )}
            />
          ) : (
            /* Results */
            <View style={{ flex: 1 }}>
              {/* Back + Event info */}
              <View style={s.resultHeader}>
                <TouchableOpacity onPress={() => { setSelectedEvent(null); setResults([]); }}>
                  <Ionicons name="arrow-back" size={22} color={Colors.darkBrown} />
                </TouchableOpacity>
                <MaterialCommunityIcons name={selectedEvent.icon} size={20} color={selectedEvent.color} style={{ marginLeft: 10 }} />
                <Text style={s.resultEventName}>{selectedEvent.telugu}</Text>
                <Text style={s.resultCount}>{results.length} శుభ దినాలు</Text>
              </View>

              {/* Share Bar — PDF, WhatsApp, Share */}
              {!searching && results.length > 0 && (
                <ShareBar
                  eventType={selectedEvent}
                  results={results}
                  locationName={locationName}
                />
              )}

              {searching ? (
                <View style={s.searchingBox}>
                  <MaterialCommunityIcons name="magnify" size={40} color={Colors.tulasiGreen} />
                  <Text style={s.searchingText}>శుభ దినాలు వెతుకుతోంది...</Text>
                </View>
              ) : results.length === 0 ? (
                <View style={s.searchingBox}>
                  <MaterialCommunityIcons name="calendar-remove" size={40} color={Colors.textMuted} />
                  <Text style={s.searchingText}>ఈ కాలంలో శుభ దినాలు లేవు</Text>
                </View>
              ) : (
                <FlatList
                  data={results}
                  keyExtractor={(item) => item.dateStr}
                  renderItem={({ item }) => {
                    const d = item.date;
                    const isExpanded = selectedResult?.dateStr === item.dateStr;
                    const ratingColors = {
                      excellent: Colors.tulasiGreen,
                      good: '#4A90D9',
                      fair: Colors.saffron,
                      avoid: Colors.kumkum,
                    };

                    return (
                      <TouchableOpacity
                        style={[s.resultItem, isExpanded && s.resultItemExpanded]}
                        onPress={() => setSelectedResult(isExpanded ? null : item)}
                      >
                        <View style={s.resultRow}>
                          <View style={s.resultDateCol}>
                            <Text style={s.resultDay}>{d.getDate()}</Text>
                            <Text style={s.resultMonth}>
                              {d.toLocaleDateString('en-IN', { month: 'short' })}
                            </Text>
                            <Text style={s.resultWeekday}>
                              {WEEKDAY_NAMES_TE[d.getDay()].slice(0, 3)}
                            </Text>
                          </View>

                          <View style={s.resultInfo}>
                            <Text style={s.resultDateFull}>
                              {d.toLocaleDateString('te-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </Text>
                            <View style={s.resultBadges}>
                              <View style={[s.scoreBadge, { backgroundColor: ratingColors[item.rating] }]}>
                                <Text style={s.scoreText}>{item.ratingTelugu}</Text>
                              </View>
                              <Text style={s.scorePercent}>{item.score}%</Text>
                            </View>
                          </View>

                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={16}
                            color={Colors.textMuted}
                          />
                        </View>

                        {isExpanded && (
                          <View style={s.resultDetails}>
                            {item.reasons.map((r, i) => (
                              <View key={`r-${i}`} style={s.reasonRow}>
                                <Ionicons name="checkmark-circle" size={14} color={Colors.tulasiGreen} />
                                <Text style={s.reasonText}>{r}</Text>
                              </View>
                            ))}
                            {item.warnings.map((w, i) => (
                              <View key={`w-${i}`} style={s.reasonRow}>
                                <Ionicons name="alert-circle" size={14} color={Colors.saffron} />
                                <Text style={[s.reasonText, { color: Colors.saffronDark }]}>{w}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </View>
          )}

          <TouchableOpacity style={s.closeBtn} onPress={handleClose}>
            <Text style={s.closeBtnText}>మూసివేయండి</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────

const mStyles = StyleSheet.create({
  card: { borderRadius: 16, overflow: 'hidden', marginBottom: 8 },
  cardGradient: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 16, borderWidth: 1, borderColor: 'rgba(46,125,50,0.12)',
  },
  cardIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(46,125,50,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: Colors.darkBrown },
  cardDesc: { fontSize: 12, color: Colors.textMuted, marginTop: 2, lineHeight: 18 },
  premiumLock: { alignItems: 'center' },
  premiumText: { fontSize: 9, color: Colors.gold, fontWeight: '700', marginTop: 2 },
});

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '90%', flex: 1,
  },
  modalHeader: {
    paddingVertical: 20, paddingHorizontal: 20,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    alignItems: 'center', position: 'relative',
  },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#F5D77A', marginTop: 8, letterSpacing: 1 },
  modalSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  closeX: {
    position: 'absolute', top: 16, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  eventCard: {
    flex: 1, margin: 6, padding: 16,
    backgroundColor: Colors.white, borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  eventIcon: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  eventTelugu: { fontSize: 14, fontWeight: '700', color: Colors.darkBrown, textAlign: 'center' },
  eventEnglish: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  resultHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  resultEventName: { fontSize: 16, fontWeight: '700', color: Colors.darkBrown, marginLeft: 6, flex: 1 },
  resultCount: { fontSize: 12, color: Colors.tulasiGreen, fontWeight: '600' },

  searchingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  searchingText: { fontSize: 15, color: Colors.textMuted, marginTop: 12 },

  resultItem: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  resultItemExpanded: { backgroundColor: 'rgba(46,125,50,0.04)' },
  resultRow: { flexDirection: 'row', alignItems: 'center' },
  resultDateCol: { width: 50, alignItems: 'center' },
  resultDay: { fontSize: 22, fontWeight: '800', color: Colors.tulasiGreen },
  resultMonth: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase' },
  resultWeekday: { fontSize: 10, color: Colors.textSecondary },
  resultInfo: { flex: 1, marginLeft: 12 },
  resultDateFull: { fontSize: 14, fontWeight: '600', color: Colors.darkBrown },
  resultBadges: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  scoreBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  scoreText: { fontSize: 11, color: Colors.white, fontWeight: '700' },
  scorePercent: { fontSize: 11, color: Colors.textMuted, marginLeft: 8, fontWeight: '600' },

  resultDetails: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  reasonText: { fontSize: 13, color: Colors.textSecondary, marginLeft: 6, flex: 1, lineHeight: 20 },

  closeBtn: {
    alignItems: 'center', paddingVertical: 14, marginHorizontal: 20, marginVertical: 12,
    backgroundColor: Colors.tulasiGreen, borderRadius: 12,
  },
  closeBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },

  // Premium lock overlay styles
  premiumOverlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 24, paddingVertical: 32,
  },
  premiumOverlayTitle: {
    fontSize: 22, fontWeight: '800', color: Colors.darkBrown,
    marginTop: 16, marginBottom: 8,
  },
  premiumOverlayDesc: {
    fontSize: 14, color: Colors.textMuted, textAlign: 'center',
    lineHeight: 22, marginBottom: 24, paddingHorizontal: 12,
  },
  premiumPlans: {
    flexDirection: 'row', justifyContent: 'center',
    marginBottom: 24, gap: 10,
  },
  premiumPlanCard: {
    backgroundColor: Colors.white, borderRadius: 14,
    padding: 14, alignItems: 'center', width: 100,
    borderWidth: 1, borderColor: 'rgba(212,160,23,0.2)',
  },
  premiumPlanBadge: {
    fontSize: 9, fontWeight: '700', color: Colors.white,
    backgroundColor: Colors.tulasiGreen, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6,
    overflow: 'hidden',
  },
  premiumPlanTelugu: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  premiumPlanPrice: { fontSize: 22, fontWeight: '800', color: Colors.saffron, marginVertical: 4 },
  premiumPlanDuration: { fontSize: 10, color: Colors.textMuted },
  premiumActivateBtn: { borderRadius: 12, overflow: 'hidden', width: '100%' },
  premiumActivateBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12,
  },
  premiumActivateBtnText: {
    fontSize: 15, fontWeight: '700', color: Colors.white, marginLeft: 8,
  },
});
