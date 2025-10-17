import { useState } from 'react';
import ReactSelect from 'react-select';
import { DEFAULT_LANGUAGE, LANGUAGE_OPTIONS } from '../../constants';
import i18n from '../../lib';

export function LanguageSelect() {
  const [language, setLanguage] = useState(() => {
    const savedLang = i18n.language;
    return savedLang ? savedLang : DEFAULT_LANGUAGE;
  });

  const [options] = useState(LANGUAGE_OPTIONS);

  function onLanguageChange(option: any) {
    const newLang = option?.value;
    if (!newLang) return;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  }

  return (
    <ReactSelect
      options={options}
      value={options.find((option) => option.value === language)}
      onChange={onLanguageChange}
    />
  );
}
