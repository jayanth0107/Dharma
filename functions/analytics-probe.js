// Read recent analytics_events from Firestore using firebase-admin
// (already auth'd via Firebase CLI / application default credentials).
const admin = require('firebase-admin');
admin.initializeApp({ projectId: 'dharmadaily-1fa89' });
const db = admin.firestore();

(async () => {
  try {
    const snap = await db.collection('analytics_events')
      .orderBy('clientTs', 'desc')
      .limit(300)
      .get();
    const events = [];
    snap.forEach(d => events.push({ id: d.id, ...d.data() }));

    // Crashes
    const crashes = events.filter(e => e.event === 'app_crash');
    console.log('\n=== app_crash events (most recent 300 events) ===');
    console.log('Total:', crashes.length);
    for (const c of crashes.slice(0, 20)) {
      console.log('---');
      console.log('  screen:', c.params?.screen);
      console.log('  msg:   ', (c.params?.message || '').slice(0, 200));
      console.log('  ts:    ', c.clientTs);
      console.log('  plat:  ', c.platform, 'os:', c.osVersion);
      console.log('  app:   ', c.appVersion);
    }

    // Most recent events overall (any kind) — see what's even firing
    console.log('\n=== Top events in the recent 300 ===');
    const counts = {};
    for (const e of events) counts[e.event] = (counts[e.event] || 0) + 1;
    Object.entries(counts).sort(([,a],[,b]) => b-a).slice(0, 30).forEach(([k,v]) => console.log(' ', v, k));

    // Platform breakdown
    console.log('\n=== Platform breakdown ===');
    const plats = {};
    for (const e of events) plats[e.platform || '?'] = (plats[e.platform || '?'] || 0) + 1;
    Object.entries(plats).forEach(([k,v]) => console.log(' ', v, k));

    // Most recent 10 events overall (raw)
    console.log('\n=== Most recent 10 events (any) ===');
    for (const e of events.slice(0, 10)) {
      console.log(' ', e.clientTs, '|', e.event, '|', e.platform, '|', JSON.stringify(e.params).slice(0, 100));
    }

    // Search-related events
    const searchEvents = events.filter(e =>
      e.event && (
        e.event.startsWith('horoscope_') ||
        e.event === 'horoscope_generate' ||
        e.event.includes('location') ||
        e.event === 'matchmaking_check'
      )
    );
    console.log('\n=== Location / horoscope-related events ===');
    console.log('Count:', searchEvents.length);
    for (const e of searchEvents.slice(0, 15)) {
      console.log(' ', e.clientTs, '|', e.event, '|', e.platform, '|', JSON.stringify(e.params).slice(0, 120));
    }
  } catch (e) {
    console.error('Probe failed:', e.message);
    process.exit(1);
  }
  process.exit(0);
})();
