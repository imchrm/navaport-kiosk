import { ipcMain, powerSaveBlocker } from 'electron';
import type { BrowserWindow } from 'electron';
import { config } from './ipc-main';

export function startLifecycle(win: BrowserWindow): void {
  powerSaveBlocker.start('prevent-display-sleep');

  let idleTimer: ReturnType<typeof setTimeout> | null = null;
  let isTimerScheduled = false;
  let isTourActive = false;

  const scheduleIdleReset = (): void => {
    if (idleTimer !== null) clearTimeout(idleTimer);
    isTimerScheduled = true;
    const timeout = isTourActive ? config.tourIdleTimeoutMs : config.menuIdleTimeoutMs;
    idleTimer = setTimeout(() => {
      isTimerScheduled = false;
      win.webContents.send('kiosk:idleReset');
    }, timeout);
  };

  // Idle timer starts only on first user touch, not at app launch.
  ipcMain.on('kiosk:reportActivity', () => scheduleIdleReset());

  ipcMain.on('kiosk:setTourActive', (_event, active: unknown) => {
    isTourActive = active === true;
    // If a timer is already running, reschedule it with the new timeout.
    if (isTimerScheduled) scheduleIdleReset();
  });

  win.on('closed', () => {
    if (idleTimer !== null) clearTimeout(idleTimer);
    ipcMain.removeAllListeners('kiosk:reportActivity');
    ipcMain.removeAllListeners('kiosk:setTourActive');
  });
}
