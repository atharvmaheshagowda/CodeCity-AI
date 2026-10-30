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

  // 1. RightDrawer default overview
  await page.screenshot({ path: path.join(screenshotsDir, 'p2_1_drawer_overview.png') });
  console.log('✓ 1. Drawer overview');

  // 2. RightDrawer Metrics Tab (with Bus Factor concentration card)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const metricsBtn = buttons.find((b) => b.innerText && b.innerText.trim() === 'Metrics');
    if (metricsBtn) metricsBtn.click();
  });
  await wait(800);
  await page.screenshot({ path: path.join(screenshotsDir, 'p2_2_drawer_metrics_busfactor.png') });
  console.log('✓ 2. Drawer metrics & bus factor');

  // 3. RightDrawer SHAP Tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const shapBtn = buttons.find((b) => b.innerText && b.innerText.trim() === 'SHAP');
    if (shapBtn) shapBtn.click();
  });
  await wait(800);
  await page.screenshot({ path: path.join(screenshotsDir, 'p2_3_drawer_shap_attribution.png') });
  console.log('✓ 3. Drawer SHAP attribution');

  // 4. Toggle Exhibition Mode (PresentationHUD tour card)
  await page.evaluate(() => {
    const exhibBtn = document.getElementById('nav-exhibition-btn');
    if (exhibBtn) exhibBtn.click();
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'p2_4_exhibition_tour_hud.png') });
  console.log('✓ 4. Exhibition tour HUD');

  // Exit Exhibition mode
  await page.keyboard.press('KeyP');
  await wait(600);

  // 5. Switch to Pallets Flask for archetype badges
  await page.evaluate(() => {
    const select = document.getElementById('nav-repo-select');
    if (select) {
      select.value = 'pallets_flask';
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await wait(2000);
  await page.screenshot({ path: path.join(screenshotsDir, 'p2_5_flask_archetype_badges.png') });
  console.log('✓ 5. Flask archetype badges');

  await browser.close();
  console.log('All P2 screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Capture error:', err);
  process.exit(1);
});

