<!-- 新增平台角色弹窗组件 -->
<script setup lang="ts">
import { reactive, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  created: [name: string, desc: string];
}>();

const form = reactive({ name: "", desc: "" });

watch(
  () => props.visible,
  (v) => {
    if (v) Object.assign(form, { name: "", desc: "" });
  },
);

function handleClose() {
  emit("update:visible", false);
}

function handleSubmit() {
  if (!form.name.trim()) {
    ElMessage.warning("请输入角色名称");
    return;
  }
  emit("created", form.name, form.desc || "自定义角色");
  emit("update:visible", false);
  ElMessage.success("自定义角色已创建，请前往授权配置权限点");
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="新建自定义角色"
    width="440px"
    @update:model-value="handleClose"
  >
    <el-form label-width="80px">
      <el-form-item label="角色名称" required>
        <el-input v-model="form.name" placeholder="如：专项活动运营" maxlength="20" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="form.desc" type="textarea" :rows="2" placeholder="满足临时授权等场景" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">创建</el-button>
    </template>
  </el-dialog>
</template>
