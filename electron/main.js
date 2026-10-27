const { app, BrowserWindow, globalShortcut, ipcMain, screen, protocol, session, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
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

// Report a clean Chrome user-agent by removing Electron and app tokens (helps compatibility with Google/YouTube services)
app.userAgentFallback = app.userAgentFallback
  .replace(/\s+Electron\/\S+/i, '')
  .replace(new RegExp(`\\s+(?:${app.getName()}|working-english|WorkingEnglish)\\/\\S+`, 'gi'), '');

function createMainWindow() {
  const iconPath = path.join(__dirname, '../build/icon.png');
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 650,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
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
    mainWindow.loadURL('http://localhost:5174');
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
    ? 'http://localhost:5174/?view=mini' 
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

ipcMain.handle('send-desktop-notification', (_event, { title, body }) => {
  try {
    if (Notification.isSupported()) {
      const notif = new Notification({
        title: title || 'WorkingEnglish',
        body: body || 'Đã đến giờ ôn tập tiếng Anh hôm nay!',
        silent: false
      });
      notif.show();
      notif.on('click', () => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore();
          mainWindow.show();
          mainWindow.focus();
        }
      });
      return { success: true };
    }
    return { success: false, reason: 'Notification not supported on this platform' };
  } catch (err) {
    console.error('Failed to show notification:', err);
    return { success: false, error: err.message };
  }
});

// Persistent User Data Storage handlers (Disk file + rolling backups)
function getUserDataFilePath() {
  return path.join(app.getPath('userData'), 'working_english_data.json');
}

function getBackupDirPath() {
  const backupDir = path.join(app.getPath('userData'), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  return backupDir;
}

ipcMain.handle('save-user-data', async (_event, payload) => {
  try {
    const filePath = getUserDataFilePath();
    const dataString = JSON.stringify(payload, null, 2);
    fs.writeFileSync(filePath, dataString, 'utf8');

    // Rolling daily backup
    try {
      const today = new Date().toISOString().slice(0, 10);
      const backupFile = path.join(getBackupDirPath(), `backup_${today}.json`);
      if (!fs.existsSync(backupFile)) {
        fs.writeFileSync(backupFile, dataString, 'utf8');
      }
    } catch (bErr) {
      // backup failure should not block main save
    }

    return { success: true, path: filePath };
  } catch (err) {
    console.error('Failed to save user data to disk:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('load-user-data', async () => {
  try {
    const filePath = getUserDataFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return { success: true, data: JSON.parse(content), path: filePath };
    }
    return { success: true, data: null, path: filePath };
  } catch (err) {
    console.error('Failed to load user data from disk:', err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('get-user-data-path', () => {
  return {
    userDataDir: app.getPath('userData'),
    dataFile: getUserDataFilePath(),
    backupDir: path.join(app.getPath('userData'), 'backups')
  };
});

app.whenReady().then(() => {
  if (!isDev) mapExamMediaRequests();

  // YouTube embeds need a valid Referer. When loaded from file:// (packaged app), no Referer is sent,
  // causing error 153. We set Referer to https://workingenglish.app/.
  // NOTE: Never set Referer or Origin to https://www.youtube.com because YouTube rejects embedded player
  // requests whose referer is youtube.com itself with Error 152-4.
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*.youtube.com/*', '*://*.youtube-nocookie.com/*'] },
    (details, callback) => {
      const ref = details.requestHeaders['Referer'];
      if (!ref || ref.startsWith('file:')) {
        details.requestHeaders['Referer'] = 'https://workingenglish.app/';
      }
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

  if (process.platform === 'darwin' && app.dock) {
    const dockIconPath = path.join(__dirname, '../build/icon.png');
    if (fs.existsSync(dockIconPath)) {
      try {
        app.dock.setIcon(dockIconPath);
      } catch (_) {}
    }
  }

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
