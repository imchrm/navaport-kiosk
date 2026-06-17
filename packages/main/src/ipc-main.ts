import { ipcMain } from 'electron';
import type { KioskConfig } from '@navaport/contract';

const config: KioskConfig = {
  idleTimeoutMs: 60_000,
  defaultLang: 'ru',
  // Replace with the actual file once D1 (target OS / hardware codec) is resolved.
  attractVideoSrc: 'video/attract.mp4',
};

export function setupIpc(): void {
  ipcMain.handle('kiosk:getConfig', (): KioskConfig => config);
}

export { config };
