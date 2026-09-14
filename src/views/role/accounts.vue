<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface Account {
  id: number
  account: string
  name: string
  phone: string
  roles: string[]
  status: 'enabled' | 'disabled'
  lastLoginAt: string
  tempAuth?: { name: string; expireAt: string }
}

const roleOptions = ['超级管理员', '运营', '客服', '财务', '风控', '数据分析', '专项活动运营']

const list = ref<Account[]>([
  { id: 1, account: 'admin', name: '系统管理员', phone: '13900000001', roles: ['超级管理员'], status: 'enabled', lastLoginAt: '2026-09-14 09:02' },
  { id: 2, account: 'op_chen', name: '陈雨薇', phone: '13900000002', roles: ['运营'], status: 'enabled', lastLoginAt: '2026-09-14 08:40' },
  { id: 3, account: 'op_liu', name: '刘一帆', phone: '13900000003', roles: ['运营'], status: 'enabled', lastLoginAt: '2026-09-13 19:22', tempAuth: { name: '白名单管理', expireAt: '2026-09-30' } },
  { id: 4, account: 'cs_zhao', name: '赵倩文', phone: '13900000004', roles: ['客服'], status: 'enabled', lastLoginAt: '2026-09-14 08:55' },
  { id: 5, account: 'cs_sun', name: '孙浩然', phone: '13900000005', roles: ['客服'], status: 'disabled', lastLoginAt: '2026-08-28 17:10' },
  { id: 6, account: 'fin_wu', name: '吴倩', phone: '13900000006', roles: ['财务'], status: 'enabled', lastLoginAt: '2026-09-13 16:48' },
  { id: 7, account: 'risk_zheng', name: '郑毅', phone: '13900000007', roles: ['风控'], status: 'enabled', lastLoginAt: '2026-09-12 20:35' },
  { id: 8, account: 'data_fang', name: '方雪', phone: '13900000008', roles: ['数据分析'], status: 'enabled', lastLoginAt: '2026-09-11 10:18' },
])

// ===== 搜索 =====
const keyword = ref('')
const filtered = computed(() =>
  list.value.filter(
    (a) => !keyword.value || a.account.includes(keyword.value) || a.name.includes(keyword.value),
  ),
)

// ===== 新增账号 =====
const createDialog = reactive({ visible: false, account: '', name: '', phone: '', roles: [] as string[] })

function submitCreate() {
  if (!createDialog.account || !createDialog.name || !createDialog.roles.length) {
    ElMessage.warning('请填写账号、姓名并分配至少一个角色')
    return
  }
  list.value.push({
    id: Date.now(),
    account: createDialog.account,
    name: createDialog.name,
    phone: createDialog.phone,
    roles: [...createDialog.roles],
    status: 'enabled',
    lastLoginAt: '—',
  })
  Object.assign(createDialog, { visible: false, account: '', name: '', phone: '', roles: [] })
  ElMessage.success('后台账号已创建，初始密码已发送至绑定手机')
}

// ===== 分配角色 =====
const roleDialog = reactive({ visible: false, accountId: 0, name: '', roles: [] as string[] })

function openRoles(acc: Account) {
  Object.assign(roleDialog, { visible: true, accountId: acc.id, name: acc.name, roles: [...acc.roles] })
}

function submitRoles() {
  if (!roleDialog.roles.length) {
    ElMessage.warning('请至少选择一个角色')
    return
  }
  const acc = list.value.find((a) => a.id === roleDialog.accountId)
  if (acc) acc.roles = [...roleDialog.roles]
  roleDialog.visible = false
  ElMessage.success(`「${roleDialog.name}」角色分配已保存，权限变更已写入审计日志`)
}

// ===== 临时授权 =====
const tempDialog = reactive({ visible: false, accountId: 0, name: '', perm: '', expireAt: '' })

function openTemp(acc: Account) {
  Object.assign(tempDialog, { visible: true, accountId: acc.id, name: acc.name, perm: '', expireAt: '' })
}

function submitTemp() {
  if (!tempDialog.perm || !tempDialog.expireAt) {
    ElMessage.warning('请选择权限点并设置有效期')
    return
  }
  const acc = list.value.find((a) => a.id === tempDialog.accountId)
  if (acc) acc.tempAuth = { name: tempDialog.perm, expireAt: tempDialog.expireAt }
  tempDialog.visible = false
  ElMessage.success(`已临时授权「${tempDialog.perm}」，到期自动回收，已写入审计日志`)
}

function revokeTemp(acc: Account) {
  ElMessageBox.confirm(`确认撤销「${acc.name}」的临时授权吗？权限立即回收`, '撤销临时授权', {
    confirmButtonText: '确认撤销',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    acc.tempAuth = undefined
    ElMessage.success('临时授权已撤销')
  })
}

