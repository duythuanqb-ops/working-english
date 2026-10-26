const { app, BrowserWindow, globalShortcut, ipcMain, screen, protocol, session } = require('electron');
const path = require('path');
const { fileURLToPath } = require('url');
const { getExamsDir, checkExamMediaStatus, downloadAndExtractMedia } = require('./mediaManager');

// The renderer references exam media as absolute "/exams/..." paths, which under loadFile become file:///exams/... or file:///C:/exams/... on Windows
function mapExamMediaRequests() {
  protocol.interceptFileProtocol('file', (request, callback) => {
    let urlPath;
    try {
      urlPath = fileURLToPath(request.url);
    } catch {
      urlPath = request.url;
    }
    // Match /exams/... on macOS/Linux or C:\exams\... / C:/exams/... on Windows
    const match = urlPath.match(/(?:^[a-zA-Z]:)?[/\\]exams[/\\](.*)$/);
    if (match) {
      const relPath = match[1];
      callback(path.join(getExamsDir(), relPath));
    } else {
      callback(urlPath);
    }
  });
}

let mainWindow = null;
let miniWindow = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 650,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    ...(process.platform === 'darwin' ? { trafficLightPosition: { x: 18, y: 18 } } : {}),
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    // Open DevTools in dev mode if needed
    // mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMiniWindow() {
  if (miniWindow) {
    if (miniWindow.isVisible()) {
      miniWindow.hide();
    } else {
      miniWindow.show();
      miniWindow.focus();
    }
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  miniWindow = new BrowserWindow({
    width: 520,
    height: 420,
    x: Math.round((width - 520) / 2),
    y: 120,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  });

  const miniUrl = isDev 
    ? 'http://localhost:5173/?view=mini' 
    : `file://${path.join(__dirname, '../dist/index.html')}?view=mini`;

  miniWindow.loadURL(miniUrl);

  miniWindow.once('ready-to-show', () => {
    miniWindow.show();
    miniWindow.focus();
  });

  miniWindow.on('blur', () => {
    // Optional: Hide when losing focus for quick-capture feel
    // miniWindow.hide();
  });

  miniWindow.on('closed', () => {
    miniWindow = null;
  });
}

// IPC Handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('open-mini-capture', () => {
  createMiniWindow();
});

ipcMain.on('close-mini-capture', () => {
  if (miniWindow) {
    miniWindow.hide();
  }
});

ipcMain.on('save-quick-word', (_event, wordData) => {
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send('quick-word-added', wordData);
  }
  if (miniWindow) {
    miniWindow.hide();
  }
});

// Media Download & Status Handlers (GitHub Releases)
ipcMain.handle('get-exam-media-status', () => {
  return checkExamMediaStatus();
});

ipcMain.handle('download-exam-media', async (_event, type) => {
  try {
    const status = await downloadAndExtractMedia(type, (progress) => {
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('exam-media-progress', progress);
      }
    });
    return { success: true, status };
  } catch (err) {
    console.error('Failed to download exam media:', err);
    return { success: false, error: err.message };
  }
});

app.whenReady().then(() => {
  if (!isDev) mapExamMediaRequests();

  // YouTube Referer & Origin interceptor (fixes error 150/152/153 on file://)
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*.youtube.com/*', '*://*.googlevideo.com/*', '*://*.ytimg.com/*'] },
    (details, callback) => {
      details.requestHeaders['Referer'] = 'https://www.youtube.com';
      details.requestHeaders['Origin'] = 'https://www.youtube.com';
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    }
  );

  // Auto-grant media/microphone permissions
  session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    if (permission === 'media') {
      return callback(true);
    }
    callback(false);
  });

  createMainWindow();

  // Register global hotkey for Quick Capture: Option+Space or Command+Shift+E
  try {
    globalShortcut.register('CommandOrControl+Shift+E', () => {
      createMiniWindow();
    });
  } catch (err) {
    console.error('Failed to register global shortcut:', err);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
