import { HashMap, Translation, TranslocoTestingModule, TranslocoTestingOptions } from '@ngneat/transloco';

import { AVAILABLE_LANGS } from '../available-langs.const';

export function getTranslocoModule(langs: HashMap<Translation>, options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: langs,
    translocoConfig: { availableLangs: AVAILABLE_LANGS, defaultLang: 'en' },
    preloadLangs: true,
    ...options,
  });
}
