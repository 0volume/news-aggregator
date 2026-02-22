// Source configuration with branding
export const SOURCE_CONFIG = {
  bbc: { name: 'BBC News', color: '#BB1919', icon: '🔴' },
  aljazeera: { name: 'Al Jazeera', color: '#FA9000', icon: '🟠' },
  yahoo: { name: 'Yahoo', color: '#410093', icon: '🟣' },
  google: { name: 'Google News', color: '#4285F4', icon: '🔵' },
  rt: { name: 'RT', color: '#FF0000', icon: '🔴' },
  fox: { name: 'Fox News', color: '#003366', icon: '🔵' },
  sky: { name: 'Sky News', color: '#00ADEF', icon: '🔵' },
  cnn: { name: 'CNN', color: '#CC0000', icon: '🔴' },
  gb: { name: 'GB News', color: '#00A0DC', icon: '🔵' },
  msn: { name: 'MSN', color: '#00A1F1', icon: '🔵' }
};

// RSS Feed URLs
export const RSS_FEEDS = {
  bbc: 'https://feeds.bbci.co.uk/news/rss.xml',
  aljazeera: 'https://www.aljazeera.com/xml/rss/all.xml',
  yahoo: 'https://news.yahoo.com/rss/topstories',
  google: 'https://news.google.com/rss',
  rt: 'https://www.rt.com/rss/',
  fox: 'https://moxie.foxnews.com/google-publisher/latest.xml'
};

// CORS/JSON Proxy URL - use rss2json which returns JSON
export const CORS_PROXY = 'https://api.rss2json.com/v1/api.json?rss_url=';

// Cache configuration
export const CACHE_KEY = 'news_aggregator_cache';
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// API Configuration
export const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY || '';
export const TAVILY_API_URL = 'https://api.tavily.com/search';

// Date range options
export const DATE_RANGES = {
  all: null,
  today: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  },
  thisweek: () => {
    const week = new Date();
    week.setDate(week.getDate() - 7);
    week.setHours(0, 0, 0, 0);
    return week;
  },
  thismonth: () => {
    const month = new Date();
    month.setDate(month.getDate() - 30);  // Last 30 days
    month.setHours(0, 0, 0, 0);
    return month;
  }
};

// Sort options
export const SORT_OPTIONS = {
  newest: 'newest',
  oldest: 'oldest'
};

// Breakpoints
export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024
};
