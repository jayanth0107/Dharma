// ధర్మ — Bookmark Service
// Save/load favorite temples and places

import { Platform } from 'react-native';

const BOOKMARK_KEY = '@dharma_bookmarks';

const Storage = {
  async get(key) {
    try {
      if (Platform.OS === 'web') return JSON.parse(localStorage.getItem(key) || '[]');
      const AS = require('@react-native-async-storage/async-storage').default;
      const raw = await AS.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  },
  async set(key, val) {
    try {
      const data = JSON.stringify(val);
      if (Platform.OS === 'web') localStorage.setItem(key, data);
      else {
        const AS = require('@react-native-async-storage/async-storage').default;
        await AS.setItem(key, data);
      }
    } catch {}
  },
};

export async function getBookmarks() {
  return await Storage.get(BOOKMARK_KEY);
}

export async function addBookmark(temple) {
  const bookmarks = await getBookmarks();
  const exists = bookmarks.find(b => b.lat?.toFixed(3) === temple.lat?.toFixed(3) && b.lon?.toFixed(3) === temple.lon?.toFixed(3));
  if (exists) return bookmarks;
  bookmarks.unshift({ ...temple, bookmarkedAt: new Date().toISOString() });
  await Storage.set(BOOKMARK_KEY, bookmarks);
  return bookmarks;
}

export async function removeBookmark(temple) {
  let bookmarks = await getBookmarks();
  bookmarks = bookmarks.filter(b => !(b.lat?.toFixed(3) === temple.lat?.toFixed(3) && b.lon?.toFixed(3) === temple.lon?.toFixed(3)));
  await Storage.set(BOOKMARK_KEY, bookmarks);
  return bookmarks;
}

export async function isBookmarked(temple) {
  const bookmarks = await getBookmarks();
  return bookmarks.some(b => b.lat?.toFixed(3) === temple.lat?.toFixed(3) && b.lon?.toFixed(3) === temple.lon?.toFixed(3));
}
