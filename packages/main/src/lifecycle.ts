import { ipcMain, powerSaveBlocker } from 'electron';
import type { BrowserWindow } from 'electron';
import { config } from './ipc-main';

export function startLifecycle(win: BrowserWindow): void {
  powerSaveBlocker.start('prevent-display-sleep');

  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleIdleReset = (): void => {
    if (idleTimer !== null) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      win.webContents.send('kiosk:idleReset');
    }, config.idleTimeoutMs);
  };

  scheduleIdleReset();

  ipcMain.on('kiosk:reportActivity', () => scheduleIdleReset());

  win.on('closed', () => {
    if (idleTimer !== null) clearTimeout(idleTimer);
  });
}
