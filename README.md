# 🟩 GitHub Green Squares — Developer Contribution Analytics

> **Tagline:** *"Turn your coding activity into measurable developer progress."*

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-success?style=flat-square)
![Local First](https://img.shields.io/badge/Architecture-Local--First-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## 📌 Project Overview

**GitHub Green Squares — Developer Contribution Analytics** is a high-performance, dependency-free developer productivity and contribution analytics web application. Designed for developers who value steady habits and visible momentum, it translates daily coding effort (commits, pull requests, issues, and code reviews) into clear, actionable progress metrics.

> **Important Notice:** **V1 is strictly local-first and uses demo activity data.** The application is completely functional in the browser without external network requests or authentication tokens, providing instant feedback and private data storage in `localStorage`.

---

## ✨ Features & Capabilities

### 1. 🟩 365-Day Contribution Calendar Heatmap
- **Authentic GitHub-Style Calendar:** 7 weekday rows, 53 columns, dynamic month headers (`Jan`–`Dec`), and weekday labels (`Mon`, `Wed`, `Fri`).
- **Dynamic Intensity Levels:**
  - `Level 0`: 0 contributions (empty cell)
  - `Level 1`: 1–2 contributions
  - `Level 2`: 3–5 contributions
  - `Level 3`: 6–9 contributions
  - `Level 4`: 10+ contributions (intense green glow)
- **Fluid Keyboard Navigation:** Full `tabindex="0"` keyboard focus and activation with `Enter` / `Space`.
- **Informative Floating Tooltips:** Hover or focus any day to view total count, commits, PRs, issues, reviews, and active repositories.

### 2. 🔍 Interactive Day Inspection, Add, Edit & Delete
- **Day Details Modal:** Click any calendar square to inspect exact activity breakdowns and commit notes.
- **Add Activity Modal:** Add new entries with input validation (date, repository, type, and count 1–100).
- **Edit Activity Modal:** Modify commits, pull requests, issues, reviews, notes, and repository assignments with zero page reloads.
- **Delete Confirmation Modal:** Safely delete day records with immediate state updates across charts, streaks, and achievements.

### 3. 📊 Calculation Engines & Metrics
- **Dynamic Profile Summary:** Calculates total contributions, current streak, longest streak, active days count, and active percentage of the year.
- **8 Dynamic Metric Cards:**
  1. *Avg / Active Day*
  2. *Current Streak* (with contextual momentum message)
  3. *Longest Streak* (all-time personal record)
  4. *Best Month* (highest volume month and contribution tally)
  5. *Best Day Record* (peak single-day contribution count and date)
  6. *Most Productive Day* (peak day of week)
  7. *Consistency Score* (0–100 transparent rating)
  8. *Tracked Repos* (unique project count)

### 4. 📈 Rich Visual Analytics (No Chart Libraries)
- **Weekly Distribution:** Monday → Sunday volume chart with day-of-week breakdown and peak indicator.
- **Weekly Commit Goal Tracker:** Set a weekly goal (default: 35), adjust via `-`/`+` stepper or settings, and track completion progress with milestone emojis.
- **Monthly Analytics:** 12-month column chart comparing monthly volume across the year.
- **Dynamic Vector SVG Trend Graph:** Smooth cubic Bezier spline with gradient area fill charting 52-week activity velocity and peak periods.

### 5. 📦 Repository Analytics & Quick Filters
- Detailed breakdown across 5 tracked projects (`LegalLens AI`, `ScanForge`, `Dev-Journal`, `Green-Square-Lab`, `Commit-Tracker`).
- Active days count, contribution share percentages, and last activity timestamp.
- **Click-to-Filter:** Click any repository to filter the entire dashboard; easily clear filter at any time.

### 6. 🕒 Recent Activity Stream
- Chronological timeline of latest recorded events sorted descending by date.
- Type badges (💻 Commits, 🔀 PRs, ⚠️ Issues, 👁️ Reviews), timestamps, project tags, and commit messages.

### 7. 🏆 10 System Achievements
1. **First Contribution:** Record at least 1 contribution.
2. **7 Day Streak:** Maintain an active coding streak of 7 consecutive days.
3. **30 Day Streak:** Reach 30 consecutive active coding days.
4. **100 Contributions:** Accumulate 100 total contributions in a year.
5. **500 Contributions:** Reach 500 total contributions.
6. **1000 Contributions:** Reach 1,000 recorded contributions.
7. **100 Active Days:** Log contributions on 100 unique calendar days.
8. **Consistency Master:** Achieve a Consistency Score of ≥ 75.
9. **Weekend Warrior:** Log 25+ contributions on Saturdays or Sundays.
10. **Activity Explorer:** Log contributions across all 4 types (commits, PRs, issues, reviews).

### 8. 🎨 Design System, Themes & Accessibility
- **Theme Switcher:** Dark Mode (default), Light Mode, and System Theme (syncs with OS `prefers-color-scheme`).
- **Responsive Layout:** Optimized for mobile (375px, 390px), tablet (768px), desktop (1024px), and ultra-wide screens (1440px). Heatmap scrolls smoothly horizontally within its container without breaking page layout.
- **Accessible UX:** ARIA attributes, semantic markup, focus rings, escape key handling, and non-blocking toast notifications.

---

## 🏗️ Architecture & Data Layer

```
                        ┌────────────────────────┐
                        │      Application       │
                        │       (script.js)      │
                        └───────────┬────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │   DataProvider (Base)  │
                        └───────────┬────────────┘
                                    │
                                    ▼
                        ┌────────────────────────┐
                        │   DemoDataProvider     │
                        │  (Local-First Engine)  │
                        └───────────┬────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        ┌──────────────────┐                ┌──────────────────┐
        │   In-Memory UI   │                │   localStorage   │
        │      State       │                │   Persistence    │
        └──────────────────┘                └──────────────────┘
```

### The DataProvider Abstraction
The application decouples UI components from persistence via a `DataProvider` contract:
- `getYearData(year)`
- `addActivity(year, entry)`
- `updateActivity(year, entry)`
- `deleteActivity(year, dateStr)`
- `generateDemo(year, intensity)`
- `resetAll()`

`DemoDataProvider` implements this interface using `localStorage`. When the user is ready to connect real GitHub webhooks or OAuth APIs in future versions, a `GitHubDataProvider` can be swapped in without modifying any UI rendering code.

---

## 🗃️ Data Model

Activity data is stored per year under the localStorage key `github_green_squares_analytics_v2`:

```json
{
  "version": 2,
  "createdAt": "2026-10-07T12:00:00.000Z",
  "weeklyGoal": 35,
  "years": {
    "2026": {
      "2026-10-07": {
        "date": "2026-10-07",
        "commits": 5,
        "pullRequests": 1,
        "issues": 1,
        "codeReviews": 1,
        "total": 8,
        "repositories": ["LegalLens AI", "ScanForge"],
        "primaryRepo": "LegalLens AI",
        "note": "feat: integrate OAuth2 refresh workflow"
      }
    },
    "2025": { ... },
    "2024": { ... }
  }
}
```

---

## 🧮 How Calculations Work

### 1. Streak Engine
- **Reference Date:** For year 2026, the current simulated date is `2026-10-07`. For past years (2025, 2024), the reference is the year end (`December 31`).
- **Current Streak:** Scans backward from the reference date. If today is active, counts consecutive days. If today has 0 contributions, it checks whether yesterday was active; if so, the streak remains intact (pending today's contributions).
- **Longest Streak:** Scans the calendar from January 1st to the reference date, maintaining a running counter and recording the maximum contiguous sequence of active days.

### 2. Consistency Score Algorithm
Returns an integer score from `0` to `100` with four transparent components:
1. **Active Day Ratio (Max 40 pts):** `(activeDays / elapsedDays) * 40`
2. **Streak Performance (Max 25 pts):** `min(25, (longestStreak / 21) * 25)` (21 days is the habit formation benchmark)
3. **Weekday Regularity (Max 20 pts):** Proportion of the 5 workdays (Mon–Fri) that have recorded contributions.
4. **Volume Distribution (Max 15 pts):** Proportion of active calendar months across the year.

---

## 🚀 Getting Started & Deployment

Because this project is built entirely with pure HTML5, CSS3, and Vanilla JavaScript with **zero npm dependencies**, no build step is needed.

### Running Locally
You can run it using any static file server:

```bash
# Using Python 3
python3 -m http.server 8080

# Or using Node.js npx
npx serve .
```

Open `http://localhost:8080` in your web browser.

### Deploying to Production
Deploy instantly to any static hosting provider:
- **GitHub Pages:** Commit to `main` and enable Pages in repository settings.
- **Vercel / Netlify / Cloudflare Pages:** Connect the repository; no build command required, publish directory is root (`./`).

---

## 🧪 Testing

Comprehensive manual test scenarios, reproduction steps, and pass criteria are documented in [TESTS.md](file:///Users/somansinghal/Downloads/green%20github/TESTS.md).

Full quality assurance verification ratings across features, accessibility, responsiveness, and performance are documented in [AUDIT-page.md](file:///Users/somansinghal/Downloads/green%20github/AUDIT-page.md).

To run the automated Node integration verification:
```bash
node -c script.js
```

---

## ⚠️ Limitations & Future Roadmap

### Current Version (V1)
- V1 is 100% client-side and local-first.
- Does not require or accept GitHub personal access tokens.
- All initial activity consists of realistic simulated demo records.

### Future Roadmap (V2)
- Optional GitHub Personal Access Token (PAT) input to fetch real user contribution GraphQL data.
- Export / Import backup functionality for customized activity datasets (JSON / CSV).
- SVG heatmap poster image download (`.png` / `.svg`).

---

## 📄 License

MIT License &copy; 2026 Soman Singhal. Built with pride for developers worldwide.
