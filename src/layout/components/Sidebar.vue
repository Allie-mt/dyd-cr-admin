<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, type RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const route = useRoute()

interface MenuItem {
  path: string
  title: string
  icon?: string
  children?: { path: string; title: string }[]
}

// 从主布局路由下读取菜单，保持单一数据源
const menus = computed<MenuItem[]>(() => {
  const mainRoute = route.matched.find((item) => item.path === '/')
  return (mainRoute?.children || [])
    .filter((child: RouteRecordRaw) => child.meta?.title)
    .map((child: RouteRecordRaw) => ({
      path: '/' + child.path,
      title: child.meta?.title as string,
      icon: child.meta?.icon as string | undefined,
      children: child.children?.length
        ? child.children
            .filter((sub) => sub.meta?.title)
            .map((sub) => ({
              path: '/' + child.path + '/' + sub.path,
              title: sub.meta?.title as string,
            }))
        : undefined,
    }))
})

const activeMenu = computed(() => route.path)
const expandedKeys = computed(() => [route.matched.find((m) => m.children?.length)?.path || ''])
</script>

<template>
  <aside class="sidebar" :class="{ 'is-collapsed': appStore.collapsed }">
    <div class="sidebar-logo">
      <div class="logo-badge">CR+</div>
      <transition name="logo-text">
        <span v-show="!appStore.collapsed" class="logo-title">平台后台</span>
      </transition>
    </div>

    <el-scrollbar class="sidebar-scroll">
      <el-menu
        class="sidebar-menu"
        :default-active="activeMenu"
        :default-openeds="expandedKeys"
        :collapse="appStore.collapsed"
        :collapse-transition="false"
        unique-opened
        router
      >
        <template v-for="menu in menus" :key="menu.path">
          <!-- 二级菜单 -->
          <el-sub-menu v-if="menu.children?.length" :index="menu.path">
            <template #title>
              <el-icon>
                <component :is="menu.icon" />
              </el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item v-for="child in menu.children" :key="child.path" :index="child.path">
              {{ child.title }}
            </el-menu-item>
          </el-sub-menu>

          <!-- 一级菜单 -->
          <el-menu-item v-else :index="menu.path">
            <el-icon>
              <component :is="menu.icon" />
            </el-icon>
            <template #title>{{ menu.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  width: $sidebar-width;
  height: 100%;
  background: $bg-sidebar;
  border-right: 1px solid $border-color;
  transition: width 0.25s ease;
  overflow: hidden;

  &.is-collapsed {
    width: $sidebar-collapsed-width;
  }

  &-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    height: $navbar-height;
    padding: 0 14px;
    flex-shrink: 0;
    border-bottom: 1px solid $border-color;
    white-space: nowrap;

    .logo-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, $primary, $primary-deep);
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
      flex-shrink: 0;
    }

    .logo-title {
      font-size: 16px;
      font-weight: 600;
      color: $text-main;
    }
  }

  &-scroll {
    flex: 1;
  }

  &-menu {
    border-right: none;
    padding: 8px;

    &:not(.el-menu--collapse) {
      width: $sidebar-width;
    }

    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 44px;
      margin-bottom: 4px;
      border-radius: 6px;
      color: $text-regular;

      .el-icon {
        color: $text-secondary;
      }

      &:hover {
        background: $primary-hover-bg;

        .el-icon {
          color: $primary;
        }
      }
    }

    :deep(.el-menu-item.is-active) {
      background: $primary;
      color: #fff;

      .el-icon {
        color: #fff;
      }
    }

    :deep(.el-menu--inline) {
      .el-menu-item {
        height: 38px;
        margin-bottom: 2px;
        padding-left: 52px !important;
        font-size: 13px;
      }
    }
  }
}

.logo-text-enter-active,
.logo-text-leave-active {
  transition: opacity 0.2s ease;
}
.logo-text-enter-from,
.logo-text-leave-to {
  opacity: 0;
}
</style>
