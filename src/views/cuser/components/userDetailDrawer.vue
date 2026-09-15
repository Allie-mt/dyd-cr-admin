<!-- 用户详情抽屉 -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import pointsActionDialog from "./pointsActionDialog.vue";
import restrictFuncDialog from "./restrictFuncDialog.vue";
import {
  getCUserDetail,
  adjustLevel,
  banUser,
  unbanUser,
  freezeUser,
  unfreezeUser,
  warnUser,
  restrictFuncs as restrictFuncsApi,
  getPointsLogs,
  getGenLogs,
  getDevices,
  kickDevice as kickDeviceApi,
  getWhitelists,
  type CUser,
  type Level,
  type CStatus,
  type PointsAction,
  type CUserPointsLog,
  type CUserGenLog,
  type CUserDevice,
  type CUserWhitelist,
} from "@/api/cuser";

const props = defineProps<{ visible: boolean; currentUser: CUser | null }>();
const emit = defineEmits<{ "update:visible": [val: boolean]; changed: [] }>();

const router = useRouter();
const levels: Level[] = ["免费版", "基础版", "标准版", "高级版"];
const activeTab = ref("base");

const statusText: Record<CStatus, string> = { normal: "正常", frozen: "冻结", banned: "封禁" };
const statusTag: Record<CStatus, "success" | "warning" | "danger"> = {
  normal: "success",
  frozen: "warning",
  banned: "danger",
};
const levelTag: Record<Level, "info" | "primary" | "warning" | "danger"> = {
  免费版: "info",
  基础版: "primary",
  标准版: "warning",
  高级版: "danger",
};

const detailData = ref<CUser | null>(null);
const pointsLogs = ref<CUserPointsLog[]>([]);
const genLogs = ref<CUserGenLog[]>([]);
const devices = ref<CUserDevice[]>([]);
const userWhitelists = ref<CUserWhitelist[]>([]);

const loadDetail = async (userId: number) => {
  const [detail, logs, gens, devs, wl] = await Promise.all([
    getCUserDetail(userId),
    getPointsLogs(userId),
    getGenLogs(userId),
    getDevices(userId),
    getWhitelists(userId),
  ]);
  detailData.value = detail ?? null;
  pointsLogs.value = logs;
  genLogs.value = gens;
  devices.value = devs;
  userWhitelists.value = wl;
};

watch(
  () => props.visible,
  (val) => {
    if (val && props.currentUser) {
      loadDetail(props.currentUser.id);
    } else {
      detailData.value = null;
      pointsLogs.value = [];
      genLogs.value = [];
      devices.value = [];
      userWhitelists.value = [];
    }
  },
);

const levelDraft = ref<Level>("免费版");
function openLevelTab() {
  if (detailData.value) levelDraft.value = detailData.value.level;
}
function applyLevel() {
  const user = detailData.value;
  if (!user) return;
  if (levelDraft.value === user.level) {
    ElMessage.info("档位未变化");
    return;
  }
  ElMessageBox.confirm(
    `确认将「${user.nickname}」档位由 ${user.level} 调整为 ${levelDraft.value} 吗？该操作将写入审计日志`,
    "档位调整",
    { confirmButtonText: "确认调整", cancelButtonText: "取消", type: "warning" },
  ).then(async () => {
    const result = await adjustLevel(user.id, levelDraft.value);
    if (result) detailData.value = result;
    ElMessage.success(`档位已调整为 ${levelDraft.value}，已写入审计日志`);
    emit("changed");
  });
}

const pointsDialog = ref(false);
const pointsType = ref<PointsAction>("gift");
function openPointsDialog(type: PointsAction) {
  pointsType.value = type;
  pointsDialog.value = true;
}

function onPointsSubmitted() {
  if (!detailData.value) return;
  loadDetail(detailData.value.id);
  emit("changed");
}

function handleWarn() {
  const user = detailData.value;
  if (!user) return;
  ElMessageBox.prompt("请输入警告内容，将站内信通知用户", "发出警告", {
    confirmButtonText: "发出警告",
    cancelButtonText: "取消",
    inputPlaceholder: "警告内容",
  }).then(async ({ value }) => {
    if (!value) return;
    await warnUser(user.id, value);
    ElMessage.success(`已向「${user.nickname}」发出警告，已写入审计日志`);
  });
}

const restrictVisible = ref(false);
function handleRestrict() {
  restrictVisible.value = true;
}
function onRestrictSubmitted(funcs: string[]) {
  const user = detailData.value;
  if (!user) return;
  restrictFuncsApi(user.id, funcs).then(() => {
    ElMessage.success(`已限制功能：${funcs.join("、")}，已写入审计日志`);
  });
}

function handleBan() {
  const user = detailData.value;
  if (!user) return;
  ElMessageBox.prompt("封禁需记录原因，将写入审计日志", "封禁账号", {
    confirmButtonText: "确认封禁",
    cancelButtonText: "取消",
    inputPlaceholder: "封禁原因",
    type: "warning",
    inputValidator: (v: string) => !!v || "必须填写封禁原因",
  }).then(async ({ value }) => {
    const result = await banUser(user.id, value);
    if (result) detailData.value = result;
    ElMessage.success(`已封禁「${user.nickname}」，原因已记录`);
    emit("changed");
  });
}

