<!-- 添加白名单弹窗组件 -->
<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";

type WlType = "功能" | "模型" | "规格";

interface WhitelistRow {
  id: number;
  userId: number;
  nickname: string;
  phone: string;
  type: WlType;
  perm: string;
  expireMode: "永久" | "固定时长" | "到期日";
  expireAt: string;
  status: "active" | "revoked" | "expired";
  operator: string;
  createdAt: string;
  remark: string;
}

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{
  "update:modelValue": [val: boolean];
  submitted: [row: WhitelistRow];
}>();

const visible = ref(false);
watch(
  () => props.modelValue,
  (v) => (visible.value = v),
);
watch(visible, (v) => emit("update:modelValue", v));

const addTab = ref("single");

const permOptions: Record<WlType, string[]> = {
  功能: ["字幕擦除（灰度）", "数字人内测", "批量生成"],
  模型: ["视频生成 2.5（灰度）", "4K 超清生成", "数字人 S1（内测）"],
  规格: ["1080p 分辨率", "4K 分辨率", "超清画质"],
};

const userOptions = [
  { id: 1001, nickname: "夜航星", phone: "13812340921" },
  { id: 1003, nickname: "山间清风", phone: "18973102286" },
  { id: 1005, nickname: "一只小鹿呀", phone: "17705711892" },
  { id: 1006, nickname: "晚风信箱", phone: "15928740366" },
  { id: 1007, nickname: "阿汤哥不喝汤", phone: "13522378098" },
  { id: 1010, nickname: "苏打气泡水", phone: "13770389516" },
];

const levelOptions = ["免费版", "基础版", "标准版", "高级版"];

const singleForm = reactive({
  userId: undefined as number | undefined,
  type: "功能" as WlType,
  perm: "",
  expireMode: "到期日" as "永久" | "固定时长" | "到期日",
  days: 30,
  expireAt: "2026-12-31",
  remark: "",
});

const batchForm = reactive({
  level: "",
  registerRange: [] as string[],
  phonePrefix: "",
  type: "功能" as WlType,
  perm: "",
  expireMode: "固定时长" as "永久" | "固定时长" | "到期日",
  days: 30,
  expireAt: "2026-12-31",
  remark: "",
});

const importForm = reactive({
  content: "",
  type: "模型" as WlType,
  perm: "",
  expireMode: "到期日" as "永久" | "固定时长" | "到期日",
  days: 30,
  expireAt: "2026-12-31",
  remark: "",
});

function resetForms() {
  Object.assign(singleForm, {
    userId: undefined,
    type: "功能",
    perm: "",
    expireMode: "到期日",
    days: 30,
    expireAt: "2026-12-31",
    remark: "",
  });
  Object.assign(batchForm, {
    level: "",
    registerRange: [],
    phonePrefix: "",
    type: "功能",
    perm: "",
    expireMode: "固定时长",
    days: 30,
    expireAt: "2026-12-31",
    remark: "",
  });
  Object.assign(importForm, {
    content: "",
    type: "模型",
    perm: "",
    expireMode: "到期日",
    days: 30,
    expireAt: "2026-12-31",
    remark: "",
  });
}

function calcExpire(
  mode: "永久" | "固定时长" | "到期日",
  days: number,
  date: string,
) {
  if (mode === "永久") return "永久";
  if (mode === "固定时长")
    return `2026-${String(9 + Math.floor(days / 30)).padStart(2, "0")}-14`;
  return date;
}

function handleClose() {
  visible.value = false;
  resetForms();
}

function handleSubmit() {
  if (addTab.value === "single") submitSingle();
  else if (addTab.value === "batch") submitBatch();
  else submitImport();
}

function submitSingle() {
  if (!singleForm.userId || !singleForm.perm) {
    ElMessage.warning("请选择用户并勾选权限点");
    return;
  }
  const user = userOptions.find((u) => u.id === singleForm.userId)!;
  const row: WhitelistRow = {
    id: Date.now(),
    userId: user.id,
    nickname: user.nickname,
    phone: user.phone,
    type: singleForm.type,
    perm: singleForm.perm,
    expireMode: singleForm.expireMode,
    expireAt: calcExpire(
      singleForm.expireMode,
      singleForm.days,
      singleForm.expireAt,
    ),
    status: "active",
    operator: "系统管理员",
    createdAt: "2026-09-14 10:00",
    remark: singleForm.remark || "单个开白",
  };
  visible.value = false;
  resetForms();
  emit("submitted", row);
  ElMessage.success(
    `已为「${user.nickname}」开白「${singleForm.perm}」，已写入审计日志`,
  );
}

