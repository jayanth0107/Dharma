# Meditation mantra audio — drop your MP3s here

The Meditation screen will loop a mantra audio track in the background while
the timer runs. Audio is **optional** — if no source is configured, the
meditation runs silently with just the breathing animation.

## Two ways to add audio

### Option A — Local MP3 files (recommended, works offline)

1. Download an MP3 for each mantra you want (sources below).
2. Drop the files into this folder with these exact names:

   ```
   assets/audio/om.mp3
   assets/audio/soham.mp3
   assets/audio/shiva.mp3
   assets/audio/krishna.mp3
   ```

3. Open `src/screens/MeditationScreen.js`, find the `MANTRAS` array, and
   uncomment the `audioFile` line for each mantra:

   ```js
   { id: 'om', /* ... */
     audioFile: require('../../assets/audio/om.mp3'),  // ← uncomment
   },
   ```

4. Restart Metro (`Ctrl+C`, then `npx expo start --clear`).

Files larger than ~5 MB each will inflate the app bundle — keep loops short
(2-5 minutes seamlessly looped) or use Option B.

### Option B — Streaming URL (no bundle bloat, needs internet)

In the `MANTRAS` array, set `audioUrl` to a direct MP3/OGG/M4A URL:

```js
{ id: 'om', /* ... */
  audioUrl: 'https://example.com/path/to/om-chant.mp3',
},
```

Restart not required — Metro picks up the change on save.

## Where to find royalty-free mantra recordings

| Source | Notes |
|---|---|
| **archive.org** | Largest free library of devotional audio. Search "Om mantra 108 times", "Hare Krishna Maha Mantra", "Om Namah Shivaya chant". Click the file → right-click "Download" → MP3. License varies (most are public domain or CC). |
| **Wikimedia Commons** | Smaller selection but very stable URLs. `commons.wikimedia.org/wiki/File:Om_chant.ogg` etc. |
| **Pixabay** (pixabay.com/music) | CC0 ambient and chant tracks. Search "om", "meditation chant", "mantra". |
| **Freesound.org** | CC-licensed loops. Filter by "no attribution required" if you don't want to credit. |
| **YouTube → MP3** | Use only for public-domain content or content you have rights to. Tools: yt-dlp, 4K Video Downloader. ISKCON kirtans, M.S. Subbulakshmi (some recordings are public domain). |

## Recommended track length

Aim for **2-5 minute seamless loops**. Long single takes (e.g. an
hour-long Om Namah Shivaya track) work but bloat your offline bundle —
the player loops infinitely either way, so a short clean loop is better
for app size.

## Mute / volume

Volume is fixed at 55% inside the meditation screen so it stays in the
background of consciousness, not the foreground. The user can tap the
speaker icon on the running screen to mute / unmute.

## Privacy

No audio is sent anywhere — it plays locally from the bundled file or
streams directly from the URL you configure. The app does not log or
upload audio data.
