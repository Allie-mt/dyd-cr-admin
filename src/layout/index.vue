<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import Sidebar from './components/Sidebar.vue'
import Navbar from './components/Navbar.vue'

const appStore = useAppStore()
</script>

<template>
  <div class="layout" :class="{ 'is-collapsed': appStore.collapsed }">
    <Sidebar />
    <div class="layout-main">
      <Navbar />
      <main class="layout-content">
        <router-view v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  height: 100%;

  &-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &-content {
    flex: 1;
    overflow-y: auto;
  }
}

// 路由切换过渡
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>
