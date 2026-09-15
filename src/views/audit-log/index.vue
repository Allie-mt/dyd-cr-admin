<!-- 审计日志：操作日志 / 登录日志 / 权限变更日志 -->
<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { getOpLogs, getLoginLogs, getPermLogs } from "@/api/auditLog";
import type { OpLog, LoginLog, PermLog } from "@/api/auditLog";

// ===== 操作日志：记录后台所有写操作 =====
const opLogs = ref<OpLog[]>([]);
const loginLogs = ref<LoginLog[]>([]);
const permLogs = ref<PermLog[]>([]);

async function fetchLogs() {
  const [opRes, loginRes, permRes] = await Promise.all([
    getOpLogs(),
    getLoginLogs(),
    getPermLogs(),
  ]);
  opLogs.value = opRes;
  loginLogs.value = loginRes;
  permLogs.value = permRes;
}

fetchLogs();
// 操作日志筛选条件
const opFilter = reactive({
  keyword: "",
  action: "",
  dateRange: [] as string[],
});
// 重置操作日志筛选条件
const resetOpFilter = () => {
  Object.assign(opFilter, { keyword: "", action: "", dateRange: [] });
};
// 操作日志筛选条件：操作类型
const actionOptions = [...new Set(opLogs.value.map((l) => l.action))];
// 操作日志筛选条件：时间范围快捷选择
const rangeShortcuts = [
  {
    text: "近7天",
    value: () => {
      const end = new Date();
      const start = new Date(end.getTime() - 7 * 86400000);
      return [start, end];
    },
  },
  {
    text: "近30天",
    value: () => {
      const end = new Date();
      const start = new Date(end.getTime() - 30 * 86400000);
      return [start, end];
    },
  },
];
// 判断时间是否在范围内
const inRange = (time: string, dateRange: string[]) => {
  if (!dateRange || dateRange.length !== 2) return true;
  const d = time.slice(0, 10);
  return d >= dateRange[0] && d <= dateRange[1];
};
// 计算筛选后的操作日志
const filteredOpLogs = computed(() =>
  opLogs.value.filter(
    (l) =>
      (!opFilter.keyword ||
        l.operator.includes(opFilter.keyword) ||
        l.target.includes(opFilter.keyword) ||
        l.ip.includes(opFilter.keyword)) &&
      (!opFilter.action || l.action === opFilter.action) &&
      inRange(l.time, opFilter.dateRange),
  ),
);

// ===== 登录日志 =====

const loginFilter = reactive({
  keyword: "",
  result: "",
  dateRange: [] as string[],
});
// 重置登录日志筛选条件
const resetLoginFilter = () => {
  Object.assign(loginFilter, { keyword: "", result: "", dateRange: [] });
};
// 登录日志筛选条件：登录结果
const filteredLoginLogs = computed(() =>
  loginLogs.value.filter(
    (l) =>
      (!loginFilter.keyword ||
        l.user.includes(loginFilter.keyword) ||
        l.ip.includes(loginFilter.keyword)) &&
      (!loginFilter.result || l.result === loginFilter.result) &&
      inRange(l.time, loginFilter.dateRange),
  ),
);

// ===== 权限变更日志 =====
// 权限变更日志筛选条件
const permFilter = reactive({
  keyword: "",
  targetType: "",
  dateRange: [] as string[],
});
// 重置权限变更日志筛选条件
const resetPermFilter = () => {
  Object.assign(permFilter, { keyword: "", targetType: "", dateRange: [] });
};
const targetTypeOptions = ["后台账号", "C端用户", "企业", "白名单"];
const filteredPermLogs = computed(() =>
  permLogs.value.filter(
    (l) =>
      (!permFilter.keyword ||
        l.operator.includes(permFilter.keyword) ||
        l.target.includes(permFilter.keyword)) &&
      (!permFilter.targetType || l.targetType === permFilter.targetType) &&
      inRange(l.time, permFilter.dateRange),
  ),
);

const activeTab = ref("op");
</script>

