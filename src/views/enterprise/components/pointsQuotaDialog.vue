<!-- 点数配额管理 -->
<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { Enterprise } from "@/mock/buser";
import { adjustQuota } from "@/api/enterprise";
const props = defineProps<{
  visible: boolean;
  currentEnt: Enterprise | null;
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  saved: [data: Enterprise];
}>();

const form = reactive({ amount: 0, action: "add" as "add" | "adjust", remark: "" });

watch(
  () => props.visible,
  (v) => {
    if (v) Object.assign(form, { amount: 0, action: "add", remark: "" });
  },
);

const handleClose = () => {
  emit("update:visible", false);
};

const handleSubmit = () => {
  const ent = props.currentEnt;
  if (!ent) return;
  if (form.amount <= 0) {
    ElMessage.warning(form.action === "add" ? "加购点数需大于 0" : "请输入调整后的总额度");
    return;
  }
  adjustQuota(ent.id, form.action, form.amount, form.remark).then((result) => {
    if (!result) {
      ElMessage.error("操作失败，未找到对应企业");
      return;
    }
    ElMessage.success("配额调整成功，已写入审计日志");
    emit("update:visible", false);
    emit("saved", result);
  });
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="点数配额管理"
    width="480px"
    destroy-on-close
    append-to-body
    @update:model-value="handleClose"
  >
    <template v-if="currentEnt">
      <el-descriptions :column="3" border size="small" class="detail-desc">
        <el-descriptions-item label="当前余额">
          {{ (currentEnt.pointsTotal - currentEnt.pointsUsed).toLocaleString() }}
        </el-descriptions-item>
        <el-descriptions-item label="总配额">
          {{ currentEnt.pointsTotal.toLocaleString() }}
        </el-descriptions-item>
        <el-descriptions-item label="已使用">
          {{ currentEnt.pointsUsed.toLocaleString() }}
        </el-descriptions-item>
      </el-descriptions>
      <el-form :model="form" label-width="100px" class="points-form">
        <el-form-item label="操作">
          <el-radio-group v-model="form.action">
            <el-radio value="add">加购点数</el-radio>
            <el-radio value="adjust">调整总额度</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="form.action === 'add' ? '加购数量' : '调整后总额'">
          <el-input-number v-model="form.amount" :min="0" :step="10000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="form.remark"
            type="textarea"
            :rows="2"
            placeholder="调整原因（写入审计日志）"
          />
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.detail-desc {
  margin-bottom: 16px;
}

.points-form {
  margin-top: 16px;
}
</style>
