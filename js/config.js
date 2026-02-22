// js/config.js - PALITAN ITO
const CONFIG = {
  // I-paste ang bagong URL dito
  SCRIPT_URL: 'https://script.google.com/macros/s/AKfycbwKX1dU9SZDQHgXtgZnlik_g51G1giRzrGExtcOWvRoofsOzSpPw6ccrJXW71vVBrZJ/exec',
  
  APP_NAME: 'Listahan ng AnimeManga',
  APP_VERSION: '1.1.0',
  DEVELOPER: 'Mark Joseph Rogasan',
  
  TYPES: ['anime', 'manga', 'manhwa'],
  STATUSES: ['watching', 'plan', 'complete', 'dropped'],
  
  STATUS_LABELS: {
    watching: 'Watching',
    plan: 'Plan to Watch',
    complete: 'Completed',
    dropped: 'Dropped'
  },

  STATUS_COLORS: {
    watching: '#00d4ff',
    plan: '#f59e0b',
    complete: '#10b981',
    dropped: '#ef4444'
  },

  GENRES: [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Isekai', 'Mecha', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Supernatural', 'Thriller', 'Martial Arts', 'School',
    'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Harem', 'Ecchi'
  ],

  ITEMS_PER_PAGE: 20,
  CACHE_KEY: 'listahan_cache',
  THEME_KEY: 'listahan_theme',
  SESSION_KEY: 'listahan_session',
};

window.CONFIG = CONFIG;