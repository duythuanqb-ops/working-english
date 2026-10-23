const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  openMiniCapture: () => ipcRenderer.send('open-mini-capture'),
  closeMiniCapture: () => ipcRenderer.send('close-mini-capture'),
  onQuickWordAdded: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('quick-word-added', handler);
    return () => ipcRenderer.removeListener('quick-word-added', handler);
  },
  sendQuickWord: (wordData) => ipcRenderer.send('save-quick-word', wordData)
});