function handleUnban() {
  const user = detailData.value;
  if (!user) return;
  ElMessageBox.confirm(`确认解封用户「${user.nickname}」吗？`, "解封账号", {
    confirmButtonText: "确认解封",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    const result = await unbanUser(user.id);
    if (result) detailData.value = result;
    ElMessage.success("已解封，已写入审计日志");
    emit("changed");
  });
}

function handleFreeze(frozen: boolean) {
  const user = detailData.value;
  if (!user) return;
  const action = frozen ? "冻结" : "解冻";
  ElMessageBox.confirm(`确认${action}用户「${user.nickname}」的账号吗？`, `${action}账号`, {
    confirmButtonText: `确认${action}`,
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    const apiFn = frozen ? freezeUser : unfreezeUser;
    const result = await apiFn(user.id);
    if (result) detailData.value = result;
    ElMessage.success(`已${action}，已写入审计日志`);
    emit("changed");
  });
}

function kickDevice(device: CUserDevice) {
  const user = detailData.value;
  if (!user) return;
  ElMessageBox.confirm(`确认将设备「${device.name}」强制下线吗？`, "踢下线", {
    confirmButtonText: "强制下线",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    await kickDeviceApi(user.id, device.id);
    devices.value = devices.value.filter((d) => d.id !== device.id);
    ElMessage.success("该设备已强制下线，已写入审计日志");
  });
}

const whitelistTypeTag: Record<string, "success" | "warning" | "danger"> = {
  功能: "success",
  模型: "warning",
  规格: "danger",
};
</script>

