<!-- 点数操作弹窗 -->
<script setup lang="ts">
import { reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import { pointsAction, type CUser, type PointsAction } from "@/api/cuser";

const props = defineProps<{
  visible: boolean;
  type: PointsAction;
  currentUser: CUser | null;
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  submitted: [];
}>();

const pointsActionText: Record<PointsAction, string> = {
  gift: "赠送点数",
  deduct: "扣减点数",
  freeze: "冻结点数",
};
const form = reactive({ amount: 100, remark: "" });

watch(
  () => props.visible,
  (v) => {
    if (v) Object.assign(form, { amount: 100, remark: "" });
  },
);

function handleClose() {
  emit("update:visible", false);
}

function handleSubmit() {
  const user = props.currentUser;
  if (!user || form.amount <= 0) {
    ElMessage.warning("请输入正确的点数数量");
    return;
  }
  if (props.type === "deduct" && form.amount > user.points) {
    ElMessage.warning(`可扣减点数不足，当前可用余额 ${user.points}`);
    return;
  }
  if (props.type === "freeze" && form.amount > user.points) {
    ElMessage.warning(`可冻结点数不足，当前可用余额 ${user.points}`);
    return;
  }
  pointsAction(user.id, props.type, form.amount, form.remark).then(() => {
    emit("update:visible", false);
    emit("submitted");
    ElMessage.success(`${pointsActionText[props.type]}成功，已写入审计日志`);
  });
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="pointsActionText[type]"
    width="420px"
    append-to-body
    @update:model-value="handleClose"
  >
    <el-form label-width="90px">
      <el-form-item label="点数数量">
        <el-input-number v-model="form.amount" :min="1" :max="100000" :step="100" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="form.remark"
          type="textarea"
          :rows="2"
          placeholder="操作原因，将写入审计日志"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>
