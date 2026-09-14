<!-- C端用户管理页面 -->
<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";

type Level = "免费版" | "基础版" | "标准版" | "高级版";
type CStatus = "normal" | "frozen" | "banned";

interface CUser {
  id: number;
  nickname: string;
  phone: string;
  level: Level;
  levelStart: string;
  levelExpire: string;
  points: number;
  frozenPoints: number;
  status: CStatus;
  banReason: string;
  registeredAt: string;
  lastLoginAt: string;
}

const levels: Level[] = ["免费版", "基础版", "标准版", "高级版"];
const statusOptions: { label: string; value: CStatus }[] = [
  { label: "正常", value: "normal" },
  { label: "冻结", value: "frozen" },
  { label: "封禁", value: "banned" },
];

const list = ref<CUser[]>([
  {
    id: 1001,
    nickname: "夜航星",
    phone: "13812340921",
    level: "高级版",
    levelStart: "2026-03-14",
    levelExpire: "2027-03-14",
    points: 12480,
    frozenPoints: 0,
    status: "normal",
    banReason: "",
    registeredAt: "2025-03-14 20:18",
    lastLoginAt: "2026-09-14 08:42",
  },
  {
    id: 1002,
    nickname: "柠檬不酸",
    phone: "15620873411",
    level: "高级版",
    levelStart: "2026-01-02",
    levelExpire: "2027-01-02",
    points: 8450,
    frozenPoints: 500,
    status: "normal",
    banReason: "",
    registeredAt: "2025-04-02 12:05",
    lastLoginAt: "2026-09-13 22:10",
  },
  {
    id: 1003,
    nickname: "山间清风",
    phone: "18973102286",
    level: "基础版",
    levelStart: "2026-06-19",
    levelExpire: "2026-12-19",
    points: 2100,
    frozenPoints: 0,
    status: "normal",
    banReason: "",
    registeredAt: "2025-04-19 09:33",
    lastLoginAt: "2026-09-14 07:55",
  },
  {
    id: 1004,
    nickname: "Gordon_Liu",
    phone: "13699812304",
    level: "免费版",
    levelStart: "2025-05-27",
    levelExpire: "",
    points: 60,
    frozenPoints: 0,
    status: "banned",
    banReason: "批量爬取生成接口，违反服务协议",
    registeredAt: "2025-05-27 16:44",
    lastLoginAt: "2026-07-30 21:03",
  },
  {
    id: 1005,
    nickname: "一只小鹿呀",
    phone: "17705711892",
    level: "高级版",
    levelStart: "2026-08-11",
    levelExpire: "2026-11-11",
    points: 5620,
    frozenPoints: 1000,
    status: "normal",
    banReason: "",
    registeredAt: "2025-06-11 10:27",
    lastLoginAt: "2026-09-12 19:36",
  },
  {
    id: 1006,
    nickname: "晚风信箱",
    phone: "15928740366",
    level: "基础版",
    levelStart: "2026-04-08",
    levelExpire: "2026-10-08",
    points: 1780,
    frozenPoints: 0,
    status: "frozen",
    banReason: "",
    registeredAt: "2025-07-08 21:52",
    lastLoginAt: "2026-09-14 09:18",
  },
  {
    id: 1007,
    nickname: "阿汤哥不喝汤",
    phone: "13522378098",
    level: "免费版",
    levelStart: "2025-08-23",
    levelExpire: "",
    points: 330,
    frozenPoints: 0,
    status: "normal",
    banReason: "",
    registeredAt: "2025-08-23 14:11",
    lastLoginAt: "2026-09-11 08:27",
  },
  {
    id: 1008,
    nickname: "Momo酱",
    phone: "18615209432",
    level: "免费版",
    levelStart: "2025-09-30",
    levelExpire: "",
    points: 0,
    frozenPoints: 0,
    status: "banned",
    banReason: "涉嫌售卖他人肖像生成数字人视频",
    registeredAt: "2025-09-30 18:39",
    lastLoginAt: "2026-05-14 12:00",
  },
  {
    id: 1009,
    nickname: "北城以北",
    phone: "15829631745",
    level: "高级版",
    levelStart: "2026-02-17",
    levelExpire: "2027-02-17",
    points: 9340,
    frozenPoints: 200,
    status: "normal",
    banReason: "",
    registeredAt: "2025-11-17 08:09",
    lastLoginAt: "2026-09-13 23:47",
  },
  {
    id: 1010,
    nickname: "苏打气泡水",
    phone: "13770389516",
    level: "基础版",
    levelStart: "2026-07-05",
    levelExpire: "2027-01-05",
    points: 3460,
    frozenPoints: 0,
    status: "normal",
    banReason: "",
    registeredAt: "2026-01-05 11:24",
    lastLoginAt: "2026-09-14 06:30",
  },
]);