<template>
  <div class="page-container">
    <div class="card-panel">
      <el-tabs v-model="activeTab">
        <!-- Tab 1 操作日志 -->
        <el-tab-pane label="操作日志" name="op">
          <div class="filter-bar">
            <el-input
              v-model="opFilter.keyword"
              placeholder="搜索操作人 / 目标对象 / IP"
              clearable
              style="width: 240px"
              :prefix-icon="'Search'"
            />
            <el-select v-model="opFilter.action" placeholder="动作" clearable style="width: 150px">
              <el-option v-for="a in actionOptions" :key="a" :label="a" :value="a" />
            </el-select>
            <el-date-picker
              v-model="opFilter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :shortcuts="rangeShortcuts"
              style="width: 220px"
            />
            <el-button :icon="'RefreshLeft'" @click="resetOpFilter">重置</el-button>
          </div>
          <el-table :data="filteredOpLogs" stripe style="width: 100%">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="operator" label="操作人" width="140" />
            <el-table-column prop="action" label="动作" width="120">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.action }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="目标对象" min-width="220" show-overflow-tooltip />
            <el-table-column label="变更内容" min-width="240">
              <template #default="{ row }">
                <div class="change-cell">
                  <span class="change-before">{{ row.before }}</span>
                  <span class="change-arrow">→</span>
                  <span class="change-after">{{ row.after }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="ip" label="IP" width="100" />
          </el-table>
          <div class="pagination-wrap">
            <el-pagination
              background
              layout="total, prev, pager, next"
              :total="filteredOpLogs.length"
            />
          </div>
        </el-tab-pane>

        <!-- Tab 2 登录日志 -->
        <el-tab-pane label="登录日志" name="login">
          <div class="filter-bar">
            <el-input
              v-model="loginFilter.keyword"
              placeholder="搜索登录人 / IP"
              clearable
              style="width: 240px"
              :prefix-icon="'Search'"
            />
            <el-select
              v-model="loginFilter.result"
              placeholder="结果"
              clearable
              style="width: 120px"
            >
              <el-option label="成功" value="成功" />
              <el-option label="失败" value="失败" />
            </el-select>
            <el-date-picker
              v-model="loginFilter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :shortcuts="rangeShortcuts"
              style="width: 220px"
            />
            <el-button :icon="'RefreshLeft'" @click="resetLoginFilter">重置</el-button>
          </div>
          <el-table :data="filteredLoginLogs" stripe style="width: 100%">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="user" label="登录人" width="150" />
            <el-table-column prop="ip" label="IP" width="130" />
            <el-table-column prop="device" label="设备" min-width="180" />
            <el-table-column label="结果" width="90">
              <template #default="{ row }">
                <el-tag size="small" :type="row.result === '成功' ? 'success' : 'danger'">
                  {{ row.result }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="失败原因" min-width="200">
              <template #default="{ row }">
                <span :class="row.failReason ? 'fail-reason' : 'empty-cell'">
                  {{ row.failReason || "—" }}
                </span>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrap">
            <el-pagination
              background
              layout="total, prev, pager, next"
              :total="filteredLoginLogs.length"
            />
          </div>
        </el-tab-pane>

        <!-- Tab 3 权限变更日志 -->
        <el-tab-pane label="权限变更日志" name="perm">
          <div class="filter-bar">
            <el-input
              v-model="permFilter.keyword"
              placeholder="搜索操作人 / 变更对象"
              clearable
              style="width: 240px"
              :prefix-icon="'Search'"
            />
            <el-select
              v-model="permFilter.targetType"
              placeholder="对象类型"
              clearable
              style="width: 130px"
            >
              <el-option v-for="t in targetTypeOptions" :key="t" :label="t" :value="t" />
            </el-select>
            <el-date-picker
              v-model="permFilter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              :shortcuts="rangeShortcuts"
              style="width: 220px"
            />
            <el-button :icon="'RefreshLeft'" @click="resetPermFilter">重置</el-button>
          </div>
          <el-table :data="filteredPermLogs" stripe style="width: 100%">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="operator" label="操作人" width="130" />
            <el-table-column label="对象类型" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain" type="warning">{{ row.targetType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="target" label="变更对象" min-width="180" show-overflow-tooltip />
            <el-table-column prop="changeType" label="变更类型" width="170" />
            <el-table-column label="变更内容" min-width="220">
              <template #default="{ row }">
                <div class="change-cell">
                  <span class="change-before">{{ row.before }}</span>
                  <span class="change-arrow">→</span>
                  <span class="change-after">{{ row.after }}</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-wrap">
            <el-pagination
              background
              layout="total, prev, pager, next"
              :total="filteredPermLogs.length"
            />
          </div>
        </el-tab-pane>
      </el-tabs>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="关键操作（退款、封号、套餐下线、企业配额调整、权限变更）已全量留痕，可追溯至具体管理员"
        class="audit-tip"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.change-cell {
  display: flex;
  align-items: center;
  gap: 6px;

  .change-before {
    color: #909399;
    font-size: 13px;
  }

  .change-arrow {
    color: #c0c4cc;
  }

  .change-after {
    color: $primary;
    font-size: 13px;
    font-weight: 500;
  }
}

.fail-reason {
  color: #f56c6c;
  font-size: 13px;
}

.empty-cell {
  color: #c0c4cc;
}

.audit-tip {
  margin-top: 16px;
}
</style>
