// Header component

/**
 * Create header element
 * @param {object} options - Configuration options
 * @param {function} options.onRefresh - Callback when refresh button clicked
 * @param {function} options.onMobileFilterToggle - Callback when mobile filter toggle clicked
 * @returns {HTMLElement}
 */
export function createHeader({ onRefresh, onMobileFilterToggle }) {
  const header = document.createElement('header');
  header.className = 'header';
  header.setAttribute('role', 'banner');
  
  header.innerHTML = `
    <div class="header-content">
      <h1 class="header-title">
        <span class="header-icon">📰</span>
        <span class="header-text">News Aggregator</span>
      </h1>
      <div class="header-actions">
        <button id="refresh-btn" class="btn btn-primary" aria-label="Refresh news">
          <span class="btn-icon">🔄</span>
          <span class="btn-text">Refresh</span>
        </button>
        <button id="mobile-filter-toggle" class="btn btn-icon-only" aria-label="Toggle filters" hidden>
          <span>⚙️</span>
        </button>
      </div>
    </div>
  `;
  
  // Attach event listeners
  const refreshBtn = header.querySelector('#refresh-btn');
  const mobileFilterToggle = header.querySelector('#mobile-filter-toggle');
  
  refreshBtn.addEventListener('click', () => {
    if (onRefresh) {
      onRefresh();
    }
  });
  
  mobileFilterToggle.addEventListener('click', () => {
    if (onMobileFilterToggle) {
      onMobileFilterToggle();
    }
  });
  
  return header;
}

/**
 * Set loading state on refresh button
 * @param {HTMLElement} header - Header element
 * @param {boolean} isLoading - Whether to show loading state
 */
export function setRefreshLoading(header, isLoading) {
  const refreshBtn = header.querySelector('#refresh-btn');
  if (!refreshBtn) return;
  
  if (isLoading) {
    refreshBtn.classList.add('loading');
    refreshBtn.setAttribute('disabled', 'true');
    refreshBtn.querySelector('.btn-icon').textContent = '⏳';
  } else {
    refreshBtn.classList.remove('loading');
    refreshBtn.removeAttribute('disabled');
    refreshBtn.querySelector('.btn-icon').textContent = '🔄';
  }
}

/**
 * Show/hide mobile filter toggle
 * @param {HTMLElement} header - Header element
 * @param {boolean} show - Whether to show the button
 */
export function showMobileFilterToggle(header, show) {
  const toggle = header.querySelector('#mobile-filter-toggle');
  if (toggle) {
    toggle.hidden = !show;
  }
}
