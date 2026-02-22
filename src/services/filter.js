// Filter service for filtering and sorting articles
import { isWithinDateRange } from '../utils/dateUtils.js';
import { DATE_RANGES, SORT_OPTIONS } from '../utils/constants.js';

/**
 * Filter articles by source
 * @param {array} articles - Array of articles
 * @param {array} sources - Array of source IDs to include
 * @returns {array}
 */
export function filterBySource(articles, sources) {
  if (!sources || sources.length === 0) {
    return articles;
  }
  
  return articles.filter(article => sources.includes(article.sourceId));
}

/**
 * Filter articles by category
 * @param {array} articles - Array of articles
 * @param {array} categories - Array of categories to include
 * @returns {array}
 */
export function filterByCategory(articles, categories) {
  if (!categories || categories.length === 0) {
    return articles;
  }
  
  return articles.filter(article => {
    if (!article.category) return false;
    return categories.includes(article.category.toLowerCase());
  });
}

/**
 * Filter articles by date range
 * @param {array} articles - Array of articles
 * @param {string} dateRange - Date range key ('all', 'today', 'thisweek', 'thismonth')
 * @returns {array}
 */
export function filterByDate(articles, dateRange = 'all') {
  if (!dateRange || dateRange === 'all') {
    return articles;
  }
  
  const getStartDate = DATE_RANGES[dateRange];
  if (!getStartDate) {
    return articles;
  }
  
  const startDate = getStartDate();
  return articles.filter(article => isWithinDateRange(article.publishedAt, startDate));
}

/**
 * Sort articles by date
 * @param {array} articles - Array of articles
 * @param {string} sortBy - Sort option ('newest' or 'oldest')
 * @returns {array} - New sorted array
 */
export function sortBy(articles, sortBy = SORT_OPTIONS.newest) {
  const sorted = [...articles];
  
  if (sortBy === SORT_OPTIONS.oldest) {
    sorted.sort((a, b) => new Date(a.publishedAt) - new Date(b.publishedAt));
  } else {
    // Default: newest first
    sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }
  
  return sorted;
}

/**
 * Apply all filters to articles
 * @param {array} articles - Array of articles
 * @param {object} filters - Filter options
 * @param {array} filters.sources - Source IDs to filter by
 * @param {array} filters.categories - Categories to filter by
 * @param {string} filters.dateRange - Date range key
 * @param {string} filters.sortBy - Sort option
 * @returns {object} - { articles: array, appliedFilters: object }
 */
export function applyFilters(articles, filters = {}) {
  const { sources = [], categories = [], dateRange = 'all', sortBy: sortOption = SORT_OPTIONS.newest } = filters;
  
  // Start with all articles
  let filtered = [...articles];
  
  // Apply source filter (AND logic)
  if (sources.length > 0) {
    filtered = filterBySource(filtered, sources);
  }
  
  // Apply category filter (AND logic)
  if (categories.length > 0) {
    filtered = filterByCategory(filtered, categories);
  }
  
  // Apply date filter (AND logic)
  if (dateRange !== 'all') {
    filtered = filterByDate(filtered, dateRange);
  }
  
  // Apply sorting
  filtered = sortBy(filtered, sortOption);
  
  return {
    articles: filtered,
    appliedFilters: {
      sources,
      categories,
      dateRange,
      sortBy: sortOption
    }
  };
}

/**
 * Get unique sources from articles
 * @param {array} articles - Array of articles
 * @returns {array} - Array of unique source objects
 */
export function getUniqueSources(articles) {
  const sourcesMap = new Map();
  
  for (const article of articles) {
    if (!sourcesMap.has(article.sourceId)) {
      sourcesMap.set(article.sourceId, {
        id: article.sourceId,
        name: article.source
      });
    }
  }
  
  return Array.from(sourcesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get unique categories from articles
 * @param {array} articles - Array of articles
 * @returns {array} - Array of unique categories
 */
export function getUniqueCategories(articles) {
  const categories = new Set();
  
  for (const article of articles) {
    if (article.category) {
      categories.add(article.category);
    }
  }
  
  return Array.from(categories).sort();
}
