<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import {
  enterprises,
  enterpriseStatusText,
  getDeptTree,
  getStaffs,
  getEntRoles,
  type Enterprise,
} from "@/mock/buser";

const plans: Enterprise["plan"][] = [
  "初创版",
  "成长版",
  "专业版",
  "企业定制版",
];
const C_USER_COUNT = 25680; // C 端用户总数（mock，与首页口径一致）

// ===== 统计卡 =====
// 待续费：服务已到期或 30 天内到期（注销企业除外）
const RENEW_WINDOW_DAYS = 30;

function expireState(date: string): "expired" | "soon" | "normal" {
  const diffDays = (new Date(date).getTime() - Date.now()) / 86400000;
  if (diffDays < 0) return "expired";
  if (diffDays <= RENEW_WINDOW_DAYS) return "soon";
  return "normal";
}
// 统计卡数据
const stats = computed(() => [
  {
    label: "企业总数",
    value: enterprises.length,
    icon: "OfficeBuilding",
    hint: "新增企业数 12 家",
    hintType: "success",
  },
  {
    label: "C 端用户数",
    value: C_USER_COUNT,
    icon: "User",
    hint: "新增 12 人",
    hintType: "success",
  },
  {
    label: "待续费企业",
    value: enterprises.filter(
      (e) => e.status !== "cancelled" && expireState(e.planExpire) !== "normal",
    ).length,
    icon: "AlarmClock",
    hint: "已到期或 30 天内到期",
    hintType: "danger",
  },
  {
    label: "冻结企业",
    value: enterprises.filter((e) => e.status === "frozen").length,
    icon: "Lock",
    hint: "需关注",
    hintType: "warning",
  },
]);

// ===== 列表与筛选 =====
const keyword = ref("");
const planFilter = ref("");
const statusFilter = ref("");

const filtered = computed(() =>
  enterprises.filter((item) => {
    const matchKeyword =
      !keyword.value ||
      item.name.includes(keyword.value) ||
      item.code.includes(keyword.value.toUpperCase());
    const matchPlan = !planFilter.value || item.plan === planFilter.value;
    const matchStatus =
      !statusFilter.value || item.status === statusFilter.value;
    return matchKeyword && matchPlan && matchStatus;
  }),
);

function resetSearch() {
  keyword.value = "";
  planFilter.value = "";
  statusFilter.value = "";
}

const statusTag = (status: Enterprise["status"]) =>
  ({
    normal: "success",
    pendingRenew: "danger",
    frozen: "warning",
    cancelled: "info",
  })[status];

const statusText = (status: Enterprise["status"]) =>
  enterpriseStatusText[status];

function remaining(row: Enterprise) {
  return row.pointsTotal - row.pointsUsed;
}

function formatPoints(n: number) {
  return n.toLocaleString();
}

// ===== 企业开通 =====
const createVisible = ref(false);
const createFormRef = ref<FormInstance>();
const createForm = reactive({
  name: "",
  creditCode: "",
  plan: "初创版" as Enterprise["plan"],
  points: 50000,
  signDate: "",
});

const createRules: FormRules<typeof createForm> = {
  name: [
    { required: true, message: "请输入企业名称", trigger: "blur" },
    { min: 2, max: 40, message: "长度 2-40 个字符", trigger: "blur" },
  ],
  creditCode: [
    { required: true, message: "请输入统一社会信用代码", trigger: "blur" },
    {
      pattern: /^[0-9A-HJ-NPQRTUWXY]{18}$/,
      message: "18 位信用代码格式不正确",
      trigger: "blur",
    },
  ],
  plan: [{ required: true, message: "请选择套餐档位", trigger: "change" }],
  points: [{ required: true, message: "请输入初始点数额度", trigger: "blur" }],
  signDate: [{ required: true, message: "请选择签约时间", trigger: "change" }],
};

function plusOneYear(date: string) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function handleCreate() {
  createFormRef.value?.validate((valid) => {
    if (!valid) return;
    enterprises.unshift({
      id: Date.now(),
      code: `ENT-${String(enterprises.length + 1).padStart(4, "0")}`,
      name: createForm.name,
      creditCode: createForm.creditCode,
      plan: createForm.plan,
      pointsTotal: createForm.points,
      pointsUsed: 0,
      planStart: createForm.signDate,
      planExpire: plusOneYear(createForm.signDate),
      status: "normal",
      adminName: "",
      memberCount: 0,
      createdAt: createForm.signDate,
    });
    createVisible.value = false;
    ElMessage.success("企业租户已开通，请指定企业管理员");
  });
}

