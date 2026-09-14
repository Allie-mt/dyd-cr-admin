<script setup lang="ts">
import { reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

interface Member {
  name: string;
  account: string;
  status: "正常" | "禁用";
}

interface Role {
  id: number;
  name: string;
  type: "preset" | "custom";
  members: number;
  memberList: Member[];
  perms: string[];
  desc: string;
  updatedAt: string;
}

// 权限点按模块分组（与 4.5 角色授权的分组对齐）
const permGroups = [
  {
    name: "C端用户管理",
    perms: ["用户查看", "档位调整", "点数调整", "封禁/解封", "白名单管理"],
  },
  {
    name: "B端企业管理",
    perms: ["企业查看", "企业开通", "套餐变更", "配额调整", "兜底操作"],
  },
  { name: "财务", perms: ["订单查看", "退款审批", "发票管理", "点数加购"] },
  {
    name: "功能开关",
    perms: ["权限点管理", "模型开关", "功能开关", "会员权益配置"],
  },
  {
    name: "审计与报表",
    perms: ["操作日志", "登录日志", "权限变更日志", "数据报表"],
  },
];
const allPerms = permGroups.flatMap((g) => g.perms);

const list = ref<Role[]>([
  {
    id: 1,
    name: "超级管理员",
    type: "preset",
    members: 1,
    memberList: [{ name: "张明", account: "zhangming", status: "正常" }],
    perms: allPerms,
    desc: "拥有全部权限，内置不可删除",
    updatedAt: "2026-01-10",
  },
  {
    id: 2,
    name: "运营",
    type: "preset",
    members: 3,
    memberList: [
      { name: "李婷", account: "liting", status: "正常" },
      { name: "王磊", account: "wanglei", status: "正常" },
      { name: "赵雪", account: "zhaoxue", status: "正常" },
    ],
    perms: [
      "用户查看",
      "档位调整",
      "企业查看",
      "权限点管理",
      "模型开关",
      "功能开关",
    ],
    desc: "日常运营与功能配置",
    updatedAt: "2026-03-22",
  },
  {
    id: 3,
    name: "客服",
    type: "preset",
    members: 5,
    memberList: [
      { name: "陈芳", account: "chenfang", status: "正常" },
      { name: "刘洋", account: "liuyang", status: "正常" },
      { name: "孙静", account: "sunjing", status: "正常" },
      { name: "周杰", account: "zhoujie", status: "禁用" },
      { name: "吴敏", account: "wumin", status: "正常" },
    ],
    perms: ["用户查看", "企业查看"],
    desc: "只读查询，协助处理客诉",
    updatedAt: "2026-02-14",
  },
  {
    id: 4,
    name: "财务",
    type: "preset",
    members: 2,
    memberList: [
      { name: "郑华", account: "zhenghua", status: "正常" },
      { name: "钱丽", account: "qianli", status: "正常" },
    ],
    perms: ["用户查看", "订单查看", "退款审批", "发票管理", "点数加购"],
    desc: "财务与退款相关操作",
    updatedAt: "2026-04-08",
  },
  {
    id: 5,
    name: "风控",
    type: "preset",
    members: 1,
    memberList: [{ name: "冯刚", account: "fenggang", status: "正常" }],
    perms: ["用户查看", "封禁/解封", "操作日志", "登录日志", "权限变更日志"],
    desc: "违规处置与安全审计",
    updatedAt: "2026-05-19",
  },
  {
    id: 6,
    name: "数据分析",
    type: "preset",
    members: 2,
    memberList: [
      { name: "许悦", account: "xuyue", status: "正常" },
      { name: "韩飞", account: "hanfei", status: "正常" },
    ],
    perms: ["用户查看", "企业查看", "数据报表"],
    desc: "只读报表查看",
    updatedAt: "2026-06-02",
  },
  {
    id: 7,
    name: "专项活动运营",
    type: "custom",
    members: 2,
    memberList: [
      { name: "杨帆", account: "yangfan", status: "正常" },
      { name: "朱琳", account: "zhulin", status: "正常" },
    ],
    perms: ["用户查看", "档位调整", "点数调整", "白名单管理"],
    desc: "周年庆活动临时授权，到期自动回收",
    updatedAt: "2026-09-01",
  },
]);

// ===== 授权弹窗 =====
const authDialog = reactive({
  visible: false,
  roleId: 0,
  roleName: "",
  perms: [] as string[],
});

function openAuth(role: Role) {
  Object.assign(authDialog, {
    visible: true,
    roleId: role.id,
    roleName: role.name,
    perms: [...role.perms],
  });
}

function submitAuth() {
  if (!authDialog.perms.length) {
    ElMessage.warning("请至少勾选一个权限点");
    return;
  }
  const role = list.value.find((r) => r.id === authDialog.roleId);
  if (role) {
    role.perms = [...authDialog.perms];
    role.updatedAt = "2026-09-14";
  }
  authDialog.visible = false;
  ElMessage.success(
    `角色「${authDialog.roleName}」授权已保存，权限变更已写入审计日志`,
  );
}

// ===== 自定义角色 =====
const createDialog = reactive({ visible: false, name: "", desc: "" });

function submitCreate() {
  if (!createDialog.name.trim()) {
    ElMessage.warning("请输入角色名称");
    return;
  }
  list.value.push({
    id: Date.now(),
    name: createDialog.name,
    type: "custom",
    members: 0,
    memberList: [],
    perms: [],
    desc: createDialog.desc || "自定义角色",
    updatedAt: "2026-09-14",
  });
  createDialog.visible = false;
  createDialog.name = "";
  createDialog.desc = "";
  ElMessage.success("自定义角色已创建，请前往授权配置权限点");
}

function removeRole(role: Role) {
  ElMessageBox.confirm(`确认删除自定义角色「${role.name}」吗？`, "删除角色", {
    confirmButtonText: "确认删除",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    list.value = list.value.filter((r) => r.id !== role.id);
    ElMessage.success("角色已删除，已写入审计日志");
  });
}

// ===== 查看成员弹窗 =====
const memberDialog = reactive({
  visible: false,
  roleName: "",
  members: [] as Member[],
});

function openMembers(role: Role) {
  Object.assign(memberDialog, {
    visible: true,
    roleName: role.name,
    members: role.memberList,
  });
}
</script>

<template>
  <div class="page-container">
    <div class="card-panel">
      <div class="filter-bar">
        <span class="page-tip"
          >管理后台运营人员自身的角色与权限，按权限点勾选授权；临时授权的角色到期自动回收</span
        >
        <div class="filter-actions">
          <el-button
            type="primary"
            :icon="'Plus'"
            @click="createDialog.visible = true"
            >新建自定义角色</el-button
          >
        </div>
      </div>

      <el-table :data="list" stripe style="width: 100%">
        <el-table-column prop="name" label="角色名称" min-width="130">
          <template #default="{ row }">
            <span class="role-name">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.type === 'preset'" size="small" effect="plain"
              >预置</el-tag
            >
            <el-tag v-else size="small" type="warning" effect="plain"
              >自定义</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column
          prop="members"
          label="成员数"
          width="80"
          align="center"
        />
        <el-table-column label="权限点" min-width="300">
          <template #default="{ row }">
            <el-tag
              v-for="perm in row.perms.slice(0, 5)"
              :key="perm"
              size="small"
              effect="plain"
              class="perm-tag"
            >
              {{ perm }}
            </el-tag>
            <span v-if="row.perms.length > 5" class="perm-more"
              >+{{ row.perms.length - 5 }}</span
            >
            <span v-if="!row.perms.length" class="perm-empty">未授权</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="desc"
          label="描述"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column prop="updatedAt" label="更新时间" width="110" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              size="small"
              @click="openMembers(row)"
              >成员</el-button
            >
            <el-button link type="primary" size="small" @click="openAuth(row)"
              >授权</el-button
            >
            <el-button
              v-if="row.type === 'custom'"
              link
              type="danger"
              size="small"
              @click="removeRole(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 授权弹窗 -->
    <el-dialog
      v-model="authDialog.visible"
      :title="`角色授权 · ${authDialog.roleName}`"
      width="560px"
    >
      <div v-for="group in permGroups" :key="group.name" class="perm-group">
        <div class="group-title">{{ group.name }}</div>
        <el-checkbox-group v-model="authDialog.perms">
          <el-checkbox v-for="perm in group.perms" :key="perm" :value="perm">
            {{ perm }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <el-button @click="authDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitAuth">保存授权</el-button>
      </template>
    </el-dialog>

    <!-- 新建角色弹窗 -->
    <el-dialog
      v-model="createDialog.visible"
      title="新建自定义角色"
      width="440px"
    >
      <el-form label-width="80px">
        <el-form-item label="角色名称" required>
          <el-input
            v-model="createDialog.name"
            placeholder="如：专项活动运营"
            maxlength="20"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="createDialog.desc"
            type="textarea"
            :rows="2"
            placeholder="满足临时授权等场景"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 查看成员弹窗 -->
    <el-dialog
      v-model="memberDialog.visible"
      :title="`角色成员 · ${memberDialog.roleName}`"
      width="480px"
    >
      <el-table :data="memberDialog.members" stripe size="small">
        <el-table-column prop="name" label="姓名" min-width="80" />
        <el-table-column prop="account" label="账号" min-width="120" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.status === '正常' ? 'success' : 'danger'"
              size="small"
              effect="plain"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="memberDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.page-tip {
  font-size: 13px;
  color: #909399;
}

.role-name {
  font-weight: 500;
  color: #303133;
}

.perm-tag {
  margin-right: 6px;
  margin-bottom: 2px;
}

.perm-more,
.perm-empty {
  font-size: 12px;
  color: #909399;
}

.perm-group {
  margin-bottom: 16px;

  .group-title {
    font-size: 13px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  :deep(.el-checkbox) {
    margin-right: 20px;
  }
}
</style>
