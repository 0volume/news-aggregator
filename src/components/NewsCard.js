// NewsCard component
import { getRelativeTime } from '../utils/dateUtils.js';
import { SOURCE_CONFIG } from '../utils/constants.js';

/**
 * Sanitize image URL to prevent XSS in CSS url()
 * @param {string} url - Image URL
 * @returns {string|null} - Sanitized URL or null
 */
function sanitizeImageUrl(url) {
  if (!url || url === 'null') return null;
  // Only allow http/https schemes
  if (!url.match(/^https?:\/\//i)) return null;
  return url;
}

/**
 * Create a news card HTML element
 * @param {object} article - Article object
 * @returns {HTMLElement}
 */
export function createNewsCard(article) {
  const card = document.createElement('article');
  card.className = 'news-card';
  card.setAttribute('role', 'article');
  card.setAttribute('data-source', article.sourceId);
  
  const sourceConfig = SOURCE_CONFIG[article.sourceId] || { 
    name: article.source, 
    color: '#666', 
    icon: '📰' 
  };
  
  const hasImage = sanitizeImageUrl(article.imageUrl);
  const imageHtml = hasImage 
    ? `<div class="news-card-image" style="background-image: url('${escapeHtml(hasImage)}')"></div>`
    : `<div class="news-card-image news-card-image-placeholder" style="background: linear-gradient(135deg, ${sourceConfig.color}22, ${sourceConfig.color}44)"></div>`;
  
  card.innerHTML = `
    <a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer" class="news-card-link">
      ${imageHtml}
      <span class="news-card-source" style="background-color: ${sourceConfig.color}">
        ${sourceConfig.icon} ${escapeHtml(sourceConfig.name)}
      </span>
      <div class="news-card-content">
        <h3 class="news-card-title">${escapeHtml(article.title)}</h3>
        <p class="news-card-summary">${escapeHtml(article.summary || 'No summary available')}</p>
        <div class="news-card-meta">
          <span class="news-card-date">${getRelativeTime(article.publishedAt)}</span>
        </div>
      </div>
    </a>
  `;
  
  return card;
}

/**
 * Create skeleton loading card
 * @returns {HTMLElement}
 */
export function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'skeleton-card';
  card.innerHTML = `
    <div class="skeleton-image"></div>
    <div class="skeleton-content">
      <div class="skeleton-badge"></div>
      <div class="skeleton-title"></div>
      <div class="skeleton-title short"></div>
      <div class="skeleton-summary"></div>
      <div class="skeleton-summary short"></div>
      <div class="skeleton-date"></div>
    </div>
  `;
  return card;
}

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string}
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Render news cards to a container
 * @param {HTMLElement} container - Container element
 * @param {array} articles - Array of articles
 */
export function renderNewsCards(container, articles) {
  container.innerHTML = '';
  
  if (articles.length === 0) {
    return;
  }
  
  const fragment = document.createDocumentFragment();
  
  for (const article of articles) {
    const card = createNewsCard(article);
    fragment.appendChild(card);
  }
  
  container.appendChild(fragment);
}

/**
 * Render skeleton cards to a container
 * @param {HTMLElement} container - Container element
 * @param {number} count - Number of skeletons to show
 */
export function renderSkeletonCards(container, count = 6) {
  container.innerHTML = '';
  const fragment = document.createDocumentFragment();
  
  for (let i = 0; i < count; i++) {
    fragment.appendChild(createSkeletonCard());
  }
  
  container.appendChild(fragment);
}
