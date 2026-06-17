// Browser-safe exports: types, assertNever, Zod schemas.
// loadContent (Node.js only) lives in ./load.ts — import it directly in the main process.
export type {
  LangCode,
  Localized,
  NavTarget,
  MenuBranch,
  MenuLeaf,
  MenuNode,
  ZoneShape,
  MapZone,
  FloorMap,
  ContentBundle,
} from './types.js';
export { assertNever } from './assertNever.js';
export { navSchema, mapsSchema, i18nSchema } from './schema.js';
export type { I18nDict } from './schema.js';
