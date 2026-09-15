<!-- 分配角色弹窗组件 -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps<{
  visible: boolean;
  name: string;
  roles: string[];
  roleOptions: string[];
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  save: [roles: string[]];
}>();

const localRoles = ref<string[]>([]);

watch(
  () => props.visible,
  (v) => {
    if (v) localRoles.value = [...props.roles];
  },
);

function handleClose() {
  emit("update:visible", false);
}

function handleSubmit() {
  if (!localRoles.value.length) {
    ElMessage.warning("请至少选择一个角色");
    return;
  }
  emit("save", [...localRoles.value]);
  emit("update:visible", false);
  ElMessage.success(`「${props.name}」角色分配已保存，权限变更已写入审计日志`);
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="`分配角色 · ${name}`"
    width="440px"
    @update:model-value="handleClose"
  >
    <el-select v-model="localRoles" multiple placeholder="选择角色" style="width: 100%">
      <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
    </el-select>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>
