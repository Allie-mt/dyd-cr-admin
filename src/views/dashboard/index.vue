<script setup lang="ts">
import { computed } from "vue";

const stats = [
  { label: "入驻企业", value: 128, icon: "OfficeBuilding", trend: "+6 本月" },
  { label: "C端用户总数", value: 25680, icon: "User", trend: "+1,024 本周" },
  { label: "今日活跃", value: 3142, icon: "TrendCharts", trend: "+8.2% 环比" },
  {
    label: "白名单条目",
    value: 67,
    icon: "CircleCheck",
    trend: "含 3 条待生效",
  },
];

const recentLogs = [
  {
    operator: "系统管理员",
    module: "功能开关",
    content: "开启「批量生成」功能",
    time: "10 分钟前",
  },
  {
    operator: "运营专员-李锐",
    module: "企业管理",
    content: "停用「武汉光谷软件」",
    time: "32 分钟前",
  },
  {
    operator: "系统管理员",
    module: "角色权限",
    content: "调整「运营专员」菜单权限",
    time: "1 小时前",
  },
  {
    operator: "运营专员-李锐",
    module: "白名单",
    content: "为 36 名用户开白「4K 分辨率」",
    time: "3 小时前",
  },
  {
    operator: "运营专员-李锐",
    module: "C端用户",
    content: "禁用违规用户「夜航星」",
    time: "昨天 18:20",
  },
];

const featureOverview = [
  { name: "脚本生成", enabled: true },
  { name: "图片生成", enabled: true },
  { name: "视频生成", enabled: true },
  { name: "数字人", enabled: true },
  { name: "字幕处理", enabled: true },
  { name: "批量生成", enabled: false },
];

const enabledCount = computed(
  () => featureOverview.filter((f) => f.enabled).length,
);
</script>

<template>
  <div class="page-container dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col v-for="stat in stats" :key="stat.label" :xs="12" :sm="12" :md="6">
        <div class="card-panel stat-card">
          <div class="stat-icon">
            <el-icon :size="22"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-meta">
            <div class="stat-value">{{ stat.value.toLocaleString() }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend">{{ stat.trend }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="section">
      <!-- 最近审计动态 -->
      <el-col :xs="24" :md="14">
        <div class="card-panel">
          <div class="panel-header">
            <h3>最近审计动态</h3>
            <router-link to="/audit-log" class="panel-more">
              查看全部 <el-icon><ArrowRight /></el-icon>
            </router-link>
          </div>
          <ul class="log-list">
            <li
              v-for="(log, index) in recentLogs"
              :key="index"
              class="log-item"
            >
              <span
                class="log-dot"
                :class="{
                  'log-dot--warn':
                    log.content.includes('停用') ||
                    log.content.includes('禁用'),
                }"
              />
              <span class="log-operator">{{ log.operator }}</span>
              <el-tag size="small" effect="plain">{{ log.module }}</el-tag>
              <span class="log-content">{{ log.content }}</span>
              <span class="log-time">{{ log.time }}</span>
            </li>
          </ul>
        </div>
      </el-col>

      <!-- 功能开关概览 -->
      <el-col :xs="24" :md="10">
        <div class="card-panel">
          <div class="panel-header">
            <h3>功能开关概览</h3>
            <router-link to="/feature-switch/funcs" class="panel-more">
              前往配置 <el-icon><ArrowRight /></el-icon>
            </router-link>
          </div>
          <p class="feature-summary">
            已开启 <b>{{ enabledCount }}</b> /
            {{ featureOverview.length }} 项全局能力
          </p>
          <div class="feature-grid">
            <div
              v-for="feature in featureOverview"
              :key="feature.name"
              class="feature-item"
            >
              <span class="feature-name">{{ feature.name }}</span>
              <el-switch v-model="feature.enabled" size="small" disabled />
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.dashboard {
  .section {
    margin-top: 16px;
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 96, 166, 0.12);
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: $primary-soft-bg;
    color: $primary;
    flex-shrink: 0;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: $text-main;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 13px;
    color: $text-secondary;
    margin: 2px 0 4px;
  }

  .stat-trend {
    font-size: 12px;
    color: $success;
  }
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: $text-main;
  }

  .panel-more {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-size: 13px;
    color: $text-secondary;

    &:hover {
      color: $primary;
    }
  }
}

.log-list {
  list-style: none;

  .log-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 11px 0;
    border-bottom: 1px dashed #eef1f5;
    font-size: 13px;

    &:last-child {
      border-bottom: none;
    }

    .log-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: $primary;
      flex-shrink: 0;

      &--warn {
        background: $warning;
      }
    }

    .log-operator {
      color: $text-main;
      font-weight: 500;
      flex-shrink: 0;
    }

    .log-content {
      flex: 1;
      color: $text-regular;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .log-time {
      color: $text-secondary;
      font-size: 12px;
      flex-shrink: 0;
    }
  }
}

.feature-summary {
  font-size: 13px;
  color: $text-secondary;
  margin-bottom: 12px;

  b {
    color: $primary;
    font-size: 16px;
  }
}

.feature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 20px;

  .feature-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 12px;
    border-radius: 6px;
    background: #f8fafc;
    font-size: 13px;
    color: $text-regular;
  }
}
</style>
