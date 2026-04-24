#!/usr/bin/env node
/**
 * Lawyeon hook capture script.
 *
 * Records each test_hook_*.html scene as a 1080x1920 MP4 ready to drop into
 * CapCut. Uses Playwright for pixel-perfect headless capture, then FFmpeg
 * to convert WebM -> MP4 (H.264, yuv420p, 60fps) and trim to the exact
 * scene length.
 *
 * One-time setup:
 *   npm install --save-dev playwright
 *   npx playwright install chromium
 *   # Install FFmpeg: https://ffmpeg.org/download.html (brew install ffmpeg on macOS)
 *
 * Run:
 *   node scripts/capture_hooks.js
 *
 * Override the base URL (default = production):
 *   BASE_URL=https://www.lawyeonvisa.app node scripts/capture_hooks.js
 *   BASE_URL=file:///home/user/lawyeonvisa.app node scripts/capture_hooks.js
 *
 * Output:
 *   ./captures/hook_02.mp4
 *   ./captures/hook_03.mp4
 *   ./captures/hook_04.mp4
 *   ./captures/hook_05.mp4
 */

const { chromium } = require('playwright');
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://www.lawyeonvisa.app';

// Scene list: (file, name, exact duration in seconds)
// Duration matches the timeline in each HTML's play() function.
const SCENES = [
  { file: 'test_hook_02_legal_doc.html', name: 'hook_02', duration:  8.0 },
  { file: 'test_hook_03_d8_wrong.html',  name: 'hook_03', duration: 15.0 },
  { file: 'test_hook_04_d94_right.html', name: 'hook_04', duration: 18.0 },
  { file: 'test_hook_05_brand_cta.html', name: 'hook_05', duration: 12.0 },
];

const OUT_DIR = path.resolve(__dirname, '..', 'captures');
fs.mkdirSync(OUT_DIR, { recursive: true });

// FFmpeg must be on PATH
const ffmpegCheck = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
if (ffmpegCheck.status !== 0) {
  console.error('[!] FFmpeg not found on PATH.');
  console.error('    macOS:   brew install ffmpeg');
  console.error('    Ubuntu:  sudo apt install ffmpeg');
  console.error('    Windows: https://ffmpeg.org/download.html');
  process.exit(1);
}

function logStep(msg) { process.stdout.write(msg); }

(async () => {
  console.log(`\nLawyeon hook capture\nBASE_URL: ${BASE_URL}\nOUT_DIR:  ${OUT_DIR}\n`);

  const browser = await chromium.launch({ headless: true });

  for (const scene of SCENES) {
    console.log(`\n=== ${scene.name}  (${scene.duration}s) ===`);

    const context = await browser.newContext({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1,
      recordVideo: {
        dir: OUT_DIR,
        size: { width: 1080, height: 1920 },
      },
    });
    const page = await context.newPage();

    const url = `${BASE_URL}/${scene.file}?capture=1`;
    logStep(`  loading ${url}\n`);
    await page.goto(url, { waitUntil: 'networkidle' });

    // Small buffer so fonts/first paint settle before the scene plays.
    await page.waitForTimeout(200);

    // Record for exact scene duration + tail padding. FFmpeg trims to
    // scene.duration below so tail is discarded.
    const holdMs = Math.round(scene.duration * 1000) + 1200;
    logStep(`  recording ${holdMs}ms\n`);
    await page.waitForTimeout(holdMs);

    const video = page.video();
    await context.close();
    const webmPath = await video.path();

    const mp4Path = path.join(OUT_DIR, `${scene.name}.mp4`);
    logStep(`  encoding MP4 -> ${mp4Path}\n`);
    execSync(
      [
        'ffmpeg -y',
        `-i "${webmPath}"`,
        `-t ${scene.duration}`,
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-preset medium',
        '-crf 18',
        '-r 60',
        '-movflags +faststart',
        '-an',
        `"${mp4Path}"`,
      ].join(' '),
      { stdio: 'inherit' }
    );

    fs.unlinkSync(webmPath);
    console.log(`  ok  ${scene.name}.mp4`);
  }

  await browser.close();

  console.log(`\nAll captures saved to: ${OUT_DIR}`);
  console.log('Drop these MP4s into CapCut as separate clips and stitch.\n');
})();