// ===== 详情抽屉（收编部门 / 员工 / 角色只读数据） =====
const detailVisible = ref(false);
const currentEnt = ref<Enterprise | null>(null);

const deptTree = computed(() =>
  currentEnt.value ? getDeptTree(currentEnt.value.id) : [],
);
const staffs = computed(() =>
  currentEnt.value ? getStaffs(currentEnt.value.id) : [],
);
const entRoles = computed(() =>
  currentEnt.value ? getEntRoles(currentEnt.value.id) : [],
);

const staffStatusText: Record<string, string> = {
  active: "在职",
  disabled: "已停用",
};

function openDetail(row: Enterprise) {
  currentEnt.value = row;
  detailVisible.value = true;
}

// ===== 套餐管理（升级 / 降级 / 续期） =====
const planVisible = ref(false);
const planForm = reactive({
  action: "upgrade" as "upgrade" | "downgrade" | "renew",
  plan: "初创版" as Enterprise["plan"],
  expireAt: "",
});

function openPlan(row: Enterprise, action: "upgrade" | "downgrade" | "renew") {
  currentEnt.value = row;
  Object.assign(planForm, {
    action,
    plan: row.plan,
    expireAt: action === "renew" ? "" : row.planExpire,
  });
  planVisible.value = true;
}

const planActionText = { upgrade: "升级", downgrade: "降级", renew: "续期" };

function handlePlan() {
  if (!currentEnt.value) return;
  if (planForm.action === "renew") {
    if (!planForm.expireAt) {
      ElMessage.warning("请选择续期到期时间");
      return;
    }
    currentEnt.value.planExpire = planForm.expireAt;
  } else {
    currentEnt.value.plan = planForm.plan;
  }
  ElMessage.success(
    `已${planActionText[planForm.action]}「${currentEnt.value.name}」套餐，已写入审计日志`,
  );
  planVisible.value = false;
}

// ===== 配额管理（操作列「配额」+ 兜底强改） =====
const pointsVisible = ref(false);
const pointsForm = reactive({
  amount: 0,
  action: "add" as "add" | "adjust",
  remark: "",
});

const pointsLogs = ref([
  {
    time: "2026-09-10 14:22",
    type: "加购",
    amount: 100000,
    balance: 500000,
    operator: "财务-吴倩",
  },
  {
    time: "2026-08-15 09:40",
    type: "消耗",
    amount: -12450,
    balance: 400000,
    operator: "系统",
  },
  {
    time: "2026-07-02 16:18",
    type: "调整",
    amount: 20000,
    balance: 412450,
    operator: "系统管理员",
  },
  {
    time: "2026-06-11 11:05",
    type: "消耗",
    amount: -8320,
    balance: 392450,
    operator: "系统",
  },
]);

function openPoints(row: Enterprise) {
  currentEnt.value = row;
  Object.assign(pointsForm, { amount: 0, action: "add", remark: "" });
  pointsVisible.value = true;
}

function handlePoints() {
  const ent = currentEnt.value;
  if (!ent) return;
  if (pointsForm.amount <= 0) {
    ElMessage.warning(
      pointsForm.action === "add" ? "加购点数需大于 0" : "请输入调整后的总额度",
    );
    return;
  }
  const before = ent.pointsTotal;
  ent.pointsTotal =
    pointsForm.action === "add"
      ? ent.pointsTotal + pointsForm.amount
      : pointsForm.amount;
  const delta = ent.pointsTotal - before;
  pointsLogs.value.unshift({
    time: "2026-09-14 10:30",
    type: pointsForm.action === "add" ? "加购" : "调整",
    amount: delta,
    balance: ent.pointsTotal - ent.pointsUsed,
    operator: "系统管理员",
  });
  ElMessage.success(
    pointsForm.action === "add"
      ? "点数已加购，已写入审计日志"
      : "总配额已调整，已写入审计日志",
  );
  pointsVisible.value = false;
}

