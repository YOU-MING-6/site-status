<!-- 站点数据卡片 -->
<template>
  <Transition name="fade" mode="out-in">
    <div v-if="!isEmpty(siteData)" class="site-cards">
      <n-card
        v-for="(site, index) in siteData"
        :key="index"
        :style="{ animationDelay: `${index * 0.1}s` }"
        class="site-item"
        hoverable
      >
        <!-- 信息 -->
        <n-flex class="meta" justify="space-between">
          <n-flex :size="8" class="title" align="center">
            <n-text class="site-name">{{ site.name }}</n-text>
            <n-popover>
              <template #trigger>
                <n-tag :bordered="false" size="small" round>
                  {{ siteTypeMap[site.type]?.tag || "HTTP" }} /
                  {{ formatInterval(site?.interval) }}
                </n-tag>
              </template>
              <n-text>
                {{
                    每间隔 
                }}
              </n-text>
            </n-popover>
            <!-- 跳转 -->
            <n-button
              v-if="site?.url"
              :focusable="false"
              size="tiny"
              tertiary
              round
              @click="jumpLink(site.url)"
            >
              <template #icon>
                <Icon name="icon:link" />
              </template>
            </n-button>
          </n-flex>
          <n-flex
            :style="{
              '--bg-color': `var(--${siteStatusMap[site.status]?.type || 'unknown'}-color)`,
            }"
            class="status"
            align="center"
          >
            <div v-if="site.status !== 0" class="point" />
            <Icon v-else name="icon:pause" />
            <n-text>{{ siteStatusMap[site.status]?.text }}</n-text>
          </n-flex>
        </n-flex>
        <!-- 每日数据 -->
        <n-flex
          v-if="site?.days?.length"
          :size="2"
          class="timeline"
          justify="space-between"
        >
          <n-popover
            v-for="(day, dayIndex) in site.days"
            :key="day?.date || dayIndex"
          >
            <template #trigger>
              <div
                :style="{
                  backgroundColor: `var(--${getDayStatus(day.percent)}-color)`,
                }"
                class="day"
              />
            </template>
            <div class="day-data">
              <n-text class="date" depth="3">
                {{ day?.date ? formatTime(day.date) : "未知日期" }}
              </n-text>
              <!-- 详细 -->
              <n-text v-if="day?.percent >= 100">
                当日可用率 {{ day?.percent }}%
              </n-text>
              <n-text v-else-if="day?.percent > 0 && day?.percent < 100">
                {{
                  故障 {{ day?.down?.times || 0 }} 次，累计故障时长 {{ formatDuration(day?.down?.duration || 0) }}，当日可用率 {{ day?.percent }}%
                }}
              </n-text>
              <n-text v-else>当日无数据</n-text>
            </div>
          </n-popover>
        </n-flex>
        <!-- 总结 -->
        <n-flex class="summary" justify="space-between">
          <n-text class="date" depth="3">
            {{ formatTime(site?.days?.[0]?.date || 0) }}
          </n-text>
          <n-text v-if="site?.down?.times" depth="3">
            {{
              最近 {{ site?.days?.length }} 天内故障 {{ site?.down?.times || 0 }} 次，累计故障时长 {{ formatDuration(site?.down?.duration || 0) }}，平均可用率 {{ site?.percent }}%
            }}
          </n-text>
          <n-text v-else depth="3">
            {{
              最近 {{ site?.days?.length }} 天内可用率 {{ site?.percent }}%
            }}
          </n-text>
          <n-text class="date" depth="3">今日</n-text>
        </n-flex>
      </n-card>
    </div>
    <div
      v-else
      :style="{ '--color': `var(--${statusStore.siteStatus}-color)` }"
      class="site-cards loading"
    >
      <n-card class="site-item" hoverable>
        <Transition name="fade" mode="out-in">
          <n-spin v-if="statusStore.siteStatus !== 'unknown'" />
          <n-result
            v-else
            status="error"
            :title="'出错啦'"
            :description="'接口调用超限或请求错误，请稍后重试'"}]}
          >
            <template #footer>
              <n-button tertiary round @click="refresh">
                {{ $t("meta.refresh") }}
              </n-button>
            </template>
          </n-result>
        </Transition>
      </n-card>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { SiteStatusType, SiteType } from "~~/types/main";

