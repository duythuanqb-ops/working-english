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
  sendQuickWord: (wordData) => ipcRenderer.send('save-quick-word', wordData),
  getExamMediaStatus: () => ipcRenderer.invoke('get-exam-media-status'),
  downloadExamMedia: (type) => ipcRenderer.invoke('download-exam-media', type),
  onExamMediaProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('exam-media-progress', handler);
    return () => ipcRenderer.removeListener('exam-media-progress', handler);
  },
  sendNotification: (data) => ipcRenderer.invoke('send-desktop-notification', data),
  saveUserData: (data) => ipcRenderer.invoke('save-user-data', data),
  loadUserData: () => ipcRenderer.invoke('load-user-data'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path')
});
