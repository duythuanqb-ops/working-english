const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1024,
    height: 1024,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      offscreen: true
    }
  });

  const html = `<!DOCTYPE html>
<html>
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 1024px;
      height: 1024px;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-container {
      position: relative;
      width: 860px;
      height: 860px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* 3D bottom base */
    .icon-base {
      position: absolute;
      width: 780px;
      height: 780px;
      border-radius: 230px;
      background: #17133b;
      transform: translateY(44px) rotate(-4.5deg);
      border: 32px solid #110e2b;
      box-shadow: 0 40px 65px rgba(15, 23, 42, 0.45);
    }
    /* Main face */
    .icon-face {
      position: absolute;
      width: 780px;
      height: 780px;
      border-radius: 230px;
      background: linear-gradient(150deg, #6366f1 0%, #4f46e5 55%, #4338ca 100%);
      border: 32px solid #1e1b4b;
      transform: rotate(-4.5deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 14px 28px rgba(255, 255, 255, 0.32);
    }
    .icon-text {
      font-family: 'Baloo 2', -apple-system, sans-serif;
      font-weight: 800;
      font-size: 360px;
      color: #fffdf5;
      letter-spacing: -0.025em;
      line-height: 1;
      transform: translateY(-6px);
      text-shadow: 0 8px 20px rgba(30, 27, 75, 0.35);
      user-select: none;
    }
  </style>
</head>
<body>
  <div class="icon-container">
    <div class="icon-base"></div>
    <div class="icon-face">
      <div class="icon-text">WE</div>
    </div>
  </div>
</body>
</html>`;

  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  // Give web font ample time to load and render sharply
  await new Promise((r) => setTimeout(r, 2500));
  const image = await win.webContents.capturePage();
  const pngBuffer = image.toPNG();

  // Ensure directories exist
  if (!fs.existsSync('build')) fs.mkdirSync('build', { recursive: true });
  if (!fs.existsSync('public')) fs.mkdirSync('public', { recursive: true });

  fs.writeFileSync('build/icon.png', pngBuffer);
  fs.writeFileSync('public/logo.png', pngBuffer);
  console.log('✅ Wrote 1024x1024 icon to build/icon.png and public/logo.png');

  // Generate iconset and icns using native macOS tools
  try {
    const iconsetDir = 'build/icons.iconset';
    if (fs.existsSync(iconsetDir)) fs.rmSync(iconsetDir, { recursive: true, force: true });
    fs.mkdirSync(iconsetDir, { recursive: true });

    const sizes = [
      { name: 'icon_16x16.png', size: 16 },
      { name: 'icon_16x16@2x.png', size: 32 },
      { name: 'icon_32x32.png', size: 32 },
      { name: 'icon_32x32@2x.png', size: 64 },
      { name: 'icon_128x128.png', size: 128 },
      { name: 'icon_128x128@2x.png', size: 256 },
      { name: 'icon_256x256.png', size: 256 },
      { name: 'icon_256x256@2x.png', size: 512 },
      { name: 'icon_512x512.png', size: 512 },
      { name: 'icon_512x512@2x.png', size: 1024 }
    ];

    for (const s of sizes) {
      execSync(`sips -z ${s.size} ${s.size} build/icon.png --out ${iconsetDir}/${s.name} > /dev/null 2>&1`);
    }

    // Build macOS .icns
    execSync(`iconutil -c icns ${iconsetDir} -o build/icon.icns`);
    console.log('✅ Generated native macOS build/icon.icns');

    // Clean up iconset folder
    fs.rmSync(iconsetDir, { recursive: true, force: true });
  } catch (err) {
    console.warn('⚠️ iconutil warning:', err.message);
  }

  app.quit();
});
