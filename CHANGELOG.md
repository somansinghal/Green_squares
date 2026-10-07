# Changelog

All notable changes to **GitHub Green Squares — Developer Contribution Analytics** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned
- Exportable SVG / PNG contribution heatmap badge for developer README profiles.
- Extended multi-year historical comparison trends.

---

## [2.0.0] - 2026-10-07

### Added
- **Real GitHub OAuth2 Integration:**
  - Secure Vercel serverless OAuth routes (`/api/auth/github/login`, `/api/auth/github/callback`, `/api/auth/github/me`, `/api/auth/github/logout`).
  - Cryptographically secure CSRF `state` generation and validation via HTTP-only cookies.
  - Server-side token exchange storing `access_token` in secure `gh_session` HTTP-only cookie.
  - Minimum permission scope (`read:user`) ensuring private repo boundaries are respected.
- **Official GitHub API Integration:**
  - Authenticated 365-day contribution calendar extraction via GitHub GraphQL API (`/api/github/contributions`).
  - User public repository ingestion with live stars, forks, languages, and direct URLs (`/api/github/repositories`).
  - Live public event timeline ingestion (`/api/github/activity`).
  - Safe API health status endpoint (`/api/health` and `/api/github/health`).
- **Dual DataProvider Architecture:**
  - Clear separation between `DemoDataProvider` (local-first browser simulation) and `GitHubDataProvider` (serverless gateway).
  - Explicit dashboard mode indicators: `🟡 Demo Data` vs `🟢 Live GitHub Data`.
- **Data Portability:**
  - JSON Data Export for local backup.
  - Validated JSON Data Import with XSS sanitization and structural checks.
- **Brand Identity & Assets:**
  - Original SVG logo (`assets/logo.svg`) and brand mark (`assets/logo-mark.svg`).
  - Crisp scalable favicon (`assets/favicon.svg`, `assets/favicon.ico`).
  - Apple touch icon (`assets/apple-touch-icon.png`) and high-res social preview card (`assets/social-preview.png`).
  - Web App Manifest (`manifest.webmanifest`).
- **Responsive Navigation Drawer:**
  - Accessible mobile hamburger menu drawer (<768px) with focus trapping and `Escape` key close.
- **Automated Testing Suite:**
  - Zero-dependency node test runner (`tests/runner.js` executing via `npm test`).
  - Multi-device Playwright test suite (`tests/app.spec.js` and `playwright.config.js`).

### Fixed
- Fixed critical production `TypeError: null is not an object` crash caused by obsolete DOM ID lookups (`stat-total-contributions`).
- Introduced centralized, defensive DOM reference dictionary with null-safe setters.
- Resolved mobile horizontal layout overflow with smooth inner calendar scrolling container.

---

## [1.0.0] - 2026-10-07

### Added
- 365-day contribution calendar heatmap with 5 intensity levels (0 to 4).
- Interactive day inspection modal with activity breakdown.
- Local contribution CRUD: Add, Edit, and Delete activity with immediate recalculation.
- Streak calculation engines: Current streak and Longest contiguous streak.
- Consistency score engine (0 to 100 rating algorithm).
- Dynamic SVG vector trend graph (weekly cubic Bezier velocity curve).
- Weekly commit goal tracker with interactive stepper.
- Day-of-week and monthly activity distribution charts.
- 10 system achievements engine.
- Dark, Light, and System theme switcher with `localStorage` persistence.
