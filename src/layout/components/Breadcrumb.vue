<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 由 matched 链生成：首页 / [父模块] / 当前页
const crumbs = computed(() => {
  const list = [{ title: '首页', path: '/dashboard', current: false }]
  route.matched
    .filter((item) => item.path !== '/' && item.meta?.title)
    .forEach((item) => {
      const isLeaf = item === route.matched.at(-1)
      list.push({
        title: item.meta?.title as string,
        path: isLeaf ? route.path : item.path,
        current: isLeaf,
      })
    })
  return list
})
</script>

<template>
  <el-breadcrumb class="breadcrumb" separator="/">
    <el-breadcrumb-item v-for="crumb in crumbs" :key="crumb.path">
      <span :class="{ 'crumb-active': crumb.current }">{{ crumb.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style lang="scss" scoped>
.breadcrumb {
  font-size: 14px;

  .crumb-active {
    color: $text-main;
    font-weight: 500;
  }
}
</style>