function submitBatch() {
  if (!batchForm.perm) {
    ElMessage.warning("请勾选权限点");
    return;
  }
  const cond = [
    batchForm.level,
    batchForm.phonePrefix && `手机号段 ${batchForm.phonePrefix}`,
  ].filter(Boolean);
  const row: WhitelistRow = {
    id: Date.now() + 1,
    userId: 0,
    nickname: `批量（${cond.join(" / ") || "全部用户"}）`,
    phone: "36 人",
    type: batchForm.type,
    perm: batchForm.perm,
    expireMode: batchForm.expireMode,
    expireAt: calcExpire(
      batchForm.expireMode,
      batchForm.days,
      batchForm.expireAt,
    ),
    status: "active",
    operator: "系统管理员",
    createdAt: "2026-09-14 10:00",
    remark: batchForm.remark || "批量开白",
  };
  visible.value = false;
  resetForms();
  emit("submitted", row);
  ElMessage.success("已按条件为 36 名用户批量开白，已写入审计日志");
}

function submitImport() {
  const lines = importForm.content
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!lines.length || !importForm.perm) {
    ElMessage.warning("请粘贴用户名单（手机号/UID，每行一个）并勾选权限点");
    return;
  }
  const row: WhitelistRow = {
    id: Date.now() + 2,
    userId: 0,
    nickname: `名单导入（${lines.length} 人）`,
    phone: lines.slice(0, 2).join(" / ") + (lines.length > 2 ? " …" : ""),
    type: importForm.type,
    perm: importForm.perm,
    expireMode: importForm.expireMode,
    expireAt: calcExpire(
      importForm.expireMode,
      importForm.days,
      importForm.expireAt,
    ),
    status: "active",
    operator: "系统管理员",
    createdAt: "2026-09-14 10:00",
    remark: importForm.remark || "名单导入开白",
  };
  visible.value = false;
  resetForms();
  emit("submitted", row);
  ElMessage.success(`已为名单内 ${lines.length} 名用户开白，已写入审计日志`);
}

const submitLabel = () =>
  addTab.value === "single"
    ? "确认开白"
    : addTab.value === "batch"
      ? "批量开白"
      : "导入并开白";
</script>

