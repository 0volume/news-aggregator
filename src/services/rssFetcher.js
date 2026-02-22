// RSS Fetcher service
import { RSS_FEEDS, CORS_PROXY } from '../utils/constants.js';

/**
 * Fetch RSS feed for a specific source using rss2json
 * @param {string} sourceId - Source identifier
 * @returns {Promise<array>} - Array of normalized articles
 */
export async function fetchRSS(sourceId) {
  const feedUrl = RSS_FEEDS[sourceId];
  
  if (!feedUrl) {
    console.warn(`No RSS feed configured for ${sourceId}`);
    return [];
  }
  
  try {
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feedUrl)}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 'ok') {
      throw new Error(`RSS2JSON error: ${data.message || 'Unknown error'}`);
    }
    
    return parseRSS2JSON(data.items, sourceId);
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`Timeout fetching ${sourceId}`);
    } else {
      console.error(`Error fetching ${sourceId}:`, error.message);
    }
    return [];
  }
}

/**
 * Parse RSS2JSON response into normalized articles
 * @param {array} items - Array of item objects from rss2json
 * @param {string} sourceId - Source identifier
 * @returns {array} - Array of normalized articles
 */
function parseRSS2JSON(items, sourceId) {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  const articles = items.map(item => {
    try {
      return {
        id: generateId(item.title, sourceId),
        title: item.title || 'Untitled',
        source: getSourceName(sourceId),
        sourceId: sourceId,
        url: item.link || '#',
        publishedAt: normalizeDate(item.pubDate),
        summary: truncateText(stripHtml(item.description || item.content || '')),
        imageUrl: item.thumbnail || item.enclosure?.link || null,
        category: item.categories?.[0] || null
      };
    } catch (e) {
      return null;
    }
  }).filter(Boolean);
  
  return articles;
}

/**
 * Generate unique ID from title and source
 */
function generateId(title, sourceId) {
  const base = `${sourceId}-${title}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `article-${Math.abs(hash).toString(36)}`;
}

/**
 * Get display name for source
 */
function getSourceName(sourceId) {
  const names = {
    bbc: 'BBC News',
    aljazeera: 'Al Jazeera',
    yahoo: 'Yahoo',
    google: 'Google News',
    rt: 'RT',
    fox: 'Fox News'
  };
  return names[sourceId] || sourceId;
}

/**
 * Normalize date to ISO 8601
 */
function normalizeDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return new Date().toISOString();
  return date.toISOString();
}

/**
 * Strip HTML tags
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Truncate text to max length
 */
function truncateText(text, maxLen = 300) {
  if (text.length <= maxLen) return text;
  return text.substring(0, maxLen - 3) + '...';
}

/**
 * Fetch all RSS feeds
 * @param {array|null} sources - Optional array of source IDs to fetch
 * @returns {Promise<array>} - Combined and sorted array of articles
 */
export async function fetchAllRSS(sources = null) {
  const feedSources = sources || Object.keys(RSS_FEEDS);
  
  const fetchPromises = feedSources.map(sourceId => fetchRSS(sourceId));
  const results = await Promise.allSettled(fetchPromises);
  
  const allArticles = [];
  
  for (let i = 0; i < results.length; i++) {
    const sourceId = feedSources[i];
    const result = results[i];
    
    if (result.status === 'fulfilled') {
      const articles = result.value;
      console.log(`Fetched ${articles.length} articles from ${sourceId}`);
      allArticles.push(...articles);
    } else {
      console.warn(`Failed to fetch from ${sourceId}:`, result.reason?.message || 'Unknown error');
    }
  }
  
  // Sort by date, newest first
  return allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}
