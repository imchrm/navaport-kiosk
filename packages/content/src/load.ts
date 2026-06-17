import { readFileSync } from 'node:fs';
import { navSchema, mapsSchema, i18nSchema } from './schema.js';
import type { ContentBundle } from './types.js';

function readJson(filePath: string): unknown {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as unknown;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`[content] Failed to read "${filePath}": ${message}`);
  }
}

function parseOrDie<T>(schema: { parse: (data: unknown) => T }, data: unknown, label: string): T {
  const result = schema.parse(data);
  return result;
}

export function loadContent(contentDir: string): ContentBundle {
  const rawNav = readJson(`${contentDir}/nav.json`);
  const rawMaps = readJson(`${contentDir}/maps.json`);
  const rawI18n = readJson(`${contentDir}/i18n.json`);

  const nav = parseOrDie(navSchema, rawNav, 'nav.json');
  const maps = parseOrDie(mapsSchema, rawMaps, 'maps.json');
  const i18n = parseOrDie(i18nSchema, rawI18n, 'i18n.json');

  return { nav, maps, i18n };
}
