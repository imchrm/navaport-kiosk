import type { I18nDict } from './schema.js';

export type LangCode = 'uz' | 'ru' | 'en';
export type Localized = Readonly<Record<LangCode, string>>;

export type NavTarget =
  | { readonly kind: 'tour'; readonly tourId: string; readonly sceneId: string }
  | { readonly kind: 'info'; readonly body: Localized }
  | { readonly kind: 'location'; readonly mapId: string; readonly zoneId: string }
  | { readonly kind: 'external'; readonly ref: string };

interface MenuNodeBase {
  readonly id: string;
  readonly title: Localized;
  readonly icon?: string;
}

export interface MenuBranch extends MenuNodeBase {
  readonly kind: 'branch';
  readonly children: readonly MenuNode[];
}

export interface MenuLeaf extends MenuNodeBase {
  readonly kind: 'leaf';
  readonly target: NavTarget;
}

export type MenuNode = MenuBranch | MenuLeaf;

export type ZoneShape =
  | { readonly kind: 'rect'; readonly x: number; readonly y: number; readonly w: number; readonly h: number }
  | { readonly kind: 'polygon'; readonly points: readonly (readonly [number, number])[] };

export interface MapZone {
  readonly id: string;
  readonly title: Localized;
  readonly shape: ZoneShape;
  readonly target: NavTarget;
}

export interface FloorMap {
  readonly id: string;
  readonly title: Localized;
  readonly svgAsset: string;
  readonly zones: readonly MapZone[];
}

export interface ContentBundle {
  readonly nav: readonly MenuNode[];
  readonly maps: readonly FloorMap[];
  readonly i18n: I18nDict;
}
