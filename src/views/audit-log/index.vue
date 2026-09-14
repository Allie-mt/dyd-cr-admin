<!-- 审计日志：操作日志 / 登录日志 / 权限变更日志 -->
<script setup lang="ts">
import { computed, reactive, ref } from "vue";

// ===== 操作日志：记录后台所有写操作 =====
interface OpLog {
  time: string;
  operator: string;
  action: string;
  target: string;
  before: string;
  after: string;
  ip: string;
}

const opLogs = ref<OpLog[]>([
  {
    time: "2026-09-14 09:32",
    operator: "吴倩（财务）",
    action: "加购点数",
    target: "深圳市道友岛科技（ENT-0001）",
    before: "余额 400,000",
    after: "余额 500,000",
    ip: "10.8.2.31",
  },
  {
    time: "2026-09-14 09:05",
    operator: "系统管理员",
    action: "模型开关",
    target: "视频生成 2.5（灰度）",
    before: "灰度 20%",
    after: "灰度 50%",
    ip: "10.8.1.12",
  },
  {
    time: "2026-09-13 18:44",
    operator: "郑毅（风控）",
    action: "封禁账号",
    target: "C端用户 Momo酱（1008）",
    before: "正常",
    after: "封禁（涉嫌售卖他人肖像）",
    ip: "10.8.3.77",
  },
  {
    time: "2026-09-13 15:21",
    operator: "陈雨薇（运营）",
    action: "调整会员档位",
    target: "C端用户 北城以北（1009）",
    before: "标准版",
    after: "专业版",
    ip: "10.8.2.08",
  },
  {
    time: "2026-09-13 11:36",
    operator: "系统管理员",
    action: "重置企业管理员",
    target: "广州汇智互通（ENT-0005）",
    before: "何美琳",
    after: "何美琳（重新指定）",
    ip: "10.8.1.12",
  },
  {
    time: "2026-09-12 20:18",
    operator: "吴倩（财务）",
    action: "退款审批",
    target: "订单 R20260912001",
    before: "待审批",
    after: "已退款 ¥299.00",
    ip: "10.8.2.31",
  },
  {
    time: "2026-09-12 16:02",
    operator: "陈雨薇（运营）",
    action: "白名单开白",
    target: "C端用户 夜航星（1001）",
    before: "无",
    after: "视频生成 2.5 · 至 2026-10-01",
    ip: "10.8.2.08",
  },
  {
    time: "2026-09-11 10:47",
    operator: "系统管理员",
    action: "冻结企业",
    target: "广州汇智互通（ENT-0005）",
    before: "正常",
    after: "冻结（安全风险处置）",
    ip: "10.8.1.12",
  },
  {
    time: "2026-09-10 14:29",
    operator: "陈雨薇（运营）",
    action: "强制调整配额",
    target: "杭州云启智联（ENT-0002）",
    before: "总配额 180,000",
    after: "总配额 200,000",
    ip: "10.8.2.08",
  },
  {
    time: "2026-09-09 09:15",
    operator: "系统管理员",
    action: "套餐变更",
    target: "成都天府智造（ENT-0006）",
    before: "标准版",
    after: "专业版",
    ip: "10.8.1.12",
  },
]);

const opFilter = reactive({
  keyword: "",
  action: "",
  dateRange: [] as string[],
});
const actionOptions = [...new Set(opLogs.value.map((l) => l.action))];

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

const inRange = (time: string, dateRange: string[]) => {
  if (!dateRange || dateRange.length !== 2) return true;
  const d = time.slice(0, 10);
  return d >= dateRange[0] && d <= dateRange[1];
};

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
interface LoginLog {
  time: string;
  user: string;
  ip: string;
  device: string;
  result: "成功" | "失败";
  failReason?: string;
}

const loginLogs = ref<LoginLog[]>([
  {
    time: "2026-09-14 09:02",
    user: "系统管理员",
    ip: "10.8.1.12",
    device: "Chrome 129 · macOS",
    result: "成功",
  },
  {
    time: "2026-09-14 08:55",
    user: "赵倩文（客服）",
    ip: "10.8.4.21",
    device: "Chrome 129 · Windows",
    result: "成功",
  },
  {
    time: "2026-09-14 08:40",
    user: "陈雨薇（运营）",
    ip: "10.8.2.08",
    device: "Safari 18 · macOS",
    result: "成功",
  },
  {
    time: "2026-09-14 03:12",
    user: "admin",
    ip: "203.156.x.x",
    device: "未知",
    result: "失败",
    failReason: "密码错误 5 次，已锁定 30 分钟",
  },
  {
    time: "2026-09-13 19:22",
    user: "刘一帆（运营）",
    ip: "10.8.2.15",
    device: "Chrome 129 · Windows",
    result: "成功",
  },
  {
    time: "2026-09-13 16:48",
    user: "吴倩（财务）",
    ip: "10.8.2.31",
    device: "Edge 129 · Windows",
    result: "成功",
  },
  {
    time: "2026-09-13 14:33",
    user: "孙浩然（客服）",
    ip: "10.8.4.30",
    device: "Chrome 128 · Windows",
    result: "失败",
    failReason: "账号已禁用",
  },
  {
    time: "2026-09-12 20:35",
    user: "郑毅（风控）",
    ip: "10.8.3.77",
    device: "Chrome 129 · macOS",
    result: "成功",
  },
  {
    time: "2026-09-11 10:18",
    user: "方雪（数据分析）",
    ip: "10.8.5.11",
    device: "Safari 18 · macOS",
    result: "成功",
  },
]);

