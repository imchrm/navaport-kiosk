import { BrowserWindow } from 'electron';
import path from 'node:path';

const isDev = process.env['NODE_ENV'] === 'development';
const DEV_URL = process.env['ELECTRON_DEV_URL'] ?? 'http://localhost:5173';

export function createWindow(): BrowserWindow {
  const preloadPath = path.join(__dirname, 'preload.js');

  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: !isDev,
    kiosk: !isDev,
    frame: isDev,
    resizable: isDev,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  if (isDev) {
    void win.loadURL(DEV_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    void win.loadFile(path.join(__dirname, '../../renderer/dist/index.html'));
  }

  win.webContents.on('context-menu', (e) => e.preventDefault());

  return win;
}
