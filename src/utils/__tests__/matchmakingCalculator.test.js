// Unit tests for Matchmaking Calculator
// Run: npx jest src/utils/__tests__/matchmakingCalculator.test.js

const { calculateMatchmaking, NAKSHATRAS, NAKSHATRAS_EN, RASHIS } = require('../matchmakingCalculator');

describe('Matchmaking Calculator', () => {
  test('returns 8 kutas', () => {
    const result = calculateMatchmaking(0, 3); // Ashwini + Rohini
    expect(result.kutas).toHaveLength(8);
  });

  test('total score is between 0 and 36', () => {
    for (let g = 0; g < 27; g++) {
      for (let b = 0; b < 27; b++) {
        const result = calculateMatchmaking(g, b);
        expect(result.totalScore).toBeGreaterThanOrEqual(0);
        expect(result.totalScore).toBeLessThanOrEqual(36);
      }
    }
  });

  test('same nakshatra gives specific score', () => {
    const result = calculateMatchmaking(0, 0); // Ashwini + Ashwini
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.kutas[3].score).toBe(4); // Yoni: same = 4
  });

  test('all nakshatras have Telugu and English names', () => {
    expect(NAKSHATRAS).toHaveLength(27);
    expect(NAKSHATRAS_EN).toHaveLength(27);
    NAKSHATRAS.forEach(n => expect(n.length).toBeGreaterThan(0));
    NAKSHATRAS_EN.forEach(n => expect(n.length).toBeGreaterThan(0));
  });

  test('verdict categories are correct', () => {
    // High score
    const high = calculateMatchmaking(3, 12); // Rohini + Hasta
    expect(['అత్యుత్తమం', 'మంచిది', 'సగటు', 'తక్కువ']).toContain(high.verdict.split(' —')[0]);

    // Percentage is calculated correctly
    expect(high.percentage).toBe(Math.round((high.totalScore / 36) * 100));
  });

  test('rashi mapping is correct', () => {
    const result = calculateMatchmaking(0, 0);
    expect(result.groomRashi.index).toBeDefined();
    expect(result.brideRashi.index).toBeDefined();
    expect(result.groomRashi.telugu).toBeTruthy();
    expect(result.groomRashi.english).toBeTruthy();
  });
});
