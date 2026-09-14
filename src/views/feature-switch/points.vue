<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

interface PermPoint {
  code: string
  name: string
  enabled: boolean
  desc: string
}

interface PermGroup {
  module: string
  points: PermPoint[]
}

const groups = ref<PermGroup[]>([
  {
    module: 'C端用户管理',
    points: [
      { code: 'cuser:view', name: '用户查看', enabled: true, desc: '查看 C 端用户列表与详情' },
      { code: 'cuser:level', name: '档位调整', enabled: true, desc: '调整用户会员档位' },
      { code: 'cuser:points', name: '点数调整', enabled: true, desc: '赠送/扣减/冻结用户点数' },
      { code: 'cuser:ban', name: '封禁/解封', enabled: true, desc: '控制用户账号状态' },
      { code: 'cuser:whitelist', name: '白名单管理', enabled: true, desc: '灰度开白与临时授权' },
    ],
  },
  {
    module: 'B端企业管理',
    points: [
      { code: 'ent:view', name: '企业查看', enabled: true, desc: '查看企业与组织架构' },
      { code: 'ent:create', name: '企业开通', enabled: true, desc: '新建企业租户' },
      { code: 'ent:plan', name: '套餐变更', enabled: true, desc: '企业套餐升降级与续期' },
      { code: 'ent:quota', name: '配额调整', enabled: true, desc: '调整企业点数总配额' },
      { code: 'ent:fallback', name: '兜底操作', enabled: true, desc: '重置管理员/临时冻结/强制调额' },
    ],
  },
  {
    module: '财务',
    points: [
      { code: 'fin:order', name: '订单查看', enabled: true, desc: '查看订单记录' },
      { code: 'fin:refund', name: '退款审批', enabled: true, desc: '处理退款申请' },
      { code: 'fin:invoice', name: '发票管理', enabled: true, desc: '发票开具与查看' },
      { code: 'fin:recharge', name: '点数加购', enabled: true, desc: '企业点数加购入账' },
    ],
  },
  {
    module: '审计与报表',
    points: [
      { code: 'audit:op', name: '操作日志', enabled: true, desc: '查看后台写操作日志' },
      { code: 'audit:login', name: '登录日志', enabled: true, desc: '查看后台登录日志' },
      { code: 'audit:perm', name: '权限变更日志', enabled: true, desc: '查看权限/配额变更' },
      { code: 'audit:report', name: '数据报表', enabled: true, desc: '运营数据报表查看' },
    ],
  },
])

const total = groups.value.reduce((sum, g) => sum + g.points.length, 0)
const enabledCount = () =>
  groups.value.reduce((sum, g) => sum + g.points.filter((p) => p.enabled).length, 0)

function togglePoint(point: PermPoint, module: string) {
  ElMessage.success(
    `权限点「${module} · ${point.name}」已${point.enabled ? '启用' : '禁用'}，已写入审计日志`,
  )
}
</script>

<template>
  <div class="page-container">
    <div class="filter-bar">
      <span class="page-tip">权限点是角色授权与白名单开白的最小单元，共 {{ total }} 个，当前启用 {{ enabledCount() }} 个；禁用后所有角色该项权限同步失效</span>
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
