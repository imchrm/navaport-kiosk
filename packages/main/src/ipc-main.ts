import { ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import type { KioskConfig } from '@navaport/contract';
import { TOUR_SERVER_BASE_URL } from './tour-server';

const isDev = process.env['NODE_ENV'] === 'development';

const config: KioskConfig = {
  menuIdleTimeoutMs: isDev ? 5_000 : 60_000,
  tourIdleTimeoutMs: isDev ? 30_000 : 300_000,
  defaultLang: 'ru',
  attractVideoSrc: 'video/attract.mp4',
  tourBaseUrl: isDev ? 'https://360tur.uz/tours' : TOUR_SERVER_BASE_URL,
};

const contentDir = isDev
  ? path.join(__dirname, '../../../content')
  : path.join(process.resourcesPath, 'content');

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
