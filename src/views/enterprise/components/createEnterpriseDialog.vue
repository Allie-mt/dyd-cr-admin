<!-- 开通企业 -->
<script setup lang="ts">
import { reactive, ref } from "vue";
import { type FormInstance, type FormRules } from "element-plus";
type Plan = "初创版" | "成长版" | "专业版" | "企业定制版";

const props = defineProps<{
  visible: boolean;
  plans: Plan[];
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  created: [
    data: { name: string; creditCode: string; plan: Plan; points: number; signDate: string },
  ];
}>();

const formRef = ref<FormInstance>();
// 表单数据
const form = reactive({
  name: "",
  creditCode: "",
  plan: "初创版" as Plan,
  points: 50000,
  signDate: "",
});

const rules: FormRules<typeof form> = {
  name: [
    { required: true, message: "请输入企业名称", trigger: "blur" },
    { min: 2, max: 40, message: "长度 2-40 个字符", trigger: "blur" },
  ],
  creditCode: [
    { required: true, message: "请输入统一社会信用代码", trigger: "blur" },
    { pattern: /^[0-9A-HJ-NPQRTUWXY]{18}$/, message: "18 位信用代码格式不正确", trigger: "blur" },
  ],
  plan: [{ required: true, message: "请选择套餐档位", trigger: "change" }],
  points: [{ required: true, message: "请输入初始点数额度", trigger: "blur" }],
  signDate: [{ required: true, message: "请选择签约时间", trigger: "change" }],
};
// 关闭弹窗
const handleClose = () => {
  emit("update:visible", false);
};
// 提交表单
const handleSubmit = () => {
  formRef.value?.validate((valid) => {
    if (!valid) return;
    emit("created", { ...form });
    emit("update:visible", false);
  });
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="开通企业租户"
    width="540px"
    destroy-on-close
    @update:model-value="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="企业名称" prop="name">
        <el-input v-model="form.name" placeholder="请输入企业全称" />
      </el-form-item>
      <el-form-item label="统一信用代码" prop="creditCode">
        <el-input v-model="form.creditCode" placeholder="18 位统一社会信用代码" maxlength="18" />
      </el-form-item>
      <el-form-item label="套餐档位" prop="plan">
        <el-radio-group v-model="form.plan">
          <el-radio-button v-for="p in plans" :key="p" :value="p">{{ p }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="初始点数额度" prop="points">
        <el-input-number v-model="form.points" :min="1000" :step="10000" style="width: 100%" />
      </el-form-item>
      <el-form-item label="签约时间" prop="signDate">
        <el-date-picker
          v-model="form.signDate"
          type="date"
          value-format="YYYY-MM-DD"
          placeholder="请选择签约时间"
          style="width: 100%"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">开通</el-button>
    </template>
  </el-dialog>
</template>
