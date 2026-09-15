<!-- 平台角色成员弹窗组件 -->
<script setup lang="ts">
interface Member {
  name: string;
  account: string;
  status: "正常" | "禁用";
}

defineProps<{
  visible: boolean;
  roleName: string;
  members: Member[];
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
}>();
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="`角色成员 · ${roleName}`"
    width="480px"
    @update:model-value="emit('update:visible', $event)"
  >
    <el-table :data="members" stripe size="small">
      <el-table-column prop="name" label="姓名" min-width="80" />
      <el-table-column prop="account" label="账号" min-width="120" />
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === '正常' ? 'success' : 'danger'" size="small" effect="plain">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>
