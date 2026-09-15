<!-- 模型开关 -->
<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { mockGetModels, mockScopes } from "@/api/featureSwitch";
import type { AIModel, Scope } from "@/api/featureSwitch";

const scopes: Scope[] = mockScopes;

const list = ref<AIModel[]>(mockGetModels());

function toggleModel(model: AIModel) {
  ElMessage.success(`模型「${model.name}」已${model.enabled ? "启用" : "停用"}，已写入审计日志`);
}

function changeScope(model: AIModel) {
  ElMessage.success(`「${model.name}」生效范围已调整为「${model.scope}」`);
}
</script>

<template>
  <div class="page-container">
    <div class="card-panel">
      <div class="filter-bar">
        <span class="page-tip">
          全局控制模型上下线；停用后所有用户（含白名单）立即不可用，生效范围支持按比例灰度或仅白名单可用
        </span>
      </div>

      <el-table :data="list" stripe style="width: 100%">
        <el-table-column prop="name" label="模型名称" min-width="180">
          <template #default="{ row }">
            <span class="model-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="类别" width="110">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.category }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="toggleModel(row)" />
          </template>
        </el-table-column>
        <el-table-column label="生效范围" width="160">
          <template #default="{ row }">
            <el-select v-model="row.scope" size="small" @change="changeScope(row)">
              <el-option v-for="s in scopes" :key="s" :label="s" :value="s" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="120" />
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-tip {
  font-size: 13px;
  color: #909399;
}

.model-name {
  font-weight: 500;
  color: #303133;
}
</style>
