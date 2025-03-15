import zh from "./locales/zh-CN.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "zh-CN",
  messages: { "zh-CN": zh, "en-US": en },
  fallbackLocale: "zh-CN",
  // 语言偏好
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: "i18n_redirected",
    alwaysRedirect: true,
    fallbackLocale: "zh-CN",
    redirectOn: "root",
  },
}));
