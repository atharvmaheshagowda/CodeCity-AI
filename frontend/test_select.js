import puppeteer from 'puppeteer-core';
import path from 'path';

async function testSelectDirectly() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--enable-accelerated-2d-canvas'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 2000));
  
  const res = await page.evaluate(async () => {
    const el = document.getElementById('nav-repo-select');
    if (!el) return { found: false, count: document.querySelectorAll('*').length };
    const opts = Array.from(el.options).map((o) => ({ id: o.value, text: o.text }));
    return { found: true, id: el.id, value: el.value, options: opts };
  });

  console.log('Result:', JSON.stringify(res, null, 2));

  // Change selection to pallets_flask
  await page.evaluate(() => {
    const el = document.getElementById('nav-repo-select');
    if (el) {
      el.value = 'pallets_flask';
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });

  await new Promise((r) => setTimeout(r, 2500));
  await page.screenshot({ path: path.resolve('..', 'screenshots', 'phase1_flask_confirmed.png') });
  await browser.close();
  console.log('Finished test and saved screenshots/phase1_flask_confirmed.png');
}

testSelectDirectly().catch(console.error);