// ===== 搜索 / 筛选 / 排序 =====
const filter = reactive({ keyword: "", level: "", status: "" });

const filtered = computed(() =>
  list.value.filter((item) => {
    const matchKeyword =
      !filter.keyword ||
      item.nickname.includes(filter.keyword) ||
      item.phone.includes(filter.keyword) ||
      String(item.id).includes(filter.keyword);
    const matchLevel = !filter.level || item.level === filter.level;
    const matchStatus = !filter.status || item.status === filter.status;
    return matchKeyword && matchLevel && matchStatus;
  }),
);

function resetSearch() {
  Object.assign(filter, { keyword: "", level: "", status: "" });
}

const statusText: Record<CStatus, string> = {
  normal: "正常",
  frozen: "冻结",
  banned: "封禁",
};
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

// ===== 统计卡 =====
const stats = computed(() => [
  {
    label: "C 端用户总数",
    value: list.value.length,
    icon: "User",
    hint: "全部 C 端用户",
    hintType: "success",
  },
  {
    label: "高级版",
    value: list.value.filter((u) => u.level === "高级版").length,
    icon: "Crown",
    hint: "高级版会员",
    hintType: "success",
  },
  {
    label: "标准版",
    value: list.value.filter((u) => u.level === "标准版").length,
    icon: "Medal",
    hint: "标准版会员",
    hintType: "success",
  },
  {
    label: "基础版",
    value: list.value.filter((u) => u.level === "基础版").length,
    icon: "Star",
    hint: "基础版会员",
    hintType: "success",
  },
]);

// ===== 详情抽屉 =====
const detailVisible = ref(false);
const activeTab = ref("base");
const currentUser = ref<CUser | null>(null);

function openDetail(row: CUser) {
  currentUser.value = row;
  activeTab.value = "base";
  detailVisible.value = true;
}

// ===== 会员档位调整 =====
const levelDraft = ref<Level>("免费版");

function openLevelTab() {
  if (currentUser.value) levelDraft.value = currentUser.value.level;
}

function applyLevel() {
  const user = currentUser.value;
  if (!user) return;
  if (levelDraft.value === user.level) {
    ElMessage.info("档位未变化");
    return;
  }
  ElMessageBox.confirm(
    `确认将「${user.nickname}」档位由 ${user.level} 调整为 ${levelDraft.value} 吗？该操作将写入审计日志`,
    "档位调整",
    {
      confirmButtonText: "确认调整",
      cancelButtonText: "取消",
      type: "warning",
    },
  ).then(() => {
    user.level = levelDraft.value;
    user.levelStart = "2026-09-14";
    user.levelExpire = levelDraft.value === "免费版" ? "" : "2027-09-14";
    ElMessage.success(`档位已调整为 ${levelDraft.value}，已写入审计日志`);
  });
}

// ===== 点数管理 =====
type PointsAction = "gift" | "deduct" | "freeze";
const pointsActionText: Record<PointsAction, string> = {
  gift: "赠送点数",
  deduct: "扣减点数",
  freeze: "冻结点数",
};
const pointsDialog = reactive({
  visible: false,
  type: "gift" as PointsAction,
  amount: 100,
  remark: "",
});

function openPointsDialog(type: PointsAction) {
  Object.assign(pointsDialog, { visible: true, type, amount: 100, remark: "" });
}

