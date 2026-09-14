<!-- 白名单管理：灰度开白 / 临时授权 / 内部测试 -->
<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import addWhitelistDialog from "./addWhitelistDialog.vue";

type WlType = "功能" | "模型" | "规格";
type WlStatus = "active" | "revoked" | "expired";

interface WhitelistRow {
  id: number;
  userId: number;
  nickname: string;
  phone: string;
  type: WlType;
  perm: string;
  expireMode: "永久" | "固定时长" | "到期日";
  expireAt: string;
  status: WlStatus;
  operator: string;
  createdAt: string;
  remark: string;
}

const list = ref<WhitelistRow[]>([
  {
    id: 1,
    userId: 1001,
    nickname: "夜航星",
    phone: "13812340921",
    type: "模型",
    perm: "视频生成 2.5（灰度）",
    expireMode: "到期日",
    expireAt: "2026-10-01",
    status: "active",
    operator: "陈雨薇",
    createdAt: "2026-09-12 16:02",
    remark: "灰度体验",
  },
  {
    id: 2,
    userId: 1002,
    nickname: "柠檬不酸",
    phone: "15620873411",
    type: "规格",
    perm: "4K 分辨率",
    expireMode: "到期日",
    expireAt: "2026-09-30",
    status: "active",
    operator: "陈雨薇",
    createdAt: "2026-09-10 14:20",
    remark: "画质内测",
  },
  {
    id: 3,
    userId: 1005,
    nickname: "一只小鹿呀",
    phone: "17705711892",
    type: "功能",
    perm: "字幕擦除（灰度）",
    expireMode: "固定时长",
    expireAt: "2026-09-24",
    status: "active",
    operator: "系统管理员",
    createdAt: "2026-09-09 11:15",
    remark: "字幕灰度放量",
  },
  {
    id: 4,
    userId: 1003,
    nickname: "山间清风",
    phone: "18973102286",
    type: "功能",
    perm: "数字人内测",
    expireMode: "永久",
    expireAt: "—",
    status: "active",
    operator: "系统管理员",
    createdAt: "2026-08-28 10:40",
    remark: "内部测试账号",
  },
  {
    id: 5,
    userId: 1009,
    nickname: "北城以北",
    phone: "15829631745",
    type: "模型",
    perm: "4K 超清生成",
    expireMode: "固定时长",
    expireAt: "2026-09-08",
    status: "expired",
    operator: "陈雨薇",
    createdAt: "2026-08-09 09:22",
    remark: "4K 内测第一批",
  },
  {
    id: 6,
    userId: 1006,
    nickname: "晚风信箱",
    phone: "15928740366",
    type: "规格",
    perm: "1080p 分辨率",
    expireMode: "到期日",
    expireAt: "2026-09-20",
    status: "revoked",
    operator: "陈雨薇",
    createdAt: "2026-08-15 15:03",
    remark: "活动临时授权，提前撤销",
  },
  {
    id: 7,
    userId: 1010,
    nickname: "苏打气泡水",
    phone: "13770389516",
    type: "功能",
    perm: "批量生成",
    expireMode: "到期日",
    expireAt: "2026-10-15",
    status: "active",
    operator: "刘一帆",
    createdAt: "2026-09-01 10:11",
    remark: "短期项目",
  },
  {
    id: 8,
    userId: 1007,
    nickname: "阿汤哥不喝汤",
    phone: "13522378098",
    type: "模型",
    perm: "数字人 S1（内测）",
    expireMode: "固定时长",
    expireAt: "2026-09-05",
    status: "expired",
    operator: "系统管理员",
    createdAt: "2026-08-06 14:48",
    remark: "内测收集反馈",
  },
]);

// ===== 筛选 =====
const filter = reactive({ keyword: "", type: "", status: "" });

const filtered = computed(() =>
  list.value.filter(
    (row) =>
      (!filter.keyword ||
        row.nickname.includes(filter.keyword) ||
        row.phone.includes(filter.keyword) ||
        String(row.userId).includes(filter.keyword)) &&
      (!filter.type || row.type === filter.type) &&
      (!filter.status || row.status === filter.status),
  ),
);

