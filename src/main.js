// Main application entry point
import { CACHE_KEY, CACHE_DURATION, BREAKPOINTS } from './utils/constants.js';
import { fetchAllRSS } from './services/rssFetcher.js';
import { applyFilters } from './services/filter.js';
import { renderNewsCards, renderSkeletonCards } from './components/NewsCard.js';

// App state
const state = {
  articles: [],
  filteredArticles: [],
  filters: {
    sources: [],
    categories: [],
    dateRange: 'all',
    sortBy: 'newest'
  },
  isLoading: false,
  error: null
};

// DOM Elements
let elements = {};

/**
 * Initialize the application
 */
export async function init() {
  cacheElements();
  setupEventListeners();
  setupResponsive();
  await loadArticles();
}

/**
 * Cache DOM element references
 */
function cacheElements() {
  elements = {
    app: document.getElementById('app'),
    newsGrid: document.getElementById('news-grid'),
    loadingState: document.getElementById('loading-state'),
    errorState: document.getElementById('error-state'),
    emptyState: document.getElementById('empty-state'),
    errorMessage: document.getElementById('error-message'),
    articleCount: document.getElementById('article-count'),
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    mobileFilterToggle: document.getElementById('mobile-filter-toggle'),
    closeSidebar: document.getElementById('close-sidebar'),
    refreshBtn: document.getElementById('refresh-btn'),
    retryBtn: document.getElementById('retry-btn')
  };
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Refresh button
  elements.refreshBtn?.addEventListener('click', handleRefresh);
  elements.retryBtn?.addEventListener('click', handleRefresh);
  
  // Mobile filter toggle
  elements.mobileFilterToggle?.addEventListener('click', toggleMobileSidebar);
  elements.closeSidebar?.addEventListener('click', toggleMobileSidebar);
  elements.sidebarOverlay?.addEventListener('click', toggleMobileSidebar);
  
  // Filter changes - delegate to sidebar
  document.addEventListener('change', handleFilterChange);
  
  // Window resize for responsive
  window.addEventListener('resize', handleResize);
}

/**
 * Handle window resize
 */
function handleResize() {
  setupResponsive();
}

/**
 * Setup responsive behavior
 */
function setupResponsive() {
  const isMobile = window.innerWidth < BREAKPOINTS.mobile;
  const isTablet = window.innerWidth < BREAKPOINTS.tablet && window.innerWidth >= BREAKPOINTS.mobile;
  
  // Toggle mobile filter button visibility
  if (elements.mobileFilterToggle) {
    elements.mobileFilterToggle.hidden = !isMobile;
  }
  
  // Close mobile sidebar on resize to desktop
  if (!isMobile && elements.sidebar?.classList.contains('sidebar-open')) {
    elements.sidebar.classList.remove('sidebar-open');
    elements.sidebarOverlay.hidden = true;
  }
  
  // Update grid columns based on viewport
  const newsGrid = elements.newsGrid;
  if (newsGrid) {
    newsGrid.classList.remove('grid-mobile', 'grid-tablet', 'grid-desktop');
    if (isMobile) {
      newsGrid.classList.add('grid-mobile');
    } else if (isTablet) {
      newsGrid.classList.add('grid-tablet');
    } else {
      newsGrid.classList.add('grid-desktop');
    }
  }
}

/**
 * Handle filter changes from sidebar
 */
function handleFilterChange(event) {
  const target = event.target;
  
  // Source filter checkboxes
  if (target.matches('#source-filters input[type="checkbox"]')) {
    const checkboxes = document.querySelectorAll('#source-filters input[type="checkbox"]');
    state.filters.sources = Array.from(checkboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);
    applyCurrentFilters();
  }
  
  // Date range select
  if (target.matches('#date-range')) {
    state.filters.dateRange = target.value;
    applyCurrentFilters();
  }
  
  // Sort order select
  if (target.matches('#sort-order')) {
    state.filters.sortBy = target.value;
    applyCurrentFilters();
  }
}

/**
 * Apply current filters to articles
 */
function applyCurrentFilters() {
  const result = applyFilters(state.articles, state.filters);
  state.filteredArticles = result.articles;
  renderArticles();
}

/**
 * Load articles from cache or fetch from RSS
 */
async function loadArticles() {
  // Try to load from cache first
  const cached = loadFromCache();
  if (cached) {
    state.articles = cached.articles;
    state.filters.sources = Object.keys(cached.articlesBySource || {});
    applyCurrentFilters();
    
    // Check if cache is stale
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      // Cache is fresh, don't fetch
      return;
    }
  }
  
  // Fetch fresh data
  await fetchArticles();
}

