<!-- 权限点管理 -->
<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { mockGetPermPoints } from "@/api/featureSwitch";
import type { PermGroup, PermPoint } from "@/api/featureSwitch";

const groups = ref<PermGroup[]>(mockGetPermPoints());

const total = groups.value.reduce((sum, g) => sum + g.points.length, 0);
const enabledCount = () =>
  groups.value.reduce((sum, g) => sum + g.points.filter((p) => p.enabled).length, 0);

function togglePoint(point: PermPoint, module: string) {
  ElMessage.success(
    `权限点「${module} · ${point.name}」已${point.enabled ? "启用" : "禁用"}，已写入审计日志`,
  );
}
</script>

<template>
  <div class="page-container">
    <div class="filter-bar">
      <span class="page-tip">
        权限点是角色授权与白名单开白的最小单元，共 {{ total }} 个，当前启用
        {{ enabledCount() }} 个；禁用后所有角色该项权限同步失效
      </span>
    </div>

    <div v-for="group in groups" :key="group.module" class="card-panel group-card">
      <div class="group-header">
        <span class="group-title">{{ group.module }}</span>
        <el-tag size="small" type="info" effect="plain">{{ group.points.length }} 个权限点</el-tag>
      </div>
      <el-table :data="group.points" size="default" style="width: 100%">
        <el-table-column prop="code" label="权限编码" width="160" />
        <el-table-column prop="name" label="权限点名称" width="130" />
        <el-table-column prop="desc" label="说明" min-width="220" />
        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.enabled" @change="togglePoint(row, group.module)" />
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