const statusStore = useStatusStore();

// 站点类型
const siteStatusMap = computed(() => ({
  0: { text: "暂停检测", type: "unknown" },
  1: { text: "还未检查", type: "unknown" },
  2: { text: "正常访问", type: "normal" },
  8: { text: "站点异常", type: "error" },
  9: { text: "无法访问", type: "error" },
}));

// 请求类型
const siteTypeMap = computed(() => ({
  1: { tag: "HTTP", text: "通过发送 HTTP 或 HTTPS 请求来监测目标服务的可用性" },
  2: { tag: "KEYWORD", text: "通过获取页面内容，并检查返回的内容是否包含指定的关键词" },
  3: { tag: "PING", text: "使用 ICMP 协议向目标服务器发送 Ping 请求" },
  4: { tag: "PORT", text: "检测目标服务器的指定端口是否开放" },
  5: { tag: "HEARTBEAT", text: "由被监控的服务主动发送‘心跳信号’到监控服务，表明自身正常运行" },
}));

// 全部站点数据
const siteData = computed<SiteStatusType[] | undefined>(
  () => statusStore.siteData?.data,
);

// 当天站点状态
const getDayStatus = (percent: number): SiteType => {
  if (percent >= 100) return "normal";
  else if (percent >= 50 && percent < 100) return "warn";
  else if (percent > 0 && percent < 50) return "error";
  else return "unknown";
};

// 重试
const refresh = async () => {
  statusStore.$patch({
    siteStatus: "loading",
    siteData: undefined,
  });
  await getSiteData();
};

onMounted(getSiteData);
</script>

<style lang="scss" scoped>
.site-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 900px;
  margin: 30px auto 20px;
  padding: 0 20px;
  will-change: transform;
}

.site-item {
  opacity: 0;
  border-radius: 12px;
  animation: float-up 0.5s forwards;
  overflow: hidden;
  will-change: transform, opacity;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--main-box-shadow);
  }
}

.site-meta {
  .site-name {
    font-weight: bold;
  }
  
  .n-tag {
    --n-height: 20px;
    cursor: pointer;
  }
  
  .status-text {
    color: var(--bg-color);
  }
  
  .status-icon {
    font-size: 22px;
    margin-right: -4px;
    color: var(--bg-color);
  }
}

.status-point {
  position: relative;
  width: 14px;
  height: 14px;
  min-width: 14px;
  background-color: var(--bg-color);
  border-radius: 50%;
  
  &::after {
    content: "";
    background-color: var(--bg-color);
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    border-radius: 50%;
    opacity: 1;
    z-index: -1;
    animation: breathing 1.5s ease infinite;
    transition: background-color 1s;
  }
}

.timeline {
  margin: 15px 0 10px;
  
  .day {
    height: 26px;
    flex: 1;
    border-radius: 25px;
    background-color: var(--normal-color);
    transition: transform 0.3s ease;
    transform-origin: bottom;
    cursor: pointer;
    will-change: transform;
    
    &:hover {
      transform: scaleY(1.1);
    }
  }
}

.summary {
  .date {
    width: 100px;
    font-size: 13px;
    
    &:last-child {
      text-align: right;
    }
  }
}

.loading {
  .site-item {
    min-height: 200px;
    
    :deep(.n-card__content) {
      padding: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  
  .n-spin-body {
    --n-size: 40px;
    --n-color: var(--color);
  }
}

.day-data {
  display: flex;
  flex-direction: column;
  
  .date {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .site-cards {
    margin: 15px auto;
    padding: 0 12px;
  }
  
  .site-item {
    border-radius: 8px;
  }
}
</style>