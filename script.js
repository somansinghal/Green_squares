/**
 * 🟩 GitHub Green Squares — Developer Contribution Analytics (V2 Production)
 * Tagline: "Turn your coding activity into measurable developer progress."
 * 
 * Pure Vanilla JavaScript ES6+ (Zero external dependencies).
 * Architecture:
 * - Centralized DOM Reference System with Graceful Missing-Element Handling (Fixes Root Cause)
 * - Dual DataProvider Architecture: DemoDataProvider & GitHubDataProvider
 * - Real GitHub OAuth Integration (Connect, Disconnect, Sync, Profile, Repos, Events)
 * - 365-Day GitHub Contribution Calendar Heatmap
 * - Real-time Calculation Engines (Streaks, Consistency Algorithm, Metrics)
 * - Dynamic Vector SVG Trend Curve & Custom HTML/CSS Analytics Charts
 * - Full CRUD Operations in Demo Mode with LocalStorage Persistence
 * - Data Import / Export (JSON Backup & Migration)
 * - Mobile Navigation Menu with Accessible Toggle
 * - Dark / Light / System Theme Engine
 * - Zero Uncaught Console Errors
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. CONSTANTS & CONFIGURATION
  // ==========================================================================

  const STORAGE_KEY = 'github_green_squares_analytics_v2';
  const THEME_KEY = 'github_green_squares_theme_v2';
  const GOAL_KEY = 'github_green_squares_goal_v2';
  const CACHE_KEY_GH = 'github_green_squares_gh_cache_v2';

  const SIMULATED_TODAY_STR = '2026-10-07';
  const SUPPORTED_DEMO_YEARS = ['2026', '2025', '2024'];

  const DEMO_REPOSITORIES = [
    'LegalLens AI',
    'ScanForge',
    'Dev-Journal',
    'Green-Square-Lab',
    'Commit-Tracker'
  ];

  const MONTH_NAMES_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_NAMES_FULL = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const WEEKDAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // 10 System Achievements Definitions (Section 25)
  const ACHIEVEMENTS_DEFINITIONS = [
    {
      id: 'first_contribution',
      icon: '🟩',
      name: 'First Contribution',
      desc: 'Record your very first contribution in the application.',
      req: '1 contribution',
      check: (stats) => stats.totalContributions >= 1,
      progress: (stats) => Math.min(100, (stats.totalContributions / 1) * 100),
      current: (stats) => `${Math.min(stats.totalContributions, 1)} / 1 contribution`
    },
    {
      id: 'streak_7',
      icon: '🔥',
      name: '7 Day Streak',
      desc: 'Maintain an active coding streak of 7 consecutive days.',
      req: '7 consecutive active days',
      check: (stats) => stats.longestStreak >= 7,
      progress: (stats) => Math.min(100, (stats.longestStreak / 7) * 100),
      current: (stats) => `${Math.min(stats.longestStreak, 7)} / 7 days`
    },
    {
      id: 'streak_30',
      icon: '⚡',
      name: '30 Day Streak',
      desc: 'Demonstrate unstoppable developer momentum for 30 straight days.',
      req: '30 consecutive active days',
      check: (stats) => stats.longestStreak >= 30,
      progress: (stats) => Math.min(100, (stats.longestStreak / 30) * 100),
      current: (stats) => `${Math.min(stats.longestStreak, 30)} / 30 days`
    },
    {
      id: 'century_contrib',
      icon: '💯',
      name: '100 Contributions',
      desc: 'Cross the milestone of 100 total contributions in a single year.',
      req: '100 contributions',
      check: (stats) => stats.totalContributions >= 100,
      progress: (stats) => Math.min(100, (stats.totalContributions / 100) * 100),
      current: (stats) => `${Math.min(stats.totalContributions, 100)} / 100 contributions`
    },
    {
      id: 'major_milestone',
      icon: '🚀',
      name: '500 Contributions',
      desc: 'Reach 500 total contributions across commits, PRs, and reviews.',
      req: '500 contributions',
      check: (stats) => stats.totalContributions >= 500,
      progress: (stats) => Math.min(100, (stats.totalContributions / 500) * 100),
      current: (stats) => `${Math.min(stats.totalContributions, 500)} / 500 contributions`
    },
    {
      id: 'code_machine',
      icon: '👑',
      name: '1000 Contributions',
      desc: 'Join the four-digit contribution elite: 1,000 recorded contributions.',
      req: '1,000 contributions',
      check: (stats) => stats.totalContributions >= 1000,
      progress: (stats) => Math.min(100, (stats.totalContributions / 1000) * 100),
      current: (stats) => `${Math.min(stats.totalContributions, 1000)} / 1000 contributions`
    },
    {
      id: 'active_100',
      icon: '📅',
      name: '100 Active Days',
      desc: 'Show sustained dedication by logging contributions on 100 different days.',
      req: '100 active days in year',
      check: (stats) => stats.activeDays >= 100,
      progress: (stats) => Math.min(100, (stats.activeDays / 100) * 100),
      current: (stats) => `${Math.min(stats.activeDays, 100)} / 100 active days`
    },
    {
      id: 'consistency_master',
      icon: '🎯',
      name: 'Consistency Master',
      desc: 'Score 75 or higher on the transparent consistency algorithm.',
      req: 'Consistency Score ≥ 75',
      check: (stats) => stats.consistencyScore >= 75,
      progress: (stats) => Math.min(100, (stats.consistencyScore / 75) * 100),
      current: (stats) => `${Math.min(stats.consistencyScore, 75)} / 75 score`
    },
    {
      id: 'weekend_warrior',
      icon: '⚔️',
      name: 'Weekend Warrior',
      desc: 'Ship code on the weekends: log 25+ contributions on Saturdays or Sundays.',
      req: '25+ weekend contributions',
      check: (stats) => stats.weekendContributions >= 25,
      progress: (stats) => Math.min(100, (stats.weekendContributions / 25) * 100),
      current: (stats) => `${Math.min(stats.weekendContributions, 25)} / 25 weekend contributions`
    },
    {
      id: 'activity_explorer',
      icon: '🧭',
      name: 'Activity Explorer',
      desc: 'Contribute across all 4 types: Commits, Pull Requests, Issues, and Reviews.',
      req: 'Activity logged in all 4 categories',
      check: (stats) => stats.totalCommits > 0 && stats.totalPRs > 0 && stats.totalIssues > 0 && stats.totalReviews > 0,
      progress: (stats) => {
        let count = 0;
        if (stats.totalCommits > 0) count++;
        if (stats.totalPRs > 0) count++;
        if (stats.totalIssues > 0) count++;
        if (stats.totalReviews > 0) count++;
        return (count / 4) * 100;
      },
      current: (stats) => {
        let count = 0;
        if (stats.totalCommits > 0) count++;
        if (stats.totalPRs > 0) count++;
        if (stats.totalIssues > 0) count++;
        if (stats.totalReviews > 0) count++;
        return `${count} / 4 activity types unlocked`;
      }
    }
  ];

  // ==========================================================================
  // 2. CENTRALIZED DOM REFERENCE SYSTEM (Section 1 & 29)
  // Fixes the root cause of "null is not an object" by validating references
  // ==========================================================================

  let DOM = {};

  function initDOMReferences() {
    DOM = {
      // Header & Navigation
      btnMobileMenu: document.getElementById('btn-mobile-menu'),
      mainNavList: document.getElementById('main-nav-list'),
      themeBtn: document.getElementById('theme-btn'),
      themeIcon: document.getElementById('theme-icon'),
      themeLabel: document.getElementById('theme-label'),
      themeMenu: document.getElementById('theme-menu'),
      settingsThemeSelect: document.getElementById('settings-theme-select'),
      btnHeaderAdd: document.getElementById('btn-header-add'),
      btnHeaderGenerate: document.getElementById('btn-header-generate'),
      btnHeaderReset: document.getElementById('btn-header-reset'),

      // GitHub Auth & Mode Badges
      btnConnectGithub: document.getElementById('btn-connect-github'),
      userConnectedBadge: document.getElementById('user-connected-badge'),
      headerUserAvatar: document.getElementById('header-user-avatar'),
      headerUserName: document.getElementById('header-user-name'),
      btnRefreshGithub: document.getElementById('btn-refresh-github'),
      btnDisconnectGithub: document.getElementById('btn-disconnect-github'),
      dashboardModeBadge: document.getElementById('dashboard-mode-badge'),
      modeTitleText: document.getElementById('mode-title-text'),
      modeDescText: document.getElementById('mode-desc-text'),
      apiHealthBadge: document.getElementById('api-health-badge'),
      apiHealthLabel: document.getElementById('api-health-label'),

      // Profile Card Elements
      profUserName: document.getElementById('prof-user-name'),
      profUserRole: document.getElementById('prof-user-role'),
      profUserBio: document.getElementById('prof-user-bio'),
      profAvatarImg: document.getElementById('prof-avatar-img'),
      profAvatarFallback: document.getElementById('prof-avatar-fallback'),
      profAvatarInitials: document.getElementById('prof-avatar-initials'),
      profStatusPill: document.getElementById('prof-status-pill'),
      profBadgeDot: document.getElementById('prof-badge-dot'),
      profStatusLabel: document.getElementById('prof-status-label'),
      profGithubMeta: document.getElementById('prof-github-meta'),
      profGhRepos: document.getElementById('prof-gh-repos'),
      profGhFollowers: document.getElementById('prof-gh-followers'),
      profGhFollowing: document.getElementById('prof-gh-following'),
      profGithubLink: document.getElementById('prof-github-link'),
      profTotalContrib: document.getElementById('prof-total-contributions'),
      profYearLabel: document.getElementById('prof-year-label'),
      profCurrentStreak: document.getElementById('prof-current-streak'),
      profLongestStreak: document.getElementById('prof-longest-streak'),
      profActiveDays: document.getElementById('prof-active-days'),
      profActivePct: document.getElementById('prof-active-pct'),

      // 8 Metric Cards Elements
      statAvgContrib: document.getElementById('stat-avg-contributions'),
      statCurrentStreak: document.getElementById('stat-current-streak'),
      statStreakMsg: document.getElementById('stat-streak-msg'),
      statLongestStreak: document.getElementById('stat-longest-streak'),
      statBestMonth: document.getElementById('stat-best-month'),
      statBestMonthVol: document.getElementById('stat-best-month-vol'),
      statBestDay: document.getElementById('stat-best-day'),
      statBestDayDate: document.getElementById('stat-best-day-date'),
      statBestWeekday: document.getElementById('stat-best-weekday'),
      statBestWeekdayVol: document.getElementById('stat-best-weekday-vol'),
      statConsistencyScore: document.getElementById('stat-consistency-score'),
      statConsistencyDesc: document.getElementById('stat-consistency-desc'),
      statActiveRepos: document.getElementById('stat-active-repos'),
      statReposSub: document.getElementById('stat-repos-sub'),

      // Heatmap Controls & Calendar
      yearSelect: document.getElementById('year-select'),
      typeFilterSelect: document.getElementById('type-filter-select'),
      btnAddActivityModal: document.getElementById('btn-add-activity-modal'),
      btnOpenGenModal: document.getElementById('btn-open-gen-modal'),
      heatmapCalendar: document.getElementById('heatmap-calendar'),
      heatmapSubtext: document.getElementById('heatmap-subtext'),
      heatmapModeTag: document.getElementById('heatmap-mode-tag'),
      filterPills: document.querySelectorAll('.filter-pill'),

      // Weekly Chart & Goal Tracker
      weeklyAnalyticsChart: document.getElementById('weekly-analytics-chart'),
      weeklyPeakInfo: document.getElementById('weekly-peak-info'),
      weeklyAvgInfo: document.getElementById('weekly-avg-info'),
      btnGoalDec: document.getElementById('btn-goal-dec'),
      goalTargetInput: document.getElementById('goal-target-input'),
      btnGoalInc: document.getElementById('btn-goal-inc'),
      goalTargetDisplay: document.getElementById('goal-target-display'),
      goalCurrentDisplay: document.getElementById('goal-current-display'),
      goalPercentDisplay: document.getElementById('goal-percent-display'),
      goalProgressBar: document.getElementById('goal-progress-bar'),
      goalProgressFill: document.getElementById('goal-progress-fill'),
      goalStatusBox: document.getElementById('goal-status-box'),
      goalStatusIcon: document.getElementById('goal-status-icon'),
      goalStatusText: document.getElementById('goal-status-text'),

      // Monthly Chart & Trend SVG
      monthlyAnalyticsChart: document.getElementById('monthly-analytics-chart'),
      monthlyBestInfo: document.getElementById('monthly-best-info'),
      monthlyTotalInfo: document.getElementById('monthly-total-info'),
      trendChartContainer: document.getElementById('trend-chart-container'),
      trendPeakPeriod: document.getElementById('trend-peak-period'),
      trendVelocityLabel: document.getElementById('trend-velocity-label'),

      // Repository Analytics & Recent Stream
      repoFilterIndicator: document.getElementById('repo-filter-indicator'),
      repoFilterActiveText: document.getElementById('repo-filter-active-text'),
      btnClearRepoFilter: document.getElementById('btn-clear-repo-filter'),
      repoAnalyticsList: document.getElementById('repo-analytics-list'),
      activityStreamCount: document.getElementById('activity-stream-count'),
      recentActivityFeed: document.getElementById('recent-activity-feed'),

      // Achievements
      achievementsTallyBadge: document.getElementById('achievements-tally-badge'),
      achievementsGrid: document.getElementById('achievements-grid'),

      // Settings
      settingsGoalInput: document.getElementById('settings-goal-input'),
      btnExportData: document.getElementById('btn-export-data'),
      btnImportData: document.getElementById('btn-import-data'),
      btnSettingsOpenGen: document.getElementById('btn-settings-open-gen'),
      btnSettingsReset: document.getElementById('btn-settings-reset'),
      hiddenExportLink: document.getElementById('hidden-export-link'),

      // Global Components
      toastContainer: document.getElementById('toast-container'),
      appTooltip: document.getElementById('app-tooltip')
    };
  }

  // Safe DOM helper utilities (prevent any null-reference crashes)
  function setText(el, text) {
    if (el) el.textContent = text !== undefined && text !== null ? text : '';
  }
  function setHTML(el, html) {
    if (el) el.innerHTML = html !== undefined && html !== null ? html : '';
  }
  function setVal(el, val) {
    if (el) el.value = val !== undefined && val !== null ? val : '';
  }

  // ==========================================================================
  // 3. DATA LAYER ARCHITECTURE & PROVIDER ABSTRACTION (Section 9)
  // ==========================================================================

  /**
   * DataProvider Base Class
   */
  class DataProvider {
    async getYearData(year) { throw new Error('getYearData not implemented'); }
    async addActivity(year, entry) { throw new Error('addActivity not implemented'); }
    async updateActivity(year, entry) { throw new Error('updateActivity not implemented'); }
    async deleteActivity(year, dateStr) { throw new Error('deleteActivity not implemented'); }
    async generateDemo(year, intensity) { throw new Error('generateDemo not implemented'); }
    async resetAll() { throw new Error('resetAll not implemented'); }
    async getRepositories() { return []; }
    async getRecentActivity() { return []; }
  }

  /**
   * DemoDataProvider Implementation (Local-First Simulation)
   */
  class DemoDataProvider extends DataProvider {
    constructor() {
      super();
      this.state = this.loadAppState();
    }

    loadAppState() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object' && parsed.years && parsed.years['2026']) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('Could not read demo state from localStorage:', err);
      }
      return this.createInitialDemoState();
    }

    saveAppState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.error('Failed to save state to localStorage:', err);
        showToast('Storage quota exceeded or private mode enabled.', 'error');
      }
    }

    createInitialDemoState() {
      const state = {
        version: 2,
        createdAt: new Date().toISOString(),
        weeklyGoal: 35,
        years: {}
      };

      SUPPORTED_DEMO_YEARS.forEach((yr) => {
        state.years[yr] = generateDemoYearData(parseInt(yr, 10), 'normal');
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}
      return state;
    }

    async getYearData(year) {
      const yrStr = String(year);
      if (!this.state.years[yrStr]) {
        this.state.years[yrStr] = generateDemoYearData(parseInt(yrStr, 10), 'normal');
        this.saveAppState();
      }
      return this.state.years[yrStr];
    }

    async addActivity(year, newEntry) {
      const yrStr = String(year);
      if (!this.state.years[yrStr]) {
        this.state.years[yrStr] = {};
      }

      const dateStr = newEntry.date;
      const existing = this.state.years[yrStr][dateStr] || {
        date: dateStr,
        commits: 0,
        pullRequests: 0,
        issues: 0,
        codeReviews: 0,
        total: 0,
        repositories: [],
        primaryRepo: newEntry.repo,
        note: ''
      };

      if (newEntry.type === 'commits') existing.commits += newEntry.count;
      else if (newEntry.type === 'prs') existing.pullRequests += newEntry.count;
      else if (newEntry.type === 'issues') existing.issues += newEntry.count;
      else if (newEntry.type === 'reviews') existing.codeReviews += newEntry.count;

      existing.total = existing.commits + existing.pullRequests + existing.issues + existing.codeReviews;

      if (!existing.repositories.includes(newEntry.repo)) {
        existing.repositories.push(newEntry.repo);
      }
      existing.primaryRepo = newEntry.repo;
      if (newEntry.note) {
        existing.note = newEntry.note;
      }

      this.state.years[yrStr][dateStr] = existing;
      this.saveAppState();
      return existing;
    }

    async updateActivity(year, updatedData) {
      const yrStr = String(year);
      if (!this.state.years[yrStr]) return null;

      const dateStr = updatedData.date;
      const commits = Math.max(0, parseInt(updatedData.commits, 10) || 0);
      const prs = Math.max(0, parseInt(updatedData.pullRequests, 10) || 0);
      const issues = Math.max(0, parseInt(updatedData.issues, 10) || 0);
      const reviews = Math.max(0, parseInt(updatedData.codeReviews, 10) || 0);
      const total = commits + prs + issues + reviews;

      if (total === 0) {
        delete this.state.years[yrStr][dateStr];
      } else {
        const repo = updatedData.primaryRepo || DEMO_REPOSITORIES[0];
        this.state.years[yrStr][dateStr] = {
          date: dateStr,
          commits,
          pullRequests: prs,
          issues,
          codeReviews: reviews,
          total,
          repositories: [repo],
          primaryRepo: repo,
          note: updatedData.note || ''
        };
      }

      this.saveAppState();
      return this.state.years[yrStr][dateStr] || null;
    }

    async deleteActivity(year, dateStr) {
      const yrStr = String(year);
      if (this.state.years[yrStr] && this.state.years[yrStr][dateStr]) {
        delete this.state.years[yrStr][dateStr];
        this.saveAppState();
        return true;
      }
      return false;
    }

    async generateDemo(year, intensity = 'normal') {
      const yrStr = String(year);
      this.state.years[yrStr] = generateDemoYearData(parseInt(yrStr, 10), intensity);
      this.saveAppState();
      return this.state.years[yrStr];
    }

    async resetAll() {
      this.state = this.createInitialDemoState();
      try {
        localStorage.removeItem(GOAL_KEY);
      } catch (e) {}
      return this.state;
    }

    getWeeklyGoal() {
      try {
        const stored = localStorage.getItem(GOAL_KEY);
        if (stored) return parseInt(stored, 10) || 35;
      } catch (e) {}
      return this.state.weeklyGoal || 35;
    }

    setWeeklyGoal(goal) {
      const val = Math.max(5, Math.min(200, parseInt(goal, 10) || 35));
      this.state.weeklyGoal = val;
      try {
        localStorage.setItem(GOAL_KEY, String(val));
      } catch (e) {}
      this.saveAppState();
      return val;
    }
  }

  /**
   * GitHubDataProvider Implementation (Live GitHub API Integration)
   */
  class GitHubDataProvider extends DataProvider {
    constructor() {
      super();
      this.cache = {};
      this.userProfile = null;
      this.lastSyncTime = null;
    }

    async checkAuth() {
      try {
        const res = await fetch('/api/auth/github/me', { headers: { 'Accept': 'application/json' } });
        if (!res.ok) return { authenticated: false };
        const data = await res.json();
        if (data.authenticated && data.user) {
          this.userProfile = data.user;
          return { authenticated: true, user: data.user };
        }
        return { authenticated: false };
      } catch (err) {
        console.warn('GitHub auth check offline or serverless not available:', err);
        return { authenticated: false };
      }
    }

    async getYearData(year) {
      const yrStr = String(year);
      if (this.cache[yrStr]) {
        return this.cache[yrStr];
      }

      try {
        const res = await fetch(`/api/github/contributions?year=${yrStr}`);
        if (!res.ok) {
          throw new Error(`GitHub API returned status ${res.status}`);
        }
        const data = await res.json();
        if (data.success && data.days) {
          this.cache[yrStr] = data.days;
          this.lastSyncTime = new Date();
          return data.days;
        }
        throw new Error(data.message || 'Failed to parse GitHub contribution data');
      } catch (err) {
        console.error('Error fetching live GitHub contributions:', err);
        showToast('Unable to fetch live GitHub contributions. Falling back to local data.', 'warning');
        return {};
      }
    }

    async getRepositories() {
      try {
        const res = await fetch('/api/github/repositories');
        if (!res.ok) return [];
        const data = await res.json();
        return data.success && Array.isArray(data.repositories) ? data.repositories : [];
      } catch (err) {
        console.warn('Error fetching live repositories:', err);
        return [];
      }
    }

    async getRecentActivity() {
      try {
        const res = await fetch('/api/github/activity');
        if (!res.ok) return [];
        const data = await res.json();
        return data.success && Array.isArray(data.activities) ? data.activities : [];
      } catch (err) {
        console.warn('Error fetching live GitHub activity:', err);
        return [];
      }
    }

    async addActivity() {
      showToast('You are in Live GitHub Mode. Your activity is synced with your live GitHub account.', 'info');
      return null;
    }

    async updateActivity() {
      showToast('You are in Live GitHub Mode. Modify contributions directly in your GitHub repositories.', 'info');
      return null;
    }

    async deleteActivity() {
      showToast('You are in Live GitHub Mode. Contributions are managed on GitHub.', 'info');
      return false;
    }

    async generateDemo() {
      showToast('Demo generator is disabled in Live GitHub Mode. Disconnect to customize demo data.', 'info');
      return {};
    }

    async resetAll() {
      this.cache = {};
      showToast('Cleared cached GitHub data.', 'info');
      return {};
    }

    clearCache() {
      this.cache = {};
    }
  }

  // ==========================================================================
  // 4. DEMO DATA GENERATOR WITH REALISTIC PATTERNS (Section 4)
  // ==========================================================================

  function pseudoRandom(seed) {
    let s = Math.sin(seed) * 10000;
    return s - Math.floor(s);
  }

  function generateDemoYearData(year, intensity = 'normal') {
    const data = {};
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeap ? 366 : 365;

    let activeProbWeekday = 0.70;
    let activeProbWeekend = 0.30;
    let minContrib = 1;
    let maxContrib = 8;

    if (intensity === 'low') {
      activeProbWeekday = 0.40;
      activeProbWeekend = 0.15;
      maxContrib = 4;
    } else if (intensity === 'high') {
      activeProbWeekday = 0.88;
      activeProbWeekend = 0.55;
      minContrib = 2;
      maxContrib = 14;
    }

    const todaySim = new Date('2026-10-07T00:00:00');
    let vacationDaysLeft = 0;

    for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
      const currentDate = new Date(year, 0, 1 + dayIdx);
      const dateStr = formatDateToISO(currentDate);

      if (year === 2026 && currentDate > todaySim) {
        continue;
      }

      const dayOfWeek = currentDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      const seed = (year * 1000) + dayIdx * 7.13 + (dayOfWeek * 0.31);
      const r1 = pseudoRandom(seed);
      const r2 = pseudoRandom(seed + 1.6);
      const r3 = pseudoRandom(seed + 3.2);

      if (vacationDaysLeft > 0) {
        vacationDaysLeft--;
        continue;
      } else if (r1 < 0.025 && dayIdx > 30 && dayIdx < totalDays - 40) {
        vacationDaysLeft = Math.floor(r2 * 4) + 2;
        continue;
      }

      const prob = isWeekend ? activeProbWeekend : activeProbWeekday;
      if (r1 < prob) {
        let count;
        if (r2 > 0.90) {
          count = Math.floor(r3 * (maxContrib + 4)) + 6;
        } else if (r2 < 0.35) {
          count = Math.floor(r3 * 2) + 1;
        } else {
          count = Math.floor(r3 * (maxContrib - minContrib + 1)) + minContrib;
        }

        let commits = Math.max(1, Math.round(count * 0.70));
        let remaining = count - commits;
        let prs = 0;
        let issues = 0;
        let reviews = 0;

        if (remaining > 0) {
          if (r2 > 0.6) {
            prs = Math.min(remaining, Math.floor(pseudoRandom(seed + 4) * 2) + 1);
            remaining -= prs;
          }
        }
        if (remaining > 0) {
          if (r3 > 0.5) {
            reviews = Math.min(remaining, Math.floor(pseudoRandom(seed + 5) * 2) + 1);
            remaining -= reviews;
          }
        }
        if (remaining > 0) {
          issues = remaining;
        }

        const total = commits + prs + issues + reviews;
        const repoIdx = Math.floor(r2 * DEMO_REPOSITORIES.length);
        const primaryRepo = DEMO_REPOSITORIES[repoIdx];

        const repos = [primaryRepo];
        if (total > 6 && r3 > 0.4) {
          const secondRepo = DEMO_REPOSITORIES[(repoIdx + 1) % DEMO_REPOSITORIES.length];
          repos.push(secondRepo);
        }

        const sampleNotes = [
          `feat: implement core workflow in ${primaryRepo}`,
          `fix: resolve edge-case serialization bug`,
          `refactor: optimize rendering pipeline and performance`,
          `docs: update API specification and architecture guide`,
          `test: add manual and integration test suites`,
          `perf: reduce memory allocation in background task`
        ];
        const note = sampleNotes[Math.floor(r1 * sampleNotes.length)];

        data[dateStr] = {
          date: dateStr,
          commits,
          pullRequests: prs,
          issues,
          codeReviews: reviews,
          total,
          repositories: repos,
          primaryRepo,
          note
        };
      }
    }

    return data;
  }

  // ==========================================================================
  // 5. CALCULATION ENGINES: STATISTICS, STREAKS & CONSISTENCY (Sections 13, 14, 15)
  // ==========================================================================

  function calculateStatistics(yearData, year, filterType = 'all', repoFilter = null) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDaysInYear = isLeap ? 366 : 365;

    let totalContributions = 0;
    let totalCommits = 0;
    let totalPRs = 0;
    let totalIssues = 0;
    let totalReviews = 0;
    let activeDays = 0;
    let weekendContributions = 0;

    let bestDay = { count: 0, date: null };
    const monthVolumes = new Array(12).fill(0);
    const weekdayVolumes = new Array(7).fill(0);
    const repoSet = new Set();

    Object.keys(yearData || {}).forEach((dateStr) => {
      const entry = yearData[dateStr];
      if (!entry) return;

      if (repoFilter && !entry.repositories.includes(repoFilter)) {
        return;
      }

      let count = 0;
      if (filterType === 'all') count = entry.total || 0;
      else if (filterType === 'commits') count = entry.commits || 0;
      else if (filterType === 'prs') count = entry.pullRequests || 0;
      else if (filterType === 'issues') count = entry.issues || 0;
      else if (filterType === 'reviews') count = entry.codeReviews || 0;

      if (count > 0) {
        totalContributions += count;
        totalCommits += (entry.commits || 0);
        totalPRs += (entry.pullRequests || 0);
        totalIssues += (entry.issues || 0);
        totalReviews += (entry.codeReviews || 0);
        activeDays++;

        (entry.repositories || []).forEach((r) => repoSet.add(r));

        const d = parseISODate(dateStr);
        const month = d.getMonth();
        const weekday = d.getDay();

        monthVolumes[month] += count;
        weekdayVolumes[weekday] += count;

        if (weekday === 0 || weekday === 6) {
          weekendContributions += count;
        }

        if (count > bestDay.count) {
          bestDay = { count, date: dateStr };
        }
      }
    });

    const avgPerActiveDay = activeDays > 0 ? (totalContributions / activeDays).toFixed(1) : '0.0';

    let effectiveElapsedDays = totalDaysInYear;
    if (year === 2026) {
      const start = new Date(2026, 0, 1);
      const end = new Date(2026, 9, 7);
      effectiveElapsedDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
    const activePct = effectiveElapsedDays > 0 ? ((activeDays / effectiveElapsedDays) * 100).toFixed(1) : '0.0';

    const streakResult = calculateStreaks(yearData, year, filterType, repoFilter);

    let bestMonthIdx = 0;
    let bestMonthVal = 0;
    monthVolumes.forEach((val, idx) => {
      if (val > bestMonthVal) {
        bestMonthVal = val;
        bestMonthIdx = idx;
      }
    });

    let bestWeekdayIdx = 1;
    let bestWeekdayVal = -1;
    weekdayVolumes.forEach((val, idx) => {
      if (val > bestWeekdayVal) {
        bestWeekdayVal = val;
        bestWeekdayIdx = idx;
      }
    });

    const consistency = calculateConsistencyScore({
      activeDays,
      effectiveElapsedDays,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      totalContributions,
      weekdayVolumes,
      monthVolumes
    });

    return {
      totalContributions,
      totalCommits,
      totalPRs,
      totalIssues,
      totalReviews,
      activeDays,
      activePct,
      avgPerActiveDay,
      currentStreak: streakResult.currentStreak,
      longestStreak: streakResult.longestStreak,
      bestMonth: bestMonthVal > 0 ? MONTH_NAMES_FULL[bestMonthIdx] : '--',
      bestMonthVolume: bestMonthVal,
      bestDayCount: bestDay.count,
      bestDayDate: bestDay.date ? formatFriendlyDate(bestDay.date) : 'None recorded',
      bestWeekday: bestWeekdayVal > 0 ? WEEKDAY_NAMES_FULL[bestWeekdayIdx] : '--',
      bestWeekdayVolume: bestWeekdayVal,
      consistencyScore: consistency.score,
      consistencyDesc: consistency.description,
      weekendContributions,
      activeReposCount: repoSet.size || (appState.mode === 'live' ? 0 : DEMO_REPOSITORIES.length),
      monthVolumes,
      weekdayVolumes
    };
  }

  function calculateStreaks(yearData, year, filterType = 'all', repoFilter = null) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeap ? 366 : 365;

    function isDayActive(dateStr) {
      const entry = (yearData || {})[dateStr];
      if (!entry) return false;
      if (repoFilter && !entry.repositories.includes(repoFilter)) return false;
      if (filterType === 'all') return entry.total > 0;
      if (filterType === 'commits') return entry.commits > 0;
      if (filterType === 'prs') return entry.pullRequests > 0;
      if (filterType === 'issues') return entry.issues > 0;
      if (filterType === 'reviews') return entry.codeReviews > 0;
      return false;
    }

    let longestStreak = 0;
    let runningStreak = 0;

    const refDate = year === 2026 ? new Date('2026-10-07T00:00:00') : new Date(year, 11, 31);

    for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
      const curDate = new Date(year, 0, 1 + dayIdx);
      if (curDate > refDate) break;

      const dateStr = formatDateToISO(curDate);
      if (isDayActive(dateStr)) {
        runningStreak++;
        if (runningStreak > longestStreak) {
          longestStreak = runningStreak;
        }
      } else {
        runningStreak = 0;
      }
    }

    let currentStreak = 0;
    let checkDate = new Date(refDate);

    const todayStr = formatDateToISO(checkDate);
    const isTodayActive = isDayActive(todayStr);

    if (isTodayActive) {
      currentStreak++;
      while (true) {
        checkDate.setDate(checkDate.getDate() - 1);
        if (checkDate.getFullYear() !== year) break;
        const prevStr = formatDateToISO(checkDate);
        if (isDayActive(prevStr)) {
          currentStreak++;
        } else {
          break;
        }
      }
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      if (checkDate.getFullYear() === year) {
        const yestStr = formatDateToISO(checkDate);
        if (isDayActive(yestStr)) {
          currentStreak = 1;
          while (true) {
            checkDate.setDate(checkDate.getDate() - 1);
            if (checkDate.getFullYear() !== year) break;
            const prevStr = formatDateToISO(checkDate);
            if (isDayActive(prevStr)) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }
    }

    return {
      currentStreak,
      longestStreak
    };
  }

  function calculateConsistencyScore({
    activeDays,
    effectiveElapsedDays,
    currentStreak,
    longestStreak,
    totalContributions,
    weekdayVolumes,
    monthVolumes
  }) {
    if (activeDays === 0 || effectiveElapsedDays === 0) {
      return {
        score: 0,
        description: 'No recorded activity yet in this period.'
      };
    }

    const activeRatio = Math.min(1, activeDays / effectiveElapsedDays);
    const p1 = activeRatio * 40;

    const streakRatio = Math.min(1, longestStreak / 21);
    const p2 = streakRatio * 25;

    let activeWeekdays = 0;
    for (let w = 1; w <= 5; w++) {
      if (weekdayVolumes[w] > 0) activeWeekdays++;
    }
    const p3 = (activeWeekdays / 5) * 20;

    const activeMonths = monthVolumes.filter((v) => v > 0).length;
    const p4 = (activeMonths / 12) * 15;

    const rawScore = Math.round(p1 + p2 + p3 + p4);
    const score = Math.max(0, Math.min(100, rawScore));

    let description = '';
    if (score >= 88) {
      description = 'Exceptional consistency — daily cadence spread across all weeks.';
    } else if (score >= 75) {
      description = 'High consistency — steady habit with active momentum.';
    } else if (score >= 60) {
      description = 'Solid consistency — regular coding bursts with minor gaps.';
    } else if (score >= 40) {
      description = 'Moderate consistency — intermittent activity with occasional pauses.';
    } else {
      description = 'Developing consistency — sporadic contributions across the calendar.';
    }

    return { score, description };
  }

  // ==========================================================================
  // 6. APPLICATION STATE
  // ==========================================================================

  const demoProvider = new DemoDataProvider();
  const githubProvider = new GitHubDataProvider();

  const appState = {
    mode: 'demo', // 'demo' or 'live'
    currentProvider: demoProvider,
    authenticatedUser: null,
    selectedYear: 2026,
    activeFilter: 'all',
    activeRepoFilter: null,
    currentTheme: 'dark',
    weeklyGoal: demoProvider.getWeeklyGoal(),
    selectedDate: null,
    activeModal: null,
    cachedLiveRepos: [],
    cachedLiveActivities: []
  };

  // ==========================================================================
  // 7. RENDERERS: HEATMAP, CHARTS, METRICS & FEEDS
  // ==========================================================================

  async function renderAll() {
    const yearData = await appState.currentProvider.getYearData(appState.selectedYear);
    const stats = calculateStatistics(yearData, appState.selectedYear, appState.activeFilter, appState.activeRepoFilter);

    renderModeAndAuthUI();
    renderProfileCard(stats);
    renderMetricCards(stats);
    renderContributionHeatmap(yearData, stats);
    renderWeeklyAnalytics(stats);
    renderWeeklyGoal(yearData);
    renderMonthlyAnalytics(stats);
    renderContributionTrend(yearData);
    await renderRepositoryAnalytics(yearData);
    await renderRecentActivity(yearData);
    renderAchievements(stats);
    renderRepoFilterBadge();
  }

  function renderModeAndAuthUI() {
    if (appState.mode === 'live' && appState.authenticatedUser) {
      // Live Mode
      if (DOM.dashboardModeBadge) {
        DOM.dashboardModeBadge.className = 'mode-badge live-mode';
      }
      setText(DOM.modeTitleText, 'Live GitHub Data');
      setText(DOM.modeDescText, `Connected as @${appState.authenticatedUser.login}`);
      setText(DOM.heatmapModeTag, 'LIVE GITHUB');
      setText(DOM.statReposSub, 'Connected repositories');

      if (DOM.btnConnectGithub) DOM.btnConnectGithub.style.display = 'none';
      if (DOM.userConnectedBadge) DOM.userConnectedBadge.style.display = 'inline-flex';
      if (DOM.headerUserAvatar) DOM.headerUserAvatar.src = appState.authenticatedUser.avatar_url || '';
      setText(DOM.headerUserName, `@${appState.authenticatedUser.login}`);
    } else {
      // Demo Mode
      if (DOM.dashboardModeBadge) {
        DOM.dashboardModeBadge.className = 'mode-badge demo-mode';
      }
      setText(DOM.modeTitleText, 'Demo Data');
      setText(DOM.modeDescText, 'Local-first browser simulation. Not connected to external GitHub accounts.');
      setText(DOM.heatmapModeTag, 'DEMO DATA');
      setText(DOM.statReposSub, 'Demo projects');

      if (DOM.btnConnectGithub) DOM.btnConnectGithub.style.display = 'inline-flex';
      if (DOM.userConnectedBadge) DOM.userConnectedBadge.style.display = 'none';
    }
  }

  function renderProfileCard(stats) {
    if (appState.mode === 'live' && appState.authenticatedUser) {
      const u = appState.authenticatedUser;
      setText(DOM.profUserName, u.name || u.login);
      setText(DOM.profUserRole, `@${u.login} • GitHub Contributor`);
      setText(DOM.profUserBio, u.bio || 'Active developer visualizing contributions on GitHub Green Squares.');

      if (DOM.profAvatarImg) {
        DOM.profAvatarImg.src = u.avatar_url;
        DOM.profAvatarImg.style.display = 'block';
      }
      if (DOM.profAvatarFallback) DOM.profAvatarFallback.style.display = 'none';

      setText(DOM.profStatusLabel, 'Live Connected');
      if (DOM.profStatusPill) DOM.profStatusPill.className = 'profile-status-badge status-live';

      if (DOM.profGithubMeta) DOM.profGithubMeta.style.display = 'flex';
      setText(DOM.profGhRepos, `${u.public_repos} Public Repos`);
      setText(DOM.profGhFollowers, `${u.followers} Followers`);
      setText(DOM.profGhFollowing, `${u.following} Following`);
      if (DOM.profGithubLink) {
        DOM.profGithubLink.href = u.html_url || `https://github.com/${u.login}`;
        DOM.profGithubLink.style.display = 'inline-flex';
      }
    } else {
      setText(DOM.profUserName, 'Soman Singhal');
      setText(DOM.profUserRole, 'Developer Analytics Dashboard • Full-Stack Contributor');
      setText(DOM.profUserBio, 'Visualizing commits, pull requests, issues, and code reviews across demo repositories.');

      if (DOM.profAvatarImg) DOM.profAvatarImg.style.display = 'none';
      if (DOM.profAvatarFallback) DOM.profAvatarFallback.style.display = 'flex';
      setText(DOM.profAvatarInitials, 'SS');

      setText(DOM.profStatusLabel, 'Demo Dataset');
      if (DOM.profStatusPill) DOM.profStatusPill.className = 'profile-status-badge';

      if (DOM.profGithubMeta) DOM.profGithubMeta.style.display = 'none';
      if (DOM.profGithubLink) DOM.profGithubLink.style.display = 'none';
    }

    setText(DOM.profTotalContrib, stats.totalContributions.toLocaleString());
    setText(DOM.profYearLabel, `${appState.selectedYear} Activity (${appState.activeFilter.toUpperCase()})`);
    setText(DOM.profCurrentStreak, `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`);
    setText(DOM.profLongestStreak, `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`);
    setText(DOM.profActiveDays, stats.activeDays.toLocaleString());
    setText(DOM.profActivePct, `${stats.activePct}% of year`);
  }

  function renderMetricCards(stats) {
    setText(DOM.statAvgContrib, stats.avgPerActiveDay);
    setText(DOM.statCurrentStreak, `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`);
    if (DOM.statStreakMsg) {
      if (stats.currentStreak >= 14) DOM.statStreakMsg.textContent = 'Unstoppable momentum 🔥';
      else if (stats.currentStreak >= 7) DOM.statStreakMsg.textContent = 'Weekly streak active 🔥';
      else if (stats.currentStreak >= 3) DOM.statStreakMsg.textContent = 'Building consistency ✨';
      else if (stats.currentStreak > 0) DOM.statStreakMsg.textContent = 'Streak started 🌱';
      else DOM.statStreakMsg.textContent = 'Ready for your next commit';
    }
    setText(DOM.statLongestStreak, `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`);
    setText(DOM.statBestMonth, stats.bestMonth);
    setText(DOM.statBestMonthVol, `${stats.bestMonthVolume.toLocaleString()} contributions`);
    setText(DOM.statBestDay, `${stats.bestDayCount} contributions`);
    setText(DOM.statBestDayDate, stats.bestDayDate);
    setText(DOM.statBestWeekday, stats.bestWeekday);
    setText(DOM.statBestWeekdayVol, `${stats.bestWeekdayVolume.toLocaleString()} contributions`);
    setText(DOM.statConsistencyScore, `${stats.consistencyScore} / 100`);
    setText(DOM.statConsistencyDesc, stats.consistencyDesc);
    setText(DOM.statActiveRepos, stats.activeReposCount);
  }

  function renderContributionHeatmap(yearData, stats) {
    if (!DOM.heatmapCalendar) return;
    DOM.heatmapCalendar.innerHTML = '';

    const year = appState.selectedYear;
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeap ? 366 : 365;

    const jan1 = new Date(year, 0, 1);
    const startDayOfWeek = jan1.getDay();
    const totalWeeks = Math.ceil((totalDays + startDayOfWeek) / 7);

    // Month headers
    const monthsRow = document.createElement('div');
    monthsRow.className = 'heatmap-months-row';
    const monthSpacer = document.createElement('div');
    monthsRow.appendChild(monthSpacer);

    const monthStartWeeks = new Array(12).fill(-1);
    for (let m = 0; m < 12; m++) {
      const firstOfMonth = new Date(year, m, 1);
      const dayOfYear = Math.floor((firstOfMonth - jan1) / (1000 * 60 * 60 * 24));
      const weekCol = Math.floor((dayOfYear + startDayOfWeek) / 7);
      monthStartWeeks[m] = weekCol;
    }

    let lastRenderedCol = -1;
    for (let w = 0; w < totalWeeks; w++) {
      const mIdx = monthStartWeeks.indexOf(w);
      if (mIdx !== -1 && (w - lastRenderedCol >= 3 || lastRenderedCol === -1)) {
        const mLabel = document.createElement('div');
        mLabel.className = 'heatmap-month-label';
        mLabel.textContent = MONTH_NAMES_SHORT[mIdx];
        monthsRow.appendChild(mLabel);
        lastRenderedCol = w;
      }
    }
    DOM.heatmapCalendar.appendChild(monthsRow);

    // Heatmap body
    const heatmapBody = document.createElement('div');
    heatmapBody.className = 'heatmap-body';

    // Weekdays column (Mon, Wed, Fri)
    const daysCol = document.createElement('div');
    daysCol.className = 'heatmap-days-col';
    const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];
    dayLabels.forEach((lbl) => {
      const dl = document.createElement('div');
      dl.className = 'heatmap-day-label';
      dl.textContent = lbl;
      daysCol.appendChild(dl);
    });
    heatmapBody.appendChild(daysCol);

    const weeksContainer = document.createElement('div');
    weeksContainer.className = 'heatmap-weeks-container';

    let currentDayIdx = 0;

    for (let w = 0; w < totalWeeks; w++) {
      const weekCol = document.createElement('div');
      weekCol.className = 'heatmap-week-col';
      weekCol.setAttribute('role', 'row');

      for (let d = 0; d < 7; d++) {
        if ((w === 0 && d < startDayOfWeek) || currentDayIdx >= totalDays) {
          const emptyCell = document.createElement('div');
          emptyCell.className = 'contrib-cell empty-cell';
          emptyCell.setAttribute('aria-hidden', 'true');
          weekCol.appendChild(emptyCell);
          continue;
        }

        const currentDate = new Date(year, 0, 1 + currentDayIdx);
        const dateStr = formatDateToISO(currentDate);
        const entry = (yearData || {})[dateStr] || null;

        let count = 0;
        let commits = 0;
        let prs = 0;
        let issues = 0;
        let reviews = 0;
        let repos = [];

        if (entry) {
          commits = entry.commits || 0;
          prs = entry.pullRequests || 0;
          issues = entry.issues || 0;
          reviews = entry.codeReviews || 0;
          repos = entry.repositories || [];

          if (appState.activeRepoFilter && !repos.includes(appState.activeRepoFilter)) {
            count = 0;
          } else {
            if (appState.activeFilter === 'all') count = entry.total || 0;
            else if (appState.activeFilter === 'commits') count = commits;
            else if (appState.activeFilter === 'prs') count = prs;
            else if (appState.activeFilter === 'issues') count = issues;
            else if (appState.activeFilter === 'reviews') count = reviews;
          }
        }

        const level = getIntensityLevel(count);

        const cell = document.createElement('div');
        cell.className = `contrib-cell level-${level}`;
        cell.setAttribute('tabindex', '0');
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('data-date', dateStr);
        cell.setAttribute('data-count', String(count));
        cell.setAttribute('data-level', String(level));
        cell.setAttribute('aria-label', `${formatFriendlyDate(dateStr)}: ${count} contributions`);

        cell.addEventListener('mouseenter', (e) => {
          showHeatmapTooltip(e, {
            dateStr,
            count,
            commits,
            prs,
            issues,
            reviews,
            repos
          });
        });
        cell.addEventListener('mouseleave', hideHeatmapTooltip);

        cell.addEventListener('focus', (e) => {
          showHeatmapTooltip(e, {
            dateStr,
            count,
            commits,
            prs,
            issues,
            reviews,
            repos
          });
        });
        cell.addEventListener('blur', hideHeatmapTooltip);

        cell.addEventListener('click', () => {
          openDayDetailsModal(dateStr);
        });

        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openDayDetailsModal(dateStr);
          }
        });

        weekCol.appendChild(cell);
        currentDayIdx++;
      }

      weeksContainer.appendChild(weekCol);
    }

    heatmapBody.appendChild(weeksContainer);
    DOM.heatmapCalendar.appendChild(heatmapBody);
  }

  function getIntensityLevel(count) {
    if (!count || count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  function renderWeeklyAnalytics(stats) {
    if (!DOM.weeklyAnalyticsChart) return;
    DOM.weeklyAnalyticsChart.innerHTML = '';

    const dayIndices = [1, 2, 3, 4, 5, 6, 0];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    let maxVol = 0;
    let totalVol = 0;
    dayIndices.forEach((idx) => {
      const vol = stats.weekdayVolumes[idx] || 0;
      if (vol > maxVol) maxVol = vol;
      totalVol += vol;
    });

    const dailyAvg = (totalVol / 7).toFixed(1);
    setHTML(DOM.weeklyPeakInfo, `Peak: <strong>${stats.bestWeekday}</strong>`);
    setHTML(DOM.weeklyAvgInfo, `Daily Average: <strong>${dailyAvg} contributions</strong>`);

    dayIndices.forEach((dayIdx, i) => {
      const vol = stats.weekdayVolumes[dayIdx] || 0;
      const pct = maxVol > 0 ? Math.max(6, Math.round((vol / maxVol) * 100)) : 6;

      const colWrap = document.createElement('div');
      colWrap.className = 'weekly-col-wrap';
      colWrap.setAttribute('tabindex', '0');
      colWrap.setAttribute('aria-label', `${dayLabels[i]}: ${vol} contributions`);

      colWrap.innerHTML = `
        <span class="bar-val-badge">${vol}</span>
        <div class="bar-groove">
          <div class="bar-stem" style="height: ${pct}%;"></div>
        </div>
        <span class="bar-name-label">${dayLabels[i]}</span>
      `;

      colWrap.addEventListener('mouseenter', (e) => {
        showGenericTooltip(e, `${WEEKDAY_NAMES_FULL[dayIdx]}: ${vol} contributions (${pct}% of peak)`);
      });
      colWrap.addEventListener('mouseleave', hideHeatmapTooltip);
      colWrap.addEventListener('focus', (e) => {
        showGenericTooltip(e, `${WEEKDAY_NAMES_FULL[dayIdx]}: ${vol} contributions (${pct}% of peak)`);
      });
      colWrap.addEventListener('blur', hideHeatmapTooltip);

      DOM.weeklyAnalyticsChart.appendChild(colWrap);
    });
  }

  function renderWeeklyGoal(yearData) {
    const target = appState.weeklyGoal;
    setVal(DOM.goalTargetInput, target);
    setVal(DOM.settingsGoalInput, target);
    setText(DOM.goalTargetDisplay, target);

    const refDate = appState.selectedYear === 2026 ? new Date('2026-10-07T00:00:00') : new Date(appState.selectedYear, 11, 28);
    const dayOfWeek = refDate.getDay();
    const distToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(refDate);
    monday.setDate(monday.getDate() - distToMon);

    let loggedThisWeek = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const iso = formatDateToISO(d);
      const entry = (yearData || {})[iso];
      if (entry) {
        if (appState.activeFilter === 'all') loggedThisWeek += (entry.total || 0);
        else if (appState.activeFilter === 'commits') loggedThisWeek += (entry.commits || 0);
        else if (appState.activeFilter === 'prs') loggedThisWeek += (entry.pullRequests || 0);
        else if (appState.activeFilter === 'issues') loggedThisWeek += (entry.issues || 0);
        else if (appState.activeFilter === 'reviews') loggedThisWeek += (entry.codeReviews || 0);
      }
    }

    const pct = Math.min(100, Math.round((loggedThisWeek / target) * 100));

    setText(DOM.goalCurrentDisplay, loggedThisWeek);
    setText(DOM.goalPercentDisplay, `${pct}%`);
    if (DOM.goalProgressFill) DOM.goalProgressFill.style.width = `${pct}%`;
    if (DOM.goalProgressBar) DOM.goalProgressBar.setAttribute('aria-valuenow', String(pct));

    if (DOM.goalStatusIcon && DOM.goalStatusText) {
      if (pct >= 100) {
        DOM.goalStatusIcon.textContent = '🎉';
        DOM.goalStatusText.textContent = `Weekly goal completed! (+${loggedThisWeek - target} surplus)`;
      } else {
        const remaining = target - loggedThisWeek;
        DOM.goalStatusIcon.textContent = '⏳';
        DOM.goalStatusText.textContent = `${remaining} more contributions needed to hit your weekly goal`;
      }
    }
  }

  function renderMonthlyAnalytics(stats) {
    if (!DOM.monthlyAnalyticsChart) return;
    DOM.monthlyAnalyticsChart.innerHTML = '';

    let maxVol = 0;
    stats.monthVolumes.forEach((v) => {
      if (v > maxVol) maxVol = v;
    });

    setHTML(DOM.monthlyBestInfo, `Most Active Month: <strong>${stats.bestMonth} (${stats.bestMonthVolume.toLocaleString()})</strong>`);
    setHTML(DOM.monthlyTotalInfo, `Year Total: <strong>${stats.totalContributions.toLocaleString()} contributions</strong>`);

    stats.monthVolumes.forEach((vol, mIdx) => {
      const pct = maxVol > 0 ? Math.max(5, Math.round((vol / maxVol) * 100)) : 5;

      const colWrap = document.createElement('div');
      colWrap.className = 'month-col-wrap';
      colWrap.setAttribute('tabindex', '0');
      colWrap.setAttribute('aria-label', `${MONTH_NAMES_FULL[mIdx]}: ${vol} contributions`);

      colWrap.innerHTML = `
        <span class="bar-val-badge">${vol}</span>
        <div class="bar-groove">
          <div class="bar-stem" style="height: ${pct}%;"></div>
        </div>
        <span class="bar-name-label">${MONTH_NAMES_SHORT[mIdx]}</span>
      `;

      colWrap.addEventListener('mouseenter', (e) => {
        showGenericTooltip(e, `${MONTH_NAMES_FULL[mIdx]}: ${vol} contributions (${pct}% of peak)`);
      });
      colWrap.addEventListener('mouseleave', hideHeatmapTooltip);
      colWrap.addEventListener('focus', (e) => {
        showGenericTooltip(e, `${MONTH_NAMES_FULL[mIdx]}: ${vol} contributions (${pct}% of peak)`);
      });
      colWrap.addEventListener('blur', hideHeatmapTooltip);

      DOM.monthlyAnalyticsChart.appendChild(colWrap);
    });
  }

  function renderContributionTrend(yearData) {
    if (!DOM.trendChartContainer) return;
    DOM.trendChartContainer.innerHTML = '';

    const pointsCount = 24;
    const year = appState.selectedYear;
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeap ? 366 : 365;
    const daysPerPoint = Math.floor(totalDays / pointsCount);

    const values = [];
    const labels = [];
    let peakVal = 0;
    let peakLabel = '';

    for (let p = 0; p < pointsCount; p++) {
      const startDay = p * daysPerPoint;
      const endDay = Math.min(totalDays, (p + 1) * daysPerPoint);
      let periodVol = 0;

      for (let d = startDay; d < endDay; d++) {
        const curDate = new Date(year, 0, 1 + d);
        if (year === 2026 && curDate > new Date('2026-10-07T00:00:00')) continue;
        const iso = formatDateToISO(curDate);
        const entry = (yearData || {})[iso];
        if (entry) {
          if (appState.activeFilter === 'all') periodVol += (entry.total || 0);
          else if (appState.activeFilter === 'commits') periodVol += (entry.commits || 0);
          else if (appState.activeFilter === 'prs') periodVol += (entry.pullRequests || 0);
          else if (appState.activeFilter === 'issues') periodVol += (entry.issues || 0);
          else if (appState.activeFilter === 'reviews') periodVol += (entry.codeReviews || 0);
        }
      }

      values.push(periodVol);
      const midDate = new Date(year, 0, 1 + Math.floor((startDay + endDay) / 2));
      const lbl = `${MONTH_NAMES_SHORT[midDate.getMonth()]} ${midDate.getDate()}`;
      labels.push(lbl);

      if (periodVol > peakVal) {
        peakVal = periodVol;
        peakLabel = `${MONTH_NAMES_SHORT[midDate.getMonth()]} period`;
      }
    }

    setText(DOM.trendPeakPeriod, peakLabel || 'Consistent pace');
    const sum = values.reduce((a, b) => a + b, 0);
    const weeklyVelocity = (sum / 52).toFixed(1);
    setText(DOM.trendVelocityLabel, `~${weeklyVelocity} / week avg`);

    const svgWidth = 600;
    const svgHeight = 150;
    const padTop = 16;
    const padBottom = 22;
    const padLeft = 16;
    const padRight = 16;
    const chartW = svgWidth - padLeft - padRight;
    const chartH = svgHeight - padTop - padBottom;

    const maxChartVal = Math.max(10, peakVal * 1.15);

    const coords = values.map((val, idx) => {
      const x = padLeft + (idx / (pointsCount - 1)) * chartW;
      const y = padTop + chartH - (val / maxChartVal) * chartH;
      return { x, y, val, label: labels[idx] };
    });

    let linePathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cpx1 = p0.x + (p1.x - p0.x) / 2;
      const cpy1 = p0.y;
      const cpx2 = p0.x + (p1.x - p0.x) / 2;
      const cpy2 = p1.y;
      linePathD += ` C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${p1.x} ${p1.y}`;
    }

    const areaPathD = `${linePathD} L ${coords[coords.length - 1].x} ${padTop + chartH} L ${coords[0].x} ${padTop + chartH} Z`;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
    svg.setAttribute('class', 'trend-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', `Contribution velocity curve for ${year}`);

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.setAttribute('id', 'trendGradient');
    grad.setAttribute('x1', '0');
    grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '0');
    grad.setAttribute('y2', '1');

    grad.innerHTML = `
      <stop offset="0%" stop-color="#39d353" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#39d353" stop-opacity="0.0"/>
    `;
    defs.appendChild(grad);
    svg.appendChild(defs);

    const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    areaPath.setAttribute('d', areaPathD);
    areaPath.setAttribute('fill', 'url(#trendGradient)');
    svg.appendChild(areaPath);

    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    linePath.setAttribute('d', linePathD);
    linePath.setAttribute('fill', 'none');
    linePath.setAttribute('stroke', '#39d353');
    linePath.setAttribute('stroke-width', '2.5');
    linePath.setAttribute('stroke-linecap', 'round');
    svg.appendChild(linePath);

    coords.forEach((pt) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pt.x));
      circle.setAttribute('cy', String(pt.y));
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#39d353');
      circle.setAttribute('stroke', '#0d1117');
      circle.setAttribute('stroke-width', '1.5');
      circle.setAttribute('tabindex', '0');
      circle.setAttribute('aria-label', `${pt.label}: ${pt.val} contributions`);
      circle.style.cursor = 'pointer';

      circle.addEventListener('mouseenter', (e) => {
        showGenericTooltip(e, `${pt.label}: ${pt.val} contributions`);
      });
      circle.addEventListener('mouseleave', hideHeatmapTooltip);
      circle.addEventListener('focus', (e) => {
        showGenericTooltip(e, `${pt.label}: ${pt.val} contributions`);
      });
      circle.addEventListener('blur', hideHeatmapTooltip);

      svg.appendChild(circle);
    });

    DOM.trendChartContainer.appendChild(svg);
  }

  async function renderRepositoryAnalytics(yearData) {
    if (!DOM.repoAnalyticsList) return;
    DOM.repoAnalyticsList.innerHTML = '';

    let repoList = [];

    if (appState.mode === 'live' && appState.currentProvider instanceof GitHubDataProvider) {
      if (!appState.cachedLiveRepos || appState.cachedLiveRepos.length === 0) {
        appState.cachedLiveRepos = await appState.currentProvider.getRepositories();
      }
      repoList = (appState.cachedLiveRepos || []).map((r) => ({
        name: r.name,
        contributions: r.stars || 1,
        activeDays: 1,
        lastDate: r.updated_at ? r.updated_at.split('T')[0] : null,
        url: r.html_url,
        lang: r.language
      }));
    } else {
      const repoStats = {};
      DEMO_REPOSITORIES.forEach((name) => {
        repoStats[name] = {
          name,
          contributions: 0,
          activeDays: 0,
          lastDate: null,
          url: `https://github.com/somansinghal/${name}`,
          lang: 'TypeScript'
        };
      });

      let overallTotal = 0;
      Object.keys(yearData || {}).sort().forEach((dateStr) => {
        const entry = yearData[dateStr];
        if (!entry) return;

        (entry.repositories || []).forEach((repoName) => {
          if (!repoStats[repoName]) {
            repoStats[repoName] = { name: repoName, contributions: 0, activeDays: 0, lastDate: null, url: `https://github.com/somansinghal/${repoName}`, lang: 'TypeScript' };
          }
          repoStats[repoName].contributions += (entry.total || 0);
          repoStats[repoName].activeDays += 1;
          repoStats[repoName].lastDate = dateStr;
          overallTotal += (entry.total || 0);
        });
      });

      repoList = Object.values(repoStats).sort((a, b) => b.contributions - a.contributions);
    }

    const totalVolume = repoList.reduce((acc, r) => acc + r.contributions, 0) || 1;

    repoList.forEach((repo) => {
      const pct = Math.round((repo.contributions / totalVolume) * 100);
      const isSelected = appState.activeRepoFilter === repo.name;

      const item = document.createElement('div');
      item.className = `repo-entry-card ${isSelected ? 'active' : ''}`;
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      item.setAttribute('aria-label', `Filter by ${repo.name}`);

      item.innerHTML = `
        <div class="repo-entry-left">
          <span class="repo-entry-icon">📦</span>
          <div>
            <div class="repo-entry-name">${escapeHtml(repo.name)}</div>
            <div class="repo-entry-sub">${repo.activeDays} active days • Last: ${repo.lastDate ? formatFriendlyDate(repo.lastDate) : 'None'}</div>
          </div>
        </div>
        <div class="repo-entry-right">
          <div class="repo-pct-bar-wrap">
            <div class="repo-pct-bar-fill" style="width: ${pct}%;"></div>
          </div>
          <span class="repo-pct-text">${pct}%</span>
          <span class="pill-tag">${repo.contributions.toLocaleString()}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        toggleRepoFilter(repo.name);
      });

      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleRepoFilter(repo.name);
        }
      });

      DOM.repoAnalyticsList.appendChild(item);
    });
  }

  async function renderRecentActivity(yearData) {
    if (!DOM.recentActivityFeed) return;
    DOM.recentActivityFeed.innerHTML = '';

    if (appState.mode === 'live' && appState.currentProvider instanceof GitHubDataProvider) {
      if (!appState.cachedLiveActivities || appState.cachedLiveActivities.length === 0) {
        appState.cachedLiveActivities = await appState.currentProvider.getRecentActivity();
      }

      const activities = appState.cachedLiveActivities || [];
      setText(DOM.activityStreamCount, `${activities.length} live events`);

      if (activities.length === 0) {
        DOM.recentActivityFeed.innerHTML = `
          <div class="card-panel text-center" style="padding: 24px;">
            <span style="font-size: 2rem;">📭</span>
            <h4 style="margin-top: 8px;">No Recent Public Events</h4>
            <p class="panel-subtext">No public events returned for this account.</p>
          </div>
        `;
        return;
      }

      activities.slice(0, 15).forEach((evt) => {
        const feedItem = document.createElement('div');
        feedItem.className = 'feed-item';
        feedItem.setAttribute('tabindex', '0');
        feedItem.setAttribute('role', 'article');
        feedItem.style.cursor = 'pointer';

        feedItem.innerHTML = `
          <div class="feed-marker">🟩</div>
          <div class="feed-content">
            <div class="feed-header-line">
              <span class="feed-action">${evt.icon || '💻'} ${escapeHtml(evt.typeLabel || 'Activity')}</span>
              <span class="feed-date">${formatFriendlyDate(evt.date)}</span>
            </div>
            <div class="feed-repo">${escapeHtml(evt.repository)}</div>
            ${evt.message ? `<div class="feed-msg">"${escapeHtml(evt.message)}"</div>` : ''}
          </div>
        `;

        feedItem.addEventListener('click', () => {
          if (evt.url) window.open(evt.url, '_blank', 'noopener,noreferrer');
        });

        DOM.recentActivityFeed.appendChild(feedItem);
      });
      return;
    }

    // Demo Mode Activity Feed
    const sortedDates = Object.keys(yearData || {})
      .filter((dateStr) => {
        const e = yearData[dateStr];
        if (!e || (e.total || 0) <= 0) return false;
        if (appState.activeRepoFilter && !e.repositories.includes(appState.activeRepoFilter)) return false;
        return true;
      })
      .sort((a, b) => b.localeCompare(a));

    const displayDates = sortedDates.slice(0, 15);
    setText(DOM.activityStreamCount, `${sortedDates.length} recorded events`);

    if (displayDates.length === 0) {
      DOM.recentActivityFeed.innerHTML = `
        <div class="card-panel text-center" style="padding: 24px;">
          <span style="font-size: 2rem;">📭</span>
          <h4 style="margin-top: 8px;">No Activity Found</h4>
          <p class="panel-subtext">No contributions match the selected filter or repository.</p>
        </div>
      `;
      return;
    }

    displayDates.forEach((dateStr) => {
      const entry = yearData[dateStr];
      const feedItem = document.createElement('div');
      feedItem.className = 'feed-item';
      feedItem.setAttribute('tabindex', '0');
      feedItem.setAttribute('role', 'article');
      feedItem.setAttribute('aria-label', `Activity on ${formatFriendlyDate(dateStr)}: ${entry.total} contributions`);
      feedItem.style.cursor = 'pointer';

      const typeBadges = [];
      if (entry.commits > 0) typeBadges.push(`💻 ${entry.commits} commits`);
      if (entry.pullRequests > 0) typeBadges.push(`🔀 ${entry.pullRequests} PRs`);
      if (entry.issues > 0) typeBadges.push(`⚠️ ${entry.issues} issues`);
      if (entry.codeReviews > 0) typeBadges.push(`👁️ ${entry.codeReviews} reviews`);

      feedItem.innerHTML = `
        <div class="feed-marker">🟩</div>
        <div class="feed-content">
          <div class="feed-header-line">
            <span class="feed-action">${typeBadges.join(' • ') || 'Activity'}</span>
            <span class="feed-date">${formatFriendlyDate(dateStr)}</span>
          </div>
          <div class="feed-repo">${escapeHtml(entry.primaryRepo || 'General')}</div>
          ${entry.note ? `<div class="feed-msg">"${escapeHtml(entry.note)}"</div>` : ''}
        </div>
      `;

      feedItem.addEventListener('click', () => {
        openDayDetailsModal(dateStr);
      });

      feedItem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDayDetailsModal(dateStr);
        }
      });

      DOM.recentActivityFeed.appendChild(feedItem);
    });
  }

  function renderAchievements(stats) {
    if (!DOM.achievementsGrid) return;
    DOM.achievementsGrid.innerHTML = '';

    let unlockedCount = 0;

    ACHIEVEMENTS_DEFINITIONS.forEach((achieve) => {
      const isUnlocked = achieve.check(stats);
      if (isUnlocked) unlockedCount++;

      const progressPct = achieve.progress(stats);
      const currentText = achieve.current(stats);

      const card = document.createElement('div');
      card.className = `achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`;
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `${achieve.name}: ${isUnlocked ? 'Unlocked' : 'In Progress'}`);

      card.innerHTML = `
        <div class="achieve-icon">${achieve.icon}</div>
        <div class="achieve-info">
          <div class="achieve-title">${escapeHtml(achieve.name)}</div>
          <div class="achieve-desc">${escapeHtml(achieve.desc)}</div>
          <div class="achieve-status-text">${isUnlocked ? '✓ Unlocked' : currentText}</div>
          <div class="progress-track" style="height: 6px; margin: 6px 0 0 0;">
            <div class="progress-indicator" style="width: ${progressPct}%;"></div>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openAchievementDetailModal(achieve, isUnlocked, progressPct, currentText);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAchievementDetailModal(achieve, isUnlocked, progressPct, currentText);
        }
      });

      DOM.achievementsGrid.appendChild(card);
    });

    setText(DOM.achievementsTallyBadge, `${unlockedCount} / ${ACHIEVEMENTS_DEFINITIONS.length} Unlocked`);
  }

  function renderRepoFilterBadge() {
    if (!DOM.repoFilterIndicator || !DOM.repoFilterActiveText || !DOM.btnClearRepoFilter) return;

    if (appState.activeRepoFilter) {
      DOM.repoFilterActiveText.textContent = `Filtered: ${appState.activeRepoFilter}`;
      DOM.btnClearRepoFilter.style.display = 'inline-block';
    } else {
      DOM.repoFilterActiveText.textContent = 'All Projects';
      DOM.btnClearRepoFilter.style.display = 'none';
    }
  }

  function toggleRepoFilter(repoName) {
    if (appState.activeRepoFilter === repoName) {
      appState.activeRepoFilter = null;
      showToast('Cleared repository filter', 'info');
    } else {
      appState.activeRepoFilter = repoName;
      showToast(`Filtered by ${repoName}`, 'info');
    }
    renderAll();
  }

  // ==========================================================================
  // 8. MODALS INFRASTRUCTURE & HANDLERS
  // ==========================================================================

  let lastActiveElement = null;

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    lastActiveElement = document.activeElement;
    appState.activeModal = modalId;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    appState.activeModal = null;
    document.body.classList.remove('modal-open');

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  function closeAllModals() {
    const activeModals = document.querySelectorAll('.modal-backdrop.active');
    activeModals.forEach((m) => {
      m.classList.remove('active');
      m.setAttribute('aria-hidden', 'true');
    });
    appState.activeModal = null;
    document.body.classList.remove('modal-open');
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (appState.activeModal) {
        closeModal(appState.activeModal);
      }
      if (DOM.mainNavList && DOM.mainNavList.classList.contains('mobile-open')) {
        toggleMobileMenu(false);
      }
    }
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  async function openDayDetailsModal(dateStr) {
    appState.selectedDate = dateStr;
    const year = parseInt(dateStr.substring(0, 4), 10);
    const yearData = await appState.currentProvider.getYearData(year);
    const entry = (yearData || {})[dateStr] || {
      date: dateStr,
      commits: 0,
      pullRequests: 0,
      issues: 0,
      codeReviews: 0,
      total: 0,
      repositories: [DEMO_REPOSITORIES[0]],
      primaryRepo: DEMO_REPOSITORIES[0],
      note: ''
    };

    setText(document.getElementById('day-modal-date'), formatFriendlyDate(dateStr));
    setText(document.getElementById('day-modal-total-count'), `${entry.total || 0} Contributions`);
    setText(document.getElementById('day-modal-commits'), entry.commits || 0);
    setText(document.getElementById('day-modal-prs'), entry.pullRequests || 0);
    setText(document.getElementById('day-modal-issues'), entry.issues || 0);
    setText(document.getElementById('day-modal-reviews'), entry.codeReviews || 0);

    const reposWrap = document.getElementById('day-modal-repos');
    if (reposWrap) {
      reposWrap.innerHTML = '';
      const repos = entry.repositories || [];
      if (repos.length > 0) {
        repos.forEach((r) => {
          const tag = document.createElement('span');
          tag.className = 'repo-tag';
          tag.textContent = r;
          reposWrap.appendChild(tag);
        });
      } else {
        const tag = document.createElement('span');
        tag.className = 'repo-tag';
        tag.textContent = 'None';
        reposWrap.appendChild(tag);
      }
    }

    const noteWrap = document.getElementById('day-modal-note-wrap');
    const noteVal = document.getElementById('day-modal-note');
    if (noteWrap && noteVal) {
      if (entry.note) {
        noteWrap.style.display = 'block';
        noteVal.textContent = entry.note;
      } else {
        noteWrap.style.display = 'none';
        noteVal.textContent = '';
      }
    }

    openModal('modal-day-details');
  }

  function openAddActivityModal() {
    const form = document.getElementById('form-add-activity');
    if (form) form.reset();

    const dateInput = document.getElementById('add-input-date');
    if (dateInput) {
      const defaultDate = appState.selectedYear === 2026 ? SIMULATED_TODAY_STR : `${appState.selectedYear}-06-15`;
      dateInput.value = defaultDate;
    }

    document.querySelectorAll('#form-add-activity .field-error').forEach((el) => {
      el.style.display = 'none';
    });

    openModal('modal-add-activity');
  }

  async function openEditActivityModal(dateStr) {
    closeModal('modal-day-details');
    appState.selectedDate = dateStr;

    const year = parseInt(dateStr.substring(0, 4), 10);
    const yearData = await appState.currentProvider.getYearData(year);
    const entry = (yearData || {})[dateStr] || {
      date: dateStr,
      commits: 0,
      pullRequests: 0,
      issues: 0,
      codeReviews: 0,
      total: 0,
      repositories: [DEMO_REPOSITORIES[0]],
      primaryRepo: DEMO_REPOSITORIES[0],
      note: ''
    };

    setVal(document.getElementById('edit-hidden-date'), dateStr);
    setText(document.getElementById('edit-display-date-text'), formatFriendlyDate(dateStr));
    setVal(document.getElementById('edit-input-repo'), entry.primaryRepo || DEMO_REPOSITORIES[0]);
    setVal(document.getElementById('edit-commits'), entry.commits || 0);
    setVal(document.getElementById('edit-prs'), entry.pullRequests || 0);
    setVal(document.getElementById('edit-issues'), entry.issues || 0);
    setVal(document.getElementById('edit-reviews'), entry.codeReviews || 0);
    setVal(document.getElementById('edit-input-note'), entry.note || '');

    openModal('modal-edit-activity');
  }

  function openDeleteConfirmModal(dateStr) {
    closeModal('modal-day-details');
    appState.selectedDate = dateStr;
    setText(document.getElementById('delete-target-date'), formatFriendlyDate(dateStr));
    openModal('modal-delete-confirm');
  }

  function openGenerateDemoModal() {
    setText(document.getElementById('gen-target-year'), String(appState.selectedYear));
    openModal('modal-generate-demo');
  }

  function openResetConfirmModal() {
    openModal('modal-reset-confirm');
  }

  function openImportModal() {
    const fileInput = document.getElementById('import-file-input');
    if (fileInput) fileInput.value = '';
    const errBox = document.getElementById('err-import-file');
    if (errBox) errBox.style.display = 'none';
    const previewBox = document.getElementById('import-preview-box');
    if (previewBox) previewBox.style.display = 'none';
    openModal('modal-import-data');
  }

  function openAchievementDetailModal(achieve, isUnlocked, progressPct, currentText) {
    setText(document.getElementById('achieve-modal-icon'), achieve.icon);
    setText(document.getElementById('achieve-modal-symbol'), achieve.icon);
    setText(document.getElementById('achieve-modal-name'), achieve.name);

    const badgeEl = document.getElementById('achieve-modal-badge');
    if (badgeEl) {
      badgeEl.textContent = isUnlocked ? 'Unlocked' : 'In Progress';
      badgeEl.className = `status-pill ${isUnlocked ? 'status-unlocked' : 'status-locked'}`;
    }

    setText(document.getElementById('achieve-modal-desc'), `${achieve.desc} Requirement: ${achieve.req}.`);
    setText(document.getElementById('achieve-modal-progress-text'), currentText);

    const fill = document.getElementById('achieve-modal-progress-fill');
    if (fill) fill.style.width = `${progressPct}%`;

    openModal('modal-achievement-detail');
  }

  // ==========================================================================
  // 9. TOAST NOTIFICATION SYSTEM (Section 28)
  // ==========================================================================

  function showToast(message, type = 'info', duration = 3500) {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
        <span>${escapeHtml(message)}</span>
      </div>
      <button type="button" class="toast-close-btn" aria-label="Dismiss notification">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        dismissToast(toast);
      });
    }

    DOM.toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    const timer = setTimeout(() => {
      dismissToast(toast);
    }, duration);

    toast.dataset.timer = String(timer);
  }

  function dismissToast(toast) {
    if (!toast) return;
    toast.classList.remove('show');
    if (toast.dataset.timer) {
      clearTimeout(parseInt(toast.dataset.timer, 10));
    }
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }

  // ==========================================================================
  // 10. TOOLTIP COMPONENT (HEATMAP & CHARTS)
  // ==========================================================================

  function showHeatmapTooltip(e, data) {
    if (!DOM.appTooltip) return;

    DOM.appTooltip.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 2px;">${formatFriendlyDate(data.dateStr)}</div>
      <div style="color: var(--contrib-4); font-weight: 700;">${data.count} contribution${data.count === 1 ? '' : 's'}</div>
      <div style="font-size: 0.7rem; color: #8b949e; margin-top: 3px;">
        ${data.commits} commits • ${data.prs} PRs • ${data.issues} issues • ${data.reviews} reviews
      </div>
      ${data.repos && data.repos.length > 0 ? `<div style="font-size: 0.68rem; color: #58a6ff; margin-top: 2px;">📁 ${data.repos.join(', ')}</div>` : ''}
    `;

    positionTooltip(e);
    DOM.appTooltip.style.display = 'block';
    DOM.appTooltip.setAttribute('aria-hidden', 'false');
  }

  function showGenericTooltip(e, text) {
    if (!DOM.appTooltip) return;
    DOM.appTooltip.innerHTML = `<div>${escapeHtml(text)}</div>`;
    positionTooltip(e);
    DOM.appTooltip.style.display = 'block';
    DOM.appTooltip.setAttribute('aria-hidden', 'false');
  }

  function positionTooltip(e) {
    if (!DOM.appTooltip) return;
    const target = e.currentTarget || e.target;
    const rect = target.getBoundingClientRect();

    let left = rect.left + rect.width / 2;
    let top = rect.top;

    if (left < 80) left = 80;
    if (left > window.innerWidth - 80) left = window.innerWidth - 80;

    DOM.appTooltip.style.left = `${left}px`;
    DOM.appTooltip.style.top = `${top}px`;
  }

  function hideHeatmapTooltip() {
    if (!DOM.appTooltip) return;
    DOM.appTooltip.style.display = 'none';
    DOM.appTooltip.setAttribute('aria-hidden', 'true');
  }

  // ==========================================================================
  // 11. THEME ENGINE & MOBILE NAVIGATION (Sections 27 & 28)
  // ==========================================================================

  function initTheme() {
    let savedTheme = 'dark';
    try {
      savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    } catch (e) {}

    applyTheme(savedTheme);

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (appState.currentTheme === 'system') {
          applyTheme('system');
        }
      });
    }
  }

  function applyTheme(theme) {
    appState.currentTheme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}

    let effective = theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      effective = prefersDark ? 'dark' : 'light';
    }

    document.documentElement.setAttribute('data-theme', effective);

    if (DOM.themeIcon) {
      if (theme === 'dark') DOM.themeIcon.textContent = '🌙';
      else if (theme === 'light') DOM.themeIcon.textContent = '☀️';
      else DOM.themeIcon.textContent = '💻';
    }

    if (DOM.themeLabel) {
      if (theme === 'dark') DOM.themeLabel.textContent = 'Dark';
      else if (theme === 'light') DOM.themeLabel.textContent = 'Light';
      else DOM.themeLabel.textContent = 'System';
    }

    if (DOM.settingsThemeSelect) {
      DOM.settingsThemeSelect.value = theme;
    }
  }

  function toggleMobileMenu(forceState) {
    if (!DOM.mainNavList || !DOM.btnMobileMenu) return;
    const isCurrentlyOpen = DOM.mainNavList.classList.contains('mobile-open');
    const newState = forceState !== undefined ? forceState : !isCurrentlyOpen;

    if (newState) {
      DOM.mainNavList.classList.add('mobile-open');
      DOM.btnMobileMenu.classList.add('active');
      DOM.btnMobileMenu.setAttribute('aria-expanded', 'true');
    } else {
      DOM.mainNavList.classList.remove('mobile-open');
      DOM.btnMobileMenu.classList.remove('active');
      DOM.btnMobileMenu.setAttribute('aria-expanded', 'false');
    }
  }

  // ==========================================================================
  // 12. DATA EXPORT & IMPORT ENGINES (Sections 37 & 38)
  // ==========================================================================

  function exportApplicationData() {
    try {
      let exportPayload = {};
      if (appState.mode === 'live' && appState.authenticatedUser) {
        exportPayload = {
          exportType: 'github_live_analytics',
          exportedAt: new Date().toISOString(),
          version: 2,
          username: appState.authenticatedUser.login,
          weeklyGoal: appState.weeklyGoal,
          selectedYear: appState.selectedYear
        };
      } else {
        exportPayload = {
          exportType: 'demo_dataset',
          exportedAt: new Date().toISOString(),
          version: 2,
          weeklyGoal: demoProvider.getWeeklyGoal(),
          years: demoProvider.state.years
        };
      }

      const jsonStr = JSON.stringify(exportPayload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      if (DOM.hiddenExportLink) {
        DOM.hiddenExportLink.href = url;
        DOM.hiddenExportLink.download = `github-green-squares-${appState.mode}-${Date.now()}.json`;
        DOM.hiddenExportLink.click();
        URL.revokeObjectURL(url);
      }
      showToast('Exported dataset successfully as JSON.', 'success');
    } catch (err) {
      console.error('Export failed:', err);
      showToast('Failed to export data.', 'error');
    }
  }

  function handleImportFile(file) {
    const errBox = document.getElementById('err-import-file');
    const previewBox = document.getElementById('import-preview-box');
    const summaryText = document.getElementById('import-file-summary');

    if (!file || !file.name.endsWith('.json')) {
      if (errBox) {
        errBox.textContent = 'Please choose a valid .json file.';
        errBox.style.display = 'block';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Root is not a valid JSON object');
        }

        // Validate structure
        if (parsed.years && typeof parsed.years === 'object') {
          // Valid full dataset
          const yearsCount = Object.keys(parsed.years).length;
          if (summaryText) summaryText.textContent = `✓ Valid backup found: ${yearsCount} years of contribution data.`;
          if (previewBox) previewBox.style.display = 'block';
          if (errBox) errBox.style.display = 'none';

          // Store temporarily for confirmation
          appState.pendingImportData = parsed;
        } else {
          throw new Error('Missing years property in backup file');
        }
      } catch (err) {
        if (errBox) {
          errBox.textContent = `Malformed backup file: ${err.message}`;
          errBox.style.display = 'block';
        }
        if (previewBox) previewBox.style.display = 'none';
        appState.pendingImportData = null;
      }
    };
    reader.readAsText(file);
  }

  function executeDataImport() {
    if (!appState.pendingImportData) {
      const errBox = document.getElementById('err-import-file');
      if (errBox) {
        errBox.textContent = 'Please select a valid JSON backup file first.';
        errBox.style.display = 'block';
      }
      return;
    }

    try {
      demoProvider.state.years = appState.pendingImportData.years;
      if (appState.pendingImportData.weeklyGoal) {
        demoProvider.state.weeklyGoal = appState.pendingImportData.weeklyGoal;
        appState.weeklyGoal = appState.pendingImportData.weeklyGoal;
      }
      demoProvider.saveAppState();

      closeModal('modal-import-data');
      showToast('Successfully imported dataset!', 'success');
      renderAll();
    } catch (err) {
      console.error('Import execution failed:', err);
      showToast('Failed to save imported dataset.', 'error');
    }
  }

  // ==========================================================================
  // 13. API HEALTH CHECK (Section 19)
  // ==========================================================================

  async function checkApiHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        if (DOM.apiHealthLabel) DOM.apiHealthLabel.textContent = 'API: ● Connected';
        if (DOM.apiHealthBadge) DOM.apiHealthBadge.className = 'health-badge';
      } else {
        if (DOM.apiHealthLabel) DOM.apiHealthLabel.textContent = 'API: ● Standalone';
      }
    } catch (err) {
      if (DOM.apiHealthLabel) DOM.apiHealthLabel.textContent = 'API: ● Local Mode';
    }
  }

  // ==========================================================================
  // 14. EVENT LISTENERS & FORM SUBMISSIONS
  // ==========================================================================

  function initEventListeners() {
    // 1. Mobile Menu Toggle
    if (DOM.btnMobileMenu) {
      DOM.btnMobileMenu.addEventListener('click', () => toggleMobileMenu());
    }

    // 2. Navigation smooth scroll & close mobile menu
    document.querySelectorAll('.header-nav a, .footer-links a').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const el = document.querySelector(targetId);
          if (el) {
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth' });
            document.querySelectorAll('.header-nav .nav-item').forEach((n) => n.classList.remove('active'));
            link.classList.add('active');
            toggleMobileMenu(false);
          }
        }
      });
    });

    // 3. GitHub OAuth Connect & Disconnect Actions
    if (DOM.btnConnectGithub) {
      DOM.btnConnectGithub.addEventListener('click', () => {
        window.location.href = '/api/auth/github/login';
      });
    }

    if (DOM.btnDisconnectGithub) {
      DOM.btnDisconnectGithub.addEventListener('click', () => {
        window.location.href = '/api/auth/github/logout';
      });
    }

    if (DOM.btnRefreshGithub) {
      DOM.btnRefreshGithub.addEventListener('click', async () => {
        if (appState.currentProvider instanceof GitHubDataProvider) {
          appState.currentProvider.clearCache();
          showToast('Refreshing live GitHub contributions...', 'info');
          await renderAll();
          showToast('Refreshed latest GitHub contributions.', 'success');
        }
      });
    }

    // 4. Theme Dropdown
    if (DOM.themeBtn && DOM.themeMenu) {
      DOM.themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = DOM.themeMenu.classList.contains('show');
        if (isOpen) {
          DOM.themeMenu.classList.remove('show');
          DOM.themeBtn.setAttribute('aria-expanded', 'false');
        } else {
          DOM.themeMenu.classList.add('show');
          DOM.themeBtn.setAttribute('aria-expanded', 'true');
        }
      });

      document.querySelectorAll('#theme-menu .dropdown-item').forEach((item) => {
        item.addEventListener('click', () => {
          const val = item.getAttribute('data-theme-value');
          if (val) {
            applyTheme(val);
            DOM.themeMenu.classList.remove('show');
            DOM.themeBtn.setAttribute('aria-expanded', 'false');
            showToast(`Theme switched to ${val}`, 'info');
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (DOM.themeMenu && !DOM.themeMenu.contains(e.target) && e.target !== DOM.themeBtn) {
          DOM.themeMenu.classList.remove('show');
          if (DOM.themeBtn) DOM.themeBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (DOM.settingsThemeSelect) {
      DOM.settingsThemeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        showToast(`Theme switched to ${e.target.value}`, 'info');
      });
    }

    // 5. Year Selector
    if (DOM.yearSelect) {
      DOM.yearSelect.addEventListener('change', async (e) => {
        appState.selectedYear = parseInt(e.target.value, 10);
        showToast(`Switched view to year ${appState.selectedYear}`, 'info');
        await renderAll();
      });
    }

    // 6. Activity Type Filters
    if (DOM.typeFilterSelect) {
      DOM.typeFilterSelect.addEventListener('change', async (e) => {
        appState.activeFilter = e.target.value;
        DOM.filterPills.forEach((p) => {
          if (p.getAttribute('data-type') === appState.activeFilter) p.classList.add('active');
          else p.classList.remove('active');
        });
        showToast(`Filtered by ${appState.activeFilter.toUpperCase()}`, 'info');
        await renderAll();
      });
    }

    DOM.filterPills.forEach((pill) => {
      pill.addEventListener('click', async () => {
        const type = pill.getAttribute('data-type');
        if (!type) return;
        appState.activeFilter = type;
        if (DOM.typeFilterSelect) DOM.typeFilterSelect.value = type;
        DOM.filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        showToast(`Filtered by ${type.toUpperCase()}`, 'info');
        await renderAll();
      });
    });

    // 7. Header Quick Action Buttons
    if (DOM.btnHeaderAdd) DOM.btnHeaderAdd.addEventListener('click', openAddActivityModal);
    if (DOM.btnAddActivityModal) DOM.btnAddActivityModal.addEventListener('click', openAddActivityModal);

    if (DOM.btnHeaderGenerate) DOM.btnHeaderGenerate.addEventListener('click', openGenerateDemoModal);
    if (DOM.btnOpenGenModal) DOM.btnOpenGenModal.addEventListener('click', openGenerateDemoModal);
    if (DOM.btnSettingsOpenGen) DOM.btnSettingsOpenGen.addEventListener('click', openGenerateDemoModal);

    if (DOM.btnHeaderReset) DOM.btnHeaderReset.addEventListener('click', openResetConfirmModal);
    if (DOM.btnSettingsReset) DOM.btnSettingsReset.addEventListener('click', openResetConfirmModal);

    // 8. Clear Repository Filter
    if (DOM.btnClearRepoFilter) {
      DOM.btnClearRepoFilter.addEventListener('click', async () => {
        appState.activeRepoFilter = null;
        showToast('Cleared repository filter', 'info');
        await renderAll();
      });
    }

    // 9. Weekly Goal Stepper & Inputs
    function updateGoal(newVal) {
      const savedVal = demoProvider.setWeeklyGoal(newVal);
      appState.weeklyGoal = savedVal;
      showToast(`Weekly goal updated to ${savedVal} contributions`, 'success');
      appState.currentProvider.getYearData(appState.selectedYear).then((yearData) => {
        renderWeeklyGoal(yearData);
      });
    }

    if (DOM.btnGoalDec) DOM.btnGoalDec.addEventListener('click', () => updateGoal(appState.weeklyGoal - 5));
    if (DOM.btnGoalInc) DOM.btnGoalInc.addEventListener('click', () => updateGoal(appState.weeklyGoal + 5));
    if (DOM.goalTargetInput) DOM.goalTargetInput.addEventListener('change', (e) => updateGoal(parseInt(e.target.value, 10)));
    if (DOM.settingsGoalInput) DOM.settingsGoalInput.addEventListener('change', (e) => updateGoal(parseInt(e.target.value, 10)));

    // 10. Data Backup & Migration (Export / Import)
    if (DOM.btnExportData) DOM.btnExportData.addEventListener('click', exportApplicationData);
    if (DOM.btnImportData) DOM.btnImportData.addEventListener('click', openImportModal);

    const importFileInput = document.getElementById('import-file-input');
    if (importFileInput) {
      importFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleImportFile(e.target.files[0]);
        }
      });
    }

    const btnCloseImport = document.getElementById('btn-close-import-modal');
    const btnCancelImport = document.getElementById('btn-cancel-import');
    const btnConfirmImport = document.getElementById('btn-confirm-import');

    if (btnCloseImport) btnCloseImport.addEventListener('click', () => closeModal('modal-import-data'));
    if (btnCancelImport) btnCancelImport.addEventListener('click', () => closeModal('modal-import-data'));
    if (btnConfirmImport) btnConfirmImport.addEventListener('click', executeDataImport);

    // 11. Day Details Modal Actions
    const closeDayModalBtn = document.getElementById('btn-close-day-modal');
    const closeDayActionBtn = document.getElementById('btn-day-close-action');
    const editDayBtn = document.getElementById('btn-day-edit');
    const deleteDayBtn = document.getElementById('btn-day-delete');

    if (closeDayModalBtn) closeDayModalBtn.addEventListener('click', () => closeModal('modal-day-details'));
    if (closeDayActionBtn) closeDayActionBtn.addEventListener('click', () => closeModal('modal-day-details'));

    if (editDayBtn) {
      editDayBtn.addEventListener('click', () => {
        if (appState.selectedDate) {
          openEditActivityModal(appState.selectedDate);
        }
      });
    }

    if (deleteDayBtn) {
      deleteDayBtn.addEventListener('click', () => {
        if (appState.selectedDate) {
          openDeleteConfirmModal(appState.selectedDate);
        }
      });
    }

    // 12. Add Activity Form Submission
    const addForm = document.getElementById('form-add-activity');
    const closeAddModalBtn = document.getElementById('btn-close-add-modal');
    const cancelAddBtn = document.getElementById('btn-cancel-add');

    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', () => closeModal('modal-add-activity'));
    if (cancelAddBtn) cancelAddBtn.addEventListener('click', () => closeModal('modal-add-activity'));

    if (addForm) {
      addForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dateVal = document.getElementById('add-input-date').value;
        const repoVal = document.getElementById('add-input-repo').value;
        const typeVal = document.getElementById('add-input-type').value;
        const countVal = parseInt(document.getElementById('add-input-count').value, 10);
        const noteVal = document.getElementById('add-input-note').value.trim();

        let hasError = false;
        const errDate = document.getElementById('err-add-date');
        const errRepo = document.getElementById('err-add-repo');
        const errCount = document.getElementById('err-add-count');

        if (!dateVal || isNaN(new Date(dateVal).getTime())) {
          if (errDate) errDate.style.display = 'block';
          hasError = true;
        } else {
          if (errDate) errDate.style.display = 'none';
        }

        if (!repoVal) {
          if (errRepo) errRepo.style.display = 'block';
          hasError = true;
        } else {
          if (errRepo) errRepo.style.display = 'none';
        }

        if (isNaN(countVal) || countVal < 1 || countVal > 100) {
          if (errCount) errCount.style.display = 'block';
          hasError = true;
        } else {
          if (errCount) errCount.style.display = 'none';
        }

        if (hasError) return;

        const targetYear = parseInt(dateVal.substring(0, 4), 10);

        await appState.currentProvider.addActivity(targetYear, {
          date: dateVal,
          repo: repoVal,
          type: typeVal,
          count: countVal,
          note: noteVal
        });

        closeModal('modal-add-activity');
        showToast(`Added ${countVal} ${typeVal} to ${formatFriendlyDate(dateVal)}`, 'success');

        if (targetYear !== appState.selectedYear) {
          appState.selectedYear = targetYear;
          if (DOM.yearSelect) DOM.yearSelect.value = String(targetYear);
        }

        await renderAll();
      });
    }

    // 13. Edit Activity Form Submission
    const editForm = document.getElementById('form-edit-activity');
    const closeEditModalBtn = document.getElementById('btn-close-edit-modal');
    const cancelEditBtn = document.getElementById('btn-cancel-edit');

    if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', () => closeModal('modal-edit-activity'));
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => closeModal('modal-edit-activity'));

    if (editForm) {
      editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const dateStr = document.getElementById('edit-hidden-date').value;
        const repo = document.getElementById('edit-input-repo').value;
        const commits = parseInt(document.getElementById('edit-commits').value, 10) || 0;
        const prs = parseInt(document.getElementById('edit-prs').value, 10) || 0;
        const issues = parseInt(document.getElementById('edit-issues').value, 10) || 0;
        const reviews = parseInt(document.getElementById('edit-reviews').value, 10) || 0;
        const note = document.getElementById('edit-input-note').value.trim();

        const targetYear = parseInt(dateStr.substring(0, 4), 10);

        await appState.currentProvider.updateActivity(targetYear, {
          date: dateStr,
          primaryRepo: repo,
          commits,
          pullRequests: prs,
          issues,
          codeReviews: reviews,
          note
        });

        closeModal('modal-edit-activity');
        showToast(`Updated activity for ${formatFriendlyDate(dateStr)}`, 'success');
        await renderAll();
      });
    }

    // 14. Delete Activity Actions
    const closeDeleteModalBtn = document.getElementById('btn-close-delete-modal');
    const cancelDeleteBtn = document.getElementById('btn-cancel-delete');
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete');

    if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', () => closeModal('modal-delete-confirm'));
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => closeModal('modal-delete-confirm'));

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', async () => {
        if (appState.selectedDate) {
          const targetYear = parseInt(appState.selectedDate.substring(0, 4), 10);
          await appState.currentProvider.deleteActivity(targetYear, appState.selectedDate);
          closeModal('modal-delete-confirm');
          showToast(`Deleted activity for ${formatFriendlyDate(appState.selectedDate)}`, 'info');
          await renderAll();
        }
      });
    }

    // 15. Generate Demo Activity Actions
    const closeGenModalBtn = document.getElementById('btn-close-gen-modal');
    const cancelGenBtn = document.getElementById('btn-cancel-gen');
    const confirmGenBtn = document.getElementById('btn-confirm-gen');

    if (closeGenModalBtn) closeGenModalBtn.addEventListener('click', () => closeModal('modal-generate-demo'));
    if (cancelGenBtn) cancelGenBtn.addEventListener('click', () => closeModal('modal-generate-demo'));

    document.querySelectorAll('.intensity-card').forEach((card) => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.intensity-card').forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
      });
    });

    if (confirmGenBtn) {
      confirmGenBtn.addEventListener('click', async () => {
        const selectedRadio = document.querySelector('input[name="demo-intensity"]:checked');
        const intensity = selectedRadio ? selectedRadio.value : 'normal';

        await appState.currentProvider.generateDemo(appState.selectedYear, intensity);
        closeModal('modal-generate-demo');
        showToast(`Generated ${intensity.toUpperCase()} demo dataset for ${appState.selectedYear}`, 'success');
        await renderAll();
      });
    }

    // 16. Reset All Data Actions
    const closeResetModalBtn = document.getElementById('btn-close-reset-modal');
    const cancelResetBtn = document.getElementById('btn-cancel-reset');
    const confirmResetBtn = document.getElementById('btn-confirm-reset');

    if (closeResetModalBtn) closeResetModalBtn.addEventListener('click', () => closeModal('modal-reset-confirm'));
    if (cancelResetBtn) cancelResetBtn.addEventListener('click', () => closeModal('modal-reset-confirm'));

    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', async () => {
        await appState.currentProvider.resetAll();
        appState.activeFilter = 'all';
        appState.activeRepoFilter = null;
        if (DOM.typeFilterSelect) DOM.typeFilterSelect.value = 'all';
        DOM.filterPills.forEach((p) => {
          if (p.getAttribute('data-type') === 'all') p.classList.add('active');
          else p.classList.remove('active');
        });
        closeModal('modal-reset-confirm');
        showToast('Application reset to initial demo state', 'warning');
        await renderAll();
      });
    }

    // 17. Achievement Modal Close
    const closeAchieveModalBtn = document.getElementById('btn-close-achieve-modal');
    const closeAchieveActionBtn = document.getElementById('btn-close-achieve-action');
    if (closeAchieveModalBtn) closeAchieveModalBtn.addEventListener('click', () => closeModal('modal-achievement-detail'));
    if (closeAchieveActionBtn) closeAchieveActionBtn.addEventListener('click', () => closeModal('modal-achievement-detail'));
  }

  // ==========================================================================
  // 15. HELPER UTILITIES
  // ==========================================================================

  function formatDateToISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseISODate(dateStr) {
    const parts = String(dateStr).split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatFriendlyDate(dateStr) {
    if (!dateStr) return '';
    const d = parseISODate(dateStr);
    return `${MONTH_NAMES_FULL[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // 16. BOOTSTRAP INITIALIZATION SEQUENCE (Section 1)
  // DOMContentLoaded -> Load Config -> Load Auth -> Load State -> Calculate -> Render -> Bind Events -> Ready
  // ==========================================================================

  async function bootstrapApp() {
    try {
      // 1. Initialize validated DOM references
      initDOMReferences();

      // 2. Initialize theme preferences
      initTheme();

      // 3. Check for OAuth callback query parameters in URL
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('auth')) {
        showToast('Connected to GitHub! Loading your live analytics...', 'success');
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.has('auth_error')) {
        showToast(`GitHub authorization failed: ${urlParams.get('auth_error')}`, 'error', 5000);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.has('logged_out')) {
        showToast('Logged out of GitHub. Restored Demo Mode.', 'info');
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // 4. Check GitHub authentication state
      const authResult = await githubProvider.checkAuth();
      if (authResult.authenticated && authResult.user) {
        appState.mode = 'live';
        appState.currentProvider = githubProvider;
        appState.authenticatedUser = authResult.user;
      } else {
        appState.mode = 'demo';
        appState.currentProvider = demoProvider;
        appState.authenticatedUser = null;
      }

      // 5. Check API health in background
      checkApiHealth();

      // 6. Bind interactive event listeners
      initEventListeners();

      // 7. Initial full application render
      await renderAll();

      console.log('🟩 GitHub Green Squares Analytics V2 initialized successfully.');
    } catch (err) {
      console.error('Fatal initialization error:', err);
      showToast('Something went wrong during application startup. Restoring demo state.', 'error');
    }
  }

  document.addEventListener('DOMContentLoaded', bootstrapApp);

})();
