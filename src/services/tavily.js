// Tavily API service for sources without RSS
// Note: This is optional and requires an API key
import { TAVILY_API_KEY, TAVILY_API_URL, SOURCE_CONFIG } from '../utils/constants.js';

/**
 * Check if Tavily API is configured
 * @returns {boolean}
 */
export function isTavilyConfigured() {
  return Boolean(TAVILY_API_KEY);
}

/**
 * Search news using Tavily API
 * @param {string} query - Search query
 * @param {string} sourceId - Source identifier
 * @returns {Promise<array>} - Array of articles
 */
export async function searchTavily(query, sourceId) {
  if (!isTavilyConfigured()) {
    console.warn('Tavily API key not configured');
    return [];
  }
  
  try {
    const response = await fetch(TAVILY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query,
        search_depth: 'basic',
        max_results: 10
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return transformTavilyResults(data.results, sourceId);
  } catch (error) {
    console.error('Tavily search error:', error);
    return [];
  }
}

/**
 * Transform Tavily results to standard article schema
 * @param {array} results - Tavily search results
 * @param {string} sourceId - Source identifier
 * @returns {array}
 */
function transformTavilyResults(results, sourceId) {
  const sourceConfig = SOURCE_CONFIG[sourceId] || { name: sourceId, color: '#666', icon: '📰' };
  
  return results.map((result, index) => ({
    id: `tavily-${sourceId}-${index}-${Date.now()}`,
    title: result.title || 'Untitled',
    source: sourceConfig.name,
    sourceId,
    url: result.url || '#',
    publishedAt: result.published_at || new Date().toISOString(),
    summary: result.content || result.snippet || '',
    imageUrl: null,
    category: null
  }));
}

/**
 * Fetch from a source that doesn't have RSS (using Tavily)
 * @param {string} sourceId - Source identifier
 * @param {string} searchQuery - Query to search for
 * @returns {Promise<array>}
 */
export async function fetchFromTavily(sourceId, searchQuery = 'latest news') {
  // Adjust query based on source
  const queries = {
    sky: 'Sky News latest',
    cnn: 'CNN latest news',
    gb: 'GB News latest',
    msn: 'MSN news'
  };
  
  const query = queries[sourceId] || `${sourceId} news`;
  return searchTavily(query, sourceId);
}
