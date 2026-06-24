import React, { useEffect } from 'react';
import type { LangCode } from '@navaport/content';
import type { Action } from '../state/screen';

interface Props {
  readonly tourId: string;
  readonly sceneId: string;
  readonly lang: LangCode;
  readonly tourBaseUrl: string;
  readonly dispatch: (action: Action) => void;
}

export function TourScreen({ tourId, sceneId, lang, tourBaseUrl, dispatch }: Props): React.ReactElement {
  const src = sceneId
    ? `${tourBaseUrl}/${tourId}?lang=${lang}&scene=${sceneId}`
    : `${tourBaseUrl}/${tourId}?lang=${lang}`;

  // Listen for exit signal from the panotour viewer.
  // Viewer sends: window.parent.postMessage({ type: 'TOUR_EXIT' }, '*')
  useEffect(() => {
    const handle = (event: MessageEvent) => {
      const data = event.data as Record<string, unknown> | null;
      if (data !== null && typeof data === 'object' && data['type'] === 'TOUR_EXIT') {
        dispatch({ type: 'HOME' });
      }
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [dispatch]);

  return (
    <div style={styles.root}>
      <iframe
        src={src}
        style={styles.iframe}
        title={tourId}
      />
      {/* Kiosk-level exit button — visible when panotour has no built-in exit */}
      <button
        style={styles.exitBtn}
        onPointerDown={() => dispatch({ type: 'HOME' })}
      >
        &#8592;
      </button>
    </div>
  );
}

const styles = {
  root: {
    position: 'absolute' as const,
    inset: 0,
  },
  iframe: {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  exitBtn: {
    position: 'absolute' as const,
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 300,
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.55)',
    border: '2px solid rgba(255, 255, 255, 0.45)',
    color: '#fff',
    fontSize: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'none',
    backdropFilter: 'blur(4px)',
  },
} as const;
