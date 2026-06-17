import { app } from 'electron';
import { createWindow } from './window';
import { setupIpc } from './ipc-main';
import { startLifecycle } from './lifecycle';

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

app.on('second-instance', () => {
  // Focus existing window if a second instance tries to launch.
});

app.whenReady().then(() => {
  setupIpc();
  const win = createWindow();
  startLifecycle(win);

  win.webContents.on('destroyed', () => {
    app.relaunch();
    app.exit(0);
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