// ===== 状态：冻结 / 解冻 / 注销 =====
function handleStatus(
  row: Enterprise,
  action: "freeze" | "unfreeze" | "cancel",
) {
  const textMap = {
    freeze: {
      title: "冻结企业",
      tip: `冻结后「${row.name}」全员不可用，是否继续？`,
      type: "warning" as const,
    },
    unfreeze: {
      title: "解冻企业",
      tip: `解冻后「${row.name}」全员恢复可用，是否继续？`,
      type: "info" as const,
    },
    cancel: {
      title: "注销企业",
      tip: `注销后「${row.name}」数据保留 90 天，操作不可逆，是否继续？`,
      type: "error" as const,
    },
  };
  const conf = textMap[action];
  ElMessageBox.confirm(conf.tip, conf.title, {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: conf.type,
  }).then(() => {
    row.status = (
      { freeze: "frozen", unfreeze: "normal", cancel: "cancelled" } as const
    )[action];
    ElMessage.success(`已${conf.title}，已写入审计日志`);
  });
}

// ===== 兜底操作（二次确认 + 审计留痕提示） =====
function handleFallback(
  row: Enterprise,
  action: "resetAdmin" | "forcePoints" | "freezeEnt",
) {
  if (action === "resetAdmin") {
    ElMessageBox.prompt(
      "输入新的企业管理员账号（用于管理员失联/离职场景）",
      "兜底 · 重置企业管理员",
      {
        confirmButtonText: "确认重置",
        cancelButtonText: "取消",
        inputPattern: /^[a-zA-Z0-9_]{3,20}$/,
        inputErrorMessage: "账号格式：3-20 位字母/数字/下划线",
        type: "warning",
      },
    ).then(({ value }) => {
      row.adminName = value;
      ElMessage.success("企业管理员已重置，操作已写入审计日志");
    });
  } else if (action === "freezeEnt") {
    const isFrozen = row.status === "frozen";
    ElMessageBox.confirm(
      isFrozen
        ? `确认解冻企业「${row.name}」吗？解冻后企业将恢复正常使用。`
        : `确认冻结企业「${row.name}」吗？冻结后企业所有成员将无法登录和使用服务。`,
      isFrozen ? "兜底 · 解冻企业" : "兜底 · 冻结企业",
      {
        confirmButtonText: isFrozen ? "确认解冻" : "确认冻结",
        cancelButtonText: "取消",
        type: "warning",
      },
    ).then(() => {
      row.status = isFrozen ? "normal" : "frozen";
      ElMessage.success(
        isFrozen
          ? "企业已解冻，操作已写入审计日志"
          : "企业已冻结，操作已写入审计日志",
      );
    });
  } else {
    openPoints(row);
  }
}
</script>

