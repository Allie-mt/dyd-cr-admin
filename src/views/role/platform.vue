<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import authDialog from "./platform/authDialog.vue";
import createRoleDialog from "./platform/createRoleDialog.vue";
import memberDialog from "./platform/memberDialog.vue";
import { mockGetRoleList, mockPermGroups, mockAllPerms } from "@/api/role";
import type { Role, Member } from "@/api/role";

const permGroups = mockPermGroups;
const allPerms = mockAllPerms;

const list = ref<Role[]>(mockGetRoleList());

const authDialogState = reactive({
  visible: false,
  roleId: 0,
  roleName: "",
  perms: [] as string[],
});
const createVisible = ref(false);
const memberDialogState = reactive({ visible: false, roleName: "", members: [] as Member[] });

function openAuth(role: Role) {
  Object.assign(authDialogState, {
    visible: true,
    roleId: role.id,
    roleName: role.name,
    perms: [...role.perms],
  });
}

function onAuthSaved(perms: string[]) {
  const role = list.value.find((r) => r.id === authDialogState.roleId);
  if (role) {
    role.perms = perms;
    role.updatedAt = "2026-09-14";
  }
}

function onRoleCreated(name: string, desc: string) {
  list.value.push({
    id: Date.now(),
    name,
    type: "custom",
    members: 0,
    memberList: [],
    perms: [],
    desc,
    updatedAt: "2026-09-14",
  });
}

function removeRole(role: Role) {
  ElMessageBox.confirm(`确认删除自定义角色「${role.name}」吗？`, "删除角色", {
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    list.value = list.value.filter((r) => r.id !== role.id);
    ElMessage.success("角色已删除，已写入审计日志");
  });
}

function openMembers(role: Role) {
  Object.assign(memberDialogState, {
    visible: true,
    roleName: role.name,
    members: role.memberList,
  });
}
</script>

<template>
  <div class="page-container">
    <div class="card-panel">
      <div class="filter-bar">
        <span class="page-tip">
          管理后台运营人员自身的角色与权限，按权限点勾选授权；临时授权的角色到期自动回收
        </span>
        <div class="filter-actions">
          <el-button type="primary" :icon="'Plus'" @click="createVisible = true">
            新建自定义角色
          </el-button>
        </div>
      </div>

      <el-table :data="list" stripe style="width: 100%">
        <el-table-column prop="name" label="角色名称" min-width="130">
          <template #default="{ row }">
            <span class="role-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'preset'" size="small" effect="plain">预置</el-tag>
            <el-tag v-else size="small" type="warning" effect="plain">自定义</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="members" label="成员数" width="80" align="center" />
        <el-table-column label="权限点" min-width="300">
          <template #default="{ row }">
            <el-tag
              v-for="perm in row.perms.slice(0, 5)"
              :key="perm"
              size="small"
              effect="plain"
              class="perm-tag"
            >
              {{ perm }}
            </el-tag>
            <span v-if="row.perms.length > 5" class="perm-more">+{{ row.perms.length - 5 }}</span>
            <span v-if="!row.perms.length" class="perm-empty">未授权</span>
          </template>
        </el-table-column>
        <el-table-column prop="desc" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="updatedAt" label="更新时间" width="110" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openMembers(row)">成员</el-button>
            <el-button link type="primary" size="small" @click="openAuth(row)">授权</el-button>
            <el-button
              v-if="row.type === 'custom'"
              link
              type="danger"
              size="small"
              @click="removeRole(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <authDialog
      v-model:visible="authDialogState.visible"
      :role-name="authDialogState.roleName"
      :perms="authDialogState.perms"
      :perm-groups="permGroups"
      @save="onAuthSaved"
    />
    <createRoleDialog v-model:visible="createVisible" @created="onRoleCreated" />
    <memberDialog
      v-model:visible="memberDialogState.visible"
      :role-name="memberDialogState.roleName"
      :members="memberDialogState.members"
    />
  </div>
</template>

<style scoped lang="scss">
.page-tip {
  font-size: 13px;
  color: #909399;
}

.role-name {
  font-weight: 500;
  color: #303133;
}

.perm-tag {
  margin-right: 6px;
  margin-bottom: 2px;
}

.perm-more,
.perm-empty {
  font-size: 12px;
  color: #909399;
}
</style>
