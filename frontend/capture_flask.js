import puppeteer from 'puppeteer-core';
import path from 'path';

async function captureFlask() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--enable-accelerated-2d-canvas'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 4000));
  
  // Directly call loadRepo in Zustand store
  const switched = await page.evaluate(async () => {
    try {
      // Find repo option for pallets_flask
      const sel = document.querySelector('select');
      if (sel) {
        sel.value = 'pallets_flask';
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  });

  console.log('Switched to flask:', switched);
  await new Promise((r) => setTimeout(r, 4000));
  await page.screenshot({ path: path.resolve('..', 'screenshots', 'phase1_flask_updated.png') });
  await browser.close();
  console.log('Saved flask updated screenshot to screenshots/phase1_flask_updated.png');
}

captureFlask().catch((e) => {
  console.error(e);
  process.exit(1);
});