function submitPoints() {
  const user = currentUser.value;
  if (!user || pointsDialog.amount <= 0) {
    ElMessage.warning("请输入正确的点数数量");
    return;
  }
  if (pointsDialog.type === "deduct" && pointsDialog.amount > user.points) {
    ElMessage.warning(`可扣减点数不足，当前可用余额 ${user.points}`);
    return;
  }
  if (pointsDialog.type === "freeze" && pointsDialog.amount > user.points) {
    ElMessage.warning(`可冻结点数不足，当前可用余额 ${user.points}`);
    return;
  }
  if (pointsDialog.type === "gift") user.points += pointsDialog.amount;
  if (pointsDialog.type === "deduct") user.points -= pointsDialog.amount;
  if (pointsDialog.type === "freeze") {
    user.points -= pointsDialog.amount;
    user.frozenPoints += pointsDialog.amount;
  }
  pointsLogs.value.unshift({
    time: "2026-09-14 10:00",
    type: pointsActionText[pointsDialog.type].replace("点数", ""),
    amount:
      pointsDialog.type === "gift" ? pointsDialog.amount : -pointsDialog.amount,
    balance: user.points,
    remark: pointsDialog.remark || "后台操作",
  });
  pointsDialog.visible = false;
  ElMessage.success(
    `${pointsActionText[pointsDialog.type]}成功，已写入审计日志`,
  );
}

const pointsLogs = ref([
  {
    time: "2026-09-13 21:17",
    type: "生成消耗",
    amount: -120,
    balance: 8570,
    remark: "视频生成 2.0 · 30s",
  },
  {
    time: "2026-09-12 18:35",
    type: "赠送",
    amount: 500,
    balance: 8690,
    remark: "活动奖励",
  },
  {
    time: "2026-09-10 14:02",
    type: "冻结",
    amount: -500,
    balance: 8190,
    remark: "争议订单冻结",
  },
  {
    time: "2026-09-08 09:26",
    type: "生成消耗",
    amount: -80,
    balance: 8690,
    remark: "数字人制作 · 1min",
  },
  {
    time: "2026-09-05 16:48",
    type: "充值",
    amount: 2000,
    balance: 8770,
    remark: "标准版续费赠送",
  },
]);

// ===== 违规处理 =====
function handleWarn() {
  const user = currentUser.value;
  if (!user) return;
  ElMessageBox.prompt("请输入警告内容，将站内信通知用户", "发出警告", {
    confirmButtonText: "发出警告",
    cancelButtonText: "取消",
    inputPlaceholder: "警告内容",
  }).then(({ value }) => {
    if (!value) return;
    ElMessage.success(`已向「${user.nickname}」发出警告，已写入审计日志`);
  });
}

const restrictDialog = reactive({ visible: false, funcs: [] as string[] });
const restrictFuncs = [
  "脚本生成",
  "图片生成",
  "视频生成",
  "数字人制作",
  "字幕处理",
];

function handleRestrict() {
  restrictDialog.funcs = [];
  restrictDialog.visible = true;
}

function submitRestrict() {
  if (!restrictDialog.funcs.length) {
    ElMessage.warning("请选择要限制的功能");
    return;
  }
  restrictDialog.visible = false;
  ElMessage.success(
    `已限制功能：${restrictDialog.funcs.join("、")}，已写入审计日志`,
  );
}

function handleBan(user: CUser) {
  ElMessageBox.prompt("封禁需记录原因，将写入审计日志", "封禁账号", {
    confirmButtonText: "确认封禁",
    cancelButtonText: "取消",
    inputPlaceholder: "封禁原因",
    type: "warning",
    inputValidator: (v: string) => !!v || "必须填写封禁原因",
  }).then(({ value }) => {
    user.status = "banned";
    user.banReason = value;
    ElMessage.success(`已封禁「${user.nickname}」，原因已记录`);
  });
}

function handleUnban(user: CUser) {
  ElMessageBox.confirm(`确认解封用户「${user.nickname}」吗？`, "解封账号", {
    confirmButtonText: "确认解封",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    user.status = "normal";
    user.banReason = "";
    ElMessage.success("已解封，已写入审计日志");
  });
}