const statusText: Record<WlStatus, string> = {
  active: "生效中",
  revoked: "已撤销",
  expired: "已失效",
};
const statusTag: Record<WlStatus, "success" | "info" | "warning"> = {
  active: "success",
  revoked: "info",
  expired: "warning",
};
const typeTag: Record<WlType, "success" | "warning" | "danger"> = {
  功能: "success",
  模型: "warning",
  规格: "danger",
};

// ===== 开白弹窗 =====
const addVisible = ref(false);

function onAddSubmitted(row: WhitelistRow) {
  list.value.unshift(row);
}

// ===== 撤销 =====
function revoke(row: WhitelistRow) {
  ElMessageBox.confirm(
    `确认撤销「${row.nickname}」的「${row.perm}」白名单吗？撤销后权限立即回落至档位默认`,
    "撤销白名单",
    {
      confirmButtonText: "确认撤销",
      cancelButtonText: "取消",
      type: "warning",
    },
  ).then(() => {
    row.status = "revoked";
    ElMessage.success("白名单已撤销，权限已回落，已写入审计日志");
  });
}
</script>

<template>
  <div class="page-container">
    <el-alert type="info" :closable="false" show-icon class="rule-alert">
      <template #title>
        用户实际权限 = 会员档位权益 +
        白名单加成；白名单优先级高于档位权益，到期或撤销后自动回落至档位默认，所有操作留痕可追溯
      </template>
    </el-alert>

    <div class="card-panel">
      <div class="filter-bar">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索用户 / 手机号 / 用户ID"
          clearable
          style="width: 220px"
          :prefix-icon="'Search'"
        />
        <el-select
          v-model="filter.type"
          placeholder="白名单类型"
          clearable
          style="width: 130px"
        >
          <el-option label="功能" value="功能" />
          <el-option label="模型" value="模型" />
          <el-option label="规格" value="规格" />
        </el-select>
        <el-select
          v-model="filter.status"
          placeholder="状态"
          clearable
          style="width: 110px"
        >
          <el-option label="生效中" value="active" />
          <el-option label="已撤销" value="revoked" />
          <el-option label="已失效" value="expired" />
        </el-select>
        <div class="filter-actions">
          <el-button type="primary" :icon="'Plus'" @click="addVisible = true"
            >开白名单</el-button
          >
        </div>
      </div>

      <el-table :data="filtered" stripe style="width: 100%">
        <el-table-column label="用户" min-width="180">
          <template #default="{ row }">
            <div v-if="row.userId" class="user-cell">
              <span class="user-name">{{ row.nickname }}</span>
              <span class="user-sub">{{ row.phone }}</span>
            </div>
            <div v-else>
              <div class="user-name">{{ row.nickname }}</div>
              <div class="user-sub">{{ row.phone }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="80">
          <template #default="{ row }">
            <el-tag
              size="small"
              effect="plain"
              :type="typeTag[row.type as WlType]"
              >{{ row.type }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="perm" label="权限点" min-width="170" />
        <el-table-column label="有效期" min-width="150">
          <template #default="{ row }">
            <span :class="row.expireMode === '永久' ? 'expire-forever' : ''">
              {{ row.expireMode === "永久" ? "永久" : `${row.expireAt} 到期` }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag size="small" :type="statusTag[row.status as WlStatus]">
              {{ statusText[row.status as WlStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="operator" label="开通人" width="100" />
        <el-table-column prop="createdAt" label="开通时间" width="150" />
        <el-table-column
          prop="remark"
          label="备注"
          min-width="140"
          show-overflow-tooltip
        />
        <el-table-column label="操作" width="90" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              link
              type="danger"
              size="small"
              @click="revoke(row)"
            >
              撤销
            </el-button>
            <span v-else class="op-none">—</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="filtered.length"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>

    <!-- 开白弹窗 -->
    <addWhitelistDialog v-model="addVisible" @submitted="onAddSubmitted" />
  </div>
</template>

<style scoped lang="scss">
.rule-alert {
  margin-bottom: 16px;
}

.user-cell {
  .user-name {
    font-weight: 500;
    color: #303133;
  }

  .user-sub {
    font-size: 12px;
    color: #909399;
  }
}

.user-name {
  font-weight: 500;
  color: #303133;
}

.user-sub {
  font-size: 12px;
  color: #909399;
}

.expire-forever {
  color: #909399;
}

.op-none {
  color: #c0c4cc;
}
</style>
