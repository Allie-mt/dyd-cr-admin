<!-- 限制功能弹窗 -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ "update:visible": [val: boolean]; submitted: [funcs: string[]] }>();

const funcs = ref<string[]>([]);
const restrictFuncs = ["脚本生成", "图片生成", "视频生成", "数字人制作", "字幕处理"];

watch(
  () => props.visible,
  (v) => {
    if (v) funcs.value = [];
  },
);

function handleClose() {
  emit("update:visible", false);
}

function handleSubmit() {
  if (!funcs.value.length) {
    ElMessage.warning("请选择要限制的功能");
    return;
  }
  emit("submitted", [...funcs.value]);
  emit("update:visible", false);
  ElMessage.success(`已限制功能：${funcs.value.join("、")}，已写入审计日志`);
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="限制功能"
    width="440px"
    append-to-body
    @update:model-value="handleClose"
  >
    <p class="restrict-tip">选择要对该用户限制的功能，限制后立即生效并写入审计日志</p>
    <el-checkbox-group v-model="funcs">
      <el-checkbox v-for="f in restrictFuncs" :key="f" :value="f" class="restrict-check">
        {{ f }}
      </el-checkbox>
    </el-checkbox-group>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认限制</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.restrict-tip {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}
.restrict-check {
  margin-right: 16px;
}
</style>