// ===== 启用 / 禁用 / 重置密码 =====
function toggleStatus(acc: Account) {
  const action = acc.status === 'enabled' ? '禁用' : '启用'
  ElMessageBox.confirm(`确认${action}账号「${acc.name}」吗？`, `${action}账号`, {
    confirmButtonText: `确认${action}`,
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    acc.status = acc.status === 'enabled' ? 'disabled' : 'enabled'
    ElMessage.success(`已${action}，已写入审计日志`)
  })
}

function resetPassword(acc: Account) {
  ElMessageBox.confirm(`确认重置「${acc.name}」的登录密码吗？`, '重置密码', {
    confirmButtonText: '确认重置',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('新密码已发送至绑定手机，已写入审计日志')
  })
}
</script>

<template>
  <div class="page-container">
    <div class="card-panel">
      <div class="filter-bar">
        <el-input
          v-model="keyword"
          placeholder="搜索账号 / 姓名"
          clearable
          style="width: 200px"
          :prefix-icon="'Search'"
        />
        <div class="filter-actions">
          <el-button type="primary" :icon="'Plus'" @click="createDialog.visible = true">新增账号</el-button>
        </div>
      </div>

      <el-table :data="filtered" stripe style="width: 100%">
        <el-table-column prop="account" label="账号" min-width="110" />
        <el-table-column prop="name" label="姓名" min-width="100" />
        <el-table-column prop="phone" label="手机号" width="125" />
        <el-table-column label="角色" min-width="160">
          <template #default="{ row }">
            <el-tag
              v-for="role in row.roles"
              :key="role"
              size="small"
              effect="plain"
              class="role-tag"
            >
              {{ role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="临时授权" min-width="190">
          <template #default="{ row }">
            <template v-if="row.tempAuth">
              <el-tag size="small" type="warning">{{ row.tempAuth.name }}</el-tag>
              <span class="temp-expire">至 {{ row.tempAuth.expireAt }}</span>
            </template>
            <span v-else class="temp-none">—</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 'enabled' ? 'success' : 'info'">
              {{ row.status === 'enabled' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginAt" label="最近登录" width="150" />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openRoles(row)">分配角色</el-button>
            <el-button link type="primary" size="small" @click="openTemp(row)">临时授权</el-button>
            <el-button link type="primary" size="small" @click="resetPassword(row)">重置密码</el-button>
            <el-button
              link
              :type="row.status === 'enabled' ? 'danger' : 'success'"
              size="small"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button
              v-if="row.tempAuth"
              link
              type="warning"
              size="small"
              @click="revokeTemp(row)"
            >
              撤销授权
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增账号弹窗 -->
    <el-dialog v-model="createDialog.visible" title="新增后台账号" width="460px">
      <el-form label-width="90px">
        <el-form-item label="登录账号" required>
          <el-input v-model="createDialog.account" placeholder="如：op_zhang" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="createDialog.name" placeholder="真实姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="createDialog.phone" placeholder="用于接收初始密码" />
        </el-form-item>
        <el-form-item label="分配角色" required>
          <el-select v-model="createDialog.roles" multiple placeholder="选择角色" style="width: 100%">
            <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 分配角色弹窗 -->
    <el-dialog v-model="roleDialog.visible" :title="`分配角色 · ${roleDialog.name}`" width="440px">
      <el-select v-model="roleDialog.roles" multiple placeholder="选择角色" style="width: 100%">
        <el-option v-for="r in roleOptions" :key="r" :label="r" :value="r" />
      </el-select>
      <template #footer>
        <el-button @click="roleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitRoles">保存</el-button>
      </template>
    </el-dialog>

    <!-- 临时授权弹窗 -->
    <el-dialog v-model="tempDialog.visible" :title="`临时授权 · ${tempDialog.name}`" width="440px">
      <el-form label-width="90px">
        <el-form-item label="权限点" required>
          <el-select v-model="tempDialog.perm" placeholder="选择要临时开放的权限点">
            <el-option
              v-for="p in ['白名单管理', '企业开通', '配额调整', '退款审批', '会员权益配置']"
              :key="p"
              :label="p"
              :value="p"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="有效期至" required>
          <el-date-picker
            v-model="tempDialog.expireAt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="到期自动回收"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="临时授权到期后自动回收，无需人工干预；授权与回收均写入审计日志"
      />
      <template #footer>
        <el-button @click="tempDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitTemp">确认授权</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.role-tag {
  margin-right: 6px;
}

.temp-expire {
  margin-left: 6px;
  font-size: 12px;
  color: #e6a23c;
}

.temp-none {
  color: #c0c4cc;
}
</style>
