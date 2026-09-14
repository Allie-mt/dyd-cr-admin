import { defineStore } from 'pinia'
import { ref } from 'vue'

// 应用全局状态：侧边栏折叠
export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)

  function toggleSidebar() {
    collapsed.value = !collapsed.value
  }

  return { collapsed, toggleSidebar }
})
