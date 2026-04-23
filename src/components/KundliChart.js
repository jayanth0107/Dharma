// ధర్మ — North Indian Diamond Kundli Chart
// Renders Lagna, Navamsa, and Chandra charts with planet positions
// Uses React Native Views (not SVG) for cross-platform compatibility

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DarkColors } from '../theme/colors';
import { usePick } from '../theme/responsive';

// House positions in North Indian diamond chart (0-11)
// Standard layout:
//   ┌────┬────┬────┬────┐
//   │ 12 │  1 │  2 │  3 │
//   ├────┼────┼────┼────┤
//   │ 11 │         │  4 │
//   ├────┤  Center  ├────┤
//   │ 10 │         │  5 │
//   ├────┼────┼────┼────┤
//   │  9 │  8 │  7 │  6 │
//   └────┴────┴────┴────┘

// Abbreviated planet names
const PLANET_ABBR = {
  Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me',
  Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke',
  // Telugu abbreviations
  సూర్యుడు: 'Su', చంద్రుడు: 'Mo', కుజుడు: 'Ma', బుధుడు: 'Me',
  గురువు: 'Ju', శుక్రుడు: 'Ve', శని: 'Sa', రాహు: 'Ra', కేతు: 'Ke',
};

const PLANET_ABBR_TE = {
  Sun: 'సూ', Moon: 'చం', Mars: 'కు', Mercury: 'బు',
  Jupiter: 'గు', Venus: 'శు', Saturn: 'శ', Rahu: 'రా', Ketu: 'కే',
};

// Get planets in each house (0-11) from navagraha data
function getPlanetsInHouses(navagraha, lagna) {
  const houses = Array.from({ length: 12 }, () => []);
  if (!navagraha) return houses;

  const rashiNames = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
  ];
  const rashiNamesTE = [
    'మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం', 'సింహం', 'కన్య',
    'తుల', 'వృశ్చికం', 'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం',
  ];

  const lagnaIndex = typeof lagna === 'number' ? lagna : 0;

  Object.entries(navagraha).forEach(([key, planet]) => {
    const rashi = planet.rashi || planet.english || '';
    let rashiIdx = rashiNames.findIndex(r => rashi.toLowerCase().includes(r.toLowerCase()));
    if (rashiIdx < 0) rashiIdx = rashiNamesTE.findIndex(r => rashi.includes(r));
    if (rashiIdx < 0) return;

    // House = rashi position relative to lagna
    const house = (rashiIdx - lagnaIndex + 12) % 12;
    const name = planet.english || planet.telugu || key;
    const abbr = PLANET_ABBR[name] || PLANET_ABBR[key] || key.slice(0, 2);
    const abbrTe = PLANET_ABBR_TE[name] || PLANET_ABBR_TE[key] || key.slice(0, 2);
    houses[house].push({
      abbr,
      abbrTe,
      name,
      retrograde: planet.retrograde || false,
    });
  });

  return houses;
}

