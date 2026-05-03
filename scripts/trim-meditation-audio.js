// One-shot trim for the 4 meditation mantra MP3s.
// Cuts each to 3 minutes, adds a 2s fade-out so the loop boundary is gentle,
// re-encodes at 128 kbps. Brings total audio bundle from ~58MB → ~12MB.
//
// Usage: node scripts/trim-meditation-audio.js
const { execFileSync } = require('child_process');
const fs   = require('fs');
const path = require('path');
const ffmpegBin = require('ffmpeg-static');

const AUDIO_DIR     = path.join(__dirname, '..', 'assets', 'audio');
const TARGET_SECS   = 180;       // 3 minutes
const FADE_OUT_SECS = 2;
const BITRATE       = '128k';
const FILES = ['om.mp3', 'soham.mp3', 'shiva.mp3', 'krishna.mp3'];

for (const file of FILES) {
  const input  = path.join(AUDIO_DIR, file);
  const output = path.join(AUDIO_DIR, `_trim_${file}`);
  if (!fs.existsSync(input)) {
    console.warn(`SKIP ${file} — not found`);
    continue;
  }
  const before = fs.statSync(input).size;
  const fadeStart = TARGET_SECS - FADE_OUT_SECS;

  execFileSync(ffmpegBin, [
    '-y',                                                    // overwrite output
    '-i', input,
    '-t', String(TARGET_SECS),
    '-af', `afade=t=out:st=${fadeStart}:d=${FADE_OUT_SECS}`,
    '-c:a', 'libmp3lame',
    '-b:a', BITRATE,
    '-ar', '44100',                                          // standard sample rate
    '-ac', '2',                                              // stereo
    output,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  fs.renameSync(output, input);
  const after = fs.statSync(input).size;
  const pctSaved = ((1 - after / before) * 100).toFixed(0);
  console.log(`${file.padEnd(14)} ${(before / 1024 / 1024).toFixed(1).padStart(5)} MB → ${(after / 1024 / 1024).toFixed(1).padStart(4)} MB  (-${pctSaved}%)`);
}
