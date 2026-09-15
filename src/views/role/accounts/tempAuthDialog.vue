<!-- 临时授权弹窗组件 -->
<script setup lang="ts">
import { reactive, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps<{
  visible: boolean;
  name: string;
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  save: [perm: string, expireAt: string];
}>();

const form = reactive({ perm: "", expireAt: "" });

watch(
  () => props.visible,
  (v) => {
    if (v) Object.assign(form, { perm: "", expireAt: "" });
  },
);

function handleClose() {
  emit("update:visible", false);
}

function handleSubmit() {
  if (!form.perm || !form.expireAt) {
    ElMessage.warning("请选择权限点并设置有效期");
    return;
  }
  emit("save", form.perm, form.expireAt);
  emit("update:visible", false);
  ElMessage.success(`已临时授权「${form.perm}」，到期自动回收，已写入审计日志`);
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="`临时授权 · ${name}`"
    width="440px"
    @update:model-value="handleClose"
  >
    <el-form label-width="90px">
      <el-form-item label="权限点" required>
        <el-select v-model="form.perm" placeholder="选择要临时开放的权限点">
          <el-option
            v-for="p in ['白名单管理', '企业开通', '配额调整', '退款审批', '会员权益配置']"
            :key="p"
            :label="p"
            :value="p"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="有效期至" required>
        <el-date-picker
          v-model="form.expireAt"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="到期自动回收"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="临时授权到期后自动回收，无需人工干预；授权与回收均写入审计日志"
    />
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认授权</el-button>
    </template>
  </el-dialog>
</template>
