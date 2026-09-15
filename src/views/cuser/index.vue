<!-- C端用户管理页面 -->
<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import UserDetailDrawer from "./components/userDetailDrawer.vue";
import PointsActionDialog from "./components/pointsActionDialog.vue";
import AdjustLevelDialog from "./components/adjustLevelDialog.vue";
import {
  getCUserList,
  getCUserStats,
  banUser,
  unbanUser,
  type CUser,
  type Level,
  type CStatus,
  type PointsAction,
  type CUserStats,
} from "@/api/cuser";
import { levels, statusOptions } from "@/mock/cuser";

const keyword = ref("");
const levelFilter = ref("");
const statusFilter = ref("");
const pageNo = ref(1);
const pageSize = ref(10);
const list = ref<CUser[]>([]);
const total = ref(0);
const loading = ref(false);

const cuserStats = ref<CUserStats>({
  total: 0,
  advancedCount: 0,
  standardCount: 0,
  basicCount: 0,
});

async function fetchList() {
  loading.value = true;
  try {
    const [listRes, statsRes] = await Promise.all([
      getCUserList({
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        keyword: keyword.value || undefined,
        level: levelFilter.value || undefined,
        status: statusFilter.value || undefined,
      }),
      getCUserStats(),
    ]);
    list.value = listRes.list;
    total.value = listRes.total;
    cuserStats.value = statsRes;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNo.value = 1;
  fetchList();
}

function resetSearch() {
  keyword.value = "";
  levelFilter.value = "";
  statusFilter.value = "";
  pageNo.value = 1;
  fetchList();
}

function handlePageChange(val: number) {
  pageNo.value = val;
  fetchList();
}

function handleSizeChange(val: number) {
  pageSize.value = val;
  pageNo.value = 1;
  fetchList();
}

onMounted(() => fetchList());

const statusText: Record<CStatus, string> = { normal: "正常", frozen: "冻结", banned: "封禁" };
const statusTag: Record<CStatus, "success" | "warning" | "danger"> = {
  normal: "success",
  frozen: "warning",
  banned: "danger",
};
const levelTag: Record<Level, "info" | "primary" | "warning" | "danger"> = {
  免费版: "info",
  基础版: "primary",
  标准版: "warning",
  高级版: "danger",
};

const stats = computed(() => [
  {
    label: "C 端用户总数",
    value: cuserStats.value.total,
    icon: "User",
  },
  {
    label: "高级版",
    value: cuserStats.value.advancedCount,
    icon: "Trophy",
  },
  {
    label: "标准版",
    value: cuserStats.value.standardCount,
    icon: "Medal",
  },
  {
    label: "基础版",
    value: cuserStats.value.basicCount,
    icon: "Star",
  },
]);

const detailVisible = ref(false);
const currentUser = ref<CUser | null>(null);
const openDetail = (row: CUser) => {
  currentUser.value = row;
  detailVisible.value = true;
};

const pointsDialog = ref(false);
const pointsType = ref<PointsAction>("gift");
const openPointsDialog = (type: PointsAction) => {
  pointsType.value = type;
  pointsDialog.value = true;
};

const levelDialog = ref(false);
const openLevelDialog = (row: CUser) => {
  currentUser.value = row;
  levelDialog.value = true;
};

const onLevelSaved = () => {
  fetchList();
};

const handleBan = (user: CUser) => {
  ElMessageBox.prompt("封禁需记录原因，将写入审计日志", "封禁账号", {
    confirmButtonText: "确认封禁",
    cancelButtonText: "取消",
    inputPlaceholder: "封禁原因",
    type: "warning",
    inputValidator: (v: string) => !!v || "必须填写封禁原因",
  }).then(async ({ value }) => {
    const result = await banUser(user.id, value);
    if (result) {
      user.status = result.status;
      user.banReason = result.banReason;
    }
    ElMessage.success(`已封禁「${user.nickname}」，原因已记录`);
  });
};

const handleUnban = (user: CUser) => {
  ElMessageBox.confirm(`确认解封用户「${user.nickname}」吗？`, "解封账号", {
    confirmButtonText: "确认解封",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    const result = await unbanUser(user.id);
    if (result) {
      user.status = result.status;
      user.banReason = result.banReason;
    }
    ElMessage.success("已解封，已写入审计日志");
  });
};

const onPointsSubmitted = () => {
  fetchList();
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
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">
              {{ stat.value.toLocaleString() }}
              <span class="unit">人</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="card-panel">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索手机号 / 昵称 / 用户ID"
          clearable
          style="width: 220px"
          :prefix-icon="'Search'"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="levelFilter"
          placeholder="会员档位"
          clearable
          style="width: 130px"
          @change="handleSearch"
        >
          <el-option v-for="l in levels" :key="l" :label="l" :value="l" />
        </el-select>
        <el-select
          v-model="statusFilter"
          placeholder="状态"
          clearable
          style="width: 110px"
          @change="handleSearch"
        >
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-button :icon="'RefreshLeft'" @click="resetSearch">重置</el-button>
      </div>

      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column label="用户">
          <template #default="{ row }">
            <div class="user-cell">
              <div class="user-info">
                <span class="user-name">{{ row.nickname }}</span>
                <span class="user-id">UID: {{ row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="会员档位" align="center">
          <template #default="{ row }">
            <el-tag effect="plain" size="small" :type="levelTag[row.level as Level]">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="点数余额" width="110" align="right" prop="points">
          <template #default="{ row }">{{ row.points.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="到期时间" align="center">
          <template #default="{ row }">{{ row.levelExpire || "长期" }}</template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag[row.status as CStatus]" effect="light" size="small">
              {{ statusText[row.status as CStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="left">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="openLevelDialog(row)">
              调档位
            </el-button>
            <el-button
              link
              type="primary"
              size="small"
              @click="
                currentUser = row;
                openPointsDialog('gift');
              "
            >
              赠点
            </el-button>
            <el-button
              v-if="row.status !== 'banned'"
              link
              type="danger"
              size="small"
              @click="handleBan(row)"
            >
              封禁
            </el-button>
            <el-button v-else link type="success" size="small" @click="handleUnban(row)">
              解封
            </el-button>
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

    <UserDetailDrawer
      v-model:visible="detailVisible"
      :current-user="currentUser"
      @changed="fetchList"
    />
    <AdjustLevelDialog
      v-model:visible="levelDialog"
      :current-user="currentUser"
      @saved="onLevelSaved"
    />
    <PointsActionDialog
      v-model:visible="pointsDialog"
      :type="pointsType"
      :current-user="currentUser"
      @submitted="onPointsSubmitted"
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
  .unit {
    font-size: 12px;
    color: $text-secondary;
    font-weight: 400;
  }
  .stat-label {
    font-size: 14px;
    color: $text-secondary;
    font-weight: 700;
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
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  .user-avatar {
    background: $primary-avatar-bg;
    color: $primary;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
  }
  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    .user-name {
      font-size: 14px;
      color: $text-main;
    }
    .user-id {
      font-size: 12px;
      color: $text-secondary;
    }
  }
}
</style>
