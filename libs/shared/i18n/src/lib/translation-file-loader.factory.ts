import { AVAILABLE_LANGS } from './available-langs.const';
import { Translation } from '@ngneat/transloco';

export function langScopeLoader(
  importer: (lang: string, root: string) => Promise<Record<string, unknown>>,
  root = 'i18n'
) {
  return AVAILABLE_LANGS.reduce((acc: Translation, lang) => {
    acc[lang] = () => importer(lang, root);
    return acc;
  }, {});
}
