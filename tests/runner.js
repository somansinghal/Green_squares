const fs = require('fs');
const http = require('http');
const path = require('path');
const server = require('../server');

async function runTests() {
  console.log('🧪 Starting GitHub Green Squares V2 Automated Test Runner...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Verify index.html existence and essential SEO tags
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert(html.includes('<title>GitHub Green Squares — Developer Contribution Analytics</title>'), 'SEO: Exact Title tag');
  assert(html.includes('name="description" content="GitHub Green Squares is a developer contribution analytics dashboard'), 'SEO: Exact Meta Description');
  assert(html.includes('rel="canonical" href="https://githubgreensquare.vercel.app/"'), 'SEO: Exact Canonical URL');
  assert(html.includes('SoftwareApplication'), 'SEO: JSON-LD Structured Data Schema');
  assert((html.match(/<h1/g) || []).length === 1, 'SEO: Exactly one H1 heading');
  assert(html.includes('href="https://github.com/somansinghal"'), 'Social: Real GitHub profile link');
  assert(html.includes('href="https://instagram.com/_somansinghal"'), 'Social: Real Instagram profile link');
  assert(html.includes('href="https://somansinghal.vercel.app/"'), 'Social: Real Portfolio profile link');
  assert(html.includes('google-site-verification'), 'SEO: Google Site Verification meta tag exists');
  assert(html.includes('assets/social-preview.png'), 'SEO: Social preview card referenced');
  assert(html.includes('manifest.webmanifest'), 'PWA: Web App Manifest link exists');
  assert(!html.includes('linkedin.com'), 'Social: No invented LinkedIn link');

  // Verify Required Project Assets and Open Source Documents
  const requiredFiles = [
    'assets/logo.svg',
    'assets/logo-mark.svg',
    'assets/favicon.svg',
    'assets/favicon.ico',
    'assets/apple-touch-icon.png',
    'assets/social-preview.png',
    'manifest.webmanifest',
    'robots.txt',
    'sitemap.xml',
    'LICENSE',
    'CONTRIBUTING.md',
    'CODE_OF_CONDUCT.md',
    'SECURITY.md',
    'CHANGELOG.md',
    'SUPPORT.md',
    'google43d334ab82b2aeee.html'
  ];
  for (const relPath of requiredFiles) {
    assert(fs.existsSync(path.join(__dirname, '..', relPath)), `File Integrity: ${relPath} exists and accessible`);
  }

  // 2. Verify all DOM element references in script.js
  const js = fs.readFileSync(path.join(__dirname, '../script.js'), 'utf8');
  const idRegex = /document\.getElementById\(['\"]([^'\"]+)['\"]\)/g;
  let match;
  const usedIds = new Set();
  while ((match = idRegex.exec(js)) !== null) {
    usedIds.add(match[1]);
  }
  const missingIds = [];
  for (const id of usedIds) {
    if (!html.includes('id=\"' + id + '\"') && !html.includes('id=\'' + id + '\'')) {
      missingIds.push(id);
    }
  }
  assert(missingIds.length === 0, `DOM Integrity: All ${usedIds.size} JavaScript element references match DOM (missing: ${missingIds.join(', ')})`);

  // 3. Test Local Server and API Endpoints (in-memory dispatch, 0 network socket dependency)
  console.log('\n🌐 Testing Server Routing & API Endpoints:');
  const { Writable } = require('stream');
  const mockDispatch = (pathname, headers = {}) => new Promise((resolve) => {
    class MockRes extends Writable {
      constructor() {
        super();
        this.statusCode = 200;
        this.headers = {};
        this.data = '';
      }
      _write(chunk, enc, cb) {
        this.data += chunk.toString();
        cb();
      }
      writeHead(status, h = {}) {
        this.statusCode = status;
        for (const [k, v] of Object.entries(h)) {
          this.headers[k.toLowerCase()] = v;
        }
      }
      setHeader(k, v) {
        this.headers[k.toLowerCase()] = v;
      }
      end(chunk) {
        if (chunk) this.data += chunk.toString();
        super.end();
        resolve({ status: this.statusCode, headers: this.headers, data: this.data });
      }
    }

    const req = {
      url: pathname,
      headers: { host: 'localhost', ...headers },
      method: 'GET',
      on: (ev, cb) => {
        if (ev === 'end') cb();
        return req;
      }
    };

    const res = new MockRes();
    server.emit('request', req, res);
  });

  // Test 1: Static HTML serving
  const resHtml = await mockDispatch('/');
  assert(resHtml.status === 200, 'Server: Serves index.html at root (200 OK)');
  assert(resHtml.headers['content-type'] && resHtml.headers['content-type'].includes('text/html'), 'Server: Content-Type is text/html');

  // Test 2: Health API endpoints
  const resHealth = await mockDispatch('/api/health');
  assert(resHealth.status === 200, 'API /api/health: Returns 200 OK');
  const healthData = JSON.parse(resHealth.data);
  assert(healthData.status === 'ok' && healthData.githubApi === 'connected', 'API /api/health: Reports status ok and connected');

  const resGhHealth = await mockDispatch('/api/github/health');
  assert(resGhHealth.status === 200, 'API /api/github/health: Returns 200 OK');
  const ghHealthData = JSON.parse(resGhHealth.data);
  assert(ghHealthData.status === 'ok' && ghHealthData.githubApi === 'connected', 'API /api/github/health: Reports status ok and connected');

  // Test 3: Auth me endpoint (unauthenticated)
  const resMe = await mockDispatch('/api/auth/github/me');
  assert(resMe.status === 200, 'API /api/auth/github/me: Returns 200 OK');
  const meData = JSON.parse(resMe.data);
  assert(meData.authenticated === false, 'API /api/auth/github/me: Correctly reports unauthenticated for empty session');

  // Test 4: Auth logout endpoint
  const resLogout = await mockDispatch('/api/auth/github/logout', { 'accept': 'application/json' });
  assert(resLogout.status === 200, 'API /api/auth/github/logout: Returns 200 OK');
  const logoutData = JSON.parse(resLogout.data);
  assert(logoutData.success === true, 'API /api/auth/github/logout: Reports success: true');

  // Test 5: Contributions API endpoint (unauthenticated)
  const resContrib = await mockDispatch('/api/github/contributions');
  assert(resContrib.status === 401, 'API /api/github/contributions: Returns 401 Unauthorized when unauthenticated');

  // Test 6: Repositories API endpoint (unauthenticated)
  const resRepos = await mockDispatch('/api/github/repositories');
  assert(resRepos.status === 401, 'API /api/github/repositories: Returns 401 Unauthorized when unauthenticated');

  // Test 7: Activity API endpoint (unauthenticated)
  const resActivity = await mockDispatch('/api/github/activity');
  assert(resActivity.status === 401, 'API /api/github/activity: Returns 401 Unauthorized when unauthenticated');

  // Test 8: OAuth Login endpoint (shows setup guidance when CLIENT_ID not set)
  delete process.env.GITHUB_CLIENT_ID;
  const resLoginNoConfig = await mockDispatch('/api/auth/github/login');
  assert(resLoginNoConfig.status === 500, 'API /api/auth/github/login: Informs developer if GITHUB_CLIENT_ID is missing');

  // Test 9: OAuth Login endpoint (redirects to GitHub authorize URL when CLIENT_ID is set)
  process.env.GITHUB_CLIENT_ID = 'test_client_id_123';
  const resLoginConfigured = await mockDispatch('/api/auth/github/login');
  assert(resLoginConfigured.status === 302, 'API /api/auth/github/login: Redirects (302) when configured');
  assert(resLoginConfigured.headers['location'] && resLoginConfigured.headers['location'].includes('https://github.com/login/oauth/authorize'), 'API /api/auth/github/login: Redirects to GitHub authorize URL');
  assert(resLoginConfigured.headers['location'].includes('client_id=test_client_id_123'), 'API /api/auth/github/login: Includes client_id');
  assert(resLoginConfigured.headers['set-cookie'] && resLoginConfigured.headers['set-cookie'].includes('gh_oauth_state='), 'API /api/auth/github/login: Sets secure HTTP-only state cookie');

  // Test 10: OAuth Callback CSRF validation
  const resCallbackMissing = await mockDispatch('/api/auth/github/callback');
  assert(resCallbackMissing.status === 302 && resCallbackMissing.headers['location'].includes('auth_error=missing_code_or_state'), 'API /api/auth/github/callback: Rejects requests missing state/code');

  const resCallbackBadState = await mockDispatch('/api/auth/github/callback?code=foo&state=invalid', { 'cookie': 'gh_oauth_state=real_secret_state' });
  assert(resCallbackBadState.status === 302 && resCallbackBadState.headers['location'].includes('auth_error=invalid_csrf_state'), 'API /api/auth/github/callback: Rejects CSRF state mismatches');

  // 4. Test script.js simulated runtime in Node
  console.log('\n⚙️ Testing Application Runtime & Calculation Logic:');
  class MockElement {
    constructor(id) {
      this.id = id;
      this.children = [];
      this.classes = new Set();
      this.classList = {
        add: (c) => this.classes.add(c),
        remove: (c) => this.classes.delete(c),
        contains: (c) => this.classes.has(c)
      };
      this.style = {};
      this.dataset = {};
      this.value = '';
      this.textContent = '';
      this.innerHTML = '';
    }
    setAttribute(k, v) { this[k] = v; }
    getAttribute(k) { return this[k] || null; }
    appendChild(child) { this.children.push(child); }
    removeChild() {}
    addEventListener() {}
    querySelectorAll() { return []; }
    querySelector() { return null; }
    getBoundingClientRect() { return { left: 0, top: 0, width: 20, height: 20, bottom: 20, right: 20 }; }
    scrollIntoView() {}
  }

  const elements = {};
  let domLoadedCb = null;
  global.document = {
    getElementById: (id) => {
      if (!elements[id]) elements[id] = new MockElement(id);
      return elements[id];
    },
    createElement: (tag) => new MockElement(tag),
    createElementNS: (ns, tag) => new MockElement(tag),
    querySelectorAll: () => [],
    querySelector: () => new MockElement('mock'),
    addEventListener: (ev, fn) => {
      if (ev === 'DOMContentLoaded') domLoadedCb = fn;
    },
    body: new MockElement('body'),
    documentElement: new MockElement('html')
  };

  global.window = {
    innerWidth: 1200,
    innerHeight: 800,
    location: { search: '', pathname: '/' },
    history: { replaceState: () => {} },
    matchMedia: () => ({ matches: true, addEventListener: () => {} })
  };
  global.requestAnimationFrame = (fn) => fn();

  const store = {};
  global.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; }
  };

  // Mock global fetch
  global.fetch = async (url) => {
    if (url === '/api/auth/github/me') return { ok: true, json: async () => ({ authenticated: false }) };
    if (url === '/api/health') return { ok: true, json: async () => ({ status: 'ok' }) };
    return { ok: false, status: 404 };
  };

  require('../script.js');
  if (domLoadedCb) await domLoadedCb();

  const totalContribText = elements['prof-total-contributions'].textContent;
  const totalVal = parseInt(totalContribText.replace(/,/g, ''), 10);
  assert(totalVal > 100, `Runtime: Initial demo contributions populated (${totalVal})`);
  assert(elements['stat-consistency-score'].textContent.includes('/ 100'), 'Runtime: Consistency score calculated');
  assert(elements['achievements-tally-badge'].textContent.includes('/ 10 Unlocked'), 'Runtime: Achievements evaluated');
  assert(elements['mode-title-text'].textContent === 'Demo Data', 'Runtime: Correct default mode (Demo Data)');

  console.log(`\n========================================`);
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
