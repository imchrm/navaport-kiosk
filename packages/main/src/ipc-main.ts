import { ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { KioskConfig } from '@navaport/contract';

const config: KioskConfig = {
  idleTimeoutMs: 5_000,
  defaultLang: 'ru',
  // Replace with actual video once D1 (target OS / hardware codec) is resolved.
  attractVideoSrc: 'video/attract.mp4',
  // Switch to local path (e.g. http://localhost:PORT/tours) for production deployment.
  tourBaseUrl: 'https://360tur.uz/tours',
};

// Phase 2: raw read + pass to renderer for Zod validation.
// TODO Phase 5: validate here too once CJS/ESM interop is sorted.
const contentDir = path.join(__dirname, '../../../content');

function readRawContent(): unknown {
  const read = (file: string): unknown =>
    JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf-8')) as unknown;
  return { nav: read('nav.json'), maps: read('maps.json'), i18n: read('i18n.json') };
}

let cachedContent: unknown;

export function setupIpc(): void {
  try {
    cachedContent = readRawContent();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`[main] Failed to load content files: ${msg}`);
  }

  ipcMain.handle('kiosk:getConfig', (): KioskConfig => config);
  ipcMain.handle('kiosk:getContent', (): unknown => cachedContent);
}

export { config };
