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
  await wait(1500);

  // Skip cinematic intro if present
  await page.evaluate(() => {
    const skipBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Skip Intro'));
    if (skipBtn) skipBtn.click();
  });
  await wait(1500);

  // 1. Default View
  await page.screenshot({ path: path.resolve('screenshots/p0_1_default_view.png') });
  console.log('✓ Captured p0_1_default_view.png');

  // 2. Open Insights Dock
  await page.evaluate(() => {
    const insightsBtn = document.getElementById('nav-insights-btn');
    if (insightsBtn) insightsBtn.click();
  });
  await wait(1000);
  await page.screenshot({ path: path.resolve('screenshots/p0_2_insights_impact.png') });
  console.log('✓ Captured p0_2_insights_impact.png');

  // 3. Insert Traceback Sample and Analyze
  await page.evaluate(() => {
    const insertBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Insert Sample'));
    if (insertBtn) insertBtn.click();
  });
  await wait(300);
  await page.evaluate(() => {
    const analyzeBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Analyze Traceback'));
    if (analyzeBtn) analyzeBtn.click();
  });
  await wait(1500);
  await page.screenshot({ path: path.resolve('screenshots/p0_3_traceback_analyzed.png') });
  console.log('✓ Captured p0_3_traceback_analyzed.png');

  // 4. Switch to Smells Tab
  await page.evaluate(() => {
    const smellsBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Architecture Smells'));
    if (smellsBtn) smellsBtn.click();
  });
  await wait(800);
  await page.screenshot({ path: path.resolve('screenshots/p0_4_insights_smells.png') });
  console.log('✓ Captured p0_4_insights_smells.png');

  // 5. Switch to Health Report Tab
  await page.evaluate(() => {
    const reportBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Health Report'));
    if (reportBtn) reportBtn.click();
  });
  await wait(800);
  await page.screenshot({ path: path.resolve('screenshots/p0_5_insights_report.png') });
  console.log('✓ Captured p0_5_insights_report.png');

  // 6. Switch to Pallets Flask Repo
  await page.evaluate(() => {
    const select = document.getElementById('nav-repo-select');
    if (select) {
      select.value = 'pallets_flask';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await wait(2000);

  // Switch to Hidden Coupling Tab on Flask
  await page.evaluate(() => {
    const couplingBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Hidden Coupling'));
    if (couplingBtn) couplingBtn.click();
  });
  await wait(1000);
  await page.screenshot({ path: path.resolve('screenshots/p0_6_flask_coupling.png') });
  console.log('✓ Captured p0_6_flask_coupling.png');

  // 7. Close Insights Dock and select a building to open RightDrawer on What-If tab
  await page.evaluate(() => {
    const closeBtn = document.querySelector('button[title*="Close Insights Dock"]');
    if (closeBtn) closeBtn.click();
  });
  await wait(800);

  // Click What-If sub-tab in Right Drawer
  await page.evaluate(() => {
    const whatIfBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('What-If'));
    if (whatIfBtn) whatIfBtn.click();
  });
  await wait(800);
  await page.screenshot({ path: path.resolve('screenshots/p0_7_whatif_drawer.png') });
  console.log('✓ Captured p0_7_whatif_drawer.png');

  await browser.close();
}

capture().catch((err) => {
  console.error('Error capturing P0 suite:', err);
  process.exit(1);
});

