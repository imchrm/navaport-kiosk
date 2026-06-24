import { app } from 'electron';
import path from 'node:path';
import { createWindow } from './window';
import { setupIpc } from './ipc-main';
import { startLifecycle } from './lifecycle';
import { setupHardening } from './hardening';
import { startTourServer } from './tour-server';

const isDev = process.env['NODE_ENV'] === 'development';

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  // Focus existing window if a second instance tries to launch.
});

app.whenReady().then(() => {
  if (!isDev) {
    app.setLoginItemSettings({ openAtLogin: true });
    const toursDir = process.resourcesPath;
    startTourServer(toursDir);
  }

  setupHardening();
  setupIpc();
  const win = createWindow();
  startLifecycle(win);

  win.webContents.on('destroyed', () => {
    if (!isDev) {
      app.relaunch();
      app.exit(0);
    }
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
