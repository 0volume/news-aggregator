// Normalizer service for standardizing article data
import { toISO8601 } from '../utils/dateUtils.js';
import { SOURCE_CONFIG } from '../utils/constants.js';

/**
 * Generate a unique ID from title and source
 * @param {string} title - Article title
 * @param {string} sourceId - Source identifier
 * @returns {string}
 */
export function generateId(title, sourceId) {
  const base = `${sourceId}-${title}`.toLowerCase();
  // Create a simple hash-like ID
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    const char = base.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `article-${Math.abs(hash).toString(36)}`;
}

/**
 * Normalize a date string to ISO 8601
 * @param {string} dateString - Date in any format
 * @returns {string} - ISO 8601 date string
 */
export function normalizeDate(dateString) {
  return toISO8601(dateString);
}

/**
 * Get source config by sourceId
 * @param {string} sourceId - Source identifier
 * @returns {object}
 */
export function getSourceConfig(sourceId) {
  return SOURCE_CONFIG[sourceId] || { name: sourceId, color: '#666', icon: '📰' };
}

/**
 * Extract image URL from RSS item
 * @param {object} item - RSS item element
 * @returns {string|null}
 */
function extractImageUrl(item) {
  // Try media:content
  const mediaContent = item.getElementsByTagName('media:content')[0] || 
                       item.getElementsByTagName('media:thumbnail')[0];
  if (mediaContent?.getAttribute('url')) {
    return mediaContent.getAttribute('url');
  }
  
  // Try enclosure
  const enclosure = item.getElementsByTagName('enclosure')[0];
  if (enclosure?.getAttribute('url') && enclosure.getAttribute('type')?.startsWith('image')) {
    return enclosure.getAttribute('url');
  }
  
  // Try media:content in namespace
  const mediaContentNs = item.getElementsByTagName('media:content');
  if (mediaContentNs[0]?.getAttribute('url')) {
    return mediaContentNs[0].getAttribute('url');
  }
  
  // Try to find image in description (CDATA or HTML)
  const description = item.getElementsByTagName('description')[0]?.textContent || 
                     item.getElementsByTagName('content:encoded')[0]?.textContent || '';
  
  const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) {
    return imgMatch[1];
  }
  
  return null;
}

/**
 * Extract summary from RSS item
 * @param {object} item - RSS item element
 * @returns {string}
 */
function extractSummary(item) {
  // Try content:encoded first
  let summary = item.getElementsByTagName('content:encoded')[0]?.textContent || '';
  
  if (!summary) {
    // Try description
    summary = item.getElementsByTagName('description')[0]?.textContent || '';
  }
  
  // Strip HTML tags
  summary = summary.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = summary;
  summary = textarea.value;
  
  // Trim and limit length
  summary = summary.trim();
  if (summary.length > 300) {
    summary = summary.substring(0, 297) + '...';
  }
  
  return summary;
}

/**
 * Extract URL from RSS item
 * @param {object} item - RSS item element
 * @returns {string}
 */
function extractUrl(item) {
  // Try link element
  const link = item.getElementsByTagName('link')[0]?.textContent?.trim();
  if (link) return link;
  
  // Try atom:link
  const atomLink = item.getElementsByTagName('atom:link')[0]?.getAttribute('href');
  if (atomLink) return atomLink;
  
  // Try guid as fallback
  const guid = item.getElementsByTagName('guid')[0]?.textContent?.trim();
  if (guid && guid.startsWith('http')) return guid;
  
  return '#';
}

/**
 * Extract title from RSS item
 * @param {object} item - RSS item element
 * @returns {string}
 */
function extractTitle(item) {
  const title = item.getElementsByTagName('title')[0]?.textContent || 'Untitled';
  return title.trim();
}

/**
 * Extract publication date from RSS item
 * @param {object} item - RSS item element
 * @returns {string}
 */
function extractDate(item) {
  const pubDate = item.getElementsByTagName('pubDate')[0]?.textContent ||
                  item.getElementsByTagName('dc:date')[0]?.textContent ||
                  item.getElementsByTagName('published')[0]?.textContent ||
                  item.getElementsByTagName('updated')[0]?.textContent ||
                  '';
  return pubDate.trim();
}

/**
 * Normalize a single RSS item to standard schema
 * @param {object} item - RSS item DOM element
 * @param {string} sourceId - Source identifier
 * @returns {object|null} - Normalized article or null if invalid
 */
export function normalizeArticle(item, sourceId) {
  try {
    const title = extractTitle(item);
    const url = extractUrl(item);
    
    if (!title || title === 'Untitled' || url === '#') {
      return null;
    }
    
    const sourceConfig = getSourceConfig(sourceId);
    const publishedAt = normalizeDate(extractDate(item));
    const summary = extractSummary(item);
    const imageUrl = extractImageUrl(item);
    
    return {
      id: generateId(title, sourceId),
      title,
      source: sourceConfig.name,
      sourceId,
      url,
      publishedAt,
      summary,
      imageUrl,
      category: null
    };
  } catch (e) {
    console.warn(`Failed to normalize article from ${sourceId}:`, e);
    return null;
  }
}

/**
 * Normalize multiple RSS items
 * @param {object} items - Array of RSS item elements
 * @param {string} sourceId - Source identifier
 * @returns {array} - Array of normalized articles
 */
export function normalizeArticles(items, sourceId) {
  const articles = [];
  
  for (const item of items) {
    const article = normalizeArticle(item, sourceId);
    if (article) {
      articles.push(article);
    }
  }
  
  return articles;
}