// Simple diamond chart using the North Indian style grid layout
function DiamondHouse({ planets, houseNum, style, size, lang }) {
  const cellSize = size / 4;
  const fontSize = Math.max(8, cellSize * 0.2);
  const numFontSize = Math.max(7, cellSize * 0.16);

  return (
    <View style={[kc.house, style, { width: cellSize, height: cellSize }]}>
      <Text style={[kc.houseNum, { fontSize: numFontSize }]}>{houseNum}</Text>
      <View style={kc.planetsWrap}>
        {planets.map((p, i) => (
          <Text key={i} style={[kc.planetText, { fontSize }, p.retrograde && kc.retrograde]}>
            {lang === 'te' ? p.abbrTe : p.abbr}{p.retrograde ? '᛫' : ''}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function KundliChart({
  navagraha,
  lagnaIndex = 0,
  title,
  chartType = 'lagna', // 'lagna' | 'navamsa' | 'chandra'
  moonRashiIndex,
  lang = 'te',
}) {
  const chartSize = usePick({ default: 200, md: 240, lg: 280, xl: 320 });
  const titleSize = usePick({ default: 12, lg: 14, xl: 16 });

  // Determine effective lagna based on chart type
  let effectiveLagna = lagnaIndex;
  if (chartType === 'chandra' && moonRashiIndex !== undefined) {
    effectiveLagna = moonRashiIndex;
  }

  const houses = getPlanetsInHouses(navagraha, effectiveLagna);
  const cell = chartSize / 4;

  // Chart type labels
  const chartLabels = {
    lagna: lang === 'te' ? 'లగ్న కుండలి' : 'Lagna Chart',
    navamsa: lang === 'te' ? 'నవాంశ కుండలి' : 'Navamsa Chart',
    chandra: lang === 'te' ? 'చంద్ర కుండలి' : 'Chandra Chart',
  };

  // Grid layout: 4x4 grid, with center 2x2 being the label area
  // Row 0: houses 12, 1, 2, 3
  // Row 1: house 11, [center], [center], house 4
  // Row 2: house 10, [center], [center], house 5
  // Row 3: houses 9, 8, 7, 6
  const houseMap = [
    [12, 1, 2, 3],
    [11, -1, -1, 4],
    [10, -1, -1, 5],
    [9, 8, 7, 6],
  ];

  return (
    <View style={kc.container}>
      {title && <Text style={[kc.title, { fontSize: titleSize }]}>{title}</Text>}
      <Text style={[kc.chartTypeLabel, { fontSize: titleSize - 2 }]}>{chartLabels[chartType]}</Text>
      <View style={[kc.grid, { width: chartSize, height: chartSize }]}>
        {houseMap.map((row, ri) => (
          <View key={ri} style={kc.gridRow}>
            {row.map((houseNum, ci) => {
              if (houseNum === -1) {
                // Center area
                if (ri === 1 && ci === 1) {
                  return (
                    <View key={`center`} style={[kc.centerArea, { width: cell * 2, height: cell * 2 }]}>
                      <Text style={kc.centerText}>
                        {lang === 'te' ? 'కుండలి' : 'Kundli'}
                      </Text>
                      <Text style={kc.centerSub}>
                        {chartLabels[chartType]}
                      </Text>
                    </View>
                  );
                }
                return null; // Skip other center cells
              }
              const houseIdx = houseNum - 1; // Convert 1-12 to 0-11
              return (
                <DiamondHouse
                  key={houseNum}
                  planets={houses[houseIdx]}
                  houseNum={houseNum}
                  size={chartSize}
                  lang={lang}
                />
              );
            })}
          </View>
        ))}

        {/* Diagonal lines (decorative borders) */}
        <View style={[kc.diagLine, kc.diagTL, { width: chartSize * 0.71, top: 0, left: 0, transform: [{ rotate: '45deg' }, { translateX: chartSize * 0.145 }, { translateY: chartSize * 0.145 }] }]} />
        <View style={[kc.diagLine, kc.diagTR, { width: chartSize * 0.71, top: 0, right: 0, transform: [{ rotate: '-45deg' }, { translateX: -chartSize * 0.145 }, { translateY: chartSize * 0.145 }] }]} />
        <View style={[kc.diagLine, kc.diagBL, { width: chartSize * 0.71, bottom: 0, left: 0, transform: [{ rotate: '-45deg' }, { translateX: chartSize * 0.145 }, { translateY: -chartSize * 0.145 }] }]} />
        <View style={[kc.diagLine, kc.diagBR, { width: chartSize * 0.71, bottom: 0, right: 0, transform: [{ rotate: '45deg' }, { translateX: -chartSize * 0.145 }, { translateY: -chartSize * 0.145 }] }]} />
      </View>
    </View>
  );
}

// Simplified Rashi chart for matchmaking — North Indian diamond style
// Shows 12 rashis positioned by house, Moon's rashi highlighted in House 1
// Layout follows standard Vedic North Indian Kundli format:
//   House 1 = top-center (Pisces position in natural zodiac)
//   Houses proceed counter-clockwise: 2=top-right, 3=right-top, 4=right, etc.
export function SimpleKundliChart({
  rashiIndex,
  nakshatraName,
  personName,
  lang = 'te',
}) {
  const chartSize = usePick({ default: 150, md: 165, lg: 185, xl: 200 });
  const cell = chartSize / 4;
  const fontSize = Math.max(7, cell * 0.2);
  const numSize = Math.max(6, cell * 0.15);

  const rashiNames = [
    'మేషం', 'వృషభం', 'మిథునం', 'కర్కాటకం', 'సింహం', 'కన్య',
    'తుల', 'వృశ్చికం', 'ధనుస్సు', 'మకరం', 'కుంభం', 'మీనం',
  ];
  const rashiNamesEN = [
    'Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir',
    'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis',
  ];

  // North Indian house layout (fixed positions, rashis rotate)
  const houseMap = [
    [12, 1, 2, 3],
    [11, -1, -1, 4],
    [10, -1, -1, 5],
    [9, 8, 7, 6],
  ];

  return (
    <View style={kc.container}>
      {personName && <Text style={[kc.title, { fontSize: 11 }]}>{personName}</Text>}
      <View style={[kc.grid, kc.simpleGrid, { width: chartSize, height: chartSize }]}>
        {houseMap.map((row, ri) => (
          <View key={ri} style={kc.gridRow}>
            {row.map((houseNum, ci) => {
              if (houseNum === -1) {
                if (ri === 1 && ci === 1) {
                  return (
                    <View key="center" style={[kc.centerArea, kc.simpleCenterArea, { width: cell * 2, height: cell * 2 }]}>
                      <Text style={[kc.centerText, { fontSize: 8, color: DarkColors.gold }]}>
                        {lang === 'te' ? 'చంద్ర\nకుండలి' : 'Moon\nChart'}
                      </Text>
                    </View>
                  );
                }
                return null;
              }
              const houseIdx = houseNum - 1;
              const rashiAtHouse = (rashiIndex + houseIdx) % 12;
              const isMoonHouse = houseIdx === 0;
              const rashiLabel = lang === 'te'
                ? rashiNames[rashiAtHouse]?.slice(0, 4)
                : rashiNamesEN[rashiAtHouse];
              return (
                <View key={houseNum} style={[kc.house, kc.simpleHouse, { width: cell, height: cell }, isMoonHouse && kc.moonHouse]}>
                  <Text style={[kc.houseNum, { fontSize: numSize }]}>{houseNum}</Text>
                  <Text style={[kc.simpleRashiText, { fontSize }, isMoonHouse && kc.moonRashiText]}>
                    {rashiLabel}
                  </Text>
                  {isMoonHouse && <Text style={[kc.moonMarker, { fontSize: numSize }]}>Ch</Text>}
                </View>
              );
            })}
          </View>
        ))}
        {/* Diamond diagonal lines — matches full KundliChart */}
        <View style={[kc.diagLine, { width: chartSize * 0.71, top: 0, left: 0, transform: [{ rotate: '45deg' }, { translateX: chartSize * 0.145 }, { translateY: chartSize * 0.145 }] }]} />
        <View style={[kc.diagLine, { width: chartSize * 0.71, top: 0, right: 0, transform: [{ rotate: '-45deg' }, { translateX: -chartSize * 0.145 }, { translateY: chartSize * 0.145 }] }]} />
        <View style={[kc.diagLine, { width: chartSize * 0.71, bottom: 0, left: 0, transform: [{ rotate: '-45deg' }, { translateX: chartSize * 0.145 }, { translateY: -chartSize * 0.145 }] }]} />
        <View style={[kc.diagLine, { width: chartSize * 0.71, bottom: 0, right: 0, transform: [{ rotate: '45deg' }, { translateX: -chartSize * 0.145 }, { translateY: -chartSize * 0.145 }] }]} />
      </View>
    </View>
  );
}

const kc = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: DarkColors.gold,
    marginBottom: 4,
    textAlign: 'center',
  },
  chartTypeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: DarkColors.textMuted,
    marginBottom: 6,
  },
  grid: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: DarkColors.borderGold,
    borderRadius: 4,
    backgroundColor: DarkColors.bgCard,
  },
  simpleGrid: {
    borderWidth: 1,
  },
  gridRow: {
    flexDirection: 'row',
  },
  house: {
    borderWidth: 0.5,
    borderColor: DarkColors.borderGold,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  simpleHouse: {
    borderColor: 'rgba(212,160,23,0.15)',
  },
  moonHouse: {
    backgroundColor: 'rgba(212,160,23,0.08)',
  },
  houseNum: {
    position: 'absolute',
    top: 1,
    left: 3,
    fontSize: 7,
    color: DarkColors.textMuted,
    fontWeight: '600',
  },
  planetsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 1,
  },
  planetText: {
    fontSize: 9,
    fontWeight: '700',
    color: DarkColors.goldLight,
  },
  retrograde: {
    color: DarkColors.kumkum,
  },
  simpleRashiText: {
    fontSize: 8,
    fontWeight: '600',
    color: DarkColors.silver,
    textAlign: 'center',
  },
  moonRashiText: {
    color: DarkColors.gold,
    fontWeight: '800',
  },
  moonMarker: {
    fontSize: 7,
    fontWeight: '700',
    color: DarkColors.saffron,
  },
  centerArea: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: DarkColors.borderGold,
  },
  simpleCenterArea: {
    borderColor: 'rgba(212,160,23,0.15)',
  },
  centerText: {
    fontSize: 10,
    fontWeight: '800',
    color: DarkColors.gold,
  },
  centerSub: {
    fontSize: 8,
    color: DarkColors.textMuted,
    marginTop: 2,
  },
  // Diagonal lines for traditional diamond look
  diagLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: DarkColors.borderGold,
    opacity: 0.3,
  },
  diagTL: {},
  diagTR: {},
  diagBL: {},
  diagBR: {},
});
