// RSS Fetcher service
import { RSS_FEEDS, CORS_PROXY } from '../utils/constants.js';
import { normalizeArticles } from './normalizer.js';

/**
 * Fetch RSS feed for a specific source
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
      signal: controller.signal,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    const articles = parseRSS(xmlText, sourceId);
    
    return articles;
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
 * Parse RSS XML string into normalized articles
 * @param {string} xmlText - Raw XML string
 * @param {string} sourceId - Source identifier
 * @returns {array} - Array of normalized articles
 */
function parseRSS(xmlText, sourceId) {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Check for parse errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      console.warn(`XML parse error for ${sourceId}:`, parseError.textContent);
      return [];
    }
    
    // Try RSS 2.0 format
    let items = xmlDoc.getElementsByTagName('item');
    
    // Try Atom format
    if (items.length === 0) {
      items = xmlDoc.getElementsByTagName('entry');
    }
    
    // Try RSS 1.0 format
    if (items.length === 0) {
      items = xmlDoc.getElementsByTagName('item');
    }
    
    // Convert HTMLCollection to Array and normalize
    const itemsArray = Array.from(items);
    return normalizeArticles(itemsArray, sourceId);
  } catch (error) {
    console.error(`Error parsing RSS for ${sourceId}:`, error);
    return [];
  }
}

/**
 * Fetch all RSS feeds
 * @param {array} sourceIds - Array of source IDs to fetch (default: all)
 * @returns {Promise<array>} - Combined array of all articles
 */
export async function fetchAllRSS(sourceIds = null) {
  const sourcesToFetch = sourceIds || Object.keys(RSS_FEEDS);
  
  const fetchPromises = sourcesToFetch.map(sourceId => fetchRSS(sourceId));
  const results = await Promise.allSettled(fetchPromises);
  
  const allArticles = [];
  
  for (let i = 0; i < results.length; i++) {
    const sourceId = sourcesToFetch[i];
    const result = results[i];
    
    if (result.status === 'fulfilled') {
      const articles = result.value;
      console.log(`Fetched ${articles.length} articles from ${sourceId}`);
      allArticles.push(...articles);
    } else {
      console.warn(`Failed to fetch from ${sourceId}:`, result.reason?.message || 'Unknown error');
    }
  }
  
  // Sort by date (newest first)
  allArticles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  return allArticles;
}

/**
 * Fetch a single source by ID (exported for individual fetching if needed)
 * @param {string} sourceId - Source identifier
 * @returns {Promise<array>}
 */
export async function fetchSource(sourceId) {
  return fetchRSS(sourceId);
}
