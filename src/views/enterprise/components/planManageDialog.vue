<!-- 套餐管理 -->
<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import type { Enterprise } from "@/mock/buser";
import { changePlan } from "@/api/enterprise";

type Plan = Enterprise["plan"];

const props = defineProps<{
  visible: boolean;
  currentEnt: Enterprise | null;
  plans: Plan[];
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  saved: [data: Enterprise];
}>();

const planForm = reactive({
  action: "upgrade" as "upgrade" | "downgrade" | "renew",
  plan: "初创版" as Plan,
  expireAt: "",
});

const planActionText = { upgrade: "升级", downgrade: "降级", renew: "续期" };

watch(
  () => props.visible,
  (v) => {
    if (v && props.currentEnt) {
      Object.assign(planForm, { plan: props.currentEnt.plan, expireAt: "" });
    }
  },
);

function openWith(action: "upgrade" | "downgrade" | "renew") {
  planForm.action = action;
}

function handleClose() {
  emit("update:visible", false);
}

function handleSubmit() {
  if (!props.currentEnt) return;
  if (planForm.action === "renew") {
    if (!planForm.expireAt) {
      ElMessage.warning("请选择续期到期时间");
      return;
    }
  }
  changePlan(props.currentEnt.id, planForm.action, {
    plan: planForm.plan,
    expireAt: planForm.expireAt,
  }).then((result) => {
    if (!result) {
      ElMessage.error("操作失败，未找到对应企业");
      return;
    }
    ElMessage.success(
      `已${planActionText[planForm.action]}「${props.currentEnt!.name}」套餐，已写入审计日志`,
    );
    emit("update:visible", false);
    emit("saved", result);
  });
}

defineExpose({ openWith });
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="`套餐管理 · ${planActionText[planForm.action]}`"
    width="540px"
    destroy-on-close
    append-to-body
    @update:model-value="handleClose"
  >
    <el-form :model="planForm" label-width="100px">
      <el-form-item label="操作类型">
        <el-radio-group v-model="planForm.action" disabled>
          <el-radio value="upgrade">升级</el-radio>
          <el-radio value="downgrade">降级</el-radio>
          <el-radio value="renew">续期</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="planForm.action !== 'renew'" label="目标套餐">
        <el-radio-group v-model="planForm.plan">
          <el-radio-button v-for="p in plans" :key="p" :value="p">{{ p }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-else label="续期至">
        <el-date-picker
          v-model="planForm.expireAt"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="选择新的到期时间"
          style="width: 100%"
        />
      </el-form-item>
      <el-alert
        v-if="planForm.action === 'renew'"
        type="info"
        :closable="false"
        show-icon
        title="续费时剩余点数将自动转结至下一服务期"
      />
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>