const loginFilter = reactive({
  keyword: "",
  result: "",
  dateRange: [] as string[],
});
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
interface PermLog {
  time: string;
  operator: string;
  targetType: "后台账号" | "C端用户" | "企业" | "白名单";
  target: string;
  changeType: string;
  before: string;
  after: string;
}

const permLogs = ref<PermLog[]>([
  {
    time: "2026-09-14 09:40",
    operator: "系统管理员",
    targetType: "后台账号",
    target: "刘一帆（运营）",
    changeType: "临时授权",
    before: "无",
    after: "白名单管理 · 至 2026-09-30",
  },
  {
    time: "2026-09-13 17:12",
    operator: "系统管理员",
    targetType: "白名单",
    target: "批量开白 36 人",
    changeType: "新增白名单",
    before: "无",
    after: "4K 分辨率 · 至 2026-09-30",
  },
  {
    time: "2026-09-13 15:21",
    operator: "陈雨薇（运营）",
    targetType: "C端用户",
    target: "北城以北（1009）",
    changeType: "会员档位变更",
    before: "标准版",
    after: "专业版",
  },
  {
    time: "2026-09-12 16:02",
    operator: "陈雨薇（运营）",
    targetType: "C端用户",
    target: "夜航星（1001）",
    changeType: "白名单加成",
    before: "无",
    after: "视频生成 2.5",
  },
  {
    time: "2026-09-12 11:08",
    operator: "系统管理员",
    targetType: "后台账号",
    target: "孙浩然（客服）",
    changeType: "禁用账号",
    before: "启用",
    after: "禁用",
  },
  {
    time: "2026-09-11 10:05",
    operator: "系统管理员",
    targetType: "企业",
    target: "成都天府智造（ENT-0006）",
    changeType: "套餐变更",
    before: "标准版",
    after: "专业版",
  },
  {
    time: "2026-09-10 14:29",
    operator: "陈雨薇（运营）",
    targetType: "企业",
    target: "杭州云启智联（ENT-0002）",
    changeType: "配额调整",
    before: "总配额 180,000",
    after: "总配额 200,000",
  },
  {
    time: "2026-09-09 15:33",
    operator: "系统管理员",
    targetType: "后台账号",
    target: "新账号 op_liu",
    changeType: "创建账号并分配角色",
    before: "无",
    after: "角色：运营",
  },
]);

const permFilter = reactive({
  keyword: "",
  targetType: "",
  dateRange: [] as string[],
});
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
            <el-select
              v-model="opFilter.action"
              placeholder="动作"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="a in actionOptions"
                :key="a"
                :label="a"
                :value="a"
              />
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
          </div>
          <el-table :data="filteredOpLogs" stripe style="width: 100%">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="operator" label="操作人" width="140" />
            <el-table-column prop="action" label="动作" width="120">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.action }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="target"
              label="目标对象"
              min-width="220"
              show-overflow-tooltip
            />
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
          </div>
          <el-table :data="filteredLoginLogs" stripe style="width: 100%">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="user" label="登录人" width="150" />
            <el-table-column prop="ip" label="IP" width="130" />
            <el-table-column prop="device" label="设备" min-width="180" />
            <el-table-column label="结果" width="90">
              <template #default="{ row }">
                <el-tag
                  size="small"
                  :type="row.result === '成功' ? 'success' : 'danger'"
                >
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
              <el-option
                v-for="t in targetTypeOptions"
                :key="t"
                :label="t"
                :value="t"
              />
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
          </div>
          <el-table :data="filteredPermLogs" stripe style="width: 100%">
            <el-table-column prop="time" label="时间" width="150" />
            <el-table-column prop="operator" label="操作人" width="130" />
            <el-table-column label="对象类型" width="100">
              <template #default="{ row }">
                <el-tag size="small" effect="plain" type="warning">{{
                  row.targetType
                }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="target"
              label="变更对象"
              min-width="180"
              show-overflow-tooltip
            />
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