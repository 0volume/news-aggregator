# News Aggregator - Specification Document

## 1. Project Overview

**Project Name:** News Aggregator  
**Project Type:** Single Page Web Application  
**Core Functionality:** A frontend news aggregator that fetches articles from multiple RSS feeds, displays them in a clean card-based layout, and provides filtering/sorting capabilities.  
**Target Users:** General users who want a unified view of news from multiple sources.

---

## 2. UI/UX Specification

### 2.1 Layout Structure

**Page Sections:**
- **Header:** Fixed top bar with app title, refresh button, and mobile menu toggle
- **Sidebar:** Left-side filter panel (collapsible on mobile)
- **Main Content:** Grid of news cards
- **Footer:** Attribution and copyright

**Grid Layout:**
- Desktop (>1024px): 3-column grid + sidebar (280px)
- Tablet (768px-1024px): 2-column grid
- Mobile (<768px): Single column, filters in modal/drawer

### 2.2 Visual Design

**Color Palette:**
- Background: `#f8f9fa`
- Surface/Cards: `#ffffff`
- Text Primary: `#1a1a2e`
- Text Secondary: `#6c757d`
- Accent/Primary: `#3b82f6`
- Border: `#e5e7eb`
- Error: `#ef4444`
- Success: `#22c55e`

**Source Colors (brand):**
| Source | Color | Icon |
|--------|-------|------|
| BBC News | #BB1919 | 🔴 |
| Al Jazeera | #FA9000 | 🟠 |
| Yahoo | #410093 | 🟣 |
| Google News | #4285F4 | 🔵 |
| RT | #FF0000 | 🔴 |
| Fox News | #003366 | 🔵 |
| Sky News | #00ADEF | 🔵 |
| CNN | #CC0000 | 🔴 |
| GB News | #00A0DC | 🔵 |
| MSN | #00A1F1 | 🔵 |

**Typography:**
- Font Family: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif`
- Headings: 
  - H1 (App Title): 24px, weight 700
  - Card Title: 16px, weight 600
- Body: 14px, weight 400
- Small/Meta: 12px, weight 400

**Spacing System:**
- Base unit: 4px
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

**Visual Effects:**
- Card shadow: `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)`
- Card hover shadow: `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)`
- Border radius: 8px (cards), 6px (buttons), 4px (inputs)
- Transitions: 200ms ease-out

### 2.3 Components

**Header:**
- Height: 60px
- Contains: App logo/title (left), Refresh button (right), Mobile menu toggle (right, mobile only)
- States: Default, Loading (spinner on refresh button)

**News Card:**
- Image container: 200px height, object-fit cover (or placeholder gradient if no image)
- Content padding: 16px
- Source badge: Top-left overlay on image, pill shape
- Title: 2-line max with ellipsis
- Summary: 2-line max with ellipsis
- Footer: Date (relative format), source name
- States: Default, Hover (lift effect)

**Filter Sidebar:**
- Width: 280px (desktop)
- Sections: Source Filter, Date Range, Sort Order
- Checkbox style: Custom styled with accent color
- Dropdown style: Native select with custom styling
- Mobile: Slide-in drawer from left

**Loading State:**
- Skeleton cards (shimmer animation)
- 6 placeholder cards shown

**Error State:**
- Error message in red
- Retry button

**Empty State:**
- "No articles found" message
- Suggestion to adjust filters

---

## 3. Functionality Specification

### 3.1 Core Features

1. **RSS Feed Fetching**
   - Fetch from 6 RSS sources using CORS proxy
   - Concurrent fetching with Promise.all
   - Timeout: 10 seconds per feed
   - Error handling per feed (don't fail all if one fails)

2. **Data Normalization**
   - Convert dates to ISO 8601
   - Map source-specific fields to standard schema
   - Generate unique IDs

3. **Filtering (AND logic)**
   - By source (multi-select checkboxes)
   - By date range (Today, This Week, This Month)
   - Filters combine with AND logic

4. **Sorting**
   - Newest first (default)
   - Oldest first

5. **Caching**
   - Store fetched articles in sessionStorage
   - Cache duration: 5 minutes
   - Load from cache on page refresh (within cache window)

### 3.2 User Interactions

- Click refresh: Fetch latest from all feeds
- Toggle source checkbox: Filter results instantly
- Change date range: Filter results instantly
- Change sort: Re-sort results instantly
- Click news card: Open article in new tab
- Mobile: Tap filter icon to open drawer

### 3.3 Data Schema

```json
{
  "id": "string (unique)",
  "title": "string",
  "source": "string (display name)",
  "sourceId": "string (bbc|aljazeera|yahoo|google|rt|fox|sky|cnn|gb|msn)",
  "url": "string",
  "publishedAt": "ISO 8601",
  "summary": "string",
  "imageUrl": "string|null",
  "category": "string|null"
}
```

### 3.4 Edge Cases

- Empty feed: Show "No articles from this source"
- All feeds fail: Show error with retry button
- No image: Show gradient placeholder
- Very long title/summary: Truncate with ellipsis
- Invalid date: Use current date as fallback

---

## 4. Acceptance Criteria

### Visual Checkpoints
- [ ] Header displays app title and refresh button
- [ ] Sidebar shows all filter options
- [ ] News cards display source badge, title, summary, date
- [ ] Cards have proper hover effects
- [ ] Responsive layout works at all breakpoints
- [ ] Loading skeleton shows during fetch
- [ ] Error state displays on failure

### Functional Checkpoints
- [ ] Articles load from all 6 RSS feeds
- [ ] Source filter works correctly
- [ ] Date range filter works correctly
- [ ] Sort order works correctly
- [ ] Filters combine with AND logic
- [ ] Clicking card opens article in new tab
- [ ] Refresh button fetches new data
- [ ] Cache works on page refresh

### Performance
- [ ] Initial load < 3 seconds (with good network)
- [ ] Filtering is instant (<100ms)
- [ ] No layout shift after content loads

---

## 5. Technical Stack

- **Build Tool:** Vite
- **Language:** Vanilla JavaScript (ES6+)
- **Styling:** CSS with CSS Variables
- **No external dependencies** (except Vite for dev)
- **Deployment:** GitHub Pages
