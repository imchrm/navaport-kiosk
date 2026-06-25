import type { NavTarget, LangCode } from '@navaport/content';
import { assertNever } from '@navaport/content';

export type KioskScreen =
  | { readonly kind: 'attract' }
  | { readonly kind: 'menu'; readonly path: readonly string[] }
  | { readonly kind: 'map'; readonly floorId: string }
  | { readonly kind: 'tour'; readonly tourId: string; readonly sceneId: string };

export type Action =
  | { readonly type: 'WAKE' }
  | { readonly type: 'DRILL'; readonly nodeId: string }
  | { readonly type: 'BACK' }
  | { readonly type: 'HOME' }
  | { readonly type: 'OPEN_TARGET'; readonly target: NavTarget }
  | { readonly type: 'IDLE_RESET' }
  | { readonly type: 'SET_LANG'; readonly lang: LangCode };

export interface AppState {
  readonly screen: KioskScreen;
  readonly lang: LangCode;
}

export const initialState: AppState = {
  screen: { kind: 'attract' },
  lang: 'ru',
};

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'WAKE':
      if (state.screen.kind !== 'attract') return state;
      return { ...state, screen: { kind: 'menu', path: [] } };

    case 'IDLE_RESET':
      if (state.screen.kind === 'attract') return state;
      return { ...state, screen: { kind: 'attract' } };

    case 'HOME':
      return { ...state, screen: { kind: 'attract' } };

    case 'BACK': {
      if (state.screen.kind !== 'menu') return { ...state, screen: { kind: 'menu', path: [] } };
      const newPath = state.screen.path.slice(0, -1);
      if (newPath.length === 0) return { ...state, screen: { kind: 'attract' } };
      return { ...state, screen: { kind: 'menu', path: newPath } };
    }

    case 'DRILL':
      if (state.screen.kind !== 'menu') return state;
      return { ...state, screen: { kind: 'menu', path: [...state.screen.path, action.nodeId] } };

    case 'OPEN_TARGET': {
      const t = action.target;
      switch (t.kind) {
        case 'tour':
          return { ...state, screen: { kind: 'tour', tourId: t.tourId, sceneId: t.sceneId } };
        case 'location':
          return { ...state, screen: { kind: 'map', floorId: t.mapId } };
        case 'info':
        case 'external':
          return state;
        default:
          return assertNever(t);
      }
    }

    case 'SET_LANG':
      return { ...state, lang: action.lang };

    default:
      return assertNever(action);
  }
}
