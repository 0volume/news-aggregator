// FilterSidebar component
import { SOURCE_CONFIG, RSS_FEEDS } from '../utils/constants.js';

/**
 * Get available sources (sources with RSS feeds)
 * @returns {array}
 */
function getAvailableSources() {
  return Object.keys(RSS_FEEDS).map(sourceId => ({
    id: sourceId,
    ...SOURCE_CONFIG[sourceId]
  }));
}

/**
 * Create filter sidebar HTML and attach event listeners
 * @param {object} options - Configuration options
 * @param {function} options.onSourceChange - Callback when sources change
 * @param {function} options.onDateRangeChange - Callback when date range changes
 * @param {function} options.onSortChange - Callback when sort changes
 * @returns {HTMLElement}
 */
export function createFilterSidebar({ onSourceChange, onDateRangeChange, onSortChange }) {
  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  
  const sources = getAvailableSources();
  
  const sourcesHtml = sources.map(source => `
    <label class="checkbox-label">
      <input type="checkbox" class="checkbox-input" value="${source.id}" checked>
      <span class="checkbox-custom"></span>
      <span class="checkbox-text">
        <span class="source-icon" style="color: ${source.color}">${source.icon}</span>
        ${source.name}
      </span>
    </label>
  `).join('');
  
  sidebar.innerHTML = `
    <div class="sidebar-header">
      <h2>Filters</h2>
      <button id="close-sidebar" class="btn btn-icon-only" aria-label="Close filters" hidden>
        <span>✕</span>
      </button>
    </div>
    
    <div class="filter-section">
      <h3 class="filter-title">Sources</h3>
      <div id="source-filters" class="filter-options" role="group" aria-label="Filter by source">
        ${sourcesHtml}
      </div>
    </div>

    <div class="filter-section">
      <h3 class="filter-title">Date Range</h3>
      <select id="date-range" class="select-input" aria-label="Select date range">
        <option value="all">All Time</option>
        <option value="today">Today</option>
        <option value="thisweek">This Week</option>
        <option value="thismonth">This Month</option>
      </select>
    </div>

    <div class="filter-section">
      <h3 class="filter-title">Sort By</h3>
      <select id="sort-order" class="select-input" aria-label="Sort order">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>
  `;
  
  // Attach event listeners
  const sourceCheckboxes = sidebar.querySelectorAll('#source-filters input[type="checkbox"]');
  const dateRangeSelect = sidebar.querySelector('#date-range');
  const sortOrderSelect = sidebar.querySelector('#sort-order');
  
  sourceCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      const selected = Array.from(sourceCheckboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
      onSourceChange?.(selected);
    });
  });
  
  dateRangeSelect.addEventListener('change', () => {
    onDateRangeChange?.(dateRangeSelect.value);
  });
  
  sortOrderSelect.addEventListener('change', () => {
    onSortChange?.(sortOrderSelect.value);
  });
  
  return sidebar;
}

/**
 * Get current filter values from sidebar
 * @param {HTMLElement} sidebar - Sidebar element
 * @returns {object}
 */
export function getFilterValues(sidebar) {
  const sourceCheckboxes = sidebar.querySelectorAll('#source-filters input[type="checkbox"]');
  const selectedSources = Array.from(sourceCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  
  const dateRange = sidebar.querySelector('#date-range')?.value || 'all';
  const sortOrder = sidebar.querySelector('#sort-order')?.value || 'newest';
  
  return {
    sources: selectedSources,
    dateRange,
    sortBy: sortOrder
  };
}

/**
 * Set filter values programmatically
 * @param {HTMLElement} sidebar - Sidebar element
 * @param {object} values - Filter values to set
 */
export function setFilterValues(sidebar, values) {
  if (values.sources) {
    const checkboxes = sidebar.querySelectorAll('#source-filters input[type="checkbox"]');
    checkboxes.forEach(cb => {
      cb.checked = values.sources.includes(cb.value);
    });
  }
  
  if (values.dateRange) {
    const dateRangeSelect = sidebar.querySelector('#date-range');
    if (dateRangeSelect) {
      dateRangeSelect.value = values.dateRange;
    }
  }
  
  if (values.sortBy) {
    const sortOrderSelect = sidebar.querySelector('#sort-order');
    if (sortOrderSelect) {
      sortOrderSelect.value = values.sortBy;
    }
  }
}

/**
 * Initialize filter sidebar (replaces existing sidebar in DOM)
 * @param {HTMLElement} container - Container to render sidebar into
 * @param {object} handlers - Event handlers
 */
export function initFilterSidebar(container, handlers) {
  // Remove existing sidebar if any
  const existingSidebar = container.querySelector('.sidebar');
  if (existingSidebar) {
    existingSidebar.remove();
  }
  
  const sidebar = createFilterSidebar(handlers);
  container.insertBefore(sidebar, container.firstChild);
  
  return sidebar;
}
