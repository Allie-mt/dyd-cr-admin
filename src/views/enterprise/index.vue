<!-- 企业管理 -->
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  getEnterpriseList,
  createEnterprise,
  getEntStats,
  type Enterprise,
} from "@/api/enterprise";
import { enterpriseStatusText } from "@/mock/buser";
import createEnterpriseDialog from "./components/createEnterpriseDialog.vue";
import enterpriseDetailDrawer from "./components/enterpriseDetailDrawer.vue";
import pointsQuotaDialog from "./components/pointsQuotaDialog.vue";
import { ElMessage } from "element-plus";
const plans: Enterprise["plan"][] = ["初创版", "成长版", "专业版", "企业定制版"];

const entStats: any = ref({
  total: 0,
  totalHint: "",
  totalHintType: "success" as const,
  cUserCount: 0,
  cUserCountHint: "",
  cUserCountHintType: "success" as const,
  pendingRenew: 0,
  pendingRenewHint: "",
  pendingRenewHintType: "danger" as const,
  frozen: 0,
  frozenHint: "",
  frozenHintType: "warning" as const,
});

const RENEW_WINDOW_DAYS = 30;

const expireState = (date: string): "expired" | "soon" | "normal" => {
  const diffDays = (new Date(date).getTime() - Date.now()) / 86400000;
  if (diffDays < 0) return "expired";
  if (diffDays <= RENEW_WINDOW_DAYS) return "soon";
  return "normal";
};

const stats = computed(() => [
  {
    label: "企业总数",
    value: entStats.value.total,
    icon: "OfficeBuilding",
    hint: entStats.value.totalHint,
    hintType: entStats.value.totalHintType,
  },
  {
    label: "C 端用户数",
    value: entStats.value.cUserCount,
    icon: "User",
    hint: entStats.value.cUserCountHint,
    hintType: entStats.value.cUserCountHintType,
  },
  {
    label: "待续费企业",
    value: entStats.value.pendingRenew,
    icon: "AlarmClock",
    hint: entStats.value.pendingRenewHint,
    hintType: entStats.value.pendingRenewHintType,
  },
  {
    label: "冻结企业",
    value: entStats.value.frozen,
    icon: "Lock",
    hint: entStats.value.frozenHint,
    hintType: entStats.value.frozenHintType,
  },
]);

const keyword = ref("");
const planFilter = ref("");
const statusFilter = ref("");
const pageNo = ref(1);
const pageSize = ref(10);
const list = ref<Enterprise[]>([]);
const total = ref(0);
const loading = ref(false);
// 获取企业列表
const fetchList = async () => {
  loading.value = true;
  try {
    const [listRes, statsRes] = await Promise.all([
      getEnterpriseList({
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        keyword: keyword.value || undefined,
        plan: planFilter.value || undefined,
        status: statusFilter.value || undefined,
      }),
      getEntStats(), // 获取企业统计信息卡片
    ]);
    list.value = listRes.list;
    total.value = listRes.total;
    entStats.value = statsRes;
  } finally {
    loading.value = false;
  }
};
// 搜索企业
const handleSearch = () => {
  pageNo.value = 1;
  fetchList();
};
// 重置搜索条件
const resetSearch = () => {
  keyword.value = "";
  planFilter.value = "";
  statusFilter.value = "";
  pageNo.value = 1;
  fetchList();
};
// 分页切换
const handlePageChange = (val: number) => {
  pageNo.value = val;
  fetchList();
};
// 每页条数切换
const handleSizeChange = (val: number) => {
  pageSize.value = val;
  pageNo.value = 1;
  fetchList();
};

onMounted(() => fetchList());

const statusTag = (status: Enterprise["status"]) =>
  ({ normal: "success", pendingRenew: "danger", frozen: "warning", cancelled: "info" })[status];
const statusText = (status: Enterprise["status"]) => enterpriseStatusText[status];
// 计算企业配额剩余量
const remaining = (row: Enterprise) => {
  return row.pointsTotal - row.pointsUsed;
};
// 格式化企业配额
const formatPoints = (n: number) => {
  return n.toLocaleString();
};

const createVisible = ref(false);
const detailVisible = ref(false);
const currentEnt = ref<Enterprise | null>(null);
const pointsVisible = ref(false);