/**
 * Fetch articles from RSS feeds
 */
async function fetchArticles() {
  state.isLoading = true;
  state.error = null;
  showLoading();
  setRefreshLoading(true);
  
  try {
    const articles = await fetchAllRSS();
    
    if (articles.length === 0) {
      throw new Error('No articles could be fetched from any source');
    }
    
    state.articles = articles;
    saveToCache(articles);
    applyCurrentFilters();
    
    // Initialize sources filter with all available sources
    const uniqueSources = [...new Set(articles.map(a => a.sourceId))];
    state.filters.sources = uniqueSources;
    updateSourceCheckboxes(uniqueSources);
    
    state.isLoading = false;
    hideLoading();
    setRefreshLoading(false);
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    state.error = error.message || 'Failed to load news';
    state.isLoading = false;
    showError(state.error);
    setRefreshLoading(false);
  }
}

/**
 * Handle refresh button click
 */
async function handleRefresh() {
  // Clear cache to force fresh fetch
  clearCache();
  await fetchArticles();
}

/**
 * Toggle mobile sidebar
 */
function toggleMobileSidebar() {
  const sidebar = elements.sidebar;
  const overlay = elements.sidebarOverlay;
  
  if (!sidebar || !overlay) return;
  
  const isOpen = sidebar.classList.contains('sidebar-open');
  
  if (isOpen) {
    sidebar.classList.remove('sidebar-open');
    overlay.hidden = true;
  } else {
    sidebar.classList.add('sidebar-open');
    overlay.hidden = false;
  }
}

/**
 * Update source checkboxes based on available sources
 */
function updateSourceCheckboxes(sources) {
  const checkboxes = document.querySelectorAll('#source-filters input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = sources.includes(cb.value);
  });
}

/**
 * Render articles to the grid
 */
function renderArticles() {
  const { filteredArticles, articles, isLoading, error } = state;
  
  // Update article count
  if (elements.articleCount) {
    elements.articleCount.textContent = `${filteredArticles.length} article${filteredArticles.length !== 1 ? 's' : ''}`;
  }
  
  // Don't render if still loading or error
  if (isLoading || error) return;
  
  // Show empty state if no articles
  if (filteredArticles.length === 0) {
    showEmpty();
    return;
  }
  
  // Render cards
  hideEmpty();
  renderNewsCards(elements.newsGrid, filteredArticles);
}

/**
 * Show loading state
 */
function showLoading() {
  elements.newsGrid.hidden = true;
  elements.errorState.hidden = true;
  elements.emptyState.hidden = true;
  elements.loadingState.hidden = false;
  renderSkeletonCards(elements.newsGrid, 6);
}

/**
 * Hide loading state
 */
function hideLoading() {
  elements.loadingState.hidden = true;
  elements.newsGrid.hidden = false;
}

/**
 * Show error state
 */
function showError(message) {
  elements.newsGrid.hidden = true;
  elements.loadingState.hidden = true;
  elements.emptyState.hidden = true;
  elements.errorState.hidden = false;
  elements.errorMessage.textContent = message;
}

/**
 * Show empty state
 */
function showEmpty() {
  elements.newsGrid.hidden = true;
  elements.loadingState.hidden = true;
  elements.errorState.hidden = true;
  elements.emptyState.hidden = false;
}

/**
 * Hide empty state
 */
function hideEmpty() {
  elements.emptyState.hidden = true;
}

/**
 * Set refresh button loading state
 */
function setRefreshLoading(isLoading) {
  const btn = elements.refreshBtn;
  if (!btn) return;
  
  if (isLoading) {
    btn.classList.add('loading');
    btn.disabled = true;
    btn.querySelector('.btn-icon').textContent = '⏳';
  } else {
    btn.classList.remove('loading');
    btn.disabled = false;
    btn.querySelector('.btn-icon').textContent = '🔄';
  }
}

/**
 * Load articles from session cache
 */
function loadFromCache() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Save articles to session cache
 */
function saveToCache(articles) {
  try {
    const articlesBySource = {};
    articles.forEach(article => {
      if (!articlesBySource[article.sourceId]) {
        articlesBySource[article.sourceId] = [];
      }
      articlesBySource[article.sourceId].push(article);
    });
    
    const data = {
      articles,
      articlesBySource,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to cache articles:', e);
  }
}

/**
 * Clear session cache
 */
function clearCache() {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch (e) {
    // Ignore
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
