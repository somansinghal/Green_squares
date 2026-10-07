/**
 * 🟩 GitHub Green Squares — Developer Contribution Analytics
 * Tagline: "Turn your coding activity into measurable developer progress."
 * 
 * Pure Vanilla JavaScript ES6+ (Zero external dependencies).
 * Fully functional developer contribution analytics dashboard with:
 * - Local-first data architecture & DataProvider abstraction
 * - GitHub-style 365-day contribution calendar heatmap
 * - Day inspection, Add, Edit, Delete modals with real-time recalculation
 * - Streak engine & transparent consistency score algorithm
 * - Weekly (Mon->Sun) and Monthly volume analytics
 * - Dynamic vector SVG contribution trend graph
 * - Weekly contribution goal tracker with persistence
 * - Repository analytics with interactive filter
 * - 10 system achievements with live milestone tracking
 * - Multi-year datasets (2024, 2025, 2026)
 * - Accessible modals, tooltips, toasts, and dark/light/system theme switcher
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. CONSTANTS & CONFIGURATION
  // ==========================================================================

  const STORAGE_KEY = 'github_green_squares_analytics_v2';
  const THEME_KEY = 'github_green_squares_theme_v2';
  const GOAL_KEY = 'github_green_squares_goal_v2';

  // Simulated reference date for 2026: October 7, 2026
  const SIMULATED_TODAY_STR = '2026-10-07';
  const DEFAULT_YEAR = '2026';
  const SUPPORTED_YEARS = ['2026', '2025', '2024'];

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
  const WEEKDAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
  // 2. DATA LAYER ARCHITECTURE & PROVIDER ABSTRACTION (Section 3 & 36)
  // ==========================================================================

  /**
   * DataProvider interface (Abstraction for local demo vs future GitHub API provider)
   */
  class DataProvider {
    getYearData(year) { throw new Error('getYearData not implemented'); }
    addActivity(year, entry) { throw new Error('addActivity not implemented'); }
    updateActivity(year, entry) { throw new Error('updateActivity not implemented'); }
    deleteActivity(year, dateStr) { throw new Error('deleteActivity not implemented'); }
    generateDemo(year, intensity) { throw new Error('generateDemo not implemented'); }
    resetAll() { throw new Error('resetAll not implemented'); }
  }

  /**
   * Local-First DemoDataProvider implementation using localStorage
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
        console.warn('Could not read existing state from localStorage:', err);
      }
      return this.createInitialDemoState();
    }

    saveAppState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (err) {
        console.error('Failed to save app state to localStorage:', err);
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

      SUPPORTED_YEARS.forEach((yr) => {
        state.years[yr] = generateDemoYearData(parseInt(yr, 10), 'normal');
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}
      return state;
    }

    getYearData(year) {
      const yrStr = String(year);
      if (!this.state.years[yrStr]) {
        this.state.years[yrStr] = generateDemoYearData(parseInt(yrStr, 10), 'normal');
        this.saveAppState();
      }
      return this.state.years[yrStr];
    }

    addActivity(year, newEntry) {
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

    updateActivity(year, updatedData) {
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

    deleteActivity(year, dateStr) {
      const yrStr = String(year);
      if (this.state.years[yrStr] && this.state.years[yrStr][dateStr]) {
        delete this.state.years[yrStr][dateStr];
        this.saveAppState();
        return true;
      }
      return false;
    }

    generateDemo(year, intensity = 'normal') {
      const yrStr = String(year);
      this.state.years[yrStr] = generateDemoYearData(parseInt(yrStr, 10), intensity);
      this.saveAppState();
      return this.state.years[yrStr];
    }

    resetAll() {
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

  // ==========================================================================
  // 3. DEMO DATA GENERATOR WITH REALISTIC PATTERNS (Section 4 & 21)
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

      // In 2026, don't generate contributions for future dates beyond October 7, 2026
      if (year === 2026 && currentDate > todaySim) {
        continue;
      }

      const dayOfWeek = currentDate.getDay(); // 0 = Sun, 6 = Sat
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
  // 4. CALCULATION ENGINES: STATISTICS, STREAKS & CONSISTENCY (Sections 13, 14, 15)
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
    const weekdayVolumes = new Array(7).fill(0); // 0 = Sun, 1 = Mon ...
    const activeDatesSet = new Set();
    const repoSet = new Set();

    Object.keys(yearData).forEach((dateStr) => {
      const entry = yearData[dateStr];
      if (!entry) return;

      if (repoFilter && !entry.repositories.includes(repoFilter)) {
        return;
      }

      let count = 0;
      if (filterType === 'all') count = entry.total;
      else if (filterType === 'commits') count = entry.commits;
      else if (filterType === 'prs') count = entry.pullRequests;
      else if (filterType === 'issues') count = entry.issues;
      else if (filterType === 'reviews') count = entry.codeReviews;

      if (count > 0) {
        totalContributions += count;
        totalCommits += entry.commits;
        totalPRs += entry.pullRequests;
        totalIssues += entry.issues;
        totalReviews += entry.codeReviews;
        activeDays++;
        activeDatesSet.add(dateStr);

        entry.repositories.forEach((r) => repoSet.add(r));

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
      activeReposCount: repoSet.size || DEMO_REPOSITORIES.length,
      monthVolumes,
      weekdayVolumes
    };
  }

  function calculateStreaks(yearData, year, filterType = 'all', repoFilter = null) {
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeap ? 366 : 365;

    function isDayActive(dateStr) {
      const entry = yearData[dateStr];
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
  // 5. APPLICATION STATE
  // ==========================================================================

  const dataProvider = new DemoDataProvider();

  const appState = {
    selectedYear: 2026,
    activeFilter: 'all',
    activeRepoFilter: null,
    currentTheme: 'dark',
    weeklyGoal: dataProvider.getWeeklyGoal(),
    selectedDate: null,
    activeModal: null
  };

  // ==========================================================================
  // 6. RENDERERS: HEATMAP, CHARTS, METRICS & FEEDS
  // ==========================================================================

  function renderAll() {
    const yearData = dataProvider.getYearData(appState.selectedYear);
    const stats = calculateStatistics(yearData, appState.selectedYear, appState.activeFilter, appState.activeRepoFilter);

    renderProfileCard(stats);
    renderMetricCards(stats);
    renderContributionHeatmap(yearData, stats);
    renderWeeklyAnalytics(stats);
    renderWeeklyGoal(yearData);
    renderMonthlyAnalytics(stats);
    renderContributionTrend(yearData);
    renderRepositoryAnalytics(yearData);
    renderRecentActivity(yearData);
    renderAchievements(stats);
    renderRepoFilterBadge();
  }

  function renderProfileCard(stats) {
    const totalEl = document.getElementById('prof-total-contributions');
    const yearEl = document.getElementById('prof-year-label');
    const curStreakEl = document.getElementById('prof-current-streak');
    const longStreakEl = document.getElementById('prof-longest-streak');
    const activeDaysEl = document.getElementById('prof-active-days');
    const activePctEl = document.getElementById('prof-active-pct');

    if (totalEl) totalEl.textContent = stats.totalContributions.toLocaleString();
    if (yearEl) yearEl.textContent = `${appState.selectedYear} Activity (${appState.activeFilter.toUpperCase()})`;
    if (curStreakEl) curStreakEl.textContent = `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`;
    if (longStreakEl) longStreakEl.textContent = `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`;
    if (activeDaysEl) activeDaysEl.textContent = stats.activeDays.toLocaleString();
    if (activePctEl) activePctEl.textContent = `${stats.activePct}% of year`;
  }

  function renderMetricCards(stats) {
    const avgEl = document.getElementById('stat-avg-contributions');
    const curStreakEl = document.getElementById('stat-current-streak');
    const streakMsgEl = document.getElementById('stat-streak-msg');
    const longStreakEl = document.getElementById('stat-longest-streak');
    const bestMonthEl = document.getElementById('stat-best-month');
    const bestMonthVolEl = document.getElementById('stat-best-month-vol');
    const bestDayEl = document.getElementById('stat-best-day');
    const bestDayDateEl = document.getElementById('stat-best-day-date');
    const bestWeekdayEl = document.getElementById('stat-best-weekday');
    const bestWeekdayVolEl = document.getElementById('stat-best-weekday-vol');
    const scoreEl = document.getElementById('stat-consistency-score');
    const scoreDescEl = document.getElementById('stat-consistency-desc');
    const reposEl = document.getElementById('stat-active-repos');

    if (avgEl) avgEl.textContent = stats.avgPerActiveDay;
    if (curStreakEl) curStreakEl.textContent = `${stats.currentStreak} ${stats.currentStreak === 1 ? 'day' : 'days'}`;
    if (streakMsgEl) {
      if (stats.currentStreak >= 14) streakMsgEl.textContent = 'Unstoppable momentum 🔥';
      else if (stats.currentStreak >= 7) streakMsgEl.textContent = 'Weekly streak active 🔥';
      else if (stats.currentStreak >= 3) streakMsgEl.textContent = 'Building consistency ✨';
      else if (stats.currentStreak > 0) streakMsgEl.textContent = 'Streak started 🌱';
      else streakMsgEl.textContent = 'Ready for your next commit';
    }
    if (longStreakEl) longStreakEl.textContent = `${stats.longestStreak} ${stats.longestStreak === 1 ? 'day' : 'days'}`;
    if (bestMonthEl) bestMonthEl.textContent = stats.bestMonth;
    if (bestMonthVolEl) bestMonthVolEl.textContent = `${stats.bestMonthVolume.toLocaleString()} contributions`;
    if (bestDayEl) bestDayEl.textContent = `${stats.bestDayCount} contributions`;
    if (bestDayDateEl) bestDayDateEl.textContent = stats.bestDayDate;
    if (bestWeekdayEl) bestWeekdayEl.textContent = stats.bestWeekday;
    if (bestWeekdayVolEl) bestWeekdayVolEl.textContent = `${stats.bestWeekdayVolume.toLocaleString()} contributions`;
    if (scoreEl) scoreEl.textContent = `${stats.consistencyScore} / 100`;
    if (scoreDescEl) scoreDescEl.textContent = stats.consistencyDesc;
    if (reposEl) reposEl.textContent = stats.activeReposCount;
  }

  /**
   * Render GitHub-style 365-day Contribution Heatmap (Sections 7 & 8)
   * Uses exact styling classes from style.css:
   * .heatmap-months-row, .heatmap-month-label, .heatmap-body,
   * .heatmap-days-col, .heatmap-day-label, .heatmap-weeks-container,
   * .heatmap-week-col, .contrib-cell, .level-0 through .level-4, .empty-cell
   */
  function renderContributionHeatmap(yearData, stats) {
    const calendarEl = document.getElementById('heatmap-calendar');
    if (!calendarEl) return;

    calendarEl.innerHTML = '';

    const year = appState.selectedYear;
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const totalDays = isLeap ? 366 : 365;

    const jan1 = new Date(year, 0, 1);
    const startDayOfWeek = jan1.getDay(); // 0 = Sun, 6 = Sat
    const totalWeeks = Math.ceil((totalDays + startDayOfWeek) / 7);

    // 1. Months Label Row along the top
    const monthsRow = document.createElement('div');
    monthsRow.className = 'heatmap-months-row';

    // Blank spacer for weekday column
    const monthSpacer = document.createElement('div');
    monthsRow.appendChild(monthSpacer);

    // Compute week index where each month starts
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
    calendarEl.appendChild(monthsRow);

    // 2. Heatmap Body: Weekday labels column + Weeks container
    const heatmapBody = document.createElement('div');
    heatmapBody.className = 'heatmap-body';

    // Weekdays label column (Mon, Wed, Fri)
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

    // Weeks Container
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
        const entry = yearData[dateStr] || null;

        let count = 0;
        let commits = 0;
        let prs = 0;
        let issues = 0;
        let reviews = 0;
        let repos = [];

        if (entry) {
          commits = entry.commits;
          prs = entry.pullRequests;
          issues = entry.issues;
          reviews = entry.codeReviews;
          repos = entry.repositories;

          if (appState.activeRepoFilter && !repos.includes(appState.activeRepoFilter)) {
            count = 0;
          } else {
            if (appState.activeFilter === 'all') count = entry.total;
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
    calendarEl.appendChild(heatmapBody);
  }

  function getIntensityLevel(count) {
    if (!count || count <= 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  /**
   * Render Weekly Analytics (Section 16: Mon -> Sun)
   * Uses exact styling classes from style.css:
   * .weekly-col-wrap, .bar-val-badge, .bar-groove, .bar-stem, .bar-name-label
   */
  function renderWeeklyAnalytics(stats) {
    const chartEl = document.getElementById('weekly-analytics-chart');
    const peakInfoEl = document.getElementById('weekly-peak-info');
    const avgInfoEl = document.getElementById('weekly-avg-info');
    if (!chartEl) return;

    chartEl.innerHTML = '';

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
    if (peakInfoEl) peakInfoEl.innerHTML = `Peak: <strong>${stats.bestWeekday}</strong>`;
    if (avgInfoEl) avgInfoEl.innerHTML = `Daily Average: <strong>${dailyAvg} contributions</strong>`;

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

      chartEl.appendChild(colWrap);
    });
  }

  /**
   * Render Weekly Goal Tracker (Section 24)
   */
  function renderWeeklyGoal(yearData) {
    const targetInput = document.getElementById('goal-target-input');
    const settingsInput = document.getElementById('settings-goal-input');
    const targetDisplay = document.getElementById('goal-target-display');
    const currentDisplay = document.getElementById('goal-current-display');
    const percentDisplay = document.getElementById('goal-percent-display');
    const progressFill = document.getElementById('goal-progress-fill');
    const progressBar = document.getElementById('goal-progress-bar');
    const statusIcon = document.getElementById('goal-status-icon');
    const statusText = document.getElementById('goal-status-text');

    const target = appState.weeklyGoal;
    if (targetInput) targetInput.value = target;
    if (settingsInput) settingsInput.value = target;
    if (targetDisplay) targetDisplay.textContent = target;

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
      const entry = yearData[iso];
      if (entry) {
        if (appState.activeFilter === 'all') loggedThisWeek += entry.total;
        else if (appState.activeFilter === 'commits') loggedThisWeek += entry.commits;
        else if (appState.activeFilter === 'prs') loggedThisWeek += entry.pullRequests;
        else if (appState.activeFilter === 'issues') loggedThisWeek += entry.issues;
        else if (appState.activeFilter === 'reviews') loggedThisWeek += entry.codeReviews;
      }
    }

    const pct = Math.min(100, Math.round((loggedThisWeek / target) * 100));

    if (currentDisplay) currentDisplay.textContent = loggedThisWeek;
    if (percentDisplay) percentDisplay.textContent = `${pct}%`;
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(pct));

    if (statusIcon && statusText) {
      if (pct >= 100) {
        statusIcon.textContent = '🎉';
        statusText.textContent = `Weekly goal completed! (+${loggedThisWeek - target} surplus)`;
      } else {
        const remaining = target - loggedThisWeek;
        statusIcon.textContent = '⏳';
        statusText.textContent = `${remaining} more contributions needed to hit your weekly goal`;
      }
    }
  }

  /**
   * Render Monthly Analytics (Section 17: Jan -> Dec)
   * Uses exact styling classes from style.css:
   * .month-col-wrap, .bar-val-badge, .bar-groove, .bar-stem, .bar-name-label
   */
  function renderMonthlyAnalytics(stats) {
    const chartEl = document.getElementById('monthly-analytics-chart');
    const bestInfoEl = document.getElementById('monthly-best-info');
    const totalInfoEl = document.getElementById('monthly-total-info');
    if (!chartEl) return;

    chartEl.innerHTML = '';

    let maxVol = 0;
    stats.monthVolumes.forEach((v) => {
      if (v > maxVol) maxVol = v;
    });

    if (bestInfoEl) bestInfoEl.innerHTML = `Most Active Month: <strong>${stats.bestMonth} (${stats.bestMonthVolume.toLocaleString()})</strong>`;
    if (totalInfoEl) totalInfoEl.innerHTML = `Year Total: <strong>${stats.totalContributions.toLocaleString()} contributions</strong>`;

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

      chartEl.appendChild(colWrap);
    });
  }

  /**
   * Render Contribution Trend (Section 18: Dynamic Vector SVG Curve & Area)
   * Uses exact styling classes from style.css:
   * .trend-svg, .trend-dot, #trendGradient
   */
  function renderContributionTrend(yearData) {
    const container = document.getElementById('trend-chart-container');
    const peakPeriodEl = document.getElementById('trend-peak-period');
    const velocityEl = document.getElementById('trend-velocity-label');
    if (!container) return;

    container.innerHTML = '';

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
        const entry = yearData[iso];
        if (entry) {
          if (appState.activeFilter === 'all') periodVol += entry.total;
          else if (appState.activeFilter === 'commits') periodVol += entry.commits;
          else if (appState.activeFilter === 'prs') periodVol += entry.pullRequests;
          else if (appState.activeFilter === 'issues') periodVol += entry.issues;
          else if (appState.activeFilter === 'reviews') periodVol += entry.codeReviews;
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

    if (peakPeriodEl) peakPeriodEl.textContent = peakLabel || 'Consistent pace';

    const sum = values.reduce((a, b) => a + b, 0);
    const weeklyVelocity = (sum / 52).toFixed(1);
    if (velocityEl) velocityEl.textContent = `~${weeklyVelocity} / week avg`;

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

    container.appendChild(svg);
  }

  /**
   * Render Repository Analytics (Section 22)
   * Uses exact styling classes from style.css:
   * .repo-entry-card, .repo-entry-left, .repo-entry-icon, .repo-entry-name,
   * .repo-entry-sub, .repo-entry-right, .repo-pct-bar-wrap, .repo-pct-bar-fill, .repo-pct-text
   */
  function renderRepositoryAnalytics(yearData) {
    const listEl = document.getElementById('repo-analytics-list');
    if (!listEl) return;

    listEl.innerHTML = '';

    const repoStats = {};
    DEMO_REPOSITORIES.forEach((name) => {
      repoStats[name] = {
        name,
        contributions: 0,
        activeDays: 0,
        lastDate: null
      };
    });

    let overallTotal = 0;

    Object.keys(yearData).sort().forEach((dateStr) => {
      const entry = yearData[dateStr];
      if (!entry) return;

      entry.repositories.forEach((repoName) => {
        if (!repoStats[repoName]) {
          repoStats[repoName] = { name: repoName, contributions: 0, activeDays: 0, lastDate: null };
        }
        repoStats[repoName].contributions += entry.total;
        repoStats[repoName].activeDays += 1;
        repoStats[repoName].lastDate = dateStr;
        overallTotal += entry.total;
      });
    });

    const repoList = Object.values(repoStats).sort((a, b) => b.contributions - a.contributions);

    repoList.forEach((repo) => {
      const pct = overallTotal > 0 ? Math.round((repo.contributions / overallTotal) * 100) : 0;
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
            <div class="repo-entry-name">${repo.name}</div>
            <div class="repo-entry-sub">${repo.activeDays} active days &bull; Last: ${repo.lastDate ? formatFriendlyDate(repo.lastDate) : 'None'}</div>
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

      listEl.appendChild(item);
    });
  }

  /**
   * Render Recent Activity Feed (Section 23)
   * Uses exact styling classes from style.css:
   * .feed-item, .feed-marker, .feed-content, .feed-header-line,
   * .feed-action, .feed-date, .feed-repo, .feed-msg
   */
  function renderRecentActivity(yearData) {
    const feedEl = document.getElementById('recent-activity-feed');
    const countBadge = document.getElementById('activity-stream-count');
    if (!feedEl) return;

    feedEl.innerHTML = '';

    const sortedDates = Object.keys(yearData)
      .filter((dateStr) => {
        const e = yearData[dateStr];
        if (!e || e.total <= 0) return false;
        if (appState.activeRepoFilter && !e.repositories.includes(appState.activeRepoFilter)) return false;
        return true;
      })
      .sort((a, b) => b.localeCompare(a));

    const displayDates = sortedDates.slice(0, 15);
    if (countBadge) countBadge.textContent = `${sortedDates.length} recorded events`;

    if (displayDates.length === 0) {
      feedEl.innerHTML = `
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
            <span class="feed-action">${typeBadges.join(' &bull; ') || 'Activity'}</span>
            <span class="feed-date">${formatFriendlyDate(dateStr)}</span>
          </div>
          <div class="feed-repo">${entry.primaryRepo || 'General'}</div>
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

      feedEl.appendChild(feedItem);
    });
  }

  /**
   * Render 10 System Achievements (Section 25)
   * Uses exact styling classes from style.css:
   * .achievement-card, .unlocked, .locked, .achieve-icon, .achieve-info,
   * .achieve-title, .achieve-desc, .achieve-status-text
   */
  function renderAchievements(stats) {
    const gridEl = document.getElementById('achievements-grid');
    const badgeEl = document.getElementById('achievements-tally-badge');
    if (!gridEl) return;

    gridEl.innerHTML = '';

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
          <div class="achieve-title">${achieve.name}</div>
          <div class="achieve-desc">${achieve.desc}</div>
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

      gridEl.appendChild(card);
    });

    if (badgeEl) {
      badgeEl.textContent = `${unlockedCount} / ${ACHIEVEMENTS_DEFINITIONS.length} Unlocked`;
    }
  }

  function renderRepoFilterBadge() {
    const indicator = document.getElementById('repo-filter-indicator');
    const activeText = document.getElementById('repo-filter-active-text');
    const clearBtn = document.getElementById('btn-clear-repo-filter');

    if (!indicator || !activeText || !clearBtn) return;

    if (appState.activeRepoFilter) {
      activeText.textContent = `Filtered: ${appState.activeRepoFilter}`;
      clearBtn.style.display = 'inline-block';
    } else {
      activeText.textContent = 'All Projects';
      clearBtn.style.display = 'none';
    }
  }

  function toggleRepoFilter(repoName) {
    if (appState.activeRepoFilter === repoName) {
      appState.activeRepoFilter = null;
      showToast(`Cleared repository filter`, 'info');
    } else {
      appState.activeRepoFilter = repoName;
      showToast(`Filtered by ${repoName}`, 'info');
    }
    renderAll();
  }

  // ==========================================================================
  // 7. MODALS INFRASTRUCTURE & HANDLERS (Sections 9, 10, 11, 12, 21, 26, 29)
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
    if (e.key === 'Escape' && appState.activeModal) {
      closeModal(appState.activeModal);
    }
  });

  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal(backdrop.id);
      }
    });
  });

  function openDayDetailsModal(dateStr) {
    appState.selectedDate = dateStr;
    const year = parseInt(dateStr.substring(0, 4), 10);
    const yearData = dataProvider.getYearData(year);
    const entry = yearData[dateStr] || {
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

    const dateTitle = document.getElementById('day-modal-date');
    const totalCount = document.getElementById('day-modal-total-count');
    const commitsVal = document.getElementById('day-modal-commits');
    const prsVal = document.getElementById('day-modal-prs');
    const issuesVal = document.getElementById('day-modal-issues');
    const reviewsVal = document.getElementById('day-modal-reviews');
    const reposWrap = document.getElementById('day-modal-repos');
    const noteWrap = document.getElementById('day-modal-note-wrap');
    const noteVal = document.getElementById('day-modal-note');

    if (dateTitle) dateTitle.textContent = formatFriendlyDate(dateStr);
    if (totalCount) totalCount.textContent = `${entry.total} Contributions`;
    if (commitsVal) commitsVal.textContent = entry.commits;
    if (prsVal) prsVal.textContent = entry.pullRequests;
    if (issuesVal) issuesVal.textContent = entry.issues;
    if (reviewsVal) reviewsVal.textContent = entry.codeReviews;

    if (reposWrap) {
      reposWrap.innerHTML = '';
      if (entry.repositories && entry.repositories.length > 0) {
        entry.repositories.forEach((r) => {
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

  function openEditActivityModal(dateStr) {
    closeModal('modal-day-details');
    appState.selectedDate = dateStr;

    const year = parseInt(dateStr.substring(0, 4), 10);
    const yearData = dataProvider.getYearData(year);
    const entry = yearData[dateStr] || {
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

    const hiddenDate = document.getElementById('edit-hidden-date');
    const displayDate = document.getElementById('edit-display-date-text');
    const repoSelect = document.getElementById('edit-input-repo');
    const commitsInput = document.getElementById('edit-commits');
    const prsInput = document.getElementById('edit-prs');
    const issuesInput = document.getElementById('edit-issues');
    const reviewsInput = document.getElementById('edit-reviews');
    const noteInput = document.getElementById('edit-input-note');

    if (hiddenDate) hiddenDate.value = dateStr;
    if (displayDate) displayDate.textContent = formatFriendlyDate(dateStr);
    if (repoSelect) repoSelect.value = entry.primaryRepo || DEMO_REPOSITORIES[0];
    if (commitsInput) commitsInput.value = entry.commits;
    if (prsInput) prsInput.value = entry.pullRequests;
    if (issuesInput) issuesInput.value = entry.issues;
    if (reviewsInput) reviewsInput.value = entry.codeReviews;
    if (noteInput) noteInput.value = entry.note || '';

    openModal('modal-edit-activity');
  }

  function openDeleteConfirmModal(dateStr) {
    closeModal('modal-day-details');
    appState.selectedDate = dateStr;

    const dateTarget = document.getElementById('delete-target-date');
    if (dateTarget) dateTarget.textContent = formatFriendlyDate(dateStr);

    openModal('modal-delete-confirm');
  }

  function openGenerateDemoModal() {
    const yearTarget = document.getElementById('gen-target-year');
    if (yearTarget) yearTarget.textContent = String(appState.selectedYear);
    openModal('modal-generate-demo');
  }

  function openResetConfirmModal() {
    openModal('modal-reset-confirm');
  }

  function openAchievementDetailModal(achieve, isUnlocked, progressPct, currentText) {
    const iconEl = document.getElementById('achieve-modal-icon');
    const symbolEl = document.getElementById('achieve-modal-symbol');
    const nameEl = document.getElementById('achieve-modal-name');
    const badgeEl = document.getElementById('achieve-modal-badge');
    const descEl = document.getElementById('achieve-modal-desc');
    const progressTextEl = document.getElementById('achieve-modal-progress-text');
    const progressFillEl = document.getElementById('achieve-modal-progress-fill');

    if (iconEl) iconEl.textContent = achieve.icon;
    if (symbolEl) symbolEl.textContent = achieve.icon;
    if (nameEl) nameEl.textContent = achieve.name;
    if (badgeEl) {
      badgeEl.textContent = isUnlocked ? 'Unlocked' : 'In Progress';
      badgeEl.className = `status-pill ${isUnlocked ? 'status-unlocked' : 'status-locked'}`;
    }
    if (descEl) descEl.textContent = `${achieve.desc} Requirement: ${achieve.req}.`;
    if (progressTextEl) progressTextEl.textContent = currentText;
    if (progressFillEl) progressFillEl.style.width = `${progressPct}%`;

    openModal('modal-achievement-detail');
  }

  // ==========================================================================
  // 8. TOAST NOTIFICATION SYSTEM (Section 28)
  // Uses exact styling classes from style.css:
  // .toast, .show, .toast-error, .toast-warning, .toast-info, .toast-content, .toast-close-btn
  // ==========================================================================

  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

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

    container.appendChild(toast);

    // Trigger transition
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
  // 9. TOOLTIP COMPONENT (HEATMAP & CHARTS)
  // Uses exact styling classes from style.css: .app-tooltip
  // ==========================================================================

  const tooltipEl = document.getElementById('app-tooltip');

  function showHeatmapTooltip(e, data) {
    if (!tooltipEl) return;

    tooltipEl.innerHTML = `
      <div style="font-weight: 700; margin-bottom: 2px;">${formatFriendlyDate(data.dateStr)}</div>
      <div style="color: var(--contrib-4); font-weight: 700;">${data.count} contribution${data.count === 1 ? '' : 's'}</div>
      <div style="font-size: 0.7rem; color: #8b949e; margin-top: 3px;">
        ${data.commits} commits &bull; ${data.prs} PRs &bull; ${data.issues} issues &bull; ${data.reviews} reviews
      </div>
      ${data.repos && data.repos.length > 0 ? `<div style="font-size: 0.68rem; color: #58a6ff; margin-top: 2px;">📁 ${data.repos.join(', ')}</div>` : ''}
    `;

    positionTooltip(e);
    tooltipEl.style.display = 'block';
    tooltipEl.setAttribute('aria-hidden', 'false');
  }

  function showGenericTooltip(e, text) {
    if (!tooltipEl) return;
    tooltipEl.innerHTML = `<div>${escapeHtml(text)}</div>`;
    positionTooltip(e);
    tooltipEl.style.display = 'block';
    tooltipEl.setAttribute('aria-hidden', 'false');
  }

  function positionTooltip(e) {
    if (!tooltipEl) return;
    const target = e.currentTarget || e.target;
    const rect = target.getBoundingClientRect();

    let left = rect.left + rect.width / 2;
    let top = rect.top;

    if (left < 80) left = 80;
    if (left > window.innerWidth - 80) left = window.innerWidth - 80;

    tooltipEl.style.left = `${left}px`;
    tooltipEl.style.top = `${top}px`;
  }

  function hideHeatmapTooltip() {
    if (!tooltipEl) return;
    tooltipEl.style.display = 'none';
    tooltipEl.setAttribute('aria-hidden', 'true');
  }

  // ==========================================================================
  // 10. THEME SWITCHER LOGIC (Dark / Light / System) (Section 27)
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

    const themeIcon = document.getElementById('theme-icon');
    const themeLabel = document.getElementById('theme-label');
    const themeSelect = document.getElementById('settings-theme-select');

    if (themeIcon) {
      if (theme === 'dark') themeIcon.textContent = '🌙';
      else if (theme === 'light') themeIcon.textContent = '☀️';
      else themeIcon.textContent = '💻';
    }

    if (themeLabel) {
      if (theme === 'dark') themeLabel.textContent = 'Dark';
      else if (theme === 'light') themeLabel.textContent = 'Light';
      else themeLabel.textContent = 'System';
    }

    if (themeSelect) {
      themeSelect.value = theme;
    }
  }

  // ==========================================================================
  // 11. EVENT LISTENERS & FORM SUBMISSIONS
  // ==========================================================================

  function initEventListeners() {
    // 1. Navigation smooth scroll
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
          }
        }
      });
    });

    // 2. Theme Dropdown
    const themeBtn = document.getElementById('theme-btn');
    const themeMenu = document.getElementById('theme-menu');
    if (themeBtn && themeMenu) {
      themeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = themeMenu.classList.contains('show');
        if (isOpen) {
          themeMenu.classList.remove('show');
          themeBtn.setAttribute('aria-expanded', 'false');
        } else {
          themeMenu.classList.add('show');
          themeBtn.setAttribute('aria-expanded', 'true');
        }
      });

      document.querySelectorAll('#theme-menu .dropdown-item').forEach((item) => {
        item.addEventListener('click', () => {
          const val = item.getAttribute('data-theme-value');
          if (val) {
            applyTheme(val);
            themeMenu.classList.remove('show');
            themeBtn.setAttribute('aria-expanded', 'false');
            showToast(`Theme switched to ${val}`, 'info');
          }
        });
      });

      document.addEventListener('click', (e) => {
        if (!themeMenu.contains(e.target) && e.target !== themeBtn) {
          themeMenu.classList.remove('show');
          themeBtn.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const settingsThemeSelect = document.getElementById('settings-theme-select');
    if (settingsThemeSelect) {
      settingsThemeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
        showToast(`Theme switched to ${e.target.value}`, 'info');
      });
    }

    // 3. Year Selector (Section 20)
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
      yearSelect.addEventListener('change', (e) => {
        appState.selectedYear = parseInt(e.target.value, 10);
        showToast(`Switched view to year ${appState.selectedYear}`, 'info');
        renderAll();
      });
    }

    // 4. Activity Type Filter Dropdown & Filter Pills (Section 19)
    const filterSelect = document.getElementById('type-filter-select');
    const filterPills = document.querySelectorAll('.filter-pill');

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        appState.activeFilter = e.target.value;
        filterPills.forEach((p) => {
          if (p.getAttribute('data-type') === appState.activeFilter) p.classList.add('active');
          else p.classList.remove('active');
        });
        showToast(`Filtered by ${appState.activeFilter.toUpperCase()}`, 'info');
        renderAll();
      });
    }

    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        const type = pill.getAttribute('data-type');
        if (!type) return;
        appState.activeFilter = type;
        if (filterSelect) filterSelect.value = type;
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        showToast(`Filtered by ${type.toUpperCase()}`, 'info');
        renderAll();
      });
    });

    // 5. Header Quick Action Buttons
    const headerAddBtn = document.getElementById('btn-header-add');
    const toolbarAddBtn = document.getElementById('btn-add-activity-modal');
    if (headerAddBtn) headerAddBtn.addEventListener('click', openAddActivityModal);
    if (toolbarAddBtn) toolbarAddBtn.addEventListener('click', openAddActivityModal);

    const headerGenBtn = document.getElementById('btn-header-generate');
    const toolbarGenBtn = document.getElementById('btn-open-gen-modal');
    const settingsGenBtn = document.getElementById('btn-settings-open-gen');
    if (headerGenBtn) headerGenBtn.addEventListener('click', openGenerateDemoModal);
    if (toolbarGenBtn) toolbarGenBtn.addEventListener('click', openGenerateDemoModal);
    if (settingsGenBtn) settingsGenBtn.addEventListener('click', openGenerateDemoModal);

    const headerResetBtn = document.getElementById('btn-header-reset');
    const settingsResetBtn = document.getElementById('btn-settings-reset');
    if (headerResetBtn) headerResetBtn.addEventListener('click', openResetConfirmModal);
    if (settingsResetBtn) settingsResetBtn.addEventListener('click', openResetConfirmModal);

    // 6. Clear Repository Filter Button
    const clearRepoBtn = document.getElementById('btn-clear-repo-filter');
    if (clearRepoBtn) {
      clearRepoBtn.addEventListener('click', () => {
        appState.activeRepoFilter = null;
        showToast('Cleared repository filter', 'info');
        renderAll();
      });
    }

    // 7. Weekly Goal Stepper & Inputs (Section 24)
    const goalDecBtn = document.getElementById('btn-goal-dec');
    const goalIncBtn = document.getElementById('btn-goal-inc');
    const goalInput = document.getElementById('goal-target-input');
    const settingsGoalInput = document.getElementById('settings-goal-input');

    function updateGoal(newVal) {
      const savedVal = dataProvider.setWeeklyGoal(newVal);
      appState.weeklyGoal = savedVal;
      showToast(`Weekly goal updated to ${savedVal} contributions`, 'success');
      renderWeeklyGoal(dataProvider.getYearData(appState.selectedYear));
    }

    if (goalDecBtn) {
      goalDecBtn.addEventListener('click', () => {
        updateGoal(appState.weeklyGoal - 5);
      });
    }
    if (goalIncBtn) {
      goalIncBtn.addEventListener('click', () => {
        updateGoal(appState.weeklyGoal + 5);
      });
    }
    if (goalInput) {
      goalInput.addEventListener('change', (e) => {
        updateGoal(parseInt(e.target.value, 10));
      });
    }
    if (settingsGoalInput) {
      settingsGoalInput.addEventListener('change', (e) => {
        updateGoal(parseInt(e.target.value, 10));
      });
    }

    // 8. Day Details Modal Actions (Section 9)
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

    // 9. Add Activity Form Submission (Section 10)
    const addForm = document.getElementById('form-add-activity');
    const closeAddModalBtn = document.getElementById('btn-close-add-modal');
    const cancelAddBtn = document.getElementById('btn-cancel-add');

    if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', () => closeModal('modal-add-activity'));
    if (cancelAddBtn) cancelAddBtn.addEventListener('click', () => closeModal('modal-add-activity'));

    if (addForm) {
      addForm.addEventListener('submit', (e) => {
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

        dataProvider.addActivity(targetYear, {
          date: dateVal,
          repo: repoVal,
          type: typeVal,
          count: countVal,
          note: noteVal
        });

        closeModal('modal-add-activity');
        showToast(`Successfully added ${countVal} ${typeVal} to ${formatFriendlyDate(dateVal)}`, 'success');

        if (targetYear !== appState.selectedYear) {
          appState.selectedYear = targetYear;
          if (yearSelect) yearSelect.value = String(targetYear);
        }

        renderAll();
      });
    }

    // 10. Edit Activity Form Submission (Section 11)
    const editForm = document.getElementById('form-edit-activity');
    const closeEditModalBtn = document.getElementById('btn-close-edit-modal');
    const cancelEditBtn = document.getElementById('btn-cancel-edit');

    if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', () => closeModal('modal-edit-activity'));
    if (cancelEditBtn) cancelEditBtn.addEventListener('click', () => closeModal('modal-edit-activity'));

    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const dateStr = document.getElementById('edit-hidden-date').value;
        const repo = document.getElementById('edit-input-repo').value;
        const commits = parseInt(document.getElementById('edit-commits').value, 10) || 0;
        const prs = parseInt(document.getElementById('edit-prs').value, 10) || 0;
        const issues = parseInt(document.getElementById('edit-issues').value, 10) || 0;
        const reviews = parseInt(document.getElementById('edit-reviews').value, 10) || 0;
        const note = document.getElementById('edit-input-note').value.trim();

        const targetYear = parseInt(dateStr.substring(0, 4), 10);

        dataProvider.updateActivity(targetYear, {
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
        renderAll();
      });
    }

    // 11. Delete Activity Actions (Section 12)
    const closeDeleteModalBtn = document.getElementById('btn-close-delete-modal');
    const cancelDeleteBtn = document.getElementById('btn-cancel-delete');
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete');

    if (closeDeleteModalBtn) closeDeleteModalBtn.addEventListener('click', () => closeModal('modal-delete-confirm'));
    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', () => closeModal('modal-delete-confirm'));

    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => {
        if (appState.selectedDate) {
          const targetYear = parseInt(appState.selectedDate.substring(0, 4), 10);
          dataProvider.deleteActivity(targetYear, appState.selectedDate);
          closeModal('modal-delete-confirm');
          showToast(`Deleted activity for ${formatFriendlyDate(appState.selectedDate)}`, 'info');
          renderAll();
        }
      });
    }

    // 12. Generate Demo Activity Actions (Section 21)
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
      confirmGenBtn.addEventListener('click', () => {
        const selectedRadio = document.querySelector('input[name="demo-intensity"]:checked');
        const intensity = selectedRadio ? selectedRadio.value : 'normal';

        dataProvider.generateDemo(appState.selectedYear, intensity);
        closeModal('modal-generate-demo');
        showToast(`Generated ${intensity.toUpperCase()} demo dataset for ${appState.selectedYear}`, 'success');
        renderAll();
      });
    }

    // 13. Reset All Data Actions (Section 26)
    const closeResetModalBtn = document.getElementById('btn-close-reset-modal');
    const cancelResetBtn = document.getElementById('btn-cancel-reset');
    const confirmResetBtn = document.getElementById('btn-confirm-reset');

    if (closeResetModalBtn) closeResetModalBtn.addEventListener('click', () => closeModal('modal-reset-confirm'));
    if (cancelResetBtn) cancelResetBtn.addEventListener('click', () => closeModal('modal-reset-confirm'));

    if (confirmResetBtn) {
      confirmResetBtn.addEventListener('click', () => {
        dataProvider.resetAll();
        appState.activeFilter = 'all';
        appState.activeRepoFilter = null;
        if (filterSelect) filterSelect.value = 'all';
        filterPills.forEach((p) => {
          if (p.getAttribute('data-type') === 'all') p.classList.add('active');
          else p.classList.remove('active');
        });
        closeModal('modal-reset-confirm');
        showToast('Application reset to initial demo state', 'warning');
        renderAll();
      });
    }

    // 14. Achievement Modal Close
    const closeAchieveModalBtn = document.getElementById('btn-close-achieve-modal');
    const closeAchieveActionBtn = document.getElementById('btn-close-achieve-action');
    if (closeAchieveModalBtn) closeAchieveModalBtn.addEventListener('click', () => closeModal('modal-achievement-detail'));
    if (closeAchieveActionBtn) closeAchieveActionBtn.addEventListener('click', () => closeModal('modal-achievement-detail'));
  }

  // ==========================================================================
  // 12. HELPER UTILITIES
  // ==========================================================================

  function formatDateToISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function parseISODate(dateStr) {
    const parts = dateStr.split('-');
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
  // 13. BOOTSTRAP APPLICATION
  // ==========================================================================

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initEventListeners();
    renderAll();
    console.log('🟩 GitHub Green Squares Analytics initialized successfully.');
  });

})();
