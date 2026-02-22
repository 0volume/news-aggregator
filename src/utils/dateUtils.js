// Date utility functions

/**
 * Parse various date formats to Date object
 * @param {string} dateString - Date string in RFC 822, ISO 8601, or other formats
 * @returns {Date|null}
 */
export function parseDate(dateString) {
  if (!dateString) return null;
  
  try {
    // Try ISO 8601 first
    let date = new Date(dateString);
    if (!isNaN(date.getTime())) return date;
    
    // Try RFC 822 format (common in RSS)
    // Example: "Mon, 01 Jan 2024 12:00:00 GMT"
    const rfc822Match = dateString.match(
      /(\w{3}),?\s+(\d{1,2})\s+(\w{3})\s+(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/
    );
    if (rfc822Match) {
      const months = {
        Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
        Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
      };
      const [, , day, monthStr, year, hour, minute, second] = rfc822Match;
      date = new Date(year, months[monthStr], parseInt(day), parseInt(hour), parseInt(minute), parseInt(second));
      if (!isNaN(date.getTime())) return date;
    }
    
    // Try parsing as timestamp
    const timestamp = parseInt(dateString);
    if (!isNaN(timestamp)) {
      date = new Date(timestamp);
      if (!isNaN(date.getTime())) return date;
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Convert date to ISO 8601 format
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string}
 */
export function toISO8601(dateInput) {
  if (!dateInput) return new Date().toISOString();
  
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = parseDate(dateInput);
  }
  
  if (!date || isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  
  return date.toISOString();
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {string|Date} dateInput - Date string or Date object
 * @returns {string}
 */
export function getRelativeTime(dateInput) {
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = parseDate(dateInput);
  }
  
  if (!date) return 'Unknown';
  
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  
  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

/**
 * Check if date is within a date range
 * @param {string|Date} dateInput - Date to check
 * @param {Date|null} startDate - Start of range (null = no limit)
 * @returns {boolean}
 */
export function isWithinDateRange(dateInput, startDate) {
  if (!startDate) return true;
  
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = parseDate(dateInput);
  }
  
  if (!date) return false;
  
  return date >= startDate;
}

/**
 * Format date for display
 * @param {string|Date} dateInput - Date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string}
 */
export function formatDate(dateInput, options = {}) {
  let date;
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    date = parseDate(dateInput);
  }
  
  if (!date) return 'Unknown date';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}
