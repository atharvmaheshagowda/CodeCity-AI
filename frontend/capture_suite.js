import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const VIEWPORTS = [
  { name: '1920', width: 1920, height: 1080 },
  { name: '1366', width: 1366, height: 768 },
];

async function run() {
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

  console.log('--- Capturing Round 5 Master Verification Suite ---');

  // 1. Dense Multi-District Repo: psf_requests at 1920x1080
  await page.setViewport(VIEWPORTS[0]);
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await wait(1500);

  // Switch to psf_requests
  await page.evaluate(() => {
    const select = document.getElementById('nav-repo-select');
    if (select) {
      const opt = Array.from(select.options).find((o) => o.value.includes('requests'));
      if (opt) {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await wait(3000);

  // Skip intro
  await page.evaluate(() => {
    const skipBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Skip Intro'));
    if (skipBtn) skipBtn.click();
  });
  await wait(1500);

  await page.screenshot({ path: path.resolve('screenshots/round5_dense_requests_1920.png') });
  console.log('✓ Captured 1: round5_dense_requests_1920.png');

  // 2. Dense Multi-District Repo at 1366x768
  await page.setViewport(VIEWPORTS[1]);
  await wait(1200);
  await page.screenshot({ path: path.resolve('screenshots/round5_dense_requests_1366.png') });
  console.log('✓ Captured 2: round5_dense_requests_1366.png');

  // 3. Selection & Blast Radius in Flask at 1920x1080
  await page.setViewport(VIEWPORTS[0]);
  await wait(600);
  await page.evaluate(() => {
    const select = document.getElementById('nav-repo-select');
    if (select) {
      const opt = Array.from(select.options).find((o) => o.value.includes('flask'));
      if (opt) {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await wait(2400);

  // Skip intro
  await page.evaluate(() => {
    const skipBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Skip Intro'));
    if (skipBtn) skipBtn.click();
  });
  await wait(1000);

  // Click top hotspot (app.py)
  await page.evaluate(() => {
    const el = document.getElementById('hotspot-item-0') || document.querySelector('[data-testid="hotspot-item-0"]');
    if (el) el.click();
  });
  await wait(2400);
  await page.screenshot({ path: path.resolve('screenshots/round5_flask_selected_1920.png') });
  console.log('✓ Captured 3: round5_flask_selected_1920.png');

  // 4. Exhibition Mode (Press P)
  await page.keyboard.press('KeyP');
  await wait(2400);
  await page.screenshot({ path: path.resolve('screenshots/round5_exhibition_mode_1920.png') });
  console.log('✓ Captured 4: round5_exhibition_mode_1920.png');

  // Exit exhibition mode
  await page.keyboard.press('KeyP');
  await wait(1000);

  // 5. Model Card Modal
  await page.evaluate(() => {
    const modelCardBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Model Card'));
    if (modelCardBtn) modelCardBtn.click();
  });
  await wait(1500);
  await page.screenshot({ path: path.resolve('screenshots/round5_model_card_1920.png') });
  console.log('✓ Captured 5: round5_model_card_1920.png');

  // Close Model Card modal
  await page.evaluate(() => {
    const closeBtn = document.getElementById('close-model-card-btn') || document.querySelector('button[title*="Close"]');
    if (closeBtn) closeBtn.click();
  });
  await wait(800);

  // 6. Command Palette (Ctrl+K)
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyK');
  await page.keyboard.up('Control');
  await wait(1200);
  await page.screenshot({ path: path.resolve('screenshots/round5_command_palette_1920.png') });
  console.log('✓ Captured 6: round5_command_palette_1920.png');

  // Close Command Palette
  await page.keyboard.press('Escape');
  await wait(800);

  // 7. Sparse Repo (ecotrace-ai)
  await page.evaluate(() => {
    const select = document.getElementById('nav-repo-select');
    if (select) {
      const ecoOpt = Array.from(select.options).find((o) => o.value.includes('ecotrace'));
      if (ecoOpt) {
        select.value = ecoOpt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await wait(3000);

  // Skip intro
  await page.evaluate(() => {
    const skipBtn = Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Skip Intro'));
    if (skipBtn) skipBtn.click();
  });
  await wait(1500);
  await page.screenshot({ path: path.resolve('screenshots/round5_sparse_ecotrace_1920.png') });
  console.log('✓ Captured 7: round5_sparse_ecotrace_1920.png');

  await browser.close();
  console.log('=== All Round 5 Screenshots Successfully Captured! ===');
}

run().catch((err) => {
  console.error('Error running capture suite:', err);
  process.exit(1);
});
