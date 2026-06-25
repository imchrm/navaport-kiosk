import React from 'react';
import type { FloorMap, MapZone, LangCode } from '@navaport/content';
import type { I18nDict } from '@navaport/content';
import { assertNever } from '@navaport/content';
import type { Action } from '../state/screen';
import { NavBar } from '../components/NavBar';

interface Props {
  readonly map: FloorMap;
  readonly lang: LangCode;
  readonly i18n: I18nDict | null;
  readonly dispatch: (action: Action) => void;
}

export function MapScreen({ map, lang, i18n, dispatch }: Props): React.ReactElement {
  return (
    <div style={styles.root}>
      <NavBar
        lang={lang}
        i18n={i18n}
        breadcrumbs={[{ id: map.id, title: map.title }]}
        canGoBack={true}
        onHome={() => dispatch({ type: 'HOME' })}
        onBack={() => dispatch({ type: 'BACK' })}
        onSetLang={(l) => dispatch({ type: 'SET_LANG', lang: l })}
      />
      <div style={styles.mapArea}>
        <svg
          viewBox={map.viewBox}
          preserveAspectRatio="xMidYMid meet"
          style={styles.svg}
        >
          <image
            href={map.svgAsset}
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          />
          {map.zones.map((zone) => (
            <ZoneHit
              key={zone.id}
              zone={zone}
              lang={lang}
              onPress={() => dispatch({ type: 'OPEN_TARGET', target: zone.target })}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

interface ZoneHitProps {
  readonly zone: MapZone;
  readonly lang: LangCode;
  readonly onPress: () => void;
}

function ZoneHit({ zone, lang, onPress }: ZoneHitProps): React.ReactElement {
  const [pressed, setPressed] = React.useState(false);

  const fill = pressed ? 'rgba(255,180,0,0.38)' : 'rgba(255,255,255,0.10)';
  const stroke = pressed ? 'rgba(255,180,0,0.90)' : 'rgba(255,255,255,0.35)';

  const handlers = {
    onPointerDown: (e: React.PointerEvent) => {
      e.stopPropagation();
      setPressed(true);
      onPress();
    },
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
  };

  const labelStyle: React.CSSProperties = {
    userSelect: 'none',
    pointerEvents: 'none',
  };

  const { shape } = zone;

  if (shape.kind === 'rect') {
    const { x, y, w, h } = shape;
    return (
      <g style={{ cursor: 'none' }}>
        <rect
          x={x} y={y} width={w} height={h}
          fill={fill} stroke={stroke} strokeWidth={3} rx={6}
          {...handlers}
        />
        <text
          x={x + w / 2} y={y + h / 2}
          textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize={18} fontFamily="sans-serif"
          fontWeight="500" letterSpacing="0.04em"
          style={labelStyle}
        >
          {zone.title[lang]}
        </text>
      </g>
    );
  }

  if (shape.kind === 'polygon') {
    const pts = shape.points;
    const cx = pts.reduce((s, [px]) => s + px, 0) / pts.length;
    const cy = pts.reduce((s, [, py]) => s + py, 0) / pts.length;
    const pointStr = pts.map(([px, py]) => `${px},${py}`).join(' ');
    return (
      <g style={{ cursor: 'none' }}>
        <polygon
          points={pointStr}
          fill={fill} stroke={stroke} strokeWidth={3}
          {...handlers}
        />
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="middle"
          fill="#fff" fontSize={18} fontFamily="sans-serif"
          fontWeight="500" letterSpacing="0.04em"
          style={labelStyle}
        >
          {zone.title[lang]}
        </text>
      </g>
    );
  }

  return assertNever(shape);
}

const styles = {
  root: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  mapArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 32px',
    overflow: 'hidden',
  },
  svg: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    display: 'block',
  },
} as const;
