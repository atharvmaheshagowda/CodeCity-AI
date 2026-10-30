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
  await wait(2000);

  // Take screenshot
  const outPath = path.resolve('screenshots/current_ui_comparison.png');
  await page.screenshot({ path: outPath });
  console.log('✓ Captured current UI comparison:', outPath);

  await browser.close();
}

capture().catch((err) => {
  console.error('Error capturing UI:', err);
  process.exit(1);
});

