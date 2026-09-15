<!-- 平台角色授权弹窗组件 -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

interface PermGroup {
  name: string;
  perms: string[];
}

const props = defineProps<{
  visible: boolean;
  roleName: string;
  perms: string[];
  permGroups: PermGroup[];
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  save: [perms: string[]];
}>();

const localPerms = ref<string[]>([]);

watch(
  () => props.visible,
  (v) => {
    if (v) localPerms.value = [...props.perms];
  },
);

function handleClose() {
  emit("update:visible", false);
}

function handleSubmit() {
  if (!localPerms.value.length) {
    ElMessage.warning("请至少勾选一个权限点");
    return;
  }
  emit("save", [...localPerms.value]);
  emit("update:visible", false);
  ElMessage.success(`角色「${props.roleName}」授权已保存，权限变更已写入审计日志`);
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="`角色授权 · ${roleName}`"
    width="560px"
    @update:model-value="handleClose"
  >
    <div v-for="group in permGroups" :key="group.name" class="perm-group">
      <div class="group-title">{{ group.name }}</div>
      <el-checkbox-group v-model="localPerms">
        <el-checkbox v-for="perm in group.perms" :key="perm" :value="perm">
          {{ perm }}
        </el-checkbox>
      </el-checkbox-group>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存授权</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.perm-group {
  margin-bottom: 16px;

  .group-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  :deep(.el-checkbox) {
    margin-right: 20px;
  }
}
</style>
