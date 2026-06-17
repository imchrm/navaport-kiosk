import React from 'react';
import type { MenuNode, Localized, LangCode } from '@navaport/content';
import type { I18nDict } from '@navaport/content';
import type { Action } from '../state/screen';
import { NavBar } from '../components/NavBar';

interface Props {
  readonly nav: readonly MenuNode[];
  readonly path: readonly string[];
  readonly lang: LangCode;
  readonly i18n: I18nDict | null;
  readonly dispatch: (action: Action) => void;
}

function getNodesAtPath(
  root: readonly MenuNode[],
  path: readonly string[],
): readonly MenuNode[] {
  let current: readonly MenuNode[] = root;
  for (const id of path) {
    const node = current.find((n) => n.id === id);
    if (node === undefined || node.kind !== 'branch') return [];
    current = node.children;
  }
  return current;
}

function getBreadcrumbs(
  root: readonly MenuNode[],
  path: readonly string[],
): readonly { readonly id: string; readonly title: Localized }[] {
  const crumbs: { readonly id: string; readonly title: Localized }[] = [];
  let current: readonly MenuNode[] = root;
  for (const id of path) {
    const node = current.find((n) => n.id === id);
    if (node === undefined) break;
    crumbs.push({ id: node.id, title: node.title });
    if (node.kind !== 'branch') break;
    current = node.children;
  }
  return crumbs;
}

export function MenuScreen({ nav, path, lang, i18n, dispatch }: Props): React.ReactElement {
  const nodes = getNodesAtPath(nav, path);
  const breadcrumbs = getBreadcrumbs(nav, path);

  const handleNode = (node: MenuNode) => {
    if (node.kind === 'branch') {
      dispatch({ type: 'DRILL', nodeId: node.id });
    } else {
      dispatch({ type: 'OPEN_TARGET', target: node.target });
    }
  };

  return (
    <div style={styles.root}>
      <NavBar
        lang={lang}
        i18n={i18n}
        breadcrumbs={breadcrumbs}
        canGoBack={path.length > 0}
        onHome={() => dispatch({ type: 'HOME' })}
        onBack={() => dispatch({ type: 'BACK' })}
        onSetLang={(l) => dispatch({ type: 'SET_LANG', lang: l })}
      />

      <div key={path.join('/')} className="menu-enter" style={styles.grid}>
        {nodes.map((node) => (
          <Tile
            key={node.id}
            node={node}
            lang={lang}
            onPress={() => handleNode(node)}
          />
        ))}
      </div>
    </div>
  );
}

interface TileProps {
  readonly node: MenuNode;
  readonly lang: LangCode;
  readonly onPress: () => void;
}

function Tile({ node, lang, onPress }: TileProps): React.ReactElement {
  const [pressed, setPressed] = React.useState(false);

  return (
    <button
      style={{
        ...styles.tile,
        ...(pressed ? styles.tilePressed : {}),
      }}
      onPointerDown={() => {
        setPressed(true);
        onPress();
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
    >
      <span style={styles.tileLabel}>{node.title[lang]}</span>
      {node.kind === 'branch' && <span style={styles.tileCaret}>›</span>}
    </button>
  );
}

const styles = {
  root: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  grid: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
    padding: '32px 40px',
    overflowY: 'auto' as const,
    alignContent: 'start' as const,
  },
  tile: {
    minHeight: '160px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column' as const,
    gap: '8px',
    background: 'rgba(255,255,255,0.10)',
    border: '1px solid rgba(255,255,255,0.20)',
    borderRadius: '12px',
    color: '#fff',
    fontFamily: 'sans-serif',
    fontSize: '22px',
    fontWeight: '500' as const,
    cursor: 'none',
    padding: '24px',
    textAlign: 'center' as const,
    transition: 'background 0.1s ease, border-color 0.1s ease',
  },
  tilePressed: {
    background: 'rgba(255,255,255,0.25)',
    borderColor: 'rgba(255,255,255,0.5)',
  },
  tileLabel: {
    lineHeight: 1.3,
    pointerEvents: 'none' as const,
  },
  tileCaret: {
    fontSize: '28px',
    opacity: 0.6,
    pointerEvents: 'none' as const,
  },
} as const;
