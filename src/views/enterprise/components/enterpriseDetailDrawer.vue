<!-- 详情 -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { enterpriseStatusText, type Enterprise } from "@/mock/buser";
import planManageDialog from "./planManageDialog.vue";
import pointsQuotaDialog from "./pointsQuotaDialog.vue";
import {
  getEnterpriseDetail,
  getDeptTreeApi,
  getStaffsApi,
  getEntRolesApi,
  getPointsLogs,
  freezeEnterprise,
  unfreezeEnterprise,
  cancelEnterprise,
  resetAdmin,
} from "@/api/enterprise";
type Plan = Enterprise["plan"];

const props = defineProps<{
  visible: boolean;
  currentEnt: Enterprise | null;
  plans: Plan[];
}>();

const emit = defineEmits<{
  "update:visible": [val: boolean];
}>();

const RENEW_WINDOW_DAYS = 30; // 企业配额过期时间窗口（天）

const detailData = ref<Enterprise | null>(null); // 企业详情
const deptTree = ref<import("@/api/enterprise").DeptNode[]>([]); // 部门树
const staffs = ref<import("@/api/enterprise").EntStaff[]>([]); // 员工列表
const entRoles = ref<import("@/api/enterprise").EntRole[]>([]); // 角色列表
const pointsLogs = ref<import("@/api/enterprise").PointsLog[]>([]); // 企业配额日志

const loadDetail = async (entId: number) => {
  const [detail, tree, staffList, roleList, logs] = await Promise.all([
    getEnterpriseDetail(entId), // 企业详情
    getDeptTreeApi(entId), // 部门树
    getStaffsApi(entId), // 员工列表
    getEntRolesApi(entId), // 角色列表
    getPointsLogs(entId), // 企业配额日志
  ]);
  detailData.value = detail ?? null; // 企业详情
  deptTree.value = tree ?? []; // 部门树
  staffs.value = staffList ?? []; // 员工列表
  entRoles.value = roleList ?? []; // 角色列表
  pointsLogs.value = logs ?? []; // 企业配额日志
};

watch(
  () => props.visible,
  (val) => {
    if (val && props.currentEnt) {
      loadDetail(props.currentEnt.id);
    } else {
      detailData.value = null;
      deptTree.value = [];
      staffs.value = [];
      entRoles.value = [];
      pointsLogs.value = [];
    }
  },
);

const expireState = (date: string): "expired" | "soon" | "normal" => {
  const diffDays = (new Date(date).getTime() - Date.now()) / 86400000;
  if (diffDays < 0) return "expired";
  if (diffDays <= RENEW_WINDOW_DAYS) return "soon";
  return "normal";
};

const statusTag = (status: Enterprise["status"]) =>
  ({ normal: "success", pendingRenew: "danger", frozen: "warning", cancelled: "info" })[status];

const staffStatusText: Record<string, string> = { active: "在职", disabled: "已停用" };

const planVisible = ref(false);
const planRef = ref<InstanceType<typeof planManageDialog> | null>(null);
const pointsVisible = ref(false);

const openPlan = (action: "upgrade" | "downgrade" | "renew") => {
  planVisible.value = true;
  planRef.value?.openWith(action);
};

const handleStatus = (action: "freeze" | "unfreeze" | "cancel") => {
  const row = detailData.value;
  if (!row) return;
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
  }).then(async () => {
    const apiFn = {
      freeze: freezeEnterprise,
      unfreeze: unfreezeEnterprise,
      cancel: cancelEnterprise,
    }[action];
    const result = await apiFn(row.id);
    if (result) detailData.value = result;
    ElMessage.success(`已${conf.title}，已写入审计日志`);
  });
};

const handleFallback = (action: "resetAdmin" | "forcePoints" | "freezeEnt") => {
  const row = detailData.value;
  if (!row) return;
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
    ).then(async ({ value }) => {
      const result = await resetAdmin(row.id, value);
      if (result) detailData.value = result;
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
    ).then(async () => {
      const apiFn = isFrozen ? unfreezeEnterprise : freezeEnterprise;
      const result = await apiFn(row.id);
      if (result) detailData.value = result;
      ElMessage.success(
        isFrozen ? "企业已解冻，操作已写入审计日志" : "企业已冻结，操作已写入审计日志",
      );
    });
  } else {
    pointsVisible.value = true;
  }
};

const formatPoints = (n: number) => {
  return n.toLocaleString();
};
const remaining = (ent: Enterprise) => {
  return ent.pointsTotal - ent.pointsUsed;
};
const onPlanSaved = (data: Enterprise) => {
  detailData.value = data;
};
const onPointsSaved = (data: Enterprise) => {
  detailData.value = data;
};
</script>

