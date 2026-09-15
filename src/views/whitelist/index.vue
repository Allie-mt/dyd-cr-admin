<!-- 白名单管理：灰度开白 / 临时授权 / 内部测试 -->
<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import AddWhitelistDialog from "./compoents/addWhitelistDialog.vue";
import { getWhitelist, revokeWhitelist } from "@/api/whitelist";
import type { WhitelistRow, WlType, WlStatus } from "@/api/whitelist";

const keyword = ref("");
const typeFilter = ref("");
const statusFilter = ref("");
const pageNo = ref(1);
const pageSize = ref(10);
const list = ref<WhitelistRow[]>([]);
const total = ref(0);
const loading = ref(false);

async function fetchList() {
  loading.value = true;
  try {
    const res = await getWhitelist({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      type: typeFilter.value || undefined,
      status: statusFilter.value || undefined,
    });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  pageNo.value = 1;
  fetchList();
}

function resetFilter() {
  keyword.value = "";
  typeFilter.value = "";
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

const addVisible = ref(false);

function onAddSubmitted(row: WhitelistRow) {
  list.value.unshift(row);
  total.value += 1;
}

function revoke(row: WhitelistRow) {
  ElMessageBox.confirm(
    `确认撤销「${row.nickname}」的「${row.perm}」白名单吗？撤销后权限立即回落至档位默认`,
    "撤销白名单",
    {
      confirmButtonText: "确认撤销",
      cancelButtonText: "取消",
      type: "warning",
    },
  ).then(async () => {
    await revokeWhitelist(row.id);
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
          v-model="keyword"
          placeholder="搜索用户 / 手机号 / 用户ID"
          clearable
          style="width: 220px"
          :prefix-icon="'Search'"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="typeFilter"
          placeholder="白名单类型"
          clearable
          style="width: 130px"
          @change="handleSearch"
        >
          <el-option label="功能" value="功能" />
          <el-option label="模型" value="模型" />
          <el-option label="规格" value="规格" />
        </el-select>
        <el-select
          v-model="statusFilter"
          placeholder="状态"
          clearable
          style="width: 110px"
          @change="handleSearch"
        >
          <el-option label="生效中" value="active" />
          <el-option label="已撤销" value="revoked" />
          <el-option label="已失效" value="expired" />
        </el-select>
        <el-button :icon="'RefreshLeft'" @click="resetFilter">重置</el-button>
        <div class="filter-actions">
          <el-button type="primary" :icon="'Plus'" @click="addVisible = true">开白名单</el-button>
        </div>
      </div>

      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
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
            <el-tag size="small" effect="plain" :type="typeTag[row.type as WlType]">
              {{ row.type }}
            </el-tag>
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
        <el-table-column prop="remark" label="备注" min-width="140" show-overflow-tooltip />
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
          :total="total"
          :page-size="pageSize"
          :current-page="pageNo"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <AddWhitelistDialog v-model="addVisible" @submitted="onAddSubmitted" />
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
