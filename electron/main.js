const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');

let mainWindow = null;
let miniWindow = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 650,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
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

app.whenReady().then(() => {
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
