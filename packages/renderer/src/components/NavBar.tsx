import React from 'react';
import type { LangCode, Localized } from '@navaport/content';
import type { I18nDict } from '@navaport/content';
import { t } from '../hooks/useI18n';

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

export function NavBar({
  lang,
  i18n,
  breadcrumbs,
  canGoBack,
  onHome,
  onBack,
  onSetLang,
}: Props): React.ReactElement {
  return (
    <div style={styles.bar}>
      <div style={styles.langGroup}>
        {LANGS.map((l) => (
          <button
            key={l}
            style={{ ...styles.langBtn, ...(l === lang ? styles.langBtnActive : {}) }}
            onPointerDown={() => onSetLang(l)}
          >
            {t(i18n, l, `lang.${l}`)}
          </button>
        ))}
      </div>

      <div style={styles.crumbs}>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.id}>
            {idx > 0 && <span style={styles.sep}>/</span>}
            <span style={styles.crumbText}>{crumb.title[lang]}</span>
          </React.Fragment>
        ))}
      </div>

      <div style={styles.navBtns}>
        {canGoBack && (
          <button style={styles.navBtn} onPointerDown={onBack}>
            {t(i18n, lang, 'nav.back')}
          </button>
        )}
        <button style={styles.navBtn} onPointerDown={onHome}>
          {t(i18n, lang, 'nav.home')}
        </button>
      </div>
    </div>
  );
}

const styles = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '80px',
    padding: '0 32px',
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(8px)',
    flexShrink: 0,
  },
  langGroup: {
    display: 'flex',
    gap: '8px',
    minWidth: '160px',
  },
  langBtn: {
    height: '48px',
    padding: '0 18px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '16px',
    fontFamily: 'sans-serif',
    cursor: 'none',
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  },
  langBtnActive: {
    background: 'rgba(255,255,255,0.28)',
    color: '#fff',
    borderColor: 'rgba(255,255,255,0.6)',
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
    color: 'rgba(255,255,255,0.85)',
    fontSize: '18px',
    fontFamily: 'sans-serif',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  navBtns: {
    display: 'flex',
    gap: '12px',
    minWidth: '160px',
    justifyContent: 'flex-end',
  },
  navBtn: {
    height: '48px',
    padding: '0 24px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '16px',
    fontFamily: 'sans-serif',
    cursor: 'none',
    letterSpacing: '0.04em',
  },
} as const;
