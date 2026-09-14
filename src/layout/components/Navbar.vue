<script setup lang="ts">
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";
import { useAppStore } from "@/stores/app";
import { useUserStore } from "@/stores/user";
import Breadcrumb from "./Breadcrumb.vue";

const appStore = useAppStore();
const userStore = useUserStore();
const router = useRouter();

function handleCommand(command: string) {
  if (command === "logout") {
    ElMessageBox.confirm("确定要退出登录吗？", "提示", {
      confirmButtonText: "退出",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      userStore.logout();
      router.push("/login");
    });
  }
}
</script>

<template>
  <header class="navbar">
    <div class="navbar-left">
      <el-tooltip
        :content="appStore.collapsed ? '展开菜单' : '折叠菜单'"
        placement="bottom"
      >
        <button class="collapse-btn" @click="appStore.toggleSidebar()">
          <el-icon :size="18">
            <Expand v-if="appStore.collapsed" />
            <Fold v-else />
          </el-icon>
        </button>
      </el-tooltip>
      <Breadcrumb />
    </div>

    <div class="navbar-right">
      <el-tooltip content="消息通知" placement="bottom">
        <el-badge :value="3" class="notice-badge">
          <button class="icon-btn">
            <el-icon :size="17"><Bell /></el-icon>
          </button>
        </el-badge>
      </el-tooltip>

      <el-dropdown trigger="click" @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="30" class="user-avatar">
            {{ userStore.userInfo?.nickname?.charAt(0) || "A" }}
          </el-avatar>
          <span class="user-name">{{
            userStore.userInfo?.nickname || "未登录"
          }}</span>
          <el-icon :size="12" color="#9ca3af"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item disabled>
              {{ userStore.userInfo?.role }} ·
              {{ userStore.userInfo?.username }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $navbar-height;
  padding: 0 16px;
  background: #fff;
  border-bottom: 1px solid $border-color;
  flex-shrink: 0;

  &-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }
}

.collapse-btn,
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: $text-regular;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: $primary-soft-bg;
    color: $primary;
  }
}

.notice-badge {
  :deep(.el-badge__content) {
    background: $danger;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;

  &:hover {
    background: #f3f4f6;
  }

  .user-avatar {
    background: linear-gradient(135deg, $primary, $primary-deep);
    font-size: 14px;
    font-weight: 600;
  }

  .user-name {
    font-size: 14px;
    color: $text-main;
  }
}
</style>
