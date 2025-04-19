import { defineStore } from "pinia";
import type { MonitorsDataResult, SiteLangType, SiteType } from "~~/types/main";

export const useStatusStore = defineStore(
  "status",
  () => {
    // 站点状态
    const siteStatus = ref<SiteType>("loading");
    // 站点数据
    const siteData = ref<MonitorsDataResult>();
    // 滚动高度
    const scrollTop = ref<number>(0);
    // 站点语言
    const siteLang = ref<SiteLangType>("zh-CN");

    return { siteStatus, siteData, scrollTop, siteLang };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.localStorage(),
      pick: ["siteLang"],
    },
  },
);
