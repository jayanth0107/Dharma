// ధర్మ — Daily Streak & Badge Tracker
// Tracks consecutive daily app opens, total days, milestones
import { loadForm, saveForm, FORM_KEYS } from './formStorage';

const STREAK_KEY = '@dharma_streak';

const MILESTONES = [
  { days: 3, te: '3 రోజులు! 🔥', en: '3 days! 🔥', icon: 'fire' },
  { days: 7, te: '7 రోజులు! ⭐', en: '7 days! ⭐', icon: 'star' },
  { days: 14, te: '14 రోజులు! 🏆', en: '14 days! 🏆', icon: 'trophy' },
  { days: 30, te: '30 రోజులు! 👑', en: '30 days! 👑', icon: 'crown' },
  { days: 60, te: '60 రోజులు! 💎', en: '60 days! 💎', icon: 'diamond-stone' },
  { days: 100, te: '100 రోజులు! 🙏', en: '100 days! 🙏', icon: 'hands-pray' },
];

function getDateKey(date) {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

function isYesterday(dateStr) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getDateKey(yesterday) === dateStr;
}

export async function loadStreak() {
  try {
    const raw = await loadForm(STREAK_KEY);
    return raw || { currentStreak: 0, longestStreak: 0, totalDays: 0, lastOpenDate: null, badges: [] };
  } catch { return { currentStreak: 0, longestStreak: 0, totalDays: 0, lastOpenDate: null, badges: [] }; }
}

export async function recordDailyOpen() {
  const data = await loadStreak();
  const today = getDateKey(new Date());

  if (data.lastOpenDate === today) return data; // already recorded today

  if (isYesterday(data.lastOpenDate)) {
    data.currentStreak += 1;
  } else if (data.lastOpenDate !== today) {
    data.currentStreak = 1; // streak broken or first day
  }

  data.totalDays += 1;
  data.lastOpenDate = today;
  if (data.currentStreak > data.longestStreak) data.longestStreak = data.currentStreak;

  // Check for new milestone badges
  const newBadges = MILESTONES.filter(m => data.currentStreak >= m.days && !data.badges.includes(m.days));
  if (newBadges.length > 0) {
    data.badges = [...(data.badges || []), ...newBadges.map(b => b.days)];
    data.newMilestone = newBadges[newBadges.length - 1]; // latest milestone
  }

  await saveForm(STREAK_KEY, data);
  return data;
}

export function getCurrentMilestone(streak) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (streak >= MILESTONES[i].days) return MILESTONES[i];
  }
  return null;
}

export { MILESTONES };
