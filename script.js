/**
 * 🟩 GitHub Green Squares Ka Junoon
 * Tagline: "Commit karo. Green squares banao. Streak maintain karo. 🔥"
 * 
 * Interactive GitHub-inspired contribution activity dashboard.
 * Pure Vanilla JavaScript (ES6+).
 */

(function () {
  'use strict';

  // ==========================================================================
  // 1. CONSTANTS & CONFIGURATION
  // ==========================================================================

  const STORAGE_KEY = 'green_squares_junoon_state_v1';

  const DEMO_REPOSITORIES = [
    'Green-Square-Lab',
    'Commit-Tracker',
    'Dev-Journal',
    'Contribution-Visualizer',
    'Code-Streak'
  ];

  const MOTIVATIONAL_QUOTES = [
    "One more commit bro. 🔥",
    "Green square dopamine incoming. 💚",
    "Git push karo, tension chhodo.",
    "Consistency > perfection.",
    "Kal se daily commit pakka. 😭",
    "Production bug bhi ek contribution hai... maybe. 😭",
    "Commit today. Regret never.",
    "Streak tootne mat dena bhai.",
    "Green square dekh ke dopamine 📈",
    "Subah code, shaam ko push, raat ko sukoon. 🌙",
    "Code likho, commit karo, duniya jeeto. 🚀",
    "Your future self will thank you for this green square. 💻"
  ];

  const ACHIEVEMENTS_DEF = [
    {
      id: 'first_square',
      icon: '🟩',
      name: 'First Green Square',
      desc: 'Commit at least once and turn a square green.',
      threshold: 1,
      check: (stats) => stats.totalContributions >= 1,
      progress: (stats) => Math.min(100, (stats.totalContributions / 1) * 100),
      current: (stats) => `${Math.min(stats.totalContributions, 1)} / 1 commit`
    },
    {
      id: 'streak_3',
      icon: '🔥',
      name: '3 Day Streak',
      desc: 'Maintain an active coding streak of 3 consecutive days.',
      threshold: 3,
      check: (stats) => stats.longestStreak >= 3,
      progress: (stats) => Math.min(100, (stats.longestStreak / 3) * 100),
      current: (stats) => `${Math.min(stats.longestStreak, 3)} / 3 days`
    },
    {
      id: 'streak_7',
      icon: '🔥',
      name: '7 Day Streak',
      desc: 'Maintain an active coding streak for an entire week.',
      threshold: 7,
      check: (stats) => stats.longestStreak >= 7,
      progress: (stats) => Math.min(100, (stats.longestStreak / 7) * 100),
      current: (stats) => `${Math.min(stats.longestStreak, 7)} / 7 days`
    },
    {
      id: 'streak_30',
      icon: '🏆',
      name: '30 Day Streak',
      desc: 'Legendary developer stamina: 30 consecutive coding days!',
      threshold: 30,
      check: (stats) => stats.longestStreak >= 30,
      progress: (stats) => Math.min(100, (stats.longestStreak / 30) * 100),
      current: (stats) => `${Math.min(stats.longestStreak, 30)} / 30 days`
    },
    {
      id: 'contrib_100',
      icon: '💚',
      name: '100 Contributions',
      desc: 'Reach a century of simulated commits in the current year.',
      threshold: 100,
      check: (stats) => stats.totalContributions >= 100,
      progress: (stats) => Math.min(100, (stats.totalContributions / 100) * 100),
      current: (stats) => `${Math.min(stats.totalContributions, 100)} / 100 commits`
    },
    {
      id: 'contrib_500',
      icon: '💚',
      name: '500 Contributions',
      desc: 'Hardcore contributor: generate 500 total commits.',
      threshold: 500,
      check: (stats) => stats.totalContributions >= 500,
      progress: (stats) => Math.min(100, (stats.totalContributions / 500) * 100),
      current: (stats) => `${Math.min(stats.totalContributions, 500)} / 500 commits`
    },
    {
      id: 'repos_5',
      icon: '📦',
      name: '5 Active Repositories',
      desc: 'Commit to all 5 simulated demo repositories.',
      threshold: 5,
      check: (stats) => stats.activeReposCount >= 5,
      progress: (stats) => Math.min(100, (stats.activeReposCount / 5) * 100),
      current: (stats) => `${Math.min(stats.activeReposCount, 5)} / 5 repositories`
    }
  ];

  // Month abbreviations for heatmap columns
  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // ==========================================================================
  // 2. STATE MANAGEMENT
  // ==========================================================================

  let appState = {
    selectedYear: 2026,
    theme: 'dark',
    palette: 'emerald',
    soundEnabled: true,
    paintMode: false,
    paintBrush: 4,
    weeklyGoal: 20,
    activeIntensityFilter: 'all',
    selectedRepoFilter: null,
    // contributions[year] = { "YYYY-MM-DD": { count: number, repo: string, note?: string } }
    contributionsByYear: {},
    recentActivity: []
  };

  let modalActiveCellDate = null;
  let isMousePainting = false;
  let liveStreamInterval = null;

  // Web Audio Synthesizer (No external dependencies)
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playCommitSound() {
    if (!appState.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(540, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {}
  }

  function playSuccessSound() {
    if (!appState.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.1, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.15);
      });
    } catch (e) {}
  }

  // ==========================================================================
  // 3. SEED-BASED DEMO DATA GENERATION
  // ==========================================================================

  /**
   * Deterministic pseudo-random number generator (Mulberry32)
   */
  function createSeededRandom(seed) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Helper: format Date object to YYYY-MM-DD in local time
   */
  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Determine contribution level (0-4) from commit count
   */
  function getIntensityLevel(count) {
    if (!count || count <= 0) return 0;
    if (count <= 3) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  /**
   * Generate realistic demo dataset for a specified year
   */
  function generateDemoDataForYear(year, customSeed) {
    const seed = customSeed || year * 997 + 104729;
    const rng = createSeededRandom(seed);
    const data = {};
    const recentActivityList = [];

    // Reference today date in 2026 simulation
    const today = new Date(2026, 9, 7); // Oct 7, 2026
    const isCurrentSimYear = (year === 2026);

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const cur = new Date(startDate);

    // Build realistic contribution clusters (simulate sprints and weekends)
    let sprintCountdown = 0;
    let sprintIntensity = 1;

    while (cur <= endDate) {
      const dateKey = formatDateKey(cur);
      const dayOfWeek = cur.getDay(); // 0 = Sun, 6 = Sat
      const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);

      // Sprints: periodically boost commit density
      if (sprintCountdown <= 0) {
        if (rng() > 0.6) {
          sprintCountdown = Math.floor(rng() * 12) + 5;
          sprintIntensity = rng() > 0.4 ? 2 : 1;
        } else {
          sprintCountdown = Math.floor(rng() * 6) + 2;
          sprintIntensity = 0;
        }
      } else {
        sprintCountdown--;
      }

      // Base probability of committing
      let commitProb = isWeekend ? 0.35 : 0.72;
      if (sprintIntensity > 0) commitProb += 0.2;

      // Ensure an impressive active streak leading up to simulated today
      if (isCurrentSimYear) {
        const diffDays = Math.floor((today - cur) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 13) {
          commitProb = 1.0; // Guaranteed streak for recent 14 days
        }
      }

      let count = 0;
      let repo = DEMO_REPOSITORIES[Math.floor(rng() * DEMO_REPOSITORIES.length)];

      if (rng() < commitProb) {
        // Commits count distribution
        const rVal = rng();
        if (rVal < 0.45) {
          count = Math.floor(rng() * 3) + 1; // 1-3
        } else if (rVal < 0.75) {
          count = Math.floor(rng() * 3) + 4; // 4-6
        } else if (rVal < 0.92) {
          count = Math.floor(rng() * 3) + 7; // 7-9
        } else {
          count = Math.floor(rng() * 4) + 10; // 10-13
        }
      }

      data[dateKey] = {
        count: count,
        repo: count > 0 ? repo : null,
        note: count > 0 ? `Simulated commits for ${repo}` : null
      };

      // Collect some recent events for timeline
      if (count > 0 && isCurrentSimYear && cur <= today) {
        const diffDays = Math.floor((today - cur) / (1000 * 60 * 60 * 24));
        if (diffDays <= 7) {
          recentActivityList.push({
            date: dateKey,
            count: count,
            repo: repo,
            diffDays: diffDays,
            msg: `Implemented performance enhancements in ${repo}`
          });
        }
      }

      // Next day
      cur.setDate(cur.getDate() + 1);
    }

    recentActivityList.sort((a, b) => a.diffDays - b.diffDays);

    return { data, recentActivityList };
  }

  // ==========================================================================
  // 4. STORAGE / PERSISTENCE
  // ==========================================================================

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (e) {
      console.warn('Unable to persist to localStorage:', e);
    }
  }

  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          appState = Object.assign(appState, parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading from localStorage, initializing fresh state:', e);
    }

    // Ensure contributions exist for the current selected year
    const currentYear = appState.selectedYear || 2026;
    if (!appState.contributionsByYear[currentYear]) {
      const generated = generateDemoDataForYear(currentYear);
      appState.contributionsByYear[currentYear] = generated.data;
      if (!appState.recentActivity || appState.recentActivity.length === 0) {
        appState.recentActivity = generated.recentActivityList;
      }
    }

    // Apply saved theme
    if (appState.theme) {
      document.documentElement.setAttribute('data-theme', appState.theme);
      updateThemeButtonUI(appState.theme);
    }

    // Apply saved palette
    if (appState.palette) {
      document.documentElement.setAttribute('data-palette', appState.palette);
      const paletteSelect = document.getElementById('palette-select');
      if (paletteSelect) paletteSelect.value = appState.palette;
    }

    // Apply sound button UI
    updateSoundButtonUI(appState.soundEnabled);
  }

  // ==========================================================================
  // 5. TOAST NOTIFICATION SYSTEM
  // ==========================================================================

  function showToast(message, type = 'success', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'toast-error' : type === 'info' ? 'toast-info' : ''}`;
    toast.setAttribute('role', 'alert');

    const icon = type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '✅';

    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${message}</span>
      </div>
      <button type="button" class="toast-close-btn" aria-label="Dismiss toast">✕</button>
    `;

    const closeBtn = toast.querySelector('.toast-close-btn');
    closeBtn.addEventListener('click', () => {
      removeToast(toast);
    });

    container.appendChild(toast);

    // Trigger enter animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto dismiss
    const timer = setTimeout(() => {
      removeToast(toast);
    }, duration);

    function removeToast(el) {
      clearTimeout(timer);
      el.classList.remove('show');
      setTimeout(() => {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }
  }

  // ==========================================================================
  // 6. STATISTICS & CALCULATIONS
  // ==========================================================================

  function calculateStatistics(year) {
    const yearData = appState.contributionsByYear[year] || {};
    let totalContributions = 0;
    let activeDays = 0;
    let bestDayCount = 0;
    let bestDayDate = null;
    const reposSeen = new Set();
    const repoTotals = {};

    DEMO_REPOSITORIES.forEach(r => repoTotals[r] = 0);

    const sortedDates = Object.keys(yearData).sort();

    sortedDates.forEach(dateStr => {
      const item = yearData[dateStr];
      const count = (item && item.count) || 0;
      if (count > 0) {
        totalContributions += count;
        activeDays++;
        if (item.repo) {
          reposSeen.add(item.repo);
          repoTotals[item.repo] = (repoTotals[item.repo] || 0) + count;
        }

        if (count > bestDayCount) {
          bestDayCount = count;
          bestDayDate = dateStr;
        }
      }
    });

    const avgContributions = activeDays > 0 ? (totalContributions / activeDays).toFixed(1) : '0.0';

    // Calculate Longest Streak in this year
    let longestStreak = 0;
    let currentStreakCount = 0;

    sortedDates.forEach(dateStr => {
      const count = yearData[dateStr]?.count || 0;
      if (count > 0) {
        currentStreakCount++;
        if (currentStreakCount > longestStreak) {
          longestStreak = currentStreakCount;
        }
      } else {
        currentStreakCount = 0;
      }
    });

    // Calculate Current Streak ending today (simulated date or real date)
    const currentStreak = calculateCurrentStreak(yearData);

    return {
      totalContributions,
      activeDays,
      avgContributions,
      bestDayCount,
      bestDayDate,
      longestStreak,
      currentStreak,
      activeReposCount: reposSeen.size,
      repoTotals
    };
  }

  /**
   * Calculate current streak backwards from today
   */
  function calculateCurrentStreak(yearData) {
    const today = new Date(2026, 9, 7); // Oct 7, 2026
    let streak = 0;
    const checkDate = new Date(today);

    while (true) {
      const key = formatDateKey(checkDate);
      const entry = yearData[key];
      if (entry && entry.count > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate Developer Consistency Score (0 - 100)
   */
  function calculateConsistencyScore(stats, weeklyGoalProgress) {
    // 1. Active days ratio (weight 35)
    const totalDaysInYear = 365;
    const activeDaysRatio = Math.min(1, stats.activeDays / (totalDaysInYear * 0.6));
    const activeScore = activeDaysRatio * 35;

    // 2. Current streak factor (weight 35)
    const streakFactor = Math.min(1, stats.currentStreak / 15);
    const streakScore = streakFactor * 35;

    // 3. Weekly goal progress factor (weight 30)
    const goalRatio = Math.min(1, weeklyGoalProgress / 100);
    const goalScore = goalRatio * 30;

    const total = Math.round(activeScore + streakScore + goalScore);
    return Math.min(100, Math.max(5, total));
  }

  // ==========================================================================
  // 7. HEATMAP GENERATION & RENDERING
  // ==========================================================================

  function renderHeatmap() {
    const container = document.getElementById('heatmap-graph');
    if (!container) return;

    const year = appState.selectedYear;
    const yearData = appState.contributionsByYear[year] || {};
    const activeFilter = appState.activeIntensityFilter;
    const repoFilter = appState.selectedRepoFilter;

    // Determine calendar span: 53 weeks starting from Sunday on or before Jan 1
    const jan1 = new Date(year, 0, 1);
    const startOffset = jan1.getDay(); // 0 is Sunday
    const calendarStart = new Date(jan1);
    calendarStart.setDate(calendarStart.getDate() - startOffset);

    // Build weeks array (53 columns x 7 rows)
    const weeks = [];
    const walker = new Date(calendarStart);

    for (let w = 0; w < 53; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dateKey = formatDateKey(walker);
        const isInYear = walker.getFullYear() === year;
        const entry = isInYear ? (yearData[dateKey] || { count: 0, repo: null }) : { count: 0, repo: null };
        const level = getIntensityLevel(entry.count);

        weekDays.push({
          date: new Date(walker),
          dateKey: dateKey,
          count: entry.count,
          level: level,
          repo: entry.repo,
          note: entry.note,
          isInYear: isInYear
        });

        walker.setDate(walker.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    // Build Month Header
    let monthsHtml = '<div class="heatmap-months-row"><div class="heatmap-day-label"></div>';
    let currentMonth = -1;
    let colSpanCount = 0;
    const monthSegments = [];

    weeks.forEach((week, wIndex) => {
      // Look at the month of the first day or middle day
      const firstInYearDay = week.find(d => d.isInYear);
      if (firstInYearDay) {
        const m = firstInYearDay.date.getMonth();
        if (m !== currentMonth) {
          if (currentMonth !== -1) {
            monthSegments.push({ month: currentMonth, span: colSpanCount });
          }
          currentMonth = m;
          colSpanCount = 1;
        } else {
          colSpanCount++;
        }
      } else {
        colSpanCount++;
      }
    });

    if (currentMonth !== -1) {
      monthSegments.push({ month: currentMonth, span: colSpanCount });
    }

    monthSegments.forEach(seg => {
      const monthLabel = MONTH_NAMES[seg.month];
      monthsHtml += `<div class="heatmap-month-label" style="grid-column-end: span ${seg.span}">${monthLabel}</div>`;
    });
    monthsHtml += '</div>';

    // Build Heatmap Body
    let bodyHtml = '<div class="heatmap-body">';
    
    // Day of week labels on left (Mon, Wed, Fri)
    bodyHtml += `
      <div class="heatmap-days-col" aria-hidden="true">
        <div class="heatmap-day-label"></div>
        <div class="heatmap-day-label">Mon</div>
        <div class="heatmap-day-label"></div>
        <div class="heatmap-day-label">Wed</div>
        <div class="heatmap-day-label"></div>
        <div class="heatmap-day-label">Fri</div>
        <div class="heatmap-day-label"></div>
      </div>
    `;

    // Weeks columns
    bodyHtml += '<div class="heatmap-weeks">';

    weeks.forEach(week => {
      bodyHtml += '<div class="heatmap-week">';
      week.forEach(day => {
        const levelClass = `level-${day.level}`;
        
        // Intensity Filtering
        let filterClass = '';
        if (activeFilter !== 'all') {
          if (levelClass === activeFilter) {
            filterClass = 'filtered-match';
          } else {
            filterClass = 'filtered-dim';
          }
        }

        // Repo Filtering
        if (repoFilter) {
          if (day.repo === repoFilter) {
            filterClass = 'filtered-match';
          } else {
            filterClass = 'filtered-dim';
          }
        }

        const formattedDate = day.date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });

        const ariaDesc = day.count > 0 
          ? `${day.count} contributions on ${formattedDate}`
          : `No contributions on ${formattedDate}`;

        bodyHtml += `
          <button 
            type="button"
            class="contrib-cell ${levelClass} ${filterClass}" 
            data-date="${day.dateKey}"
            data-count="${day.count}"
            data-level="${day.level}"
            data-repo="${day.repo || ''}"
            data-formatted-date="${formattedDate}"
            aria-label="${ariaDesc}"
            ${!day.isInYear ? 'tabindex="-1" style="visibility: hidden;"' : ''}
          ></button>
        `;
      });
      bodyHtml += '</div>';
    });

    bodyHtml += '</div></div>';

    container.innerHTML = monthsHtml + bodyHtml;

    // Attach interaction handlers to cells
    attachHeatmapEvents();
  }

  // ==========================================================================
  // 8. HEATMAP INTERACTIONS (TOOLTIP & DETAIL MODAL)
  // ==========================================================================

  const tooltipEl = document.getElementById('heatmap-tooltip');

  function attachHeatmapEvents() {
    const cells = document.querySelectorAll('.contrib-cell');

    cells.forEach(cell => {
      cell.addEventListener('mouseenter', (e) => {
        handleCellHover(e);
        if (appState.paintMode && isMousePainting) {
          paintCell(cell);
        }
      });

      cell.addEventListener('mousedown', () => {
        if (appState.paintMode) {
          isMousePainting = true;
          paintCell(cell);
        }
      });

      cell.addEventListener('mouseleave', handleCellLeave);
      cell.addEventListener('focus', handleCellHover);
      cell.addEventListener('blur', handleCellLeave);
      cell.addEventListener('click', handleCellClick);
    });
  }

  function paintCell(cell) {
    const dateKey = cell.getAttribute('data-date');
    if (!dateKey) return;
    const year = parseInt(dateKey.substring(0, 4), 10);
    if (!appState.contributionsByYear[year]) {
      appState.contributionsByYear[year] = {};
    }

    const brushLevels = { 0: 0, 1: 2, 2: 5, 3: 8, 4: 12 };
    const commitCount = brushLevels[appState.paintBrush] !== undefined ? brushLevels[appState.paintBrush] : 12;
    const repo = appState.selectedRepoFilter || 'Green-Square-Lab';

    appState.contributionsByYear[year][dateKey] = {
      count: commitCount,
      repo: commitCount > 0 ? repo : null,
      note: commitCount > 0 ? `Custom painted ${commitCount} commits` : null
    };

    const level = getIntensityLevel(commitCount);
    cell.className = `contrib-cell level-${level} ${appState.activeIntensityFilter !== 'all' ? (appState.activeIntensityFilter === `level-${level}` ? 'filtered-match' : 'filtered-dim') : ''}`;
    cell.setAttribute('data-count', String(commitCount));
    cell.setAttribute('data-level', String(level));

    playCommitSound();
  }

  function handleCellHover(e) {
    const cell = e.currentTarget;
    const count = parseInt(cell.getAttribute('data-count'), 10) || 0;
    const formattedDate = cell.getAttribute('data-formatted-date') || '';
    const repo = cell.getAttribute('data-repo');

    let text = `<strong>${count > 0 ? count + ' contributions' : 'No contributions'}</strong> on ${formattedDate}`;
    if (repo && count > 0) {
      text += `<br><span style="color: #58a6ff; font-family: monospace; font-size: 0.7rem;">📦 ${repo}</span>`;
    }

    tooltipEl.innerHTML = text;
    tooltipEl.style.display = 'block';

    const rect = cell.getBoundingClientRect();
    const tooltipX = rect.left + rect.width / 2;
    const tooltipY = rect.top - 6;

    tooltipEl.style.left = `${tooltipX}px`;
    tooltipEl.style.top = `${tooltipY}px`;
  }

  function handleCellLeave() {
    tooltipEl.style.display = 'none';
  }

  function handleCellClick(e) {
    if (appState.paintMode) {
      // Handled by paintCell on mousedown
      return;
    }
    const cell = e.currentTarget;
    const dateKey = cell.getAttribute('data-date');
    if (!dateKey) return;

    modalActiveCellDate = dateKey;
    openContributionDetailModal(dateKey);
  }

  function openContributionDetailModal(dateKey) {
    const year = appState.selectedYear;
    const yearData = appState.contributionsByYear[year] || {};
    const item = yearData[dateKey] || { count: 0, repo: null };
    const dateObj = new Date(dateKey + 'T00:00:00');

    const formattedDate = dateObj.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const count = item.count || 0;
    const level = getIntensityLevel(count);

    const levelDescriptions = ['No Activity', 'Low Activity', 'Medium Activity', 'High Activity', 'Very High Activity'];

    // Update modal elements
    document.getElementById('modal-date').textContent = formattedDate;
    document.getElementById('modal-commit-count').textContent = count === 1 ? '1 contribution' : `${count} contributions`;
    document.getElementById('modal-level').textContent = levelDescriptions[level];
    document.getElementById('modal-repo').textContent = item.repo || (count > 0 ? 'Green-Square-Lab' : 'No repository active');
    document.getElementById('modal-day-name').textContent = dayName;

    // Update preview square color
    const previewSquare = document.getElementById('modal-preview-square');
    previewSquare.className = `preview-square contrib-cell level-${level}`;

    showModal('contrib-modal');
  }

  // ==========================================================================
  // 9. MODALS SYSTEM (ACCESSIBLE, NO BROWSER ALERTS)
  // ==========================================================================

  function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // Focus the close button or first interactive element
    const closeBtn = modal.querySelector('.modal-close-btn');
    if (closeBtn) closeBtn.focus();

    document.body.style.overflow = 'hidden';
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function initModals() {
    // Backdrop click to close & Escape key
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal.id);
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.show').forEach(modal => {
          closeModal(modal.id);
        });
      }
    });

    // Modal Close Buttons
    document.getElementById('modal-contrib-close')?.addEventListener('click', () => closeModal('contrib-modal'));
    document.getElementById('modal-contrib-done')?.addEventListener('click', () => closeModal('contrib-modal'));

    document.getElementById('modal-reset-close')?.addEventListener('click', () => closeModal('reset-modal'));
    document.getElementById('modal-reset-cancel')?.addEventListener('click', () => closeModal('reset-modal'));

    document.getElementById('modal-achieve-close')?.addEventListener('click', () => closeModal('achievement-modal'));
    document.getElementById('modal-achieve-done')?.addEventListener('click', () => closeModal('achievement-modal'));

    // Export Modal Close & Copy
    document.getElementById('modal-export-close')?.addEventListener('click', () => closeModal('export-modal'));
    document.getElementById('modal-export-close-btn')?.addEventListener('click', () => closeModal('export-modal'));
    document.getElementById('btn-copy-export')?.addEventListener('click', () => {
      const area = document.getElementById('export-textarea');
      if (area) {
        area.select();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(area.value).then(() => {
            showToast('Summary copied to clipboard! 📋', 'success');
          }).catch(() => {
            document.execCommand('copy');
            showToast('Summary copied to clipboard! 📋', 'success');
          });
        } else {
          document.execCommand('copy');
          showToast('Summary copied to clipboard! 📋', 'success');
        }
      }
    });

    // Quick Action in Contribution Modal: +1 Commit
    document.getElementById('btn-modal-add-one')?.addEventListener('click', () => {
      if (!modalActiveCellDate) return;
      addCommitsToDate(modalActiveCellDate, 1, 'Green-Square-Lab', 'Quick +1 commit');
      openContributionDetailModal(modalActiveCellDate);
      showToast('Added +1 commit to this day! 🟩');
    });

    // Reset Confirm Action
    document.getElementById('modal-reset-confirm')?.addEventListener('click', () => {
      resetDemoData();
      closeModal('reset-modal');
    });
  }

  // ==========================================================================
  // 10. STATISTICS & UI RENDERING
  // ==========================================================================

  function renderAllUI() {
    const year = appState.selectedYear;
    const stats = calculateStatistics(year);

    // 1. Hero 4 Dynamic Stats Cards
    const streakDays = stats.currentStreak;
    document.getElementById('stat-current-streak').textContent = `${streakDays} ${streakDays === 1 ? 'day' : 'days'}`;
    document.getElementById('stat-longest-streak').textContent = `${stats.longestStreak} days`;
    document.getElementById('stat-total-contributions').textContent = stats.totalContributions.toLocaleString();
    document.getElementById('stat-active-repos').textContent = stats.activeReposCount;
    document.getElementById('stat-year-indicator').textContent = `In year ${year}`;

    // Subtext for current streak
    const noteEl = document.getElementById('stat-current-streak-note');
    if (streakDays === 0) noteEl.textContent = 'Ready to begin';
    else if (streakDays <= 3) noteEl.textContent = 'Building momentum';
    else if (streakDays <= 7) noteEl.textContent = 'Solid daily habit';
    else noteEl.textContent = 'Unstoppable streak 🔥';

    // 2. Activity Summary Cards
    document.getElementById('sum-total-contributions').textContent = stats.totalContributions.toLocaleString();
    document.getElementById('sum-active-days').textContent = stats.activeDays;
    document.getElementById('sum-avg-contributions').textContent = stats.avgContributions;
    document.getElementById('sum-best-day-count').textContent = stats.bestDayCount > 0 ? `${stats.bestDayCount} commits` : '0';
    if (stats.bestDayDate) {
      const bestDateObj = new Date(stats.bestDayDate + 'T00:00:00');
      document.getElementById('sum-best-day-date').textContent = bestDateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      document.getElementById('sum-best-day-date').textContent = 'None yet';
    }
    document.getElementById('sum-longest-streak').textContent = `${stats.longestStreak} days`;

    // 3. Streak Mode Card
    document.getElementById('streak-big-display').textContent = streakDays;
    document.getElementById('streak-mode-current').textContent = `${streakDays} days`;
    document.getElementById('streak-mode-longest').textContent = `${stats.longestStreak} days`;

    // Streak Motivational Message
    const streakMsgEl = document.getElementById('streak-motivational-msg');
    if (streakDays === 0) {
      streakMsgEl.textContent = '"Bro, today is a good day to start."';
    } else if (streakDays >= 1 && streakDays <= 3) {
      streakMsgEl.textContent = '"Nice start. Keep going!"';
    } else if (streakDays >= 4 && streakDays <= 7) {
      streakMsgEl.textContent = '"You\'re building momentum. 🔥"';
    } else if (streakDays >= 8 && streakDays <= 14) {
      streakMsgEl.textContent = '"Serious green-square energy."';
    } else {
      streakMsgEl.textContent = '"Absolute commit machine. 🟩🔥"';
    }

    renderStreakTrail(year);

    // 4. Weekly Goal & Consistency Score
    renderWeeklyGoal(year, stats);

    // 5. Weekly Bar Chart
    renderWeeklyChart(year);

    // 6. Repositories Activity
    renderRepositories(stats);

    // 7. Recent Activity Timeline
    renderRecentActivity();

    // 8. Achievements
    renderAchievements(stats);

    // 9. Update Heatmap
    renderHeatmap();
  }

  /**
   * Render recent 14-day streak trail
   */
  function renderStreakTrail(year) {
    const container = document.getElementById('streak-trail-container');
    if (!container) return;

    const yearData = appState.contributionsByYear[year] || {};
    const today = new Date(2026, 9, 7); // Oct 7, 2026
    let html = '';

    for (let i = 13; i >= 0; i--) {
      const dayDate = new Date(today);
      dayDate.setDate(dayDate.getDate() - i);
      const key = formatDateKey(dayDate);
      const count = (yearData[key] && yearData[key].count) || 0;
      const isActive = count > 0;
      const dayLabel = DAY_LABELS[dayDate.getDay()];
      const dayNum = dayDate.getDate();

      html += `
        <div class="trail-day-bubble ${isActive ? 'active' : 'inactive'}" title="${key}: ${count} commits">
          <span class="trail-day-name">${dayLabel}</span>
          <span class="trail-day-num">${isActive ? '✓' : dayNum}</span>
        </div>
      `;
    }

    container.innerHTML = html;
  }

  /**
   * Render weekly commit goal progress and consistency score
   */
  function renderWeeklyGoal(year, stats) {
    const yearData = appState.contributionsByYear[year] || {};
    const goal = appState.weeklyGoal || 20;

    // Calculate current week commits (from current week's Monday through Sunday)
    const today = new Date(2026, 9, 7); // Oct 7, 2026 is Wednesday
    const dayOfWeek = today.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(monday.getDate() - distanceToMonday);

    let weeklyCommits = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const key = formatDateKey(d);
      if (yearData[key]) {
        weeklyCommits += yearData[key].count || 0;
      }
    }

    const percent = Math.min(100, Math.round((weeklyCommits / goal) * 100));

    document.getElementById('goal-input').value = goal;
    document.getElementById('goal-target-display').textContent = `${goal} commits`;
    document.getElementById('goal-current-display').textContent = `${weeklyCommits} commits`;
    document.getElementById('goal-percent-display').textContent = `${percent}%`;

    const progressFill = document.getElementById('goal-progress-fill');
    progressFill.style.width = `${percent}%`;

    const statusText = document.getElementById('goal-status-text');
    const statusIcon = document.getElementById('goal-status-icon');

    if (weeklyCommits >= goal) {
      statusIcon.textContent = '🎉';
      statusText.textContent = 'Goal completed! 🎉';
      statusText.style.color = 'var(--contrib-4)';
    } else {
      const diff = goal - weeklyCommits;
      statusIcon.textContent = '⏳';
      statusText.textContent = `${diff} ${diff === 1 ? 'commit' : 'commits'} to go`;
      statusText.style.color = 'var(--text-secondary)';
    }

    // Consistency Score
    const score = calculateConsistencyScore(stats, percent);
    document.getElementById('consistency-score-num').textContent = score;

    const consistencyStatus = document.getElementById('consistency-status-text');
    if (score >= 80) {
      consistencyStatus.textContent = '"Your consistency is looking elite. 🔥"';
    } else if (score >= 60) {
      consistencyStatus.textContent = '"Your consistency is looking good. 🔥"';
    } else if (score >= 40) {
      consistencyStatus.textContent = '"Steady pace. Keep pushing for more green! 🟩"';
    } else {
      consistencyStatus.textContent = '"Consistency takes practice. Start today! 🌱"';
    }
  }

  /**
   * Render pure HTML/CSS/JS 7-day Bar Chart
   */
  function renderWeeklyChart(year) {
    const container = document.getElementById('weekly-bar-chart');
    if (!container) return;

    const yearData = appState.contributionsByYear[year] || {};
    const today = new Date(2026, 9, 7); // Oct 7, 2026
    const daysData = [];

    let maxVal = 1;
    let totalCommits = 0;

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = formatDateKey(d);
      const count = (yearData[key] && yearData[key].count) || 0;
      if (count > maxVal) maxVal = count;
      totalCommits += count;

      daysData.push({
        dateKey: key,
        dayName: DAY_LABELS[d.getDay()],
        count: count
      });
    }

    let html = '';
    daysData.forEach(item => {
      const heightPercent = item.count > 0 ? Math.max(12, Math.round((item.count / maxVal) * 100)) : 4;
      html += `
        <div class="chart-bar-column" title="${item.dateKey}: ${item.count} commits">
          <div class="bar-count-label">${item.count}</div>
          <div class="bar-track">
            <div class="bar-fill" style="height: ${heightPercent}%;"></div>
          </div>
          <div class="bar-day-name">${item.dayName}</div>
        </div>
      `;
    });

    container.innerHTML = html;

    document.getElementById('chart-total-label').innerHTML = `Total in last 7 days: <strong>${totalCommits} commits</strong>`;
    document.getElementById('chart-peak-label').innerHTML = `Peak: <strong>${maxVal} commits</strong>`;
  }

  /**
   * Render repository activity cards
   */
  function renderRepositories(stats) {
    const container = document.getElementById('repo-list-container');
    if (!container) return;

    const repoTotals = stats.repoTotals || {};
    let html = '';

    DEMO_REPOSITORIES.forEach(repoName => {
      const count = repoTotals[repoName] || 0;
      let levelTag = 'low';
      let levelLabel = 'Low Activity';

      if (count >= 150) {
        levelTag = 'high';
        levelLabel = 'High Activity';
      } else if (count >= 50) {
        levelTag = 'medium';
        levelLabel = 'Medium Activity';
      }

      const isSelected = appState.selectedRepoFilter === repoName;

      html += `
        <div class="repo-item ${isSelected ? 'active' : ''}" data-repo="${repoName}">
          <div class="repo-meta-left">
            <span class="repo-icon">📦</span>
            <div>
              <div class="repo-name">${repoName}</div>
              <div class="repo-commits-pill">${count.toLocaleString()} commits</div>
            </div>
          </div>
          <div class="repo-meta-right">
            <span class="repo-level-tag ${levelTag}">${levelLabel}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Filter indicator
    const indicatorName = document.getElementById('repo-filter-name');
    const clearBtn = document.getElementById('btn-clear-repo-filter');

    if (appState.selectedRepoFilter) {
      indicatorName.textContent = `Filtered: ${appState.selectedRepoFilter}`;
      clearBtn.style.display = 'inline-block';
    } else {
      indicatorName.textContent = 'All Repos';
      clearBtn.style.display = 'none';
    }

    // Attach click events to repos for filtering
    container.querySelectorAll('.repo-item').forEach(item => {
      item.addEventListener('click', () => {
        const targetRepo = item.getAttribute('data-repo');
        if (appState.selectedRepoFilter === targetRepo) {
          appState.selectedRepoFilter = null;
          showToast(`Cleared filter for ${targetRepo}`, 'info');
        } else {
          appState.selectedRepoFilter = targetRepo;
          showToast(`Filtered heatmap by repository: ${targetRepo}`, 'info');
        }
        saveState();
        renderHeatmap();
        renderRepositories(stats);
      });
    });
  }

  /**
   * Render Recent Activity stream
   */
  function renderRecentActivity() {
    const container = document.getElementById('recent-timeline');
    if (!container) return;

    const activities = appState.recentActivity || [];

    if (activities.length === 0) {
      container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; padding: 12px;">No recent contribution events recorded.</div>';
      return;
    }

    let html = '';
    activities.slice(0, 8).forEach(act => {
      let relativeTime = 'Today';
      if (act.diffDays === 1) relativeTime = 'Yesterday';
      else if (act.diffDays > 1) relativeTime = `${act.diffDays} days ago`;
      else if (act.diffDays < 0) relativeTime = 'Upcoming';

      html += `
        <div class="timeline-item">
          <div class="timeline-marker">🟩</div>
          <div class="timeline-content">
            <div class="timeline-header-line">
              <span class="timeline-action">Added ${act.count} contributions</span>
              <span class="timeline-time">${relativeTime}</span>
            </div>
            <div class="timeline-repo">📦 ${act.repo}</div>
            ${act.msg ? `<div class="timeline-msg">"${act.msg}"</div>` : ''}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  /**
   * Render Achievements Grid
   */
  function renderAchievements(stats) {
    const container = document.getElementById('achievements-grid');
    if (!container) return;

    let unlockedCount = 0;
    let html = '';

    ACHIEVEMENTS_DEF.forEach(achieve => {
      const isUnlocked = achieve.check(stats);
      if (isUnlocked) unlockedCount++;

      html += `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}" data-achieve-id="${achieve.id}">
          <div class="achieve-icon">${achieve.icon}</div>
          <div class="achieve-info">
            <div class="achieve-title">${achieve.name}</div>
            <div class="achieve-desc">${achieve.desc}</div>
            <span class="achieve-state-pill">${isUnlocked ? '✓ Unlocked' : '🔒 Locked'}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    document.getElementById('achievements-unlocked-badge').textContent = `${unlockedCount} / ${ACHIEVEMENTS_DEF.length} Unlocked`;

    // Click to open Achievement detail modal
    container.querySelectorAll('.achievement-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-achieve-id');
        const achieve = ACHIEVEMENTS_DEF.find(a => a.id === id);
        if (!achieve) return;

        const isUnlocked = achieve.check(stats);
        document.getElementById('modal-achieve-icon').textContent = achieve.icon;
        document.getElementById('modal-achieve-giant-icon').textContent = achieve.icon;
        document.getElementById('modal-achieve-name').textContent = achieve.name;
        document.getElementById('modal-achieve-desc').textContent = achieve.desc;
        document.getElementById('modal-achieve-status').textContent = isUnlocked ? 'Unlocked 🎉' : 'In Progress ⏳';
        document.getElementById('modal-achieve-progress-text').textContent = achieve.current(stats);

        const progressPercent = achieve.progress(stats);
        document.getElementById('modal-achieve-progress-fill').style.width = `${progressPercent}%`;

        showModal('achievement-modal');
      });
    });
  }

  // ==========================================================================
  // 11. USER ACTIONS (ADD CONTRIBUTION, GENERATE, RESET)
  // ==========================================================================

  function addCommitsToDate(dateKey, commitsToAdd, repoName, noteMessage) {
    const year = parseInt(dateKey.substring(0, 4), 10);
    if (!appState.contributionsByYear[year]) {
      const generated = generateDemoDataForYear(year);
      appState.contributionsByYear[year] = generated.data;
    }

    const currentEntry = appState.contributionsByYear[year][dateKey] || { count: 0, repo: repoName };
    const newCount = (currentEntry.count || 0) + commitsToAdd;

    appState.contributionsByYear[year][dateKey] = {
      count: newCount,
      repo: repoName || currentEntry.repo || 'Green-Square-Lab',
      note: noteMessage || currentEntry.note
    };

    // Calculate diff from today for timeline
    const today = new Date(2026, 9, 7);
    const targetDate = new Date(dateKey + 'T00:00:00');
    const diffDays = Math.floor((today - targetDate) / (1000 * 60 * 60 * 24));

    // Prepend to recent activities
    appState.recentActivity.unshift({
      date: dateKey,
      count: commitsToAdd,
      repo: repoName,
      diffDays: diffDays,
      msg: noteMessage || `Commit pushed to ${repoName}`
    });

    saveState();
    renderAllUI();
  }

  function handleAddContributionForm(e) {
    e.preventDefault();

    const dateInput = document.getElementById('contrib-date');
    const countInput = document.getElementById('contrib-count');
    const repoInput = document.getElementById('contrib-repo');
    const messageInput = document.getElementById('contrib-message');

    const dateVal = dateInput.value;
    const countVal = parseInt(countInput.value, 10);
    const repoVal = repoInput.value;
    const msgVal = messageInput.value.trim();

    // Validation
    if (!dateVal) {
      showToast('Please select a valid date.', 'error');
      dateInput.focus();
      return;
    }

    if (isNaN(countVal) || countVal < 1 || countVal > 50) {
      showToast('Commits count must be between 1 and 50.', 'error');
      countInput.focus();
      return;
    }

    if (!repoVal) {
      showToast('Please select a repository.', 'error');
      repoInput.focus();
      return;
    }

    addCommitsToDate(dateVal, countVal, repoVal, msgVal);

    showToast(`Added ${countVal} contributions to ${dateVal}! 🟩`, 'success');

    // Reset message
    messageInput.value = '';
  }

  function generateNewDemoActivity() {
    const year = appState.selectedYear;
    // Generate fresh randomized seed
    const newSeed = Math.floor(Math.random() * 900000) + 100000;
    const generated = generateDemoDataForYear(year, newSeed);

    appState.contributionsByYear[year] = generated.data;
    appState.recentActivity = generated.recentActivityList;

    saveState();
    renderAllUI();

    showToast('New activity generated! 🟩', 'success');
  }

  function resetDemoData() {
    const year = appState.selectedYear;
    const initialGenerated = generateDemoDataForYear(year, year * 997 + 104729);

    appState.contributionsByYear[year] = initialGenerated.data;
    appState.recentActivity = initialGenerated.recentActivityList;
    appState.selectedRepoFilter = null;
    appState.activeIntensityFilter = 'all';

    // Reset filter UI dropdown and chips
    document.getElementById('filter-select').value = 'all';
    document.querySelectorAll('.chip').forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-filter') === 'all');
    });

    saveState();
    renderAllUI();

    showToast('Demo data restored! 🔄', 'info');
  }

  // ==========================================================================
  // 12. THEME, PALETTE, SOUND & PAINTER LOGIC
  // ==========================================================================

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    appState.theme = newTheme;
    saveState();
    updateThemeButtonUI(newTheme);

    showToast(`Theme switched to ${newTheme.toUpperCase()}`, 'info');
  }

  function updateThemeButtonUI(theme) {
    const icon = document.querySelector('.theme-icon');
    const label = document.querySelector('.theme-label');
    if (!icon || !label) return;

    if (theme === 'light') {
      icon.textContent = '☀️';
      label.textContent = 'Light';
    } else {
      icon.textContent = '🌙';
      label.textContent = 'Dark';
    }
  }

  function setPalette(paletteName) {
    if (!paletteName) return;
    document.documentElement.setAttribute('data-palette', paletteName);
    appState.palette = paletteName;
    saveState();
    renderHeatmap();
    showToast(`Palette changed to ${paletteName.toUpperCase()} 🎨`, 'info');
  }

  function toggleSound() {
    appState.soundEnabled = !appState.soundEnabled;
    saveState();
    updateSoundButtonUI(appState.soundEnabled);
    if (appState.soundEnabled) {
      playCommitSound();
      showToast('Sound effects ON 🔊', 'info');
    } else {
      showToast('Sound effects muted 🔇', 'info');
    }
  }

  function updateSoundButtonUI(enabled) {
    const icon = document.querySelector('.sound-icon');
    const label = document.querySelector('.sound-label');
    if (!icon || !label) return;
    icon.textContent = enabled ? '🔊' : '🔇';
    label.textContent = enabled ? 'Sound' : 'Mute';
  }

  function togglePaintMode() {
    appState.paintMode = !appState.paintMode;
    const btn = document.getElementById('btn-toggle-paint');
    const label = document.getElementById('paint-label');
    const brushSelector = document.getElementById('brush-selector');

    if (appState.paintMode) {
      document.body.classList.add('paint-mode-active');
      btn.classList.add('btn-primary');
      btn.classList.remove('btn-secondary');
      label.textContent = 'Square Painter: ON';
      brushSelector.style.display = 'flex';
      showToast('Painter Mode active: Click & drag over squares to draw! 🖌️', 'success');
    } else {
      document.body.classList.remove('paint-mode-active');
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
      label.textContent = 'Square Painter: OFF';
      brushSelector.style.display = 'none';
      saveState();
      renderAllUI();
      showToast('Painter Mode OFF', 'info');
    }
  }

  function setBrush(level) {
    appState.paintBrush = level;
    document.querySelectorAll('.brush-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-brush'), 10) === level);
    });
    playCommitSound();
  }

  function applyPresetArt(pattern) {
    if (!pattern) return;
    const year = appState.selectedYear;
    if (!appState.contributionsByYear[year]) {
      const generated = generateDemoDataForYear(year);
      appState.contributionsByYear[year] = generated.data;
    }

    const yearData = appState.contributionsByYear[year];
    const jan1 = new Date(year, 0, 1);
    const startOffset = jan1.getDay();
    const calendarStart = new Date(jan1);
    calendarStart.setDate(calendarStart.getDate() - startOffset);

    // Build grid mapping: (week 0..52, day 0..6) -> dateKey
    const gridMap = {};
    const walker = new Date(calendarStart);

    for (let w = 0; w < 53; w++) {
      for (let d = 0; d < 7; d++) {
        const key = formatDateKey(walker);
        if (walker.getFullYear() === year) {
          gridMap[`${w},${d}`] = key;
        }
        walker.setDate(walker.getDate() + 1);
      }
    }

    if (pattern === 'solid') {
      Object.values(gridMap).forEach(key => {
        yearData[key] = { count: 12, repo: 'Green-Square-Lab', note: 'Max Wall pattern' };
      });
    } else if (pattern === 'checker') {
      for (let w = 0; w < 53; w++) {
        for (let d = 0; d < 7; d++) {
          const key = gridMap[`${w},${d}`];
          if (!key) continue;
          if ((w + d) % 2 === 0) {
            yearData[key] = { count: 8, repo: 'Commit-Tracker', note: 'Checkerboard pattern' };
          } else {
            yearData[key] = { count: 0, repo: null };
          }
        }
      }
    } else if (pattern === 'wave') {
      for (let w = 0; w < 53; w++) {
        const waveDay = Math.round(3 + 2.5 * Math.sin(w / 3));
        for (let d = 0; d < 7; d++) {
          const key = gridMap[`${w},${d}`];
          if (!key) continue;
          if (d === waveDay || d === waveDay - 1) {
            yearData[key] = { count: 10, repo: 'Code-Streak', note: 'Wave pattern' };
          } else {
            yearData[key] = { count: 0, repo: null };
          }
        }
      }
    } else if (pattern === 'heart') {
      const heartPoints = [
        [24, 1], [25, 1], [27, 1], [28, 1],
        [23, 2], [24, 2], [25, 2], [26, 2], [27, 2], [28, 2], [29, 2],
        [23, 3], [24, 3], [25, 3], [26, 3], [27, 3], [28, 3], [29, 3],
        [24, 4], [25, 4], [26, 4], [27, 4], [28, 4],
        [25, 5], [26, 5], [27, 5],
        [26, 6]
      ];
      Object.values(gridMap).forEach(key => {
        yearData[key] = { count: 0, repo: null };
      });
      heartPoints.forEach(([w, d]) => {
        const key = gridMap[`${w},${d}`];
        if (key) {
          yearData[key] = { count: 12, repo: 'Dev-Journal', note: 'Heart Pixel Art' };
        }
      });
    } else if (pattern === 'git') {
      Object.values(gridMap).forEach(key => {
        yearData[key] = { count: 0, repo: null };
      });
      const gPoints = [
        [18, 1], [19, 1], [20, 1], [21, 1],
        [18, 2],
        [18, 3], [20, 3], [21, 3],
        [18, 4], [21, 4],
        [18, 5], [19, 5], [20, 5], [21, 5]
      ];
      const iPoints = [
        [23, 1], [24, 1], [25, 1],
        [24, 2],
        [24, 3],
        [24, 4],
        [23, 5], [24, 5], [25, 5]
      ];
      const tPoints = [
        [27, 1], [28, 1], [29, 1], [30, 1],
        [28, 2], [29, 2],
        [28, 3], [29, 3],
        [28, 4], [29, 4],
        [28, 5], [29, 5]
      ];
      [...gPoints, ...iPoints, ...tPoints].forEach(([w, d]) => {
        const key = gridMap[`${w},${d}`];
        if (key) {
          yearData[key] = { count: 12, repo: 'Green-Square-Lab', note: 'GIT Text Art' };
        }
      });
    }

    playSuccessSound();
    saveState();
    renderAllUI();
    showToast(`Pattern "${pattern.toUpperCase()}" applied to calendar! 🎨`, 'success');
  }

  function toggleLiveStream() {
    const btn = document.getElementById('btn-live-stream');
    if (liveStreamInterval) {
      clearInterval(liveStreamInterval);
      liveStreamInterval = null;
      btn.classList.remove('btn-live-active');
      btn.innerHTML = '<span>▶️ Live Stream</span>';
      showToast('Live commit simulation paused', 'info');
    } else {
      btn.classList.add('btn-live-active');
      btn.innerHTML = '<span>⏹️ Stop Stream</span>';
      showToast('Live commit stream active! 🔥', 'success');

      liveStreamInterval = setInterval(() => {
        const todayKey = '2026-10-07';
        const randomCommits = Math.floor(Math.random() * 3) + 1;
        const randomRepo = DEMO_REPOSITORIES[Math.floor(Math.random() * DEMO_REPOSITORIES.length)];
        const commitMsgs = [
          'fix(core): memory leak in worker thread',
          'feat(ui): add glassmorphic card hover',
          'docs: update API endpoints table',
          'perf: optimize virtual DOM diffing',
          'refactor: cleaner async task pipeline'
        ];
        const randomMsg = commitMsgs[Math.floor(Math.random() * commitMsgs.length)];

        addCommitsToDate(todayKey, randomCommits, randomRepo, randomMsg);
        playCommitSound();
      }, 2400);
    }
  }

  function openExportModal() {
    const year = appState.selectedYear;
    const stats = calculateStatistics(year);
    const score = document.getElementById('consistency-score-num')?.textContent || '85';

    const text = `### 🟩 GitHub Green Squares Ka Junoon — Activity Summary
**Year:** ${year}
- 🔥 **Current Streak:** ${stats.currentStreak} days
- 🏆 **Longest Streak:** ${stats.longestStreak} days
- 💚 **Total Contributions:** ${stats.totalContributions.toLocaleString()} commits
- 📦 **Active Repositories:** ${stats.activeReposCount} repos
- ⚡ **Consistency Score:** ${score} / 100

*Simulated with GitHub Green Squares Ka Junoon*
*"Commit karo. Green squares banao. Streak maintain karo. 🔥"*`;

    const area = document.getElementById('export-textarea');
    if (area) area.value = text;
    showModal('export-modal');
  }

  function cycleMotivationalQuote() {
    const quoteEl = document.getElementById('motivational-quote');
    const cornerQuoteEl = document.getElementById('corner-quote-text');

    const randomIdx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    const chosen = MOTIVATIONAL_QUOTES[randomIdx];

    if (quoteEl) {
      quoteEl.style.opacity = '0';
      setTimeout(() => {
        quoteEl.textContent = `"${chosen}"`;
        quoteEl.style.opacity = '1';
      }, 150);
    }

    if (cornerQuoteEl) {
      cornerQuoteEl.textContent = chosen;
    }
  }

  // ==========================================================================
  // 13. INITIALIZATION & EVENT LISTENERS
  // ==========================================================================

  function initApp() {
    // 1. Load saved state from LocalStorage
    loadState();

    // 2. Default form date to today (2026-10-07)
    const dateInput = document.getElementById('contrib-date');
    if (dateInput) {
      dateInput.value = '2026-10-07';
      dateInput.min = `${appState.selectedYear}-01-01`;
      dateInput.max = `${appState.selectedYear}-12-31`;
    }

    // 3. Set Year Select dropdown
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
      yearSelect.value = String(appState.selectedYear);
      yearSelect.addEventListener('change', (e) => {
        const newYear = parseInt(e.target.value, 10);
        appState.selectedYear = newYear;

        // Ensure target year has data
        if (!appState.contributionsByYear[newYear]) {
          const gen = generateDemoDataForYear(newYear);
          appState.contributionsByYear[newYear] = gen.data;
        }

        if (dateInput) {
          dateInput.min = `${newYear}-01-01`;
          dateInput.max = `${newYear}-12-31`;
          dateInput.value = `${newYear}-05-15`;
        }

        saveState();
        renderAllUI();
        showToast(`Loaded ${newYear} sample contribution data`, 'info');
      });
    }

    // Palette dropdown
    const paletteSelect = document.getElementById('palette-select');
    if (paletteSelect) {
      paletteSelect.value = appState.palette || 'emerald';
      paletteSelect.addEventListener('change', (e) => {
        setPalette(e.target.value);
      });
    }

    // Preset Art dropdown
    const presetArtSelect = document.getElementById('preset-art-select');
    if (presetArtSelect) {
      presetArtSelect.addEventListener('change', (e) => {
        applyPresetArt(e.target.value);
        e.target.value = '';
      });
    }

    // 4. Intensity Filter Select dropdown
    const filterSelect = document.getElementById('filter-select');
    if (filterSelect) {
      filterSelect.value = appState.activeIntensityFilter || 'all';
      filterSelect.addEventListener('change', (e) => {
        applyFilter(e.target.value);
      });
    }

    // Filter Chips
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filterVal = chip.getAttribute('data-filter');
        applyFilter(filterVal);
      });
    });

    function applyFilter(filterVal) {
      appState.activeIntensityFilter = filterVal;
      if (filterSelect) filterSelect.value = filterVal;

      chips.forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-filter') === filterVal);
      });

      saveState();
      renderHeatmap();
    }

    // 5. Action Buttons (Generate, Reset, Live Stream, Painter, Export)
    document.getElementById('btn-generate-activity')?.addEventListener('click', generateNewDemoActivity);
    document.getElementById('btn-reset-data')?.addEventListener('click', () => {
      showModal('reset-modal');
    });

    document.getElementById('btn-live-stream')?.addEventListener('click', toggleLiveStream);
    document.getElementById('btn-toggle-paint')?.addEventListener('click', togglePaintMode);
    document.getElementById('btn-export-summary')?.addEventListener('click', openExportModal);

    // Brush buttons
    document.querySelectorAll('.brush-btn').forEach(b => {
      b.addEventListener('click', () => {
        const level = parseInt(b.getAttribute('data-brush'), 10);
        setBrush(level);
      });
    });

    // Window mouseup to end drag painting
    window.addEventListener('mouseup', () => {
      if (isMousePainting) {
        isMousePainting = false;
        saveState();
        renderAllUI();
      }
    });

    // 6. Clear Repo Filter Button
    document.getElementById('btn-clear-repo-filter')?.addEventListener('click', () => {
      appState.selectedRepoFilter = null;
      saveState();
      renderAllUI();
      showToast('All repositories active', 'info');
    });

    // 7. Add Contribution Form Submit & Steppers
    document.getElementById('add-contribution-form')?.addEventListener('submit', handleAddContributionForm);

    document.getElementById('btn-count-sub')?.addEventListener('click', () => {
      const countInput = document.getElementById('contrib-count');
      const cur = parseInt(countInput.value, 10) || 1;
      if (cur > 1) countInput.value = cur - 1;
    });

    document.getElementById('btn-count-add')?.addEventListener('click', () => {
      const countInput = document.getElementById('contrib-count');
      const cur = parseInt(countInput.value, 10) || 1;
      if (cur < 50) countInput.value = cur + 1;
    });

    // 8. Weekly Goal Stepper
    document.getElementById('btn-goal-minus')?.addEventListener('click', () => {
      const input = document.getElementById('goal-input');
      const cur = parseInt(input.value, 10) || 20;
      if (cur > 5) {
        appState.weeklyGoal = cur - 5;
        saveState();
        renderAllUI();
        showToast(`Weekly goal updated to ${appState.weeklyGoal} commits`, 'info');
      }
    });

    document.getElementById('btn-goal-plus')?.addEventListener('click', () => {
      const input = document.getElementById('goal-input');
      const cur = parseInt(input.value, 10) || 20;
      if (cur < 100) {
        appState.weeklyGoal = cur + 5;
        saveState();
        renderAllUI();
        showToast(`Weekly goal updated to ${appState.weeklyGoal} commits`, 'info');
      }
    });

    document.getElementById('goal-input')?.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 5 && val <= 100) {
        appState.weeklyGoal = val;
        saveState();
        renderAllUI();
        showToast(`Weekly goal set to ${val} commits`, 'info');
      }
    });

    // 9. Motivational Quote Buttons
    document.getElementById('btn-motivate')?.addEventListener('click', cycleMotivationalQuote);
    document.getElementById('btn-next-quote')?.addEventListener('click', cycleMotivationalQuote);

    // 10. Theme & Sound Toggles
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.getElementById('sound-toggle')?.addEventListener('click', toggleSound);

    // 11. Navigation Smooth Scroll & Active Indicator
    const navLinks = document.querySelectorAll('.nav-link');
    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + 100;
      document.querySelectorAll('section[id]').forEach(sec => {
        if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
          const id = sec.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    });

    // 12. Modals Setup
    initModals();

    // 13. Render Initial State
    renderAllUI();

    // Scroll heatmap horizontally so modern recent weeks are in view on desktop
    const scrollArea = document.getElementById('heatmap-scroll-area');
    if (scrollArea) {
      setTimeout(() => {
        scrollArea.scrollLeft = scrollArea.scrollWidth;
      }, 100);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