<template>
  <el-dialog
    v-model="visible"
    title="开白名单"
    width="580px"
    @close="resetForms"
  >
    <el-tabs v-model="addTab">
      <!-- 单个添加 -->
      <el-tab-pane label="单个添加" name="single">
        <el-form label-width="120px">
          <el-form-item label="用户" required>
            <el-select
              v-model="singleForm.userId"
              filterable
              placeholder="搜索昵称 / 手机号选择用户"
              style="width: 100%"
            >
              <el-option
                v-for="u in userOptions"
                :key="u.id"
                :label="`${u.nickname}（${u.phone}）`"
                :value="u.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="白名单类型" required>
            <el-radio-group v-model="singleForm.type">
              <el-radio-button value="功能">功能</el-radio-button>
              <el-radio-button value="模型">模型</el-radio-button>
              <el-radio-button value="规格">规格</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="权限点" required>
            <el-select
              v-model="singleForm.perm"
              placeholder="勾选要开白的权限点"
              style="width: 100%"
            >
              <el-option
                v-for="p in permOptions[singleForm.type]"
                :key="p"
                :label="p"
                :value="p"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="有效期" required>
            <el-radio-group v-model="singleForm.expireMode">
              <el-radio-button value="永久">永久</el-radio-button>
              <el-radio-button value="固定时长">固定时长</el-radio-button>
              <el-radio-button value="到期日">到某日期</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="singleForm.expireMode === '固定时长'"
            label="时长（天）"
          >
            <el-input-number v-model="singleForm.days" :min="1" :max="365" />
          </el-form-item>
          <el-form-item
            v-if="singleForm.expireMode === '到期日'"
            label="到期日期"
          >
            <el-date-picker
              v-model="singleForm.expireAt"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="singleForm.remark"
              placeholder="开通原因，便于追溯"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 批量添加 -->
      <el-tab-pane label="批量添加" name="batch">
        <el-form label-width="100px">
          <el-form-item label="筛选条件">
            <el-select
              v-model="batchForm.level"
              placeholder="会员档位"
              clearable
              style="width: 130px"
            >
              <el-option
                v-for="l in levelOptions"
                :key="l"
                :label="l"
                :value="l"
              />
            </el-select>
            <el-date-picker
              v-model="batchForm.registerRange"
              type="daterange"
              range-separator="至"
              start-placeholder="注册开始"
              end-placeholder="注册结束"
              value-format="YYYY-MM-DD"
              style="width: 240px; margin-left: 8px"
            />
          </el-form-item>
          <el-form-item label="手机号段">
            <el-input
              v-model="batchForm.phonePrefix"
              placeholder="如 138"
              style="width: 130px"
            />
          </el-form-item>
          <el-form-item label="白名单类型" required>
            <el-radio-group v-model="batchForm.type">
              <el-radio-button value="功能">功能</el-radio-button>
              <el-radio-button value="模型">模型</el-radio-button>
              <el-radio-button value="规格">规格</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="权限点" required>
            <el-select
              v-model="batchForm.perm"
              placeholder="统一勾选权限点"
              style="width: 100%"
            >
              <el-option
                v-for="p in permOptions[batchForm.type]"
                :key="p"
                :label="p"
                :value="p"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="有效期" required>
            <el-radio-group v-model="batchForm.expireMode">
              <el-radio-button value="永久">永久</el-radio-button>
              <el-radio-button value="固定时长">固定时长</el-radio-button>
              <el-radio-button value="到期日">到某日期</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="batchForm.expireMode === '固定时长'"
            label="时长（天）"
          >
            <el-input-number v-model="batchForm.days" :min="1" :max="365" />
          </el-form-item>
          <el-form-item
            v-if="batchForm.expireMode === '到期日'"
            label="到期日期"
          >
            <el-date-picker
              v-model="batchForm.expireAt"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="batchForm.remark"
              placeholder="开通原因，便于追溯"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 名单导入 -->
      <el-tab-pane label="名单导入" name="import">
        <el-form label-width="90px">
          <el-form-item label="用户名单" required>
            <el-input
              v-model="importForm.content"
              type="textarea"
              :rows="4"
              placeholder="粘贴用户名单（手机号 / UID），每行一个"
            />
          </el-form-item>
          <el-form-item label="白名单类型" required>
            <el-radio-group v-model="importForm.type">
              <el-radio-button value="功能">功能</el-radio-button>
              <el-radio-button value="模型">模型</el-radio-button>
              <el-radio-button value="规格">规格</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="权限点" required>
            <el-select
              v-model="importForm.perm"
              placeholder="统一勾选权限点"
              style="width: 100%"
            >
              <el-option
                v-for="p in permOptions[importForm.type]"
                :key="p"
                :label="p"
                :value="p"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="有效期" required>
            <el-radio-group v-model="importForm.expireMode">
              <el-radio-button value="永久">永久</el-radio-button>
              <el-radio-button value="固定时长">固定时长</el-radio-button>
              <el-radio-button value="到期日">到某日期</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item
            v-if="importForm.expireMode === '固定时长'"
            label="时长（天）"
          >
            <el-input-number v-model="importForm.days" :min="1" :max="365" />
          </el-form-item>
          <el-form-item
            v-if="importForm.expireMode === '到期日'"
            label="到期日期"
          >
            <el-date-picker
              v-model="importForm.expireAt"
              type="date"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </el-form-item>
          <el-form-item label="备注">
            <el-input
              v-model="importForm.remark"
              placeholder="开通原因，便于追溯"
            />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">{{
        submitLabel()
      }}</el-button>
    </template>
  </el-dialog>
</template>
