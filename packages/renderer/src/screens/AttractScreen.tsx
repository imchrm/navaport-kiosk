import React from 'react';
import type { LangCode } from '@navaport/content';

const HINT: Record<LangCode, string> = {
  uz: 'Ekranga bosing',
  ru: 'Kosnites ekrana',
  en: 'Touch the screen',
};

interface Props {
  readonly lang: LangCode;
  readonly onWake: () => void;
}

export function AttractScreen({ lang, onWake }: Props): React.ReactElement {
  return (
    <div style={styles.root} onPointerDown={onWake}>
      <div style={styles.hint} className="fade-in">
        {HINT[lang]}
      </div>
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
  hint: {
    position: 'relative' as const,
    zIndex: 1,
    marginBottom: '64px',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '28px',
    fontFamily: 'sans-serif',
    letterSpacing: '0.06em',
    textShadow: '0 2px 12px rgba(0,0,0,0.7)',
    pointerEvents: 'none' as const,
  },
} as const;
