import React, { useState } from 'react';
import type { LangCode, Localized } from '@navaport/content';
import type { I18nDict } from '@navaport/content';

interface Props {
  readonly lang: LangCode;
  readonly i18n: I18nDict | null;
  readonly breadcrumbs: readonly { readonly id: string; readonly title: Localized }[];
  readonly canGoBack: boolean;
  readonly onHome: () => void;
  readonly onBack: () => void;
  readonly onSetLang: (lang: LangCode) => void;
}

const LANGS: readonly LangCode[] = ['uz', 'ru', 'en'];
const BTN = 64;

function HomeIcon(): React.ReactElement {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function BackIcon(): React.ReactElement {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

export function NavBar({
  lang,
  breadcrumbs,
  canGoBack,
  onHome,
  onBack,
  onSetLang,
}: Props): React.ReactElement {
  const [langOpen, setLangOpen] = useState(false);
  const otherLangs = LANGS.filter((l) => l !== lang);

  return (
    <div style={styles.bar}>

      {/* Left: language picker */}
      <div style={styles.side}>
        <div style={styles.langWrap}>
          <button style={styles.circleBtn} onPointerDown={() => setLangOpen((o) => !o)}>
            <span style={styles.langCode}>{lang.toUpperCase()}</span>
          </button>

          {langOpen && (
            <>
              <div style={styles.dropOverlay} onPointerDown={() => setLangOpen(false)} />
              <div style={styles.langDropdown}>
                {otherLangs.map((l) => (
                  <button
                    key={l}
                    style={styles.langOption}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      onSetLang(l);
                      setLangOpen(false);
                    }}
                  >
                    {l.toUpperCase()}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center: breadcrumbs */}
      <div style={styles.crumbs}>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id}>
            {idx > 0 && <span style={styles.sep}>/</span>}
            <span style={styles.crumbText}>{crumb.title[lang]}</span>
          </React.Fragment>
        ))}
      </div>

      {/* Right: back (sub-menu only) + home */}
      <div style={styles.rightSide}>
        {canGoBack && (
          <button style={styles.circleBtn} onPointerDown={onBack}>
            <BackIcon />
          </button>
        )}
        <button style={styles.circleBtn} onPointerDown={onHome}>
          <HomeIcon />
        </button>
      </div>

    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    height: '88px',
    padding: '0 24px',
    gap: '16px',
    background: 'transparent',
    flexShrink: 0,
  },
  side: {
    minWidth: `${BTN}px`,
  },
  rightSide: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: `${BTN}px`,
    justifyContent: 'flex-end',
  },
  crumbs: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sep: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '20px',
    fontFamily: 'sans-serif',
  },
  crumbText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: '20px',
    fontFamily: 'sans-serif',
    fontWeight: '500' as const,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  circleBtn: {
    width: `${BTN}px`,
    height: `${BTN}px`,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'none',
    flexShrink: 0,
  },
  langCode: {
    fontSize: '15px',
    fontFamily: 'sans-serif',
    fontWeight: '700' as const,
    letterSpacing: '0.08em',
  },
  langWrap: {
    position: 'relative' as const,
  },
  dropOverlay: {
    position: 'fixed' as const,
    inset: 0,
    zIndex: 99,
  },
  langDropdown: {
    position: 'absolute' as const,
    top: `${BTN + 8}px`,
    left: 0,
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  langOption: {
    width: `${BTN}px`,
    height: `${BTN}px`,
    borderRadius: '50%',
    background: 'rgba(10,10,10,0.72)',
    border: '1px solid rgba(255,255,255,0.28)',
    color: '#fff',
    fontSize: '15px',
    fontFamily: 'sans-serif',
    fontWeight: '700' as const,
    letterSpacing: '0.08em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'none',
    backdropFilter: 'blur(8px)',
  },
} as const;
