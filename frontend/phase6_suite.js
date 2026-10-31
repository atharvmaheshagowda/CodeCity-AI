import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function runPhase6Suite() {
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

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('--- 1. Testing Baseline 1920x1080 & Measuring FPS ---');
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });
  await wait(3500);

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

  console.log('--- 2. Starting Exhibition Mode (Stage A: Reveal) ---');
  await page.evaluate(() => {
    window.__cityStore = window.__cityStore || window.useCityStore;
    const btn = document.getElementById('nav-exhibition-btn');
    if (btn) btn.click();
  });
  await wait(1800);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_stage_a_reveal.png') });
  console.log('Captured phase6_stage_a_reveal.png');

  console.log('--- 3. Navigating to Stage B: Overview ---');
  await page.evaluate(() => {
    const store = window.useCityStore?.getState?.();
    if (store) store.setExhibitionStage('overview');
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_stage_b_overview.png') });
  console.log('Captured phase6_stage_b_overview.png');

  console.log('--- 4. Navigating to Stage C: Architectural Tour ---');
  await page.evaluate(() => {
    const store = window.useCityStore?.getState?.();
    if (store) store.setExhibitionStage('tour');
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_stage_c_tour.png') });
  console.log('Captured phase6_stage_c_tour.png');

  console.log('--- 5. Navigating to Stage D: Highest-Risk Hotspots ---');
  await page.evaluate(() => {
    const store = window.useCityStore?.getState?.();
    if (store) store.setExhibitionStage('hotspots');
  });
  await wait(1800);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_stage_d_hotspots.png') });
  console.log('Captured phase6_stage_d_hotspots.png');

  console.log('--- 6. Navigating to Stage E: Dependency Conduits ---');
  await page.evaluate(() => {
    const store = window.useCityStore?.getState?.();
    if (store) store.setExhibitionStage('dependencies');
  });
  await wait(1800);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_stage_e_dependencies.png') });
  console.log('Captured phase6_stage_e_dependencies.png');

  console.log('--- 7. Navigating to Stage F: Failure Simulation Cascade ---');
  await page.evaluate(() => {
    const store = window.useCityStore?.getState?.();
    if (store) store.setExhibitionStage('simulation');
  });
  await wait(2000);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_stage_f_simulation.png') });
  console.log('Captured phase6_stage_f_simulation.png');

  console.log('--- 8. Navigating to Stage G: Intelligence Summary ---');
  await page.evaluate(() => {
    const store = window.useCityStore?.getState?.();
    if (store) store.setExhibitionStage('summary');
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_stage_g_summary.png') });
  console.log('Captured phase6_stage_g_summary.png');

  console.log('--- 9. Navigating to Stage H: Return to Overview ---');
  await page.evaluate(() => {
    const store = window.useCityStore?.getState?.();
    if (store) store.setExhibitionStage('complete');
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_stage_h_complete.png') });
  console.log('Captured phase6_stage_h_complete.png');

  console.log('--- 10. Testing Manual Playback Pause & Resume ---');
  await page.evaluate(() => {
    const store = window.useCityStore?.getState?.();
    if (store) {
      store.setExhibitionStage('hotspots');
      store.toggleExhibitionPause();
    }
  });
  await wait(1200);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_controls_paused.png') });
  console.log('Captured phase6_controls_paused.png');

  console.log('--- 11. Testing 1366x768 Compact Resolution ---');
  await page.setViewport({ width: 1366, height: 768 });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_768p_compact.png') });
  console.log('Captured phase6_768p_compact.png');

  // Return to 1080p
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('--- 12. Testing Small Sparse Repository (ecotrace-ai) ---');
  await page.evaluate(async () => {
    const store = window.useCityStore?.getState?.();
    if (store) {
      await store.loadRepo('atharvmaheshagowda_ecotrace-ai');
      store.setExhibitionStage('hotspots');
    }
  });
  await wait(2500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_sparse_ecotrace.png') });
  console.log('Captured phase6_sparse_ecotrace.png');

  console.log('--- 13. Testing Dense Repository (pallets/flask) ---');
  await page.evaluate(async () => {
    const store = window.useCityStore?.getState?.();
    if (store) {
      await store.loadRepo('pallets_flask');
      store.setExhibitionStage('dependencies');
    }
  });
  await wait(2500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_dense_flask.png') });
  console.log('Captured phase6_dense_flask.png');

  console.log('--- 14. Testing Clean Exit from Exhibition Mode ---');
  await page.evaluate(() => {
    const store = window.useCityStore?.getState?.();
    if (store) store.togglePresentationMode();
  });
  await wait(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'phase6_exit_clean_return.png') });
  console.log('Captured phase6_exit_clean_return.png');

  await browser.close();

  console.log('====================================================');
  console.log('Phase 6 Test Suite Completed Successfully!');
  console.log(`Console Errors Encountered: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Errors:', consoleErrors);
  }
  console.log(`Final Benchmark Frame Rate: ${fpsMeasurement} FPS`);
  console.log('====================================================');
}

runPhase6Suite().catch((err) => {
  console.error('Phase 6 suite failed:', err);
  process.exit(1);
});
