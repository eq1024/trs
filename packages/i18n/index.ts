import { createI18n , useI18n } from 'vue-i18n';
import zh from './locales/zh-CN.json';
import en from './locales/en-US.json';

const setupI18n = (options = { locale: 'zh-CN' }) => {
  const i18n = createI18n({
    legacy: false, // Use Composition API
    locale: options.locale,
    fallbackLocale: 'en-US',
    messages: {
      'zh-CN': zh,
      'en-US': en
    },
  });
  return i18n;
};

export { useI18n, setupI18n }
