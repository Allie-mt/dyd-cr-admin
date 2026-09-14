<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

type Scope = '全部用户' | '白名单' | '灰度 20%' | '灰度 50%'

interface AIModel {
  id: number
  name: string
  category: string
  enabled: boolean
  scope: Scope
  updatedAt: string
}

const scopes: Scope[] = ['全部用户', '灰度 20%', '灰度 50%', '白名单']

const list = ref<AIModel[]>([
  { id: 1, name: '视频生成 2.0', category: '视频生成', enabled: true, scope: '全部用户', updatedAt: '2026-08-01' },
  { id: 2, name: '视频生成 2.5（灰度）', category: '视频生成', enabled: true, scope: '灰度 20%', updatedAt: '2026-09-10' },
  { id: 3, name: '4K 超清生成', category: '视频生成', enabled: true, scope: '白名单', updatedAt: '2026-09-05' },
  { id: 4, name: '数字人 A3', category: '数字人', enabled: true, scope: '全部用户', updatedAt: '2026-06-18' },
  { id: 5, name: '数字人 S1（内测）', category: '数字人', enabled: false, scope: '白名单', updatedAt: '2026-09-12' },
  { id: 6, name: '脚本大师', category: '脚本生成', enabled: true, scope: '全部用户', updatedAt: '2026-03-25' },
  { id: 7, name: '字幕擦除 Pro', category: '字幕处理', enabled: true, scope: '灰度 50%', updatedAt: '2026-09-08' },
  { id: 8, name: '图片生成 3.0', category: '图片生成', enabled: true, scope: '全部用户', updatedAt: '2026-05-14' },
])

function toggleModel(model: AIModel) {
  ElMessage.success(`模型「${model.name}」已${model.enabled ? '启用' : '停用'}，已写入审计日志`)
}

function changeScope(model: AIModel) {
  ElMessage.success(`「${model.name}」生效范围已调整为「${model.scope}」`)
}
</script>

<template>
  <div class="page-container">
    <div class="card-panel">
      <div class="filter-bar">
        <span class="page-tip">全局控制模型上下线；停用后所有用户（含白名单）立即不可用，生效范围支持按比例灰度或仅白名单可用</span>
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
