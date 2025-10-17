import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { DEFAULT_LANGUAGE } from '../constants';

import en from './en';
import vi from './vi';

export const resources = {
  en: en,
  vi: vi,
};

i18n.use(initReactI18next).init({
  fallbackLng: DEFAULT_LANGUAGE,
  lng: DEFAULT_LANGUAGE,
  ns: Object.keys(vi),
  resources,
});

export default i18n;
