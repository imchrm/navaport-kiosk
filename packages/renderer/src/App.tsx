import React, { useReducer, useEffect, useRef, useState } from 'react';
import { assertNever, navSchema, mapsSchema, i18nSchema } from '@navaport/content';
import type { ContentBundle } from '@navaport/content';
import type { KioskConfig } from '@navaport/contract';
import { reducer, initialState } from './state/screen';
import { AttractScreen } from './screens/AttractScreen';
import { MenuScreen } from './screens/MenuScreen';
import { MapScreen } from './screens/MapScreen';
import { TourScreen } from './screens/TourScreen';

// --- video overlay opacity per screen state ---
function overlayOpacity(screen: ReturnType<typeof reducer>['screen']): number {
  switch (screen.kind) {
    case 'attract': return 0;
    case 'menu':    return screen.path.length === 0 ? 0.42 : 0.72;
    case 'map':
    case 'tour':    return 0.80;
    default:        return assertNever(screen);
  }
}

function videoPaused(screen: ReturnType<typeof reducer>['screen']): boolean {
  switch (screen.kind) {
    case 'attract': return false;
    case 'menu':    return screen.path.length > 0;
    case 'map':
    case 'tour':    return true;
    default:        return assertNever(screen);
  }
}

function parseContent(raw: unknown): ContentBundle {
  if (typeof raw !== 'object' || raw === null) throw new Error('Invalid content payload');
  const obj = raw as Record<string, unknown>;
  return {
    nav: navSchema.parse(obj['nav']),
    maps: mapsSchema.parse(obj['maps']),
    i18n: i18nSchema.parse(obj['i18n']),
  };
}

export function App(): React.ReactElement {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [config, setConfig] = useState<KioskConfig | null>(null);
  const [content, setContent] = useState<ContentBundle | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load config + content on mount
  useEffect(() => {
    void Promise.all([
      window.kiosk.getConfig(),
      window.kiosk.getContent(),
    ]).then(([cfg, raw]) => {
      setConfig(cfg);
      dispatch({ type: 'SET_LANG', lang: cfg.defaultLang });
      setContent(parseContent(raw));
    });
  }, []);

  // Subscribe to idle reset from main process
  useEffect(() => {
    return window.kiosk.onIdleReset(() => dispatch({ type: 'IDLE_RESET' }));
  }, []);

  // Report any user interaction to main watchdog
  useEffect(() => {
    const handle = () => window.kiosk.reportActivity();
    window.addEventListener('pointerdown', handle);
    return () => window.removeEventListener('pointerdown', handle);
  }, []);

  // While in tour: switch main to the longer idle timeout and use window.blur
  // as a proxy for iframe interaction (iframe pointer events don't bubble out).
  useEffect(() => {
    if (state.screen.kind !== 'tour') return;
    window.kiosk.reportActivity();
    window.kiosk.setTourActive(true);
    const onBlur = () => window.kiosk.reportActivity();
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('blur', onBlur);
      window.kiosk.setTourActive(false);
    };
  }, [state.screen.kind]);

  // Control video play/pause based on screen state
  useEffect(() => {
    const video = videoRef.current;
    if (video === null) return;
    if (videoPaused(state.screen)) {
      video.pause();
    } else {
      void video.play();
    }
  }, [state.screen]);

  const { screen, lang } = state;
  const opacity = overlayOpacity(screen);

  return (
    <div style={styles.root}>
      {/* Persistent video background */}
      {config !== null && (
        <video
          ref={videoRef}
          src={config.attractVideoSrc}
          autoPlay
          loop
          muted
          playsInline
          style={styles.video}
        />
      )}

      {/* Dimming overlay — opacity controlled by screen state */}
      <div
        style={{
          ...styles.overlay,
          opacity,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* Screen content */}
      {screen.kind === 'attract' && (
        <AttractScreen
          lang={lang}
          onWake={() => dispatch({ type: 'WAKE' })}
        />
      )}

      {screen.kind === 'menu' && content !== null && (
        <MenuScreen
          nav={content.nav}
          path={screen.path}
          lang={lang}
          i18n={content.i18n}
          dispatch={dispatch}
        />
      )}

      {(() => {
        if (screen.kind !== 'map' || content === null) return null;
        const map = content.maps.find((m) => m.id === screen.floorId);
        if (map === undefined) return null;
        return (
          <MapScreen
            map={map}
            lang={lang}
            i18n={content.i18n}
            dispatch={dispatch}
          />
        );
      })()}

      {screen.kind === 'tour' && config !== null && (
        <TourScreen
          tourId={screen.tourId}
          sceneId={screen.sceneId}
          lang={lang}
          tourBaseUrl={config.tourBaseUrl}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

const styles = {
  root: {
    position: 'absolute' as const,
    inset: 0,
    overflow: 'hidden',
  },
  video: {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  overlay: {
    position: 'absolute' as const,
    inset: 0,
    background: '#000',
    pointerEvents: 'none' as const,
  },
  placeholder: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontFamily: 'sans-serif',
    fontSize: '24px',
    cursor: 'none',
  },
} as const;
