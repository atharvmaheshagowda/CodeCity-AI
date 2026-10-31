import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function runPhase5Suite() {
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

  // Console error monitoring
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('--- 1. Testing 1920x1080 Baseline & FPS ---');
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await wait(3500);

  // Measure FPS using requestAnimationFrame over 60 frames
  const fpsMeasurement = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      function count() {
        frames++;
        if (frames < 60) {
          requestAnimationFrame(count);
        } else {
          const duration = performance.now() - start;
          const fps = Math.round((frames / duration) * 1000);
          resolve(fps);
        }
      }
      requestAnimationFrame(count);
    });
  });
  console.log(`Measured 3D Canvas FPS: ${fpsMeasurement} FPS`);

  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_1080p_baseline.png') });
  console.log('Captured phase5_test_1080p_baseline.png');

  console.log('--- 2. Testing 1366x768 Compact View ---');
  await page.setViewport({ width: 1366, height: 768 });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_768p_compact.png') });
  console.log('Captured phase5_test_768p_compact.png');

  // Return to 1080p for modal tests
  await page.setViewport({ width: 1920, height: 1080 });
  await wait(800);

  console.log('--- 3. Testing Architectural Insights Panel ---');
  await page.evaluate(() => {
    const btn = document.getElementById('nav-insights-btn');
    if (btn) btn.click();
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_insights_panel.png') });
  console.log('Captured phase5_test_insights_panel.png');

  // Close Insights
  await page.keyboard.press('Escape');
  await wait(800);

  console.log('--- 4. Testing RightDrawer & Line Diagnostics (Select seed_db.py) ---');
  await page.evaluate(() => {
    const item = Array.from(document.querySelectorAll('div')).find((el) =>
      el.textContent && el.textContent.includes('seed_db.py')
    );
    if (item) item.click();
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_line_diagnostics.png') });
  console.log('Captured phase5_test_line_diagnostics.png');

  console.log('--- 5. Testing Centrality & Graph Position Card (Metrics Tab) ---');
  await page.evaluate(() => {
    const tabBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent && b.textContent.trim().toLowerCase() === 'metrics'
    );
    if (tabBtn) tabBtn.click();
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_centrality_metrics.png') });
  console.log('Captured phase5_test_centrality_metrics.png');

  console.log('--- 6. Testing Failure Simulation & Hop Depth Selector ---');
  await page.evaluate(() => {
    // Switch to overview tab and click simulate failure button
    const overviewTab = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent && b.textContent.trim().toLowerCase() === 'overview'
    );
    if (overviewTab) overviewTab.click();
  });
  await wait(600);
  await page.evaluate(() => {
    const simBtn = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent && b.textContent.includes('Simulate Failure')
    );
    if (simBtn) simBtn.click();
  });
  await wait(1800);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_failure_simulation.png') });
  console.log('Captured phase5_test_failure_simulation.png');

  // Stop simulation
  await page.keyboard.press('Escape');
  await wait(800);

  console.log('--- 7. Testing Architecture Hotspot Matrix Modal ---');
  await page.evaluate(() => {
    const btn = document.getElementById('nav-matrix-btn');
    if (btn) btn.click();
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_matrix_modal.png') });
  console.log('Captured phase5_test_matrix_modal.png');

  // Close Matrix
  await page.keyboard.press('Escape');
  await wait(800);

  console.log('--- 8. Testing Repository Intelligence Comparison Modal ---');
  await page.evaluate(() => {
    const btn = document.getElementById('nav-compare-btn');
    if (btn) btn.click();
  });
  await wait(1200);
  // Select pallets/flask from dropdown if available
  await page.evaluate(() => {
    const select = document.querySelector('select');
    if (select && select.options.length > 1) {
      select.selectedIndex = 1;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_repo_comparison.png') });
  console.log('Captured phase5_test_repo_comparison.png');

  // Close Compare
  await page.keyboard.press('Escape');
  await wait(800);

  console.log('--- 9. Testing Time-Lapse 4D Replay ---');
  await page.evaluate(() => {
    const btn = document.getElementById('nav-insights-btn');
    if (btn) btn.click();
  });
  await wait(1000);
  await page.evaluate(() => {
    const timeTab = Array.from(document.querySelectorAll('button')).find((b) =>
      b.textContent && b.textContent.includes('Time-Lapse')
    );
    if (timeTab) timeTab.click();
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_timelapse.png') });
  console.log('Captured phase5_test_timelapse.png');

  // Close Insights
  await page.keyboard.press('Escape');
  await wait(800);

  console.log('--- 10. Testing Largest Representative Repository (pallets/flask) ---');
  await page.evaluate(() => {
    const select = document.getElementById('navbar-repo-select');
    if (select) {
      const opt = Array.from(select.options).find((o) => o.value.includes('flask'));
      if (opt) {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await wait(3000);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_flask_dense.png') });
  console.log('Captured phase5_test_flask_dense.png');

  console.log('--- 11. Testing Smallest Repository (atharvmaheshagowda/ecotrace-ai) ---');
  await page.evaluate(() => {
    const select = document.getElementById('navbar-repo-select');
    if (select) {
      const opt = Array.from(select.options).find((o) => o.value.includes('ecotrace'));
      if (opt) {
        select.value = opt.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  await wait(2500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase5_test_ecotrace_sparse.png') });
  console.log('Captured phase5_test_ecotrace_sparse.png');

  await browser.close();

  console.log('\n=======================================');
  console.log('PHASE 5 TEST SUITE COMPLETED');
  console.log(`Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console errors encountered:', consoleErrors);
  } else {
    console.log('Zero console errors encountered.');
  }
  console.log(`Measured 3D Canvas FPS: ${fpsMeasurement} FPS`);
  console.log('=======================================');
}

runPhase5Suite().catch((e) => {
  console.error('Phase 5 suite failed:', e);
  process.exit(1);
});

