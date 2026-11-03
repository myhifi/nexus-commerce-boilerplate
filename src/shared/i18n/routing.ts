import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ar', 'en'],
  defaultLocale: 'ar',
  localePrefix: 'always'
});

export type Locale = (typeof routing.locales)[number];

// Languages that are written Right-to-Left (Arabic only)
export const RTL_LOCALES: Locale[] = ['ar'];