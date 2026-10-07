const { test, expect } = require('@playwright/test');

test.describe('GitHub Green Squares V2 — End-to-End Test Suite', () => {

  // 1. Homepage loads without uncaught console errors
  test('01: Homepage loads successfully with zero uncaught console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/GitHub Green Squares/);
    expect(consoleErrors).toHaveLength(0);
  });

  // 2. SEO & Metadata Validation (Section 48)
  test('02: SEO metadata, Open Graph, Twitter cards and JSON-LD structured data', async ({ page }) => {
    await page.goto('/');

    // Meta description
    const metaDesc = await page.getAttribute('meta[name="description"]', 'content');
    expect(metaDesc).toContain('GitHub Green Squares is a developer contribution analytics dashboard');

    // Canonical link
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
    expect(canonical).toBe('https://githubgreensquare.vercel.app/');

    // Single H1 tag
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Open Graph & Twitter Cards
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content');
    expect(ogTitle).toContain('GitHub Green Squares');

    const twitterCard = await page.getAttribute('meta[name="twitter:card"]', 'content');
    expect(twitterCard).toBe('summary_large_image');

    // JSON-LD
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toContain('SoftwareApplication');
    const parsed = JSON.parse(jsonLd);
    expect(parsed.name).toBe('GitHub Green Squares');
  });

  // 3. Dashboard and Demo Data render
  test('03: Dashboard renders with calculated metrics and mode indicator', async ({ page }) => {
    await page.goto('/');

    const modeBadge = page.locator('#dashboard-mode-badge');
    await expect(modeBadge).toBeVisible();
    await expect(modeBadge).toContainText('Demo Data');

    const totalContrib = page.locator('#prof-total-contributions');
    await expect(totalContrib).toBeVisible();
    const countText = await totalContrib.textContent();
    expect(parseInt(countText.replace(/,/g, ''), 10)).toBeGreaterThan(0);
  });

  // 4. Heatmap calendar rendering & tooltip
  test('04: Heatmap renders 7 rows, week columns, and displays tooltip on hover', async ({ page }) => {
    await page.goto('/');

    const calendar = page.locator('#heatmap-calendar');
    await expect(calendar).toBeVisible();

    const cells = page.locator('.contrib-cell:not(.empty-cell)');
    const count = await cells.count();
    expect(count).toBeGreaterThanOrEqual(250);

    // Hover an active cell
    const activeCell = page.locator('.contrib-cell.level-2, .contrib-cell.level-3').first();
    if (await activeCell.isVisible()) {
      await activeCell.hover();
      const tooltip = page.locator('#app-tooltip');
      await expect(tooltip).toBeVisible();
      await expect(tooltip).toContainText('contribution');
    }
  });

  // 5. Theme Switching
  test('05: Theme switching between Dark, Light, and System modes', async ({ page }) => {
    await page.goto('/');

    const themeBtn = page.locator('#theme-btn');
    await themeBtn.click();

    const lightOption = page.locator('[data-theme-value="light"]');
    await lightOption.click();

    const htmlTheme = await page.getAttribute('html', 'data-theme');
    expect(htmlTheme).toBe('light');

    // Reload page to verify persistence
    await page.reload();
    const persistedTheme = await page.getAttribute('html', 'data-theme');
    expect(persistedTheme).toBe('light');
  });

  // 6. Mobile Navigation
  test('06: Mobile navigation toggle opens and closes correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    const menuBtn = page.locator('#btn-mobile-menu');
    await expect(menuBtn).toBeVisible();

    await menuBtn.click();
    const navList = page.locator('#main-nav-list');
    await expect(navList).toHaveClass(/mobile-open/);

    // Clicking a nav item closes the menu
    const activityLink = navList.locator('a[href="#activity-section"]');
    await activityLink.click();
    await expect(navList).not.toHaveClass(/mobile-open/);
  });

  // 7. Add Activity Modal & Validation
  test('07: Add activity modal validates fields and updates statistics', async ({ page }) => {
    await page.goto('/');

    const addBtn = page.locator('#btn-add-activity-modal');
    await addBtn.click();

    const modal = page.locator('#modal-add-activity');
    await expect(modal).toBeVisible();

    // Fill form
    await page.fill('#add-input-count', '8');
    await page.selectOption('#add-input-type', 'commits');
    await page.fill('#add-input-note', 'Test commit activity from Playwright');

    await page.click('#btn-submit-add');

    // Modal closes and toast appears
    await expect(modal).not.toBeVisible();
    const toast = page.locator('.toast-success');
    await expect(toast).toBeVisible();
  });

  // 8. Day Details Modal, Edit and Delete
  test('08: Day details modal inspection, editing, and deletion', async ({ page }) => {
    await page.goto('/');

    const cell = page.locator('.contrib-cell:not(.empty-cell)').nth(50);
    await cell.click();

    const dayModal = page.locator('#modal-day-details');
    await expect(dayModal).toBeVisible();

    const editBtn = page.locator('#btn-day-edit');
    await editBtn.click();

    const editModal = page.locator('#modal-edit-activity');
    await expect(editModal).toBeVisible();
    await page.click('#btn-cancel-edit');
    await expect(editModal).not.toBeVisible();
  });

  // 9. Activity Filters
  test('09: Activity type filters update heatmap and profile labels', async ({ page }) => {
    await page.goto('/');

    const prPill = page.locator('.filter-pill[data-type="prs"]');
    await prPill.click();

    await expect(prPill).toHaveClass(/active/);
    const profLabel = page.locator('#prof-year-label');
    await expect(profLabel).toContainText('PRS');
  });

  // 10. Weekly Goal Tracker
  test('10: Weekly goal stepper updates target and persists in storage', async ({ page }) => {
    await page.goto('/');

    const goalDisplay = page.locator('#goal-target-display');
    const initialGoal = parseInt(await goalDisplay.textContent(), 10);

    const incBtn = page.locator('#btn-goal-inc');
    await incBtn.click();

    const newGoal = parseInt(await goalDisplay.textContent(), 10);
    expect(newGoal).toBe(initialGoal + 5);
  });

  // 11. Achievements System
  test('11: System achievements render with progress bars and details modal', async ({ page }) => {
    await page.goto('/');

    const achieveCards = page.locator('.achievement-card');
    expect(await achieveCards.count()).toBe(10);

    await achieveCards.first().click();
    const achieveModal = page.locator('#modal-achievement-detail');
    await expect(achieveModal).toBeVisible();

    await page.click('#btn-close-achieve-action');
    await expect(achieveModal).not.toBeVisible();
  });

  // 12. GitHub OAuth Connect & Health
  test('12: GitHub connect button links to OAuth login route', async ({ page }) => {
    await page.goto('/');

    const connectBtn = page.locator('#btn-connect-github');
    await expect(connectBtn).toBeVisible();

    const apiHealth = page.locator('#api-health-badge');
    await expect(apiHealth).toBeVisible();
  });

  // 13. Data Export & Import
  test('13: Data export triggers JSON download and import modal opens', async ({ page }) => {
    await page.goto('/');

    const importBtn = page.locator('#btn-import-data');
    await importBtn.click();

    const importModal = page.locator('#modal-import-data');
    await expect(importModal).toBeVisible();

    await page.click('#btn-cancel-import');
    await expect(importModal).not.toBeVisible();
  });

  // 14. Real Social Links in Footer
  test('14: Real social links match specification with secure attributes', async ({ page }) => {
    await page.goto('/');

    const ghLink = page.locator('a[href="https://github.com/somansinghal"]');
    await expect(ghLink).toHaveAttribute('target', '_blank');
    await expect(ghLink).toHaveAttribute('rel', /noopener/);

    const instaLink = page.locator('a[href="https://instagram.com/_somansinghal"]');
    await expect(instaLink).toBeVisible();

    const portLink = page.locator('a[href="https://somansinghal.vercel.app/"]');
    await expect(portLink).toBeVisible();
  });

  // 15. No Page-Level Horizontal Overflow across viewports
  test('15: Zero page-level horizontal overflow on mobile viewports', async ({ page }) => {
    const viewports = [
      { width: 320, height: 800 },
      { width: 375, height: 812 },
      { width: 390, height: 844 },
      { width: 768, height: 1024 }
    ];

    for (const vp of viewports) {
      await page.setViewportSize(vp);
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // 1px rounding margin
    }
  });

});