<template>
  <el-drawer
    :model-value="visible"
    :title="detailData?.name"
    size="60%"
    @update:model-value="emit('update:visible', $event)"
  >
    <template v-if="detailData">
      <el-tabs>
        <el-tab-pane label="基本信息">
          <el-descriptions :column="2" border size="small" class="detail-desc">
            <el-descriptions-item label="企业ID">{{ detailData.code }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusTag(detailData.status)" size="small">
                {{ enterpriseStatusText[detailData.status] }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="统一信用代码" :span="2">
              {{ detailData.creditCode }}
            </el-descriptions-item>
            <el-descriptions-item label="套餐档位">{{ detailData.plan }}</el-descriptions-item>
            <el-descriptions-item
              :class="`expire-${expireState(detailData.planExpire)}`"
              label="服务到期"
            >
              {{ detailData.planExpire }}
            </el-descriptions-item>
            <el-descriptions-item label="成员总数">
              {{ detailData.memberCount }} 人
            </el-descriptions-item>
            <el-descriptions-item label="企业管理员">
              {{ detailData.adminName || "未指定（需兜底处理）" }}
            </el-descriptions-item>
            <el-descriptions-item label="点数总配额">
              {{ formatPoints(detailData.pointsTotal) }}
            </el-descriptions-item>
            <el-descriptions-item label="剩余点数">
              {{
                formatPoints(remaining(detailData))
              }}（积分可用时间统一为服务到期时间，续费自动转结）
            </el-descriptions-item>
          </el-descriptions>
          <div class="detail-actions">
            <el-button size="small" @click="openPlan('upgrade')">升级套餐</el-button>
            <el-button size="small" @click="openPlan('downgrade')">降级套餐</el-button>
            <el-button size="small" @click="openPlan('renew')">续期</el-button>
            <el-button
              :type="detailData.status === 'normal' ? 'warning' : 'success'"
              size="small"
              @click="handleStatus(detailData.status === 'normal' ? 'freeze' : 'unfreeze')"
            >
              {{ detailData.status === "normal" ? "冻结" : "解冻" }}
            </el-button>
            <el-button
              v-if="detailData.status !== 'cancelled'"
              type="danger"
              size="small"
              plain
              @click="handleStatus('cancel')"
            >
              注销
            </el-button>
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
              <el-button size="small" @click="handleFallback('resetAdmin')">
                重置企业管理员
              </el-button>
              <el-button size="small" @click="handleFallback('forcePoints')">
                强制调整配额
              </el-button>
              <el-button size="small" type="warning" @click="handleFallback('freezeEnt')">
                {{ detailData.status === "frozen" ? "解冻企业" : "冻结企业" }}
              </el-button>
            </div>
          </div>
        </el-tab-pane>

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
            <el-tree :data="deptTree" default-expand-all :expand-on-click-node="false">
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
              <el-table-column prop="dept" label="部门" min-width="150" show-overflow-tooltip />
              <el-table-column label="角色" min-width="110">
                <template #default="{ row }">
                  <el-tag
                    v-for="r in row.roles"
                    :key="r"
                    size="small"
                    effect="plain"
                    class="role-tag"
                  >
                    {{ r }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="点数配额" width="100" align="right">
                <template #default="{ row }">{{ formatPoints(row.pointsQuota) }}</template>
              </el-table-column>
              <el-table-column label="状态" width="70">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">
                    {{ staffStatusText[row.status] }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

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
                <el-tag size="small" :type="row.builtIn ? 'warning' : 'info'" effect="plain">
                  {{ row.builtIn ? "内置" : "自定义" }}
                </el-tag>
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
                >
                  {{ p }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="memberCount" label="成员数" width="70" align="right" />
            <el-table-column
              prop="description"
              label="说明"
              min-width="140"
              show-overflow-tooltip
            />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="额度流水">
          <el-table :data="pointsLogs" size="small" border>
            <el-table-column prop="time" label="时间" />
            <el-table-column prop="type" label="类型" />
            <el-table-column label="变动" width="100" align="right">
              <template #default="{ row }">
                <span :class="row.amount > 0 ? 'amount-plus' : 'amount-minus'">
                  {{ row.amount > 0 ? "+" : "" }}{{ formatPoints(row.amount) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="变动后余额" align="right">
              <template #default="{ row }">{{ formatPoints(row.balance) }}</template>
            </el-table-column>
            <el-table-column prop="operator" label="操作方" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </template>
    <!-- 计划管理弹窗 -->
    <planManageDialog
      ref="planRef"
      v-model:visible="planVisible"
      :current-ent="detailData"
      :plans="plans"
      @saved="onPlanSaved"
    />
    <!-- 点数配额弹窗 -->
    <pointsQuotaDialog
      v-model:visible="pointsVisible"
      :current-ent="detailData"
      @saved="onPointsSaved"
    />
  </el-drawer>
</template>

<style lang="scss" scoped>
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
.role-tag {
  margin: 1px 4px 1px 0;
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
.expire-expired {
  color: $danger;
}
.expire-soon {
  color: $warning;
}
</style>
