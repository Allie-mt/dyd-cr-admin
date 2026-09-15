<!-- 调档位弹窗 -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { adjustLevel, type CUser, type Level } from "@/api/cuser";

const props = defineProps<{
  visible: boolean;
  currentUser: CUser | null;
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
  saved: [data: CUser];
}>();

const levels: Level[] = ["免费版", "基础版", "标准版", "高级版"];
const levelDraft = ref<Level>("免费版");

watch(
  () => props.visible,
  (v) => {
    if (v && props.currentUser) {
      levelDraft.value = props.currentUser.level;
    }
  },
);

function handleClose() {
  emit("update:visible", false);
}

function handleSubmit() {
  const user = props.currentUser;
  if (!user) return;
  if (levelDraft.value === user.level) {
    ElMessage.info("档位未变化");
    return;
  }
  ElMessageBox.confirm(
    `确认将「${user.nickname}」档位由 ${user.level} 调整为 ${levelDraft.value} 吗？该操作将写入审计日志`,
    "档位调整",
    { confirmButtonText: "确认调整", cancelButtonText: "取消", type: "warning" },
  ).then(async () => {
    const result = await adjustLevel(user.id, levelDraft.value);
    if (result) {
      ElMessage.success(`档位已调整为 ${levelDraft.value}，已写入审计日志`);
      emit("update:visible", false);
      emit("saved", result);
    }
  });
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    title="调整会员档位"
    width="440px"
    destroy-on-close
    append-to-body
    @update:model-value="handleClose"
  >
    <template v-if="currentUser">
      <el-descriptions :column="2" border size="small" style="margin-bottom: 16px">
        <el-descriptions-item label="用户">{{ currentUser.nickname }}</el-descriptions-item>
        <el-descriptions-item label="当前档位">
          <el-tag size="small" effect="plain">{{ currentUser.level }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <el-form label-width="90px">
        <el-form-item label="调整档位">
          <el-radio-group v-model="levelDraft">
            <el-radio-button v-for="l in levels" :key="l" :value="l">{{ l }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <el-alert
        v-if="levelDraft !== currentUser.level"
        type="info"
        :closable="false"
        show-icon
        :title="`${currentUser.level} → ${levelDraft}，升级/降级会改变用户的默认权益`"
      />
    </template>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确认调整</el-button>
    </template>
  </el-dialog>
</template>