<template>
  <div class="page-container">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="stat-row">
      <el-col v-for="stat in stats" :key="stat.label" :xs="12" :sm="12" :md="6">
        <div class="card-panel stat-card">
          <div class="stat-icon">
            <el-icon :size="22"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-meta">
            <div class="stat-value">{{ stat.value.toLocaleString() }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" :class="`hint-${stat.hintType}`">
              {{ stat.hint }}
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 企业列表 -->
    <div class="card-panel list-panel">
      <div class="filter-bar">
        <div class="filter-left">
          <el-input
            v-model="keyword"
            placeholder="搜索企业名称 / 企业ID"
            clearable
            style="width: 240px"
            :prefix-icon="'Search'"
          />
          <el-select
            v-model="planFilter"
            placeholder="套餐类型"
            clearable
            style="width: 140px"
          >
            <el-option v-for="p in plans" :key="p" :label="p" :value="p" />
          </el-select>
          <el-select
            v-model="statusFilter"
            placeholder="状态"
            clearable
            style="width: 110px"
          >
            <el-option label="正常" value="normal" />
            <el-option label="待续费" value="pendingRenew" />
            <el-option label="冻结" value="frozen" />
            <el-option label="注销" value="cancelled" />
          </el-select>
          <el-button :icon="'RefreshLeft'" @click="resetSearch">重置</el-button>
        </div>
        <div class="filter-right">
          <el-button type="primary" :icon="'Plus'" @click="createVisible = true"
            >开通企业</el-button
          >
        </div>
      </div>

      <el-table :data="filtered" stripe style="width: 100%">
        <el-table-column label="企业名称">
          <template #default="{ row }" align="center">
            <div class="ent-name-cell">
              <el-link type="primary" @click="openDetail(row)">{{
                row.name
              }}</el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="plan" label="套餐" align="center">
          <template #default="{ row }">
            <el-tag
              :type="
                row.plan === '企业定制版'
                  ? 'danger'
                  : row.plan === '专业版'
                    ? 'primary'
                    : row.plan === '成长版'
                      ? 'warning'
                      : 'info'
              "
              effect="plain"
            >
              {{ row.plan }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="点数总配额" align="center">
          <template #default="{ row }">
            {{ formatPoints(row.pointsTotal) }}
          </template>
        </el-table-column>
        <el-table-column label="剩余点数">
          <template #default="{ row }">
            <span
              :class="{ 'points-low': remaining(row) / row.pointsTotal < 0.1 }"
            >
              {{ formatPoints(remaining(row)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="memberCount" label="成员数" align="center" />
        <el-table-column label="服务到期" align="center">
          <template #default="{ row }">
            <span :class="`expire-${expireState(row.planExpire)}`">
              {{ row.planExpire }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" effect="light">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)"
              >详情</el-button
            >
            <el-button link type="primary" size="small" @click="openPoints(row)"
              >配额</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="filtered.length"
        />
      </div>
    </div>

    <!-- 企业开通弹窗 -->
    <el-dialog
      v-model="createVisible"
      title="开通企业租户"
      width="540px"
      destroy-on-close
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createRules"
        label-width="110px"
      >
        <el-form-item label="企业名称" prop="name">
          <el-input v-model="createForm.name" placeholder="请输入企业全称" />
        </el-form-item>
        <el-form-item label="统一信用代码" prop="creditCode">
          <el-input
            v-model="createForm.creditCode"
            placeholder="18 位统一社会信用代码"
            maxlength="18"
          />
        </el-form-item>
        <el-form-item label="套餐档位" prop="plan">
          <el-radio-group v-model="createForm.plan">
            <el-radio-button v-for="p in plans" :key="p" :value="p">{{
              p
            }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="初始点数额度" prop="points">
          <el-input-number
            v-model="createForm.points"
            :min="1000"
            :step="10000"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="签约时间" prop="signDate">
          <el-date-picker
            v-model="createForm.signDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择签约时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">开通</el-button>
      </template>
    </el-dialog>

    <!-- 企业详情抽屉 -->
    <el-drawer v-model="detailVisible" :title="currentEnt?.name" size="640px">
      <template v-if="currentEnt">
        <el-tabs>
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息">
            <el-descriptions
              :column="2"
              border
              size="small"
              class="detail-desc"
            >
              <el-descriptions-item label="企业ID">{{
                currentEnt.code
              }}</el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="statusTag(currentEnt.status)" size="small">{{
                  enterpriseStatusText[currentEnt.status]
                }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="统一信用代码" :span="2">{{
                currentEnt.creditCode
              }}</el-descriptions-item>
              <el-descriptions-item label="套餐档位">{{
                currentEnt.plan
              }}</el-descriptions-item>
              <el-descriptions-item
                :class="`expire-${expireState(currentEnt.planExpire)}`"
                label="服务到期"
              >
                {{ currentEnt.planExpire }}
              </el-descriptions-item>
              <el-descriptions-item label="成员总数"
                >{{ currentEnt.memberCount }} 人</el-descriptions-item
              >
              <el-descriptions-item label="企业管理员">
                {{ currentEnt.adminName || "未指定（需兜底处理）" }}
              </el-descriptions-item>
              <el-descriptions-item label="点数总配额">
                {{ formatPoints(currentEnt.pointsTotal) }}
              </el-descriptions-item>
              <el-descriptions-item label="剩余点数">
                {{
                  formatPoints(remaining(currentEnt))
                }}（积分可用时间统一为服务到期时间，续费自动转结）
              </el-descriptions-item>
            </el-descriptions>

            <div class="detail-actions">
              <el-button size="small" @click="openPlan(currentEnt, 'upgrade')"
                >升级套餐</el-button
              >
              <el-button size="small" @click="openPlan(currentEnt, 'downgrade')"
                >降级套餐</el-button
              >
              <el-button size="small" @click="openPlan(currentEnt, 'renew')"
                >续期</el-button
              >
              <el-button
                :type="currentEnt.status === 'normal' ? 'warning' : 'success'"
                size="small"
                @click="
                  handleStatus(
                    currentEnt,
                    currentEnt.status === 'normal' ? 'freeze' : 'unfreeze',
                  )
                "
              >
                {{ currentEnt.status === "normal" ? "冻结" : "解冻" }}
              </el-button>
              <el-button
                v-if="currentEnt.status !== 'cancelled'"
                type="danger"
                size="small"
                plain
                @click="handleStatus(currentEnt, 'cancel')"
                >注销</el-button
              >
            </div>

            <div class="fallback-box">
              <h4>
                <el-icon color="#d97706"><Warning /></el-icon>
                兜底协助（仅异常场景）
              </h4>
              <p class="fallback-tip">
                以下操作仅用于管理员失联、安全风险、对账异常等特殊情况，全程留痕审计。
              </p>
              <div class="fallback-actions">
                <el-button
                  size="small"
                  @click="handleFallback(currentEnt, 'resetAdmin')"
                  >重置企业管理员</el-button
                >
                <el-button
                  size="small"
                  @click="handleFallback(currentEnt, 'forcePoints')"
                  >强制调整配额</el-button
                >
                <el-button
                  size="small"
                  type="warning"
                  @click="handleFallback(currentEnt, 'freezeEnt')"
                  >{{
                    currentEnt.status === "frozen" ? "解冻企业" : "冻结企业"
                  }}</el-button
                >
              </div>
            </div>
          </el-tab-pane>

          <!-- 组织与成员（只读） -->
          <el-tab-pane label="组织与成员">
            <el-alert
              type="info"
              :closable="false"
              show-icon
              title="企业内部组织由企业管理员自助维护，平台后台仅提供只读查看与对账能力"
              class="readonly-alert"
            />
            <div class="detail-section">
              <h4>组织架构</h4>
              <el-tree
                :data="deptTree"
                default-expand-all
                :expand-on-click-node="false"
              >
                <template #default="{ data }">
                  <span class="tree-node">
                    {{ data.label }}
                    <span class="tree-count">{{ data.memberCount }} 人</span>
                  </span>
                </template>
              </el-tree>
            </div>
            <div class="detail-section">
              <h4>员工列表</h4>
              <el-table :data="staffs" size="small" border>
                <el-table-column prop="name" label="姓名" width="80" />
                <el-table-column prop="account" label="账号" width="110" />
                <el-table-column
                  prop="dept"
                  label="部门"
                  min-width="150"
                  show-overflow-tooltip
                />
                <el-table-column label="角色" min-width="110">
                  <template #default="{ row }">
                    <el-tag
                      v-for="r in row.roles"
                      :key="r"
                      size="small"
                      effect="plain"
                      class="role-tag"
                      >{{ r }}</el-tag
                    >
                  </template>
                </el-table-column>
                <el-table-column label="点数配额" width="100" align="right">
                  <template #default="{ row }">
                    {{ formatPoints(row.pointsQuota) }}
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="70">
                  <template #default="{ row }">
                    <el-tag
                      :type="row.status === 'active' ? 'success' : 'info'"
                      size="small"
                    >
                      {{ staffStatusText[row.status] }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 企业角色（只读） -->
          <el-tab-pane label="企业角色">
            <el-alert
              type="info"
              :closable="false"
              show-icon
              title="角色定义由企业管理员维护，平台后台只读"
              class="readonly-alert"
            />
            <el-table :data="entRoles" size="small" border>
              <el-table-column prop="name" label="角色名" width="110">
                <template #default="{ row }">
                  {{ row.name }}
                  <el-tag
                    size="small"
                    :type="row.builtIn ? 'warning' : 'info'"
                    effect="plain"
                    >{{ row.builtIn ? "内置" : "自定义" }}</el-tag
                  >
                </template>
              </el-table-column>
              <el-table-column label="权限点" min-width="220">
                <template #default="{ row }">
                  <el-tag
                    v-for="p in row.permissions"
                    :key="p"
                    size="small"
                    effect="plain"
                    class="role-tag"
                    >{{ p }}</el-tag
                  >
                </template>
              </el-table-column>
              <el-table-column
                prop="memberCount"
                label="成员数"
                width="70"
                align="right"
              />
              <el-table-column
                prop="description"
                label="说明"
                min-width="140"
                show-overflow-tooltip
              />
            </el-table>
          </el-tab-pane>

          <!-- 额度流水 -->
          <el-tab-pane label="额度流水">
            <el-table :data="pointsLogs" size="small" border>
              <el-table-column prop="time" label="时间" width="140" />
              <el-table-column prop="type" label="类型" width="70" />
              <el-table-column label="变动" width="100" align="right">
                <template #default="{ row }">
                  <span
                    :class="row.amount > 0 ? 'amount-plus' : 'amount-minus'"
                  >
                    {{ row.amount > 0 ? "+" : ""
                    }}{{ formatPoints(row.amount) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="变动后余额" width="110" align="right">
                <template #default="{ row }">
                  {{ formatPoints(row.balance) }}
                </template>
              </el-table-column>
              <el-table-column prop="operator" label="操作方" width="100" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-drawer>

    <!-- 套餐管理弹窗 -->
    <el-dialog
      v-model="planVisible"
      :title="`套餐管理 · ${planActionText[planForm.action]}`"
      width="440px"
      destroy-on-close
      append-to-body
    >
      <el-form :model="planForm" label-width="100px">
        <el-form-item label="操作类型">
          <el-radio-group v-model="planForm.action" disabled>
            <el-radio value="upgrade">升级</el-radio>
            <el-radio value="downgrade">降级</el-radio>
            <el-radio value="renew">续期</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="planForm.action !== 'renew'" label="目标套餐">
          <el-radio-group v-model="planForm.plan">
            <el-radio-button v-for="p in plans" :key="p" :value="p">{{
              p
            }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-else label="续期至">
          <el-date-picker
            v-model="planForm.expireAt"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择新的到期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-alert
          v-if="planForm.action === 'renew'"
          type="info"
          :closable="false"
          show-icon
          title="续费时剩余点数将自动转结至下一服务期"
        />
      </el-form>
      <template #footer>
        <el-button @click="planVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePlan">确定</el-button>
      </template>
    </el-dialog>

    <!-- 点数配额弹窗 -->
    <el-dialog
      v-model="pointsVisible"
      title="点数配额管理"
      width="480px"
      destroy-on-close
      append-to-body
    >
      <template v-if="currentEnt">
        <el-descriptions :column="3" border size="small" class="detail-desc">
          <el-descriptions-item label="当前余额">{{
            formatPoints(remaining(currentEnt))
          }}</el-descriptions-item>
          <el-descriptions-item label="总配额">{{
            formatPoints(currentEnt.pointsTotal)
          }}</el-descriptions-item>
          <el-descriptions-item label="已使用">{{
            formatPoints(currentEnt.pointsUsed)
          }}</el-descriptions-item>
        </el-descriptions>
        <el-form :model="pointsForm" label-width="100px" class="points-form">
          <el-form-item label="操作">
            <el-radio-group v-model="pointsForm.action">
              <el-radio value="add">加购点数</el-radio>
              <el-radio value="adjust">调整总额度</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            :label="pointsForm.action === 'add' ? '加购数量' : '调整后总额'"
          >
            <el-input-number
              v-model="pointsForm.amount"
              :min="0"
              :step="10000"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="pointsForm.remark"
              type="textarea"
              :rows="2"
              placeholder="调整原因（写入审计日志）"
            />
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="pointsVisible = false">取消</el-button>
        <el-button type="primary" @click="handlePoints">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.stat-row {
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(0, 96, 166, 0.12);
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: $primary-soft-bg;
    color: $primary;
    flex-shrink: 0;
  }

  .stat-value {
    font-size: 22px;
    font-weight: 700;
    color: $text-main;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 13px;
    color: $text-secondary;
    margin: 2px 0 4px;
  }

  .stat-trend {
    font-size: 12px;
    color: $text-secondary;

    &.hint-success {
      color: $success;
    }

    &.hint-danger {
      color: $danger;
    }

    &.hint-warning {
      color: $warning;
    }
  }
}

.list-panel {
  margin-top: 0;
}

.points-low {
  color: $danger;
  font-weight: 600;
}

.expire-expired {
  color: $danger;
}

.expire-soon {
  color: $warning;
}

.expire-tag {
  margin-left: 6px;
}

.role-tag {
  margin: 1px 4px 1px 0;
}

.readonly-alert {
  margin-bottom: 14px;
}

.detail-desc {
  margin-bottom: 16px;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0;
  margin-bottom: 16px;
}

.detail-section {
  margin-bottom: 18px;

  h4 {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    color: $text-main;
  }
}

.tree-node {
  .tree-count {
    margin-left: 8px;
    font-size: 12px;
    color: $text-secondary;
  }
}

.amount-plus {
  color: $success;
}
.amount-minus {
  color: $danger;
}

.fallback-box {
  padding: 12px;
  border: 1px dashed mix(#fff, $warning, 70%);
  border-radius: 6px;
  background: mix(#fff, $warning, 96%);

  h4 {
    display: flex;
    align-items: center;
    gap: 6px;
    color: $warning;
    font-size: 14px;
    font-weight: 600;
  }

  .fallback-tip {
    font-size: 12px;
    color: $text-secondary;
    margin: 6px 0 10px;
  }
}

.points-form {
  margin-top: 16px;
}
</style>
