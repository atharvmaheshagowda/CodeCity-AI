import puppeteer from 'puppeteer-core';

async function testHeader() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--enable-webgl', '--use-gl=angle', '--enable-accelerated-2d-canvas'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 3000));
  
  const selects = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('select')).map((s) => ({
      id: s.id,
      options: Array.from(s.options).map((o) => ({ value: o.value, text: o.text })),
    }));
  });
  console.log('Select elements found:', JSON.stringify(selects, null, 2));
  await browser.close();
}

testHeader().catch(console.error);