function handleFreeze(user: CUser, frozen: boolean) {
  const action = frozen ? "冻结" : "解冻";
  ElMessageBox.confirm(
    `确认${action}用户「${user.nickname}」的账号吗？`,
    `${action}账号`,
    {
      confirmButtonText: `确认${action}`,
      cancelButtonText: "取消",
      type: "warning",
    },
  ).then(() => {
    user.status = frozen ? "frozen" : "normal";
    ElMessage.success(`已${action}，已写入审计日志`);
  });
}

// ===== 登录设备 =====
const devices = ref([
  {
    id: 1,
    name: "iPhone 15 Pro",
    platform: "iOS 18.1 · App",
    lastActive: "2026-09-14 09:18",
    current: true,
  },
  {
    id: 2,
    name: "Chrome 浏览器",
    platform: "Windows 11 · Web",
    lastActive: "2026-09-12 21:40",
    current: false,
  },
  {
    id: 3,
    name: "HUAWEI Mate 60",
    platform: "HarmonyOS 5 · App",
    lastActive: "2026-09-08 12:05",
    current: false,
  },
]);

function kickDevice(device: (typeof devices.value)[number]) {
  ElMessageBox.confirm(`确认将设备「${device.name}」强制下线吗？`, "踢下线", {
    confirmButtonText: "强制下线",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    devices.value = devices.value.filter((d) => d.id !== device.id);
    ElMessage.success("该设备已强制下线，已写入审计日志");
  });
}

// ===== 白名单（用户维度查看） =====
const userWhitelists = [
  {
    type: "模型",
    name: "视频生成 2.5（灰度）",
    expireAt: "2026-10-01",
    remark: "灰度体验",
  },
  {
    type: "规格",
    name: "4K 分辨率",
    expireAt: "2026-09-30",
    remark: "画质内测",
  },
];
const whitelistTypeTag: Record<string, "success" | "warning" | "danger"> = {
  功能: "success",
  模型: "warning",
  规格: "danger",
};

// ===== 生成记录 =====
const genLogs = [
  {
    time: "2026-09-14 10:02",
    type: "视频生成",
    model: "视频生成 2.0",
    points: -120,
  },
  {
    time: "2026-09-13 21:17",
    type: "数字人制作",
    model: "数字人 A3",
    points: -80,
  },
  {
    time: "2026-09-12 19:40",
    type: "脚本生成",
    model: "脚本大师",
    points: -10,
  },
];