// 创建企业
const onEnterpriseCreated = async (data: any) => {
  const res = await createEnterprise(data);
  if (res.code === "000000") {
    ElMessage.success("企业创建成功");
    fetchList();
  }
};
// 打开企业详情
const openDetail = (row: Enterprise) => {
  currentEnt.value = row;
  detailVisible.value = true;
};
// 打开企业配额详情
const openPoints = (row: Enterprise) => {
  currentEnt.value = row;
  pointsVisible.value = true;
};
</script>

<template>
  <div class="page-container">
    <el-row :gutter="16" class="stat-row">
      <el-col v-for="stat in stats" :key="stat.label" :xs="12" :sm="12" :md="6">
        <div class="card-panel stat-card">
          <div class="stat-icon">
            <el-icon :size="22"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-meta">
            <div class="stat-value">{{ stat.value.toLocaleString() }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" :class="`hint-${stat.hintType}`">{{ stat.hint }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="card-panel list-panel">
      <div class="filter-bar">
        <div class="filter-left">
          <el-input
            v-model="keyword"
            placeholder="搜索企业名称 / 企业ID"
            clearable
            style="width: 240px"
            :prefix-icon="'Search'"
            @keyup.enter="handleSearch"
            @clear="handleSearch"
          />
          <el-select
            v-model="planFilter"
            placeholder="套餐类型"
            clearable
            style="width: 140px"
            @change="handleSearch"
          >
            <el-option v-for="p in plans" :key="p" :label="p" :value="p" />
          </el-select>
          <el-select
            v-model="statusFilter"
            placeholder="状态"
            clearable
            style="width: 110px"
            @change="handleSearch"
          >
            <el-option label="正常" value="normal" />
            <el-option label="待续费" value="pendingRenew" />
            <el-option label="冻结" value="frozen" />
            <el-option label="注销" value="cancelled" />
          </el-select>
          <el-button :icon="'RefreshLeft'" @click="resetSearch">重置</el-button>
        </div>
        <div class="filter-right">
          <el-button type="primary" :icon="'Plus'" @click="createVisible = true">
            开通企业
          </el-button>
        </div>
      </div>

      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="企业名称">
          <template #default="{ row }">
            <div class="ent-name-cell">
              <el-link type="primary" @click="openDetail(row)" :underline="false">
                {{ row.name }}
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="plan" label="套餐" align="center">
          <template #default="{ row }">
            <el-tag
              :type="
                row.plan === '企业定制版'
                  ? 'danger'
                  : row.plan === '专业版'
                    ? 'primary'
                    : row.plan === '成长版'
                      ? 'warning'
                      : 'info'
              "
              effect="plain"
            >
              {{ row.plan }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="点数总配额" align="center">
          <template #default="{ row }">{{ formatPoints(row.pointsTotal) }}</template>
        </el-table-column>
        <el-table-column label="剩余点数">
          <template #default="{ row }">
            <span :class="{ 'points-low': remaining(row) / row.pointsTotal < 0.1 }">
              {{ formatPoints(remaining(row)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数" align="center" />
        <el-table-column label="服务到期" align="center">
          <template #default="{ row }">
            <span :class="`expire-${expireState(row.planExpire)}`">{{ row.planExpire }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" effect="light">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="openPoints(row)">配额</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-size="pageSize"
          :current-page="pageNo"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
    <!-- 开通企业弹窗 -->
    <createEnterpriseDialog
      v-model:visible="createVisible"
      :plans="plans"
      @created="onEnterpriseCreated"
    />
    <!-- 企业详情弹窗 -->
    <enterpriseDetailDrawer
      v-model:visible="detailVisible"
      :current-ent="currentEnt"
      :plans="plans"
    />
    <!-- 企业配额弹窗 -->
    <pointsQuotaDialog
      v-model:visible="pointsVisible"
      :current-ent="currentEnt"
      @saved="fetchList"
    />
  </div>
</template>

<style lang="scss" scoped>
.stat-row {
  margin-bottom: 16px;
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
    color: $text-secondary;
    &.hint-success {
      color: $success;
    }
    &.hint-danger {
      color: $danger;
    }
    &.hint-warning {
      color: $warning;
    }
  }
}
.list-panel {
  margin-top: 0;
}
.points-low {
  color: $danger;
  font-weight: 600;
}
.expire-expired {
  color: $danger;
}
.expire-soon {
  color: $warning;
}
</style>
