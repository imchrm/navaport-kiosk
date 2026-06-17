import React, { useReducer, useEffect, useState } from 'react';
import { assertNever } from '@navaport/content';
import type { KioskConfig } from '@navaport/contract';
import { reducer, initialState } from './state/screen';
import { AttractScreen } from './screens/AttractScreen';

export function App(): React.ReactElement {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [config, setConfig] = useState<KioskConfig | null>(null);

  useEffect(() => {
    void window.kiosk.getConfig().then((cfg) => {
      setConfig(cfg);
      dispatch({ type: 'SET_LANG', lang: cfg.defaultLang });
    });
  }, []);

  useEffect(() => {
    const unsubscribe = window.kiosk.onIdleReset(() => {
      dispatch({ type: 'IDLE_RESET' });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handle = () => window.kiosk.reportActivity();
    window.addEventListener('pointerdown', handle);
    return () => window.removeEventListener('pointerdown', handle);
  }, []);

  if (config === null) {
    return <div style={{ background: '#000', width: '100%', height: '100%' }} />;
  }

  const { screen, lang } = state;

  switch (screen.kind) {
    case 'attract':
      return (
        <AttractScreen
          videoSrc={config.attractVideoSrc}
          lang={lang}
          onWake={() => dispatch({ type: 'WAKE' })}
        />
      );

    case 'menu':
      // Phase 2: drill-down menu
      return (
        <div style={placeholderStyle} onPointerDown={() => dispatch({ type: 'HOME' })}>
          Menu — Phase 2 (tap to go back to attract)
        </div>
      );

    case 'map':
      // Phase 3: 2D floor map
      return (
        <div style={placeholderStyle} onPointerDown={() => dispatch({ type: 'HOME' })}>
          Map {screen.floorId} — Phase 3 (tap to go back)
        </div>
      );

    case 'tour':
      // Phase 4: panotour viewer
      return (
        <div style={placeholderStyle} onPointerDown={() => dispatch({ type: 'HOME' })}>
          Tour {screen.tourId}/{screen.sceneId} — Phase 4 (tap to go back)
        </div>
      );

    default:
      return assertNever(screen);
  }
}

const placeholderStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#111',
  color: '#fff',
  fontFamily: 'sans-serif',
  fontSize: '24px',
  cursor: 'none',
};
