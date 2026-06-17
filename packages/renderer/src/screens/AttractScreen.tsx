import React, { useEffect, useRef } from 'react';
import type { LangCode } from '@navaport/content';

const HINT: Record<LangCode, string> = {
  uz: 'Ekranga bosing',
  ru: 'Kosnites ekrana',
  en: 'Touch the screen',
};

interface Props {
  readonly videoSrc: string;
  readonly lang: LangCode;
  readonly onWake: () => void;
}

export function AttractScreen({ videoSrc, lang, onWake }: Props): React.ReactElement {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (el === null) return;
    el.play().catch(() => {
      // Autoplay may be blocked in dev; kiosk environment allows muted autoplay.
    });
  }, [videoSrc]);

  return (
    <div
      style={styles.root}
      onPointerDown={onWake}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        muted
        playsInline
        style={styles.video}
      />
      <div style={styles.hint}>{HINT[lang]}</div>
    </div>
  );
}

const styles = {
  root: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    cursor: 'none',
  },
  video: {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  hint: {
    position: 'relative' as const,
    zIndex: 1,
    marginBottom: '64px',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '28px',
    fontFamily: 'sans-serif',
    letterSpacing: '0.05em',
    textShadow: '0 2px 8px rgba(0,0,0,0.6)',
    pointerEvents: 'none' as const,
  },
} as const;
