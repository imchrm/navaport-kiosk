import type { LangCode } from '@navaport/content';
import type { I18nDict } from '@navaport/content';

export function t(i18n: I18nDict | null, lang: LangCode, key: string): string {
  if (i18n === null) return key;
  const dict = i18n[lang];
  return dict[key] ?? key;
}
