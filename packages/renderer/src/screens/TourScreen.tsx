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
        allow="fullscreen"
        title={tourId}
      />
      {/* Fallback exit button — used until panotour implements TOUR_EXIT postMessage */}
      <button
        style={styles.exitBtn}
        onPointerDown={() => dispatch({ type: 'HOME' })}
      >
        ‹
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
    top: '20px',
    left: '20px',
    width: '64px',
    height: '64px',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '36px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'none',
    zIndex: 9999,
  },
} as const;
