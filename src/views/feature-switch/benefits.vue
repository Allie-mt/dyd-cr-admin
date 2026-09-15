<!-- 会员权益配置 -->
<script setup lang="ts">
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import { mockGetBenefits } from "@/api/featureSwitch";
import type { BenefitGroup } from "@/api/featureSwitch";
// 权益矩阵列
const levelColumns = [
  { key: "free" as const, label: "免费版" },
  { key: "standard" as const, label: "标准版" },
  { key: "pro" as const, label: "专业版" },
  { key: "flagship" as const, label: "旗舰版" },
];

const groups = reactive<BenefitGroup[]>(mockGetBenefits());

function saveGroup(group: BenefitGroup) {
  ElMessage.success(`「${group.name}」权益矩阵已保存，已写入审计日志`);
}
</script>

<template>
  <div class="page-container">
    <div class="filter-bar">
      <span class="page-tip">
        配置 C 端各档位默认权益；用户实际权限 = 档位权益 + 白名单加成，白名单优先级更高
      </span>
    </div>

    <div v-for="group in groups" :key="group.name" class="card-panel group-card">
      <div class="group-header">
        <span class="group-title">{{ group.name }}</span>
        <el-button type="primary" size="small" @click="saveGroup(group)">保存</el-button>
      </div>
      <el-table :data="group.rows" size="default" style="width: 100%">
        <el-table-column prop="name" label="权益项" min-width="200" />
        <el-table-column
          v-for="col in levelColumns"
          :key="col.key"
          :label="col.label"
          width="110"
          align="center"
        >
          <template #default="{ row }">
            <el-checkbox v-model="row[col.key]" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-tip {
  font-size: 13px;
  color: #909399;
}

.group-card {
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .group-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