const router = useRouter();
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

    <div class="card-panel">
      <!-- 搜索栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filter.keyword"
          placeholder="搜索手机号 / 昵称 / 用户ID"
          clearable
          style="width: 220px"
          :prefix-icon="'Search'"
        />
        <el-select
          v-model="filter.level"
          placeholder="会员档位"
          clearable
          style="width: 130px"
        >
          <el-option v-for="l in levels" :key="l" :label="l" :value="l" />
        </el-select>
        <el-select
          v-model="filter.status"
          placeholder="状态"
          clearable
          style="width: 110px"
        >
          <el-option
            v-for="s in statusOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          />
        </el-select>
        <el-button :icon="'RefreshLeft'" @click="resetSearch">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="filtered" stripe style="width: 100%">
        <el-table-column label="用户">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="30" class="user-avatar">{{
                row.nickname.charAt(0)
              }}</el-avatar>
              <div class="user-info">
                <span class="user-name">{{ row.nickname }}</span>
                <span class="user-id">ID: {{ row.id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="会员档位" align="center">
          <template #default="{ row }">
            <el-tag
              effect="plain"
              size="small"
              :type="levelTag[row.level as Level]"
            >
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="点数余额"
          width="110"
          align="right"
          prop="points"
        >
          <template #default="{ row }">
            {{ row.points.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="到期时间" align="center">
          <template #default="{ row }">
            {{ row.levelExpire || "长期" }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template #default="{ row }">
            <el-tag
              :type="statusTag[row.status as CStatus]"
              effect="light"
              size="small"
            >
              {{ statusText[row.status as CStatus] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" align="left">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)"
              >详情</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              @click="
                openDetail(row);
                activeTab = 'level';
              "
              >调档位</el-button
            >
            <el-button
              link
              type="primary"
              size="small"
              @click="
                openDetail(row);
                activeTab = 'points';
                openPointsDialog('gift');
              "
              >赠点</el-button
            >
            <el-button
              v-if="row.status !== 'banned'"
              link
              type="danger"
              size="small"
              @click="handleBan(row)"
              >封禁</el-button
            >
            <el-button
              v-else
              link
              type="success"
              size="small"
              @click="handleUnban(row)"
              >解封</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="filtered.length"
          :page-sizes="[10, 20, 50]"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="用户详情" size="720px">
      <template v-if="currentUser">
        <div class="profile-header">
          <el-avatar :size="56" class="profile-avatar">{{
            currentUser.nickname.charAt(0)
          }}</el-avatar>
          <div class="profile-name">
            <h3>{{ currentUser.nickname }}</h3>
            <div class="profile-tags">
              <el-tag
                effect="plain"
                size="small"
                :type="levelTag[currentUser.level as Level]"
              >
                {{ currentUser.level }}
              </el-tag>
              <el-tag
                :type="statusTag[currentUser.status as CStatus]"
                effect="light"
                size="small"
              >
                {{ statusText[currentUser.status as CStatus] }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-tabs v-model="activeTab" @tab-click="openLevelTab">
          <!-- Tab 1 基本信息 -->
          <el-tab-pane label="基本信息" name="base">
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="用户ID">{{
                currentUser.id
              }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{
                currentUser.phone
              }}</el-descriptions-item>
              <el-descriptions-item label="注册时间">{{
                currentUser.registeredAt
              }}</el-descriptions-item>
              <el-descriptions-item label="最近登录">{{
                currentUser.lastLoginAt
              }}</el-descriptions-item>
            </el-descriptions>
            <div
              v-if="currentUser.status === 'banned' && currentUser.banReason"
              class="ban-reason"
            >
              封禁原因：{{ currentUser.banReason }}
            </div>
            <h4 class="section-title">最近生成记录</h4>
            <el-table :data="genLogs" size="small">
              <el-table-column prop="time" label="时间" min-width="140" />
              <el-table-column prop="type" label="类型" width="100" />
              <el-table-column prop="model" label="模型" min-width="120" />
              <el-table-column
                prop="points"
                label="消耗点数"
                width="90"
                align="right"
              />
            </el-table>
          </el-tab-pane>

          <!-- Tab 2 会员档位 -->
          <el-tab-pane label="会员档位" name="level">
            <el-descriptions :column="2" border size="small" class="level-desc">
              <el-descriptions-item label="当前档位">
                <el-tag
                  effect="plain"
                  :type="levelTag[currentUser.level as Level]"
                >
                  {{ currentUser.level }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="生效时间">{{
                currentUser.levelStart || "—"
              }}</el-descriptions-item>
              <el-descriptions-item label="到期时间">
                {{ currentUser.levelExpire || "免费版长期有效" }}
              </el-descriptions-item>
              <el-descriptions-item label="权益说明"
                >档位权益 + 白名单加成</el-descriptions-item
              >
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

          <!-- Tab 3 点数管理 -->
          <el-tab-pane label="点数管理" name="points">
            <div class="points-cards">
              <div class="points-card">
                <div class="points-value">
                  {{ currentUser.points.toLocaleString() }}
                </div>
                <div class="points-label">可用点数</div>
              </div>
              <div class="points-card">
                <div class="points-value">
                  {{ currentUser.frozenPoints.toLocaleString() }}
                </div>
                <div class="points-label">冻结点数</div>
              </div>
            </div>
            <div class="points-actions">
              <el-button
                type="primary"
                size="small"
                @click="openPointsDialog('gift')"
                >赠送点数</el-button
              >
              <el-button
                type="warning"
                size="small"
                plain
                @click="openPointsDialog('deduct')"
                >扣减点数</el-button
              >
              <el-button
                type="info"
                size="small"
                plain
                @click="openPointsDialog('freeze')"
                >冻结点数</el-button
              >
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
              <el-table-column
                prop="balance"
                label="余额"
                width="90"
                align="right"
              />
              <el-table-column
                prop="remark"
                label="备注"
                min-width="160"
                show-overflow-tooltip
              />
            </el-table>
          </el-tab-pane>

          <!-- Tab 4 违规处理 -->
          <el-tab-pane label="违规处理" name="violation">
            <div class="violation-actions">
              <el-button size="small" @click="handleWarn">警告</el-button>
              <el-button
                size="small"
                type="warning"
                plain
                @click="handleRestrict"
                >限制功能</el-button
              >
              <el-button
                v-if="currentUser.status !== 'banned'"
                size="small"
                type="danger"
                plain
                @click="handleBan(currentUser)"
              >
                封禁
              </el-button>
              <el-button
                v-else
                size="small"
                type="success"
                plain
                @click="handleUnban(currentUser)"
              >
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

          <!-- Tab 5 登录设备 -->
          <el-tab-pane label="登录设备" name="devices">
            <el-table :data="devices" size="small">
              <el-table-column prop="name" label="设备" min-width="140" />
              <el-table-column prop="platform" label="环境" min-width="150" />
              <el-table-column prop="lastActive" label="最近活跃" width="150" />
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-tag
                    v-if="row.current"
                    size="small"
                    type="success"
                    effect="plain"
                    >当前在线</el-tag
                  >
                  <el-button
                    v-else
                    link
                    type="danger"
                    size="small"
                    @click="kickDevice(row)"
                  >
                    踢下线
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <!-- Tab 6 白名单 -->
          <el-tab-pane label="白名单" name="whitelist">
            <el-alert
              type="info"
              :closable="false"
              show-icon
              title="白名单为该用户临时开通高于其会员档位的功能/模型，不改变会员档位；到期或撤销后自动回落"
            />
            <el-table
              :data="userWhitelists"
              size="small"
              class="whitelist-table"
            >
              <el-table-column label="类型" width="80">
                <template #default="{ row }">
                  <el-tag
                    size="small"
                    effect="plain"
                    :type="whitelistTypeTag[row.type]"
                  >
                    {{ row.type }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="权限点" min-width="180" />
              <el-table-column prop="expireAt" label="到期时间" width="120" />
              <el-table-column prop="remark" label="备注" min-width="120" />
            </el-table>
            <el-button
              type="primary"
              plain
              size="small"
              class="goto-whitelist"
              @click="router.push('/whitelist')"
            >
              前往白名单管理
            </el-button>
          </el-tab-pane>
        </el-tabs>
      </template>
    </el-drawer>

    <!-- 点数操作弹窗 -->
    <el-dialog
      v-model="pointsDialog.visible"
      :title="pointsActionText[pointsDialog.type]"
      width="420px"
      append-to-body
    >
      <el-form label-width="90px">
        <el-form-item label="点数数量">
          <el-input-number
            v-model="pointsDialog.amount"
            :min="1"
            :max="100000"
            :step="100"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="pointsDialog.remark"
            type="textarea"
            :rows="2"
            placeholder="操作原因，将写入审计日志"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pointsDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitPoints">确认</el-button>
      </template>
    </el-dialog>

    <!-- 限制功能弹窗 -->
    <el-dialog
      v-model="restrictDialog.visible"
      title="限制功能"
      width="440px"
      append-to-body
    >
      <p class="restrict-tip">
        选择要对该用户限制的功能，限制后立即生效并写入审计日志
      </p>
      <el-checkbox-group v-model="restrictDialog.funcs">
        <el-checkbox
          v-for="f in restrictFuncs"
          :key="f"
          :value="f"
          class="restrict-check"
        >
          {{ f }}
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="restrictDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitRestrict">确认限制</el-button>
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

.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-avatar {
    background: $primary-avatar-bg;
    color: $primary;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
  }

  .user-info {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .user-name {
      font-size: 14px;
      color: $text-main;
    }

    .user-id {
      font-size: 12px;
      color: $text-secondary;
    }
  }
}

.frozen-tip {
  color: #909399;
  font-size: 12px;
}

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

.restrict-tip {
  font-size: 13px;
  color: #909399;
  margin-bottom: 12px;
}

.restrict-check {
  margin-right: 16px;
}
</style>
