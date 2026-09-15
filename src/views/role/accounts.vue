<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import CreateAccountDialog from "./accounts/createAccountDialog.vue";
import AssignRoleDialog from "./accounts/assignRoleDialog.vue";
import TempAuthDialog from "./accounts/tempAuthDialog.vue";
import { mockGetAccountList, mockRoleOptions } from "@/api/role";
import type { Account } from "@/api/role";

const roleOptions = mockRoleOptions;

const keyword = ref("");
const page = ref(1);
const pageSize = ref(10);
const list = ref<Account[]>([]);
const total = ref(0);
const loading = ref(false);

async function fetchList() {
  loading.value = true;
  try {
    const res = mockGetAccountList({
      page: page.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
    });
    list.value = res.list;
    total.value = res.total;
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  page.value = 1;
  fetchList();
}

function resetSearch() {
  keyword.value = "";
  page.value = 1;
  fetchList();
}

function handlePageChange(val: number) {
  page.value = val;
  fetchList();
}

function handleSizeChange(val: number) {
  pageSize.value = val;
  page.value = 1;
  fetchList();
}

onMounted(() => fetchList());

const createVisible = ref(false);
const roleDialog = reactive({ visible: false, accountId: 0, name: "", roles: [] as string[] });
const tempDialog = reactive({ visible: false, accountId: 0, name: "" });

function onAccountCreated(data: { account: string; name: string; phone: string; roles: string[] }) {
  list.value.unshift({
    id: Date.now(),
    account: data.account,
    name: data.name,
    phone: data.phone,
    roles: data.roles,
    status: "enabled",
    lastLoginAt: "—",
  });
  total.value += 1;
}

function openRoles(acc: Account) {
  Object.assign(roleDialog, {
    visible: true,
    accountId: acc.id,
    name: acc.name,
    roles: [...acc.roles],
  });
}

function onRolesSaved(roles: string[]) {
  const acc = list.value.find((a) => a.id === roleDialog.accountId);
  if (acc) acc.roles = roles;
}

function openTemp(acc: Account) {
  Object.assign(tempDialog, { visible: true, accountId: acc.id, name: acc.name });
}

function onTempSaved(perm: string, expireAt: string) {
  const acc = list.value.find((a) => a.id === tempDialog.accountId);
  if (acc) acc.tempAuth = { name: perm, expireAt };
}

function revokeTemp(acc: Account) {
  ElMessageBox.confirm(`确认撤销「${acc.name}」的临时授权吗？权限立即回收`, "撤销临时授权", {
    confirmButtonText: "确认撤销",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    acc.tempAuth = undefined;
    ElMessage.success("临时授权已撤销");
  });
}

function toggleStatus(acc: Account) {
  const action = acc.status === "enabled" ? "禁用" : "启用";
  ElMessageBox.confirm(`确认${action}账号「${acc.name}」吗？`, `${action}账号`, {
    confirmButtonText: `确认${action}`,
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    acc.status = acc.status === "enabled" ? "disabled" : "enabled";
    ElMessage.success(`已${action}，已写入审计日志`);
  });
}

function resetPassword(acc: Account) {
  ElMessageBox.confirm(`确认重置「${acc.name}」的登录密码吗？`, "重置密码", {
    confirmButtonText: "确认重置",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    ElMessage.success("新密码已发送至绑定手机，已写入审计日志");
  });
}
</script>

<template>
  <div class="page-container">
    <div class="card-panel">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索账号 / 姓名"
          clearable
          style="width: 200px"
          :prefix-icon="'Search'"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />
        <el-button :icon="'RefreshLeft'" @click="resetSearch">重置</el-button>
        <div class="filter-actions">
          <el-button type="primary" :icon="'Plus'" @click="createVisible = true">
            新增账号
          </el-button>
        </div>
      </div>

      <el-table :data="list" stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="account" label="账号" min-width="110" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="phone" label="手机号" width="125" />
        <el-table-column label="角色" min-width="160">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role"
              size="small"
              effect="plain"
              class="role-tag"
            >
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="临时授权" min-width="190">
          <template #default="{ row }">
            <template v-if="row.tempAuth">
              <el-tag size="small" type="warning">{{ row.tempAuth.name }}</el-tag>
              <span class="temp-expire">至 {{ row.tempAuth.expireAt }}</span>
            </template>
            <span v-else class="temp-none">—</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 'enabled' ? 'success' : 'info'">
              {{ row.status === "enabled" ? "启用" : "禁用" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最近登录" width="150" />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openRoles(row)">分配角色</el-button>
            <el-button link type="primary" size="small" @click="openTemp(row)">临时授权</el-button>
            <el-button link type="primary" size="small" @click="resetPassword(row)">
              重置密码
            </el-button>
            <el-button
              link
              :type="row.status === 'enabled' ? 'danger' : 'success'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === "enabled" ? "禁用" : "启用" }}
            </el-button>
            <el-button
              v-if="row.tempAuth"
              link
              type="warning"
              size="small"
              @click="revokeTemp(row)"
            >
              撤销授权
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
          :current-page="page"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <CreateAccountDialog
      v-model:visible="createVisible"
      :role-options="roleOptions"
      @created="onAccountCreated"
    />
    <AssignRoleDialog
      v-model:visible="roleDialog.visible"
      :name="roleDialog.name"
      :roles="roleDialog.roles"
      :role-options="roleOptions"
      @save="onRolesSaved"
    />
    <TempAuthDialog
      v-model:visible="tempDialog.visible"
      :name="tempDialog.name"
      @save="onTempSaved"
    />
  </div>
</template>

<style scoped lang="scss">
.role-tag {
  margin-right: 6px;
}

.temp-expire {
  margin-left: 6px;
  font-size: 12px;
  color: #e6a23c;
}

.temp-none {
  color: #c0c4cc;
}
</style>
