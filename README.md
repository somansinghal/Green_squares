# 🟩 GitHub Green Squares — Developer Contribution Analytics (V2)

> **Tagline:** *"Turn your coding activity into measurable developer progress."*

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript ES6+](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Vercel Serverless](https://img.shields.io/badge/Vercel-Serverless%20Functions-black?style=flat-square&logo=vercel&logoColor=white)
![Playwright](https://img.shields.io/badge/Tested%20With-Playwright-2EAD33?style=flat-square&logo=playwright&logoColor=white)
![Zero Client Dependencies](https://img.shields.io/badge/Dependencies-Zero%20Client-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

**Live Deployment:** [https://githubgreensquare.vercel.app](https://githubgreensquare.vercel.app)  
**GitHub Repository:** [https://github.com/somansinghal/Green_squares](https://github.com/somansinghal/Green_squares)

---

## 📌 Project Overview

**GitHub Green Squares — Developer Contribution Analytics** is a high-performance developer productivity and contribution analytics web application. Designed for developers who value consistent habits and visible momentum, it translates daily coding activity (commits, pull requests, issues, and code reviews) into clear, actionable progress metrics, streaks, and achievements.

### 🌟 V1 vs V2 Evolution

| Capability | Version 1 (V1) | Version 2 (V2 - Current) |
| :--- | :--- | :--- |
| **Data Provider** | Local-First Demo Simulation (`localStorage`) | **Dual Provider Architecture** (`DemoDataProvider` & `GitHubDataProvider`) |
| **GitHub Integration** | Demo activity simulation only | **Real GitHub OAuth2 & Official GitHub GraphQL/REST APIs** |
| **Authentication** | None | **Server-side OAuth authorization, HTTP-only session cookies, secure CSRF state** |
| **Client Secrets** | N/A | **100% Protected:** Server-side environment variables only; zero frontend exposure |
| **Heatmap Engine** | 365-day grid with simulated demo data | **365-day authentic GitHub contribution calendar** via GitHub GraphQL API |
| **Repository Insights**| Tracked demo repository cards | **Real authenticated user repositories** with stars, forks, languages, and live links |
| **Activity Feed** | Local simulated activity stream | **Real public developer event timeline** directly from GitHub API |
| **Data Portability** | Manual browser storage | **JSON Data Export & Validated Data Import** for backup and restoration |
| **Mobile Experience** | Responsive grid cards | **Full responsive drawer navigation**, touch-optimized controls, 320px–2560px support |
| **Automated Testing**| Syntax verification (`node -c`) | **Playwright E2E suite** + Zero-dependency automated test runner (`npm test`) |

---

## 🏗️ Architecture & Data Layer

```
                             ┌─────────────────────────────────┐
                             │           index.html            │
                             │   (Semantic HTML5, ARIA, SEO)   │
                             └────────────────┬────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │           script.js             │
                             │  (Centralized DOM & Controller) │
                             └────────┬───────────────┬────────┘
                                      │               │
            ┌─────────────────────────┴────┐     ┌────┴──────────────────────────┐
            ▼                              │     │                               ▼
┌────────────────────────┐                 │     │                ┌────────────────────────┐
│    DemoDataProvider    │                 │     │                │   GitHubDataProvider   │
│  (Local-First Engine)  │                 │     │                │ (Vercel API Gateway)   │
└───────────┬────────────┘                 │     │                └───────────┬────────────┘
            │                              │     │                            │
            ▼                              │     │                            ▼
┌────────────────────────┐                 │     │                ┌────────────────────────┐
│      localStorage      │                 │     │                │    /api/ endpoints     │
│      (Persistence)     │                 │     │                │   (Serverless OAuth)   │
└────────────────────────┘                 │     │                └───────────┬────────────┘
                                           │     │                            │
                                           ▼     ▼                            ▼
                                ┌──────────────────────┐          ┌────────────────────────┐
                                │ Calculation Engines  │          │   GitHub Official API  │
                                │ (Streaks, Scores,    │          │  (GraphQL Calendar &   │
                                │  Goals, Analytics)   │          │   REST User/Repos)     │
                                └──────────────────────┘          └────────────────────────┘
```

### 1. Dual Data Provider Architecture
The application decouples all UI components, charts, and metrics calculation engines from the data source via an abstract provider pattern:
- **`DemoDataProvider`**: Manages browser `localStorage`, enables full local CRUD operations (add, edit, delete activity), year switching (2024–2026), and demo intensity generation.
- **`GitHubDataProvider`**: Connects through the Vercel serverless API layer (`/api/auth/*` and `/api/github/*`) to fetch live authenticated profile data, GraphQL contribution calendars, real repositories, and public activity.

### 2. Defensive DOM Architecture
All DOM selectors are centralized in a single `DOM` reference dictionary. Operations use defensive helper utilities (`setText`, `setHTML`, `setVal`), ensuring that a missing element never crashes the execution loop.

---

## 🔒 Security Architecture & OAuth Implementation

Security is a primary design pillar of V2:

1. **Zero Secret Exposure:**
   - `GITHUB_CLIENT_SECRET` is stored **strictly server-side** as an environment variable in Vercel.
   - It is never included in HTML, CSS, client-side JavaScript, GitHub repositories, or exported JSON.
2. **Cryptographically Secure State:**
   - OAuth requests generate a 48-character cryptographic random state (`crypto.randomBytes(24).toString('hex')`).
   - Stored in an `HttpOnly`, `SameSite=Lax` cookie and verified strictly on callback to prevent CSRF attacks.
3. **Protected Access Tokens:**
   - The GitHub `access_token` returned from the OAuth exchange is stored inside a secure `HttpOnly` cookie (`gh_session`).
   - The token is never sent to the browser or stored in `localStorage`.
4. **Minimum Permissions (`read:user`):**
   - The application requests strictly read-only profile and contribution access (`read:user`).
   - It does **not** request broad `repo` read/write access.
5. **Data Import Sanitization:**
   - All uploaded JSON files are validated against a strict schema.
   - Input strings are sanitized to prevent XSS or script injection.

---

## ⚡ Backend Vercel Serverless API Routes

The backend is organized into clean, stateless serverless functions under `/api/`:

| Endpoint | Method | Purpose | Security |
| :--- | :--- | :--- | :--- |
| `/api/auth/github/login` | `GET` | Generates OAuth authorization URL with CSRF state | Sets HTTP-only state cookie |
| `/api/auth/github/callback` | `GET` | Validates CSRF state, exchanges code for access token | Issues HTTP-only session cookie |
| `/api/auth/github/me` | `GET` | Returns authenticated user profile (username, avatar, repos) | Session cookie required |
| `/api/auth/github/logout` | `GET` | Clears authentication cookies and redirects | Idempotent |
| `/api/github/contributions` | `GET` | Queries GitHub GraphQL API for authentic 365-day calendar | Token forwarded server-side |
| `/api/github/repositories` | `GET` | Queries user's repositories (stars, forks, languages) | Rate-limit aware |
| `/api/github/activity` | `GET` | Queries public event activity timeline | Rate-limit aware |
| `/api/health` | `GET` | Reports API status and connectivity safely | Public, no secrets |

---

## 🔑 GitHub OAuth Setup Guide

To configure your own GitHub OAuth application:

1. Navigate to **[GitHub Developer Settings > OAuth Apps](https://github.com/settings/developers)**.
2. Click **New OAuth App**.
3. Fill in the application details:
   - **Application name:** `GitHub Green Squares`
   - **Homepage URL:** `https://githubgreensquare.vercel.app/` (or `http://localhost:3000/` for local dev)
   - **Authorization callback URL:**
     - Production: `https://githubgreensquare.vercel.app/api/auth/github/callback`
     - Local Development: `http://localhost:3000/api/auth/github/callback`
4. Click **Register application**.
5. Copy your **Client ID**.
6. Generate and copy a new **Client Secret**.

---

## 🌐 Environment Variables

Configure these environment variables in your Vercel Project Settings (**Settings > Environment Variables**) or in a local `.env` file:

```env
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=https://githubgreensquare.vercel.app/api/auth/github/callback
```

> **Warning:** Never commit `.env` or client secrets to version control. The `.gitignore` file is preconfigured to ignore `.env`, `.env.local`, and all cache directories.

---

## 💻 Local Development & Running the App

### Prerequisites
- Node.js (v18 or higher recommended)

### Step-by-Step Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/somansinghal/Green_squares.git
   cd Green_squares
   ```

2. **Configure local environment (optional for demo mode):**
   ```bash
   cp .env.example .env
   # Edit .env with your GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET if testing live OAuth locally
   ```

3. **Start the local server:**
   ```bash
   npm start
   # or: node server.js
   ```
   Open `http://localhost:3000` in your web browser.

4. **Run the automated test suite:**
   ```bash
   npm test
   # Executes the complete zero-dependency runner testing SEO, DOM integrity, API endpoints, and calculation engines
   ```

---

## 🚀 Vercel Deployment

Deploy directly to Vercel:

1. Import the repository `https://github.com/somansinghal/Green_squares` into Vercel.
2. Under **Project Settings > Environment Variables**, add:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_REDIRECT_URI` (e.g. `https://githubgreensquare.vercel.app/api/auth/github/callback`)
3. Deploy! Vercel automatically detects the `/api` directory and mounts serverless routes.

---

## 🧪 Testing Suite & Quality Assurance

### 1. Automated Test Runner (`tests/runner.js`)
Run anytime with:
```bash
npm test
```
The automated test runner verifies:
- **SEO & Social:** Exact title, meta description, canonical URL, JSON-LD `SoftwareApplication` schema, single H1 heading, and strictly authentic social links.
- **DOM Integrity:** Validates all 160 JavaScript element references against `index.html` (guaranteeing 0 missing IDs).
- **Serverless API Routes:** Tests all endpoints (`/api/health`, `/api/auth/github/me`, `/api/auth/github/logout`, `/api/github/contributions`, `/api/github/repositories`, `/api/github/activity`, `/api/auth/github/login`, `/api/auth/github/callback`) for proper status codes, headers, and CSRF protection.
- **Runtime Analytics:** Evaluates streak engine, consistency score algorithms, and achievement evaluators.

### 2. End-to-End Playwright Suite (`tests/app.spec.js`)
Run with Playwright:
```bash
npx playwright test
```
Covers:
- Responsive layout verification at 9 viewports (320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px).
- Zero console error monitoring (`pageerror` and `console.error` assertions).
- CRUD operations (Add, Edit, Delete activity) and instant state propagation.
- Mobile menu drawer keyboard and touch interactions.
- Data export and validated JSON data import.

---

## 🔧 Troubleshooting & Common Issues

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`redirect_uri_mismatch`** | The callback URL in GitHub Developer Settings doesn't match `GITHUB_REDIRECT_URI`. | Ensure the GitHub OAuth App callback URL matches `https://<your-domain>/api/auth/github/callback` exactly. |
| **`missing_code_or_state`** | User cancelled GitHub login or accessed callback directly. | The application gracefully redirects to demo mode and displays a helpful toast. Click **Connect GitHub** to retry. |
| **`invalid_csrf_state`** | Session cookie expired or request tampered with. | Clear cookies and initiate login again from the **Connect GitHub** button. |
| **GitHub API Rate Limit Reached** | Unauthenticated requests exceed 60 req/hr or token limit reached. | Connect your GitHub account to receive authenticated limits (5,000 req/hr). |
| **OAuth Setup Required Error Page** | `GITHUB_CLIENT_ID` is missing in Vercel environment variables. | Add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in your Vercel Project Settings and redeploy. |
| **Heatmap horizontal overflow on mobile** | Viewport width is smaller than 700px. | The calendar container is engineered with smooth inner horizontal scrolling (`overflow-x: auto`), maintaining full 365-day fidelity without breaking page layout. |

---

## 🌐 SEO & Social Metadata

- **Title:** `GitHub Green Squares — Developer Contribution Analytics`
- **Description:** *"GitHub Green Squares is a developer contribution analytics dashboard for visualizing coding activity, GitHub contributions, streaks, repositories, achievements, and developer consistency."*
- **Canonical URL:** `https://githubgreensquare.vercel.app/`
- **Open Graph & Twitter Cards:** Complete summary cards with responsive layout tags.
- **JSON-LD Structured Data:** Valid `SoftwareApplication` schema with application category and operating system descriptors.
- **Verified Creator Links:**
  - **GitHub:** [https://github.com/somansinghal](https://github.com/somansinghal)
  - **Instagram:** [https://instagram.com/_somansinghal](https://instagram.com/_somansinghal)
  - **Portfolio:** [https://somansinghal.vercel.app/](https://somansinghal.vercel.app/)
  - **Project Website:** [https://githubgreensquare.vercel.app/](https://githubgreensquare.vercel.app/)

---

## 📁 Repository Structure

```
Green_squares/
│
├── api/
│   ├── auth/
│   │   └── github/
│   │       ├── login.js          # OAuth authorization redirect with CSRF state
│   │       ├── callback.js       # Code exchange and secure session cookie issuance
│   │       ├── logout.js         # Session cookie termination
│   │       └── me.js             # Authenticated profile query
│   │
│   └── github/
│       ├── activity.js           # Live public user activity events feed
│       ├── contributions.js      # 365-day GraphQL contribution calendar query
│       ├── repositories.js       # User public repositories query
│       └── health.js             # Public API health monitor
│
├── assets/
│   ├── logo.svg                  # Full vector logo with wordmark
│   ├── logo-mark.svg             # Original emerald squircle brand mark
│   ├── favicon.svg               # Scalable browser tab favicon
│   ├── favicon.ico               # Multi-resolution ICO icon
│   ├── apple-touch-icon.png      # iOS home screen web clip icon
│   └── social-preview.png        # 1200x630 OpenGraph / Twitter preview card
│
├── tests/
│   ├── app.spec.js               # Multi-device Playwright test suite
│   └── runner.js                 # Zero-dependency automated test runner
│
├── screenshots/                  # Multi-viewport responsive snapshots
│
├── index.html                    # Semantic HTML5 frontend, ARIA & SEO markup
├── style.css                     # Premium dark/emerald design system
├── script.js                     # Dual DataProvider controller & defensive DOM map
├── server.js                     # Local Node dev server with Vercel shims
│
├── README.md                     # Comprehensive project documentation
├── LICENSE                       # MIT Open Source License (Soman Singhal)
├── CONTRIBUTING.md               # Contribution, coding, and PR guidelines
├── CODE_OF_CONDUCT.md            # Contributor Covenant v2.1 code of conduct
├── SECURITY.md                   # Security policy, secret protection & disclosure
├── CHANGELOG.md                  # Release history and unreleased features
├── SUPPORT.md                    # Support channels via GitHub Issues
├── TESTS.md                      # Comprehensive Quality Assurance test matrix
├── AUDIT-page.md                 # Detailed compliance and audit checklist
│
├── .env.example                  # Environment variable template
├── .gitignore                    # Secrets, caches, and test artifacts exclusion
├── package.json                  # Scripts: start, dev, test, test:e2e
├── playwright.config.js          # Playwright test harness configuration
├── vercel.json                   # Vercel routing and security headers
├── robots.txt                    # Search crawler indexing rules
├── sitemap.xml                   # XML sitemap for production homepage
├── manifest.webmanifest          # PWA Web App Manifest
└── google43d334ab82b2aeee.html   # Google Search Console verification token
```

---

## 🤝 Open Source & Contributing

Contributions are welcome! Please check our community guidelines:
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Changelog](CHANGELOG.md)
- [Support Guidelines](SUPPORT.md)

---

## 📄 License & Attribution

MIT License &copy; 2026 Soman Singhal. Built with pride for developers worldwide.  
*Disclaimer: GitHub Green Squares is an independent open-source developer tool and is not officially affiliated with or endorsed by GitHub, Inc.*
