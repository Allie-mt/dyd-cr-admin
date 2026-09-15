<!-- 新增后台账号弹窗组件 -->
<script setup lang="ts">
import { reactive } from "vue";
import { ElMessage } from "element-plus";

const props = defineProps<{
  visible: boolean;
  roleOptions: string[];
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  created: [account: { account: string; name: string; phone: string; roles: string[] }];
}>();

const form = reactive({ account: "", name: "", phone: "", roles: [] as string[] });

function handleClose() {
  emit("update:visible", false);
}

function handleSubmit() {
  if (!form.account || !form.name || !form.roles.length) {
    ElMessage.warning("请填写账号、姓名并分配至少一个角色");
    return;
  }
  emit("created", {
    account: form.account,
    name: form.name,
    phone: form.phone,
    roles: [...form.roles],
  });
  Object.assign(form, { account: "", name: "", phone: "", roles: [] });
  emit("update:visible", false);
  ElMessage.success("后台账号已创建，初始密码已发送至绑定手机");
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="新增后台账号"
    width="460px"
    @update:model-value="handleClose"
  >
    <el-form label-width="90px">
      <el-form-item label="登录账号" required>
        <el-input v-model="form.account" placeholder="如：op_zhang" />
      </el-form-item>
      <el-form-item label="姓名" required>
        <el-input v-model="form.name" placeholder="真实姓名" />
      </el-form-item>
      <el-form-item label="手机号">
        <el-input v-model="form.phone" placeholder="用于接收初始密码" />
      </el-form-item>
      <el-form-item label="分配角色" required>
        <el-select v-model="form.roles" multiple placeholder="选择角色" style="width: 100%">
          <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">创建</el-button>
    </template>
  </el-dialog>
</template>