<template>
  <el-drawer
    :model-value="visible"
    title="用户详情"
    size="720px"
    @update:model-value="emit('update:visible', $event)"
  >
    <template v-if="detailData">
      <div class="profile-header">
        <el-avatar :size="56" class="profile-avatar">
          {{ detailData.nickname.charAt(0) }}
        </el-avatar>
        <div class="profile-name">
          <h3>{{ detailData.nickname }}</h3>
          <div class="profile-tags">
            <el-tag effect="plain" size="small" :type="levelTag[detailData.level as Level]">
              {{ detailData.level }}
            </el-tag>
            <el-tag :type="statusTag[detailData.status as CStatus]" effect="light" size="small">
              {{ statusText[detailData.status as CStatus] }}
            </el-tag>
          </div>
        </div>
      </div>

      <el-tabs v-model="activeTab" @tab-click="openLevelTab">
        <el-tab-pane label="基本信息" name="base">
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="用户ID">{{ detailData.id }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ detailData.phone }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">
              {{ detailData.registeredAt }}
            </el-descriptions-item>
            <el-descriptions-item label="最近登录">
              {{ detailData.lastLoginAt }}
            </el-descriptions-item>
          </el-descriptions>
          <div v-if="detailData.status === 'banned' && detailData.banReason" class="ban-reason">
            封禁原因：{{ detailData.banReason }}
          </div>
          <h4 class="section-title">最近生成记录</h4>
          <el-table :data="genLogs" size="small">
            <el-table-column prop="time" label="时间" min-width="140" />
            <el-table-column prop="type" label="类型" width="100" />
            <el-table-column prop="model" label="模型" min-width="120" />
            <el-table-column prop="points" label="消耗点数" width="90" align="right" />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="会员档位" name="level">
          <el-descriptions :column="2" border size="small" class="level-desc">
            <el-descriptions-item label="当前档位">
              <el-tag effect="plain" :type="levelTag[detailData.level as Level]">
                {{ detailData.level }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="生效时间">
              {{ detailData.levelStart || "—" }}
            </el-descriptions-item>
            <el-descriptions-item label="到期时间">
              {{ detailData.levelExpire || "免费版长期有效" }}
            </el-descriptions-item>
            <el-descriptions-item label="权益说明">档位权益 + 白名单加成</el-descriptions-item>
          </el-descriptions>
          <div class="level-adjust">
            <span class="adjust-label">调整档位</span>
            <el-select v-model="levelDraft" style="width: 160px">
              <el-option v-for="l in levels" :key="l" :label="l" :value="l" />
            </el-select>
            <el-button type="primary" @click="applyLevel">应用调整</el-button>
          </div>
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="升级/降级/恢复档位会改变用户的默认权益，已生成的白名单不受影响"
          />
        </el-tab-pane>

        <el-tab-pane label="点数管理" name="points">
          <div class="points-cards">
            <div class="points-card">
              <div class="points-value">{{ detailData.points.toLocaleString() }}</div>
              <div class="points-label">可用点数</div>
            </div>
            <div class="points-card">
              <div class="points-value">{{ detailData.frozenPoints.toLocaleString() }}</div>
              <div class="points-label">冻结点数</div>
            </div>
          </div>
          <div class="points-actions">
            <el-button type="primary" size="small" @click="openPointsDialog('gift')">
              赠送点数
            </el-button>
            <el-button type="warning" size="small" plain @click="openPointsDialog('deduct')">
              扣减点数
            </el-button>
            <el-button type="info" size="small" plain @click="openPointsDialog('freeze')">
              冻结点数
            </el-button>
          </div>
          <h4 class="section-title">点数流水</h4>
          <el-table :data="pointsLogs" size="small">
            <el-table-column prop="time" label="时间" min-width="140" />
            <el-table-column prop="type" label="类型" width="80" />
            <el-table-column label="变动" width="90" align="right">
              <template #default="{ row }">
                <span :class="row.amount > 0 ? 'amount-in' : 'amount-out'">
                  {{ row.amount > 0 ? `+${row.amount}` : row.amount }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="balance" label="余额" width="90" align="right" />
            <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="违规处理" name="violation">
          <div class="violation-actions">
            <el-button size="small" @click="handleWarn">警告</el-button>
            <el-button size="small" type="warning" plain @click="handleRestrict">
              限制功能
            </el-button>
            <el-button
              v-if="detailData.status !== 'banned'"
              size="small"
              type="danger"
              plain
              @click="handleBan"
            >
              封禁
            </el-button>
            <el-button v-else size="small" type="success" plain @click="handleUnban">
              解封
            </el-button>
          </div>
          <h4 class="section-title">处理记录</h4>
          <el-timeline class="violation-timeline">
            <el-timeline-item timestamp="2026-08-20 15:30" type="warning">
              限制功能：视频生成（违规内容申诉期）
            </el-timeline-item>
            <el-timeline-item timestamp="2026-08-12 10:05" type="primary">
              发出警告：生成内容涉及侵权素材
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>

        <el-tab-pane label="登录设备" name="devices">
          <el-table :data="devices" size="small">
            <el-table-column prop="name" label="设备" min-width="140" />
            <el-table-column prop="platform" label="环境" min-width="150" />
            <el-table-column prop="lastActive" label="最近活跃" width="150" />
            <el-table-column label="操作" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.current" size="small" type="success" effect="plain">
                  当前在线
                </el-tag>
                <el-button v-else link type="danger" size="small" @click="kickDevice(row)">
                  踢下线
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="白名单" name="whitelist">
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="白名单为该用户临时开通高于其会员档位的功能/模型，不改变会员档位；到期或撤销后自动回落"
          />
          <el-table :data="userWhitelists" size="small" class="whitelist-table">
            <el-table-column label="类型" width="80">
              <template #default="{ row }">
                <el-tag size="small" effect="plain" :type="whitelistTypeTag[row.type]">
                  {{ row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="权限点" min-width="180" />
            <el-table-column prop="expireAt" label="到期时间" width="120" />
            <el-table-column prop="remark" label="备注" min-width="120" />
          </el-table>
          <el-button plain size="small" class="goto-whitelist" @click="router.push('/whitelist')">
            前往白名单管理
          </el-button>
        </el-tab-pane>
      </el-tabs>
    </template>

    <pointsActionDialog
      v-model:visible="pointsDialog"
      :type="pointsType"
      :current-user="detailData"
      @submitted="onPointsSubmitted"
    />
    <restrictFuncDialog v-model:visible="restrictVisible" @submitted="onRestrictSubmitted" />
  </el-drawer>
</template>

<style lang="scss" scoped>
.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  .profile-avatar {
    background: linear-gradient(135deg, $primary, $primary-deep);
    color: #fff;
    font-size: 22px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .profile-name {
    h3 {
      font-size: 17px;
      margin-bottom: 6px;
    }
    .profile-tags {
      display: flex;
      gap: 8px;
    }
  }
}
.ban-reason {
  margin-top: 12px;
  padding: 10px 12px;
  background: #fef0f0;
  color: #f56c6c;
  border-radius: 6px;
  font-size: 13px;
}
.section-title {
  margin: 20px 0 12px;
  font-size: 14px;
  color: #303133;
}
.level-desc {
  margin-bottom: 20px;
}
.level-adjust {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  .adjust-label {
    font-size: 14px;
    color: #606266;
  }
}
.points-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.points-card {
  flex: 1;
  text-align: center;
  padding: 18px 0;
  background: $primary-faint-bg;
  border-radius: 8px;
  .points-value {
    font-size: 26px;
    font-weight: 600;
    color: $primary;
  }
  .points-label {
    margin-top: 4px;
    font-size: 13px;
    color: #909399;
  }
}
.points-actions {
  display: flex;
  gap: 8px;
}
.amount-in {
  color: #67c23a;
}
.amount-out {
  color: #f56c6c;
}
.violation-actions {
  display: flex;
  gap: 8px;
}
.violation-timeline {
  margin-top: 16px;
  padding-left: 4px;
}
.whitelist-table {
  margin: 12px 0;
}
.goto-whitelist {
  margin-top: 4px;
}
</style>
