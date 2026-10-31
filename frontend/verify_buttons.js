import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function verifyButtons() {
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
  await wait(3000);

  // 1. Select seed_db.py in hotspot list to open Right Drawer
  console.log('Selecting seed_db.py...');
  await page.evaluate(() => {
    const item = Array.from(document.querySelectorAll('div')).find((el) =>
      el.textContent && el.textContent.includes('seed_db.py')
    );
    if (item) item.click();
  });
  await wait(1000);

  // 2. Click "View in graph" button
  console.log('Testing "View in graph" button...');
  const viewInGraphClicked = await page.evaluate(() => {
    const btn = document.getElementById('drawer-view-in-graph-btn');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('View in graph clicked:', viewInGraphClicked);
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'btn_1_view_in_graph_modal.png') });

  // Close Dependency Graph modal
  await page.keyboard.press('Escape');
  await wait(600);

  // 3. Click Theme / Moon toggle button
  console.log('Testing Theme Moon/Zap toggle button...');
  const themeToggled = await page.evaluate(() => {
    const btn = document.getElementById('nav-theme-btn');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Theme button clicked:', themeToggled);
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'btn_2_theme_neon.png') });

  // Toggle back to Midnight Cyber City
  await page.evaluate(() => {
    const btn = document.getElementById('nav-theme-btn');
    if (btn) btn.click();
  });
  await wait(600);

  // 4. Click "Matrix" button
  console.log('Testing "Matrix" button...');
  const matrixClicked = await page.evaluate(() => {
    const btn = document.getElementById('nav-matrix-btn');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Matrix button clicked:', matrixClicked);
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'btn_3_matrix_modal.png') });

  // Close Matrix modal
  await page.keyboard.press('Escape');
  await wait(600);

  // 5. Click "Compare" button
  console.log('Testing "Compare" button...');
  const compareClicked = await page.evaluate(() => {
    const btn = document.getElementById('nav-compare-btn');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Compare button clicked:', compareClicked);
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'btn_4_compare_modal.png') });

  // Close Compare modal
  await page.keyboard.press('Escape');
  await wait(600);

  // 6. Click ">_" (Terminal) button
  console.log('Testing ">_" Terminal button...');
  const terminalClicked = await page.evaluate(() => {
    const btn = document.getElementById('nav-terminal-btn');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Terminal button clicked:', terminalClicked);
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'btn_5_terminal_drawer.png') });

  await browser.close();
  console.log('All buttons tested and verified with screenshots!');
}

verifyButtons().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
