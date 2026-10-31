import puppeteer from 'puppeteer-core';

async function logErrors() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
  });
  const page = await browser.newPage();
  page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
  await page.goto('http://127.0.0.1:5173');
  await new Promise((r) => setTimeout(r, 4000));
  await browser.close();
}

logErrors().catch(console.error);

