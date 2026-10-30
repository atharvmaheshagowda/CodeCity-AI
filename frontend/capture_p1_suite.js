import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function capture() {
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--enable-accelerated-2d-canvas',
    ],
  });

  const page = await browser.newPage();
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await wait(2500);

  // 1. RightDrawer default view
  await page.screenshot({ path: path.join(screenshotsDir, 'p1_1_sparkline_drawer.png') });
  console.log('✓ 1. Sparkline drawer');

  // 2. Open Insights Dock -> Review Planner Tab
  await page.evaluate(() => {
    const btn = document.getElementById('nav-insights-btn');
    if (btn) btn.click();
  });
  await wait(800);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const planBtn = buttons.find((b) => b.innerText && b.innerText.includes('Review Planner'));
    if (planBtn) planBtn.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'p1_2_plan_tab.png') });
  console.log('✓ 2. Review Planner');

  // 3. Switch to Pallets Flask for rich Git History & Time-Lapse
  await page.evaluate(() => {
    const select = document.getElementById('nav-repo-select');
    if (select) {
      select.value = 'pallets_flask';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await wait(1500);

  // Switch to Time-Lapse tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const timeBtn = buttons.find((b) => b.innerText && b.innerText.includes('Time-Lapse'));
    if (timeBtn) timeBtn.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'p1_3_timelapse_tab.png') });
  console.log('✓ 3. Time-Lapse (Flask)');

  // 4. Breaking Change Tester & Commit Risk in Impact Tab (Scrolled into view)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const impactBtn = buttons.find((b) => b.innerText && b.innerText.includes('Impact & Cascade'));
    if (impactBtn) impactBtn.click();
  });
  await wait(800);

  // Scroll down dock container
  await page.evaluate(() => {
    const dockBody = document.querySelector('.max-h-\\[580px\\] .overflow-y-auto');
    if (dockBody) dockBody.scrollTop = 550;
  });
  await wait(600);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const simBtn = buttons.find((b) => b.innerText && b.innerText.includes('Simulate Signature Change'));
    if (simBtn) simBtn.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'p1_4_breaking_change.png') });
  console.log('✓ 4. Breaking Change');

  // 5. Commit Risk Checker (scroll further down)
  await page.evaluate(() => {
    const dockBody = document.querySelector('.max-h-\\[580px\\] .overflow-y-auto');
    if (dockBody) dockBody.scrollTop = 950;
  });
  await wait(400);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const sampleDiffBtn = buttons.find((b) => b.innerText && b.innerText.includes('Insert Sample Diff'));
    if (sampleDiffBtn) sampleDiffBtn.click();
  });
  await wait(500);

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const evalBtn = buttons.find((b) => b.innerText && b.innerText.includes('Evaluate PR Risk'));
    if (evalBtn) evalBtn.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'p1_5_commit_risk.png') });
  console.log('✓ 5. Commit Risk');

  // Close Insights Dock
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title*="Close Insights Dock"]');
    if (closeBtn) closeBtn.click();
  });
  await wait(600);

  // 6. Open 2D Scatter Matrix
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const matrixBtn = buttons.find((b) => b.innerText && b.innerText.includes('Matrix'));
    if (matrixBtn) matrixBtn.click();
  });
  await wait(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'p1_6_scatter_matrix.png') });
  console.log('✓ 6. Scatter Matrix');

  // Close Scatter Modal using its close button
  await page.evaluate(() => {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
      const closeBtn = modal.querySelector('button');
      if (closeBtn) closeBtn.click();
    }
  });
  await wait(800);

  // 7. Open Model Card
  await page.evaluate(() => {
    const cardBtn = document.getElementById('nav-model-card-btn');
    if (cardBtn) cardBtn.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'p1_7_model_card_backtest.png') });
  console.log('✓ 7. Model Card Backtest');

  // Close Model Card Modal using close button
  await page.evaluate(() => {
    const closeBtn = document.getElementById('close-model-card-btn');
    if (closeBtn) closeBtn.click();
  });
  await wait(800);

  // 8. Open Terminal Log Drawer
  await page.evaluate(() => {
    const termBtn = document.querySelector('button[title*="Analysis Terminal"]');
    if (termBtn) termBtn.click();
  });
  await wait(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'p1_8_terminal_drawer.png') });
  console.log('✓ 8. Terminal Drawer');

  // Close Terminal Drawer
  await page.evaluate(() => {
    const termBtn = document.querySelector('button[title*="Analysis Terminal"]');
    if (termBtn) termBtn.click();
  });
  await wait(800);

  // 9. Open Dual Repo Comparison
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const compBtn = buttons.find((b) => b.innerText && b.innerText.includes('Compare'));
    if (compBtn) compBtn.click();
  });
  await wait(1000);

  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll('select'));
    const repoSelect = selects.find(s => s.options && s.options.length > 2);
    if (repoSelect) {
      repoSelect.selectedIndex = 1;
      repoSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'p1_9_repo_comparison.png') });
  console.log('✓ 9. Repo Comparison');

  await browser.close();
  console.log('Suite completed successfully!');
}

capture().catch((e) => {
  console.error(e);
  process.exit(1);
});
