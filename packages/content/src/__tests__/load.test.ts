import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadContent } from '../load.js';
import { navSchema, mapsSchema, i18nSchema } from '../schema.js';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../../..');
const contentDir = resolve(repoRoot, 'content');

describe('loadContent', () => {
  it('parses valid content without throwing', () => {
    const bundle = loadContent(contentDir);
    expect(bundle.nav.length).toBeGreaterThan(0);
    expect(bundle.maps.length).toBeGreaterThan(0);
  });

  it('nav contains expected branch and leaf', () => {
    const bundle = loadContent(contentDir);
    const first = bundle.nav[0];
    expect(first).toBeDefined();
    if (first === undefined) return;
    expect(first.kind).toBe('branch');
  });

  it('maps zone target is a tour', () => {
    const bundle = loadContent(contentDir);
    const floor = bundle.maps[0];
    expect(floor).toBeDefined();
    if (floor === undefined) return;
    const zone = floor.zones[0];
    expect(zone).toBeDefined();
    if (zone === undefined) return;
    expect(zone.target.kind).toBe('tour');
  });
});

describe('navSchema rejects invalid data', () => {
  it('throws on missing required field', () => {
    const bad = [{ kind: 'leaf', id: 'x', title: { uz: '', ru: '', en: '' } }];
    expect(() => navSchema.parse(bad)).toThrow();
  });

  it('throws on unknown kind', () => {
    const bad = [{ kind: 'unknown', id: 'x', title: { uz: '', ru: '', en: '' } }];
    expect(() => navSchema.parse(bad)).toThrow();
  });
});

describe('mapsSchema rejects invalid data', () => {
  it('throws when zone shape kind is missing', () => {
    const bad = [
      {
        id: 'f1',
        title: { uz: '', ru: '', en: '' },
        svgAsset: 'a.svg',
        viewBox: '0 0 1000 600',
        zones: [
          {
            id: 'z1',
            title: { uz: '', ru: '', en: '' },
            shape: { kind: 'circle', r: 10 },
            target: { kind: 'tour', tourId: 't', sceneId: 's' },
          },
        ],
      },
    ];
    expect(() => mapsSchema.parse(bad)).toThrow();
  });
});

describe('i18nSchema', () => {
  it('accepts valid i18n dict', () => {
    const valid = {
      uz: { 'nav.back': 'Orqaga' },
      ru: { 'nav.back': 'Назад' },
      en: { 'nav.back': 'Back' },
    };
    expect(() => i18nSchema.parse(valid)).not.toThrow();
  });

  it('throws when a language key is missing', () => {
    const bad = { uz: {}, ru: {} };
    expect(() => i18nSchema.parse(bad)).toThrow();
  });
});
