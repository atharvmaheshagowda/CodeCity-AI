import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function runSuite() {
  const screenshotsDir = path.resolve('..', 'screenshots');
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

  // Benchmark FPS helper
  async function measureFPS() {
    return await page.evaluate(async () => {
      return new Promise((resolve) => {
        let frames = 0;
        const start = performance.now();
        function loop() {
          frames++;
          if (performance.now() - start >= 1000) {
            resolve(frames);
          } else {
            requestAnimationFrame(loop);
          }
        }
        requestAnimationFrame(loop);
      });
    });
  }

  // 1. 1920x1080 Baseline View
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await wait(3000);
  const fps1080 = await measureFPS();
  console.log('1080p FPS:', fps1080);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_test_1080p_baseline.png') });

  // 2. 1366x768 Compact View
  await page.setViewport({ width: 1366, height: 768 });
  await wait(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_test_768p_compact.png') });
  await page.setViewport({ width: 1920, height: 1080 });
  await wait(1000);

  // 3. Selection & Hover
  console.log('Testing selection of seed_db.py...');
  await page.evaluate(() => {
    const item = Array.from(document.querySelectorAll('div')).find((el) =>
      el.textContent && el.textContent.includes('seed_db.py')
    );
    if (item) item.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_test_selection.png') });

  // 4. Color Modes
  const modes = ['Complexity', 'Churn', 'Age', 'Impact', 'Risk'];
  for (const m of modes) {
    console.log(`Testing color mode: ${m}...`);
    await page.evaluate((modeName) => {
      const btn = Array.from(document.querySelectorAll('button')).find(
        (b) => b.textContent && b.textContent.trim() === modeName
      );
      if (btn) btn.click();
    }, m);
    await wait(800);
    await page.screenshot({ path: path.join(screenshotsDir, `phase1_test_mode_${m.toLowerCase()}.png`) });
  }

  // 5. Electric Cyber Neon Theme
  console.log('Testing Electric Cyber Neon theme...');
  await page.evaluate(() => {
    const btn = document.getElementById('nav-theme-btn');
    if (btn) btn.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_test_theme_neon.png') });

  // Switch back to Midnight
  await page.evaluate(() => {
    const btn = document.getElementById('nav-theme-btn');
    if (btn) btn.click();
  });
  await wait(800);

  // 6. Test Eco / Low-Power Mode
  console.log('Testing Eco Mode...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes('Low Power')
    );
    if (btn) btn.click();
  });
  await wait(1000);
  const ecoFPS = await measureFPS();
  console.log('Eco Mode FPS:', ecoFPS);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_test_eco_mode.png') });

  // Turn off Eco Mode
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(
      (b) => b.textContent && b.textContent.includes('Low Power')
    );
    if (btn) btn.click();
  });
  await wait(800);

  // 7. Test Largest Demo Repo (pallets/flask or codecity-ai)
  console.log('Testing pallets/flask repo switch...');
  await page.evaluate(() => {
    const selectTrigger = document.querySelector('header button');
    if (selectTrigger) selectTrigger.click();
  });
  await wait(600);
  await page.evaluate(() => {
    const option = Array.from(document.querySelectorAll('button, div')).find(
      (el) => el.textContent && el.textContent.includes('pallets/flask')
    );
    if (option) option.click();
  });
  await wait(2500);
  const flaskFPS = await measureFPS();
  console.log('Flask Repo FPS:', flaskFPS);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase1_test_flask_repo.png') });

  await browser.close();
  console.log('Validation suite finished successfully!');
}

runSuite().catch((err) => {
  console.error('Suite error:', err);
  process.exit(1);
});

