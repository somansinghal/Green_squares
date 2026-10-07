# Contributing to GitHub Green Squares

Thank you for your interest in contributing to **GitHub Green Squares — Developer Contribution Analytics**! We welcome bug reports, feature enhancements, documentation improvements, and pull requests from developers of all skill levels.

---

## 🧭 Code of Conduct

All contributors and participants are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure a respectful, inclusive, and collaborative environment.

---

## 🛠️ Development Setup

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- A modern web browser (Chrome, Firefox, Safari, Edge)

### 2. Fork & Clone
1. Fork the repository on GitHub: [https://github.com/somansinghal/Green_squares](https://github.com/somansinghal/Green_squares)
2. Clone your personal fork locally:
   ```bash
   git clone https://github.com/<your-username>/Green_squares.git
   cd Green_squares
   ```

3. Create a descriptive feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```

### 3. Local Configuration
Copy the example environment configuration:
```bash
cp .env.example .env
```

If you plan to test live GitHub OAuth locally, register a local OAuth app in **GitHub Settings > Developer settings > OAuth Apps** with callback URL `http://localhost:3000/api/auth/github/callback`, and add your credentials to `.env`. (If testing demo mode only, no OAuth credentials are required!)

### 4. Running the Application Locally
Start the integrated local server (which serves the static frontend and routes `/api/*` serverless handlers):
```bash
npm start
# or: node server.js
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Guidelines

Before committing or submitting a pull request, run the automated verification suite:

### 1. Unit & Integration Verification Runner
```bash
npm test
```
The test runner tests:
- HTML SEO metadata, structured JSON-LD data, and single `<h1>` integrity.
- All DOM selector references in `script.js` against `index.html`.
- All serverless API endpoints (`/api/health`, `/api/github/health`, `/api/auth/github/me`, `/api/auth/github/logout`, `/api/github/contributions`, `/api/github/repositories`, `/api/github/activity`, `/api/auth/github/login`, `/api/auth/github/callback`).
- Streak algorithms, consistency score calculation, and achievement evaluation.

### 2. End-to-End Tests with Playwright
```bash
npm run test:e2e
```
To run tests with interactive UI:
```bash
npm run test:e2e:ui
```

---

## 📝 Commit Conventions

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat: add export analytics feature`
- `fix: resolve mobile navigation drawer focus trap`
- `docs: update OAuth environment variable instructions`
- `test: add CSRF cookie validation tests`
- `style: refine heatmap glowing border on dark theme`

---

## 🚀 Submitting a Pull Request

1. Ensure all tests pass (`npm test`).
2. Verify zero uncaught JavaScript console errors in DevTools.
3. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a Pull Request against the `main` branch of [https://github.com/somansinghal/Green_squares](https://github.com/somansinghal/Green_squares).
5. Clearly describe the motivation, changes made, and test procedures in the PR description.
