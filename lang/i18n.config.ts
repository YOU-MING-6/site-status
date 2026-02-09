import zh from "./locales/zh-CN.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "zh-CN",
  messages: { "zh-CN": zh },
  fallbackLocale: "zh-CN",
}));