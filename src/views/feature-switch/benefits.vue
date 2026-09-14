<script setup lang="ts">
import { reactive } from "vue";
import { ElMessage } from "element-plus";

// 档位 × 权益位矩阵：行 = 权益项，列 = 会员档位
interface BenefitRow {
  name: string;
  free: boolean;
  standard: boolean;
  pro: boolean;
  flagship: boolean;
}

interface BenefitGroup {
  name: string;
  rows: BenefitRow[];
}

const levelColumns = [
  { key: "free" as const, label: "免费版" },
  { key: "standard" as const, label: "标准版" },
  { key: "pro" as const, label: "专业版" },
  { key: "flagship" as const, label: "旗舰版" },
];

const groups = reactive<BenefitGroup[]>([
  {
    name: "可用模型",
    rows: [
      {
        name: "脚本大师",
        free: true,
        standard: true,
        pro: true,
        flagship: true,
      },
      {
        name: "图片生成 3.0",
        free: true,
        standard: true,
        pro: true,
        flagship: true,
      },
      {
        name: "视频生成 2.0",
        free: false,
        standard: true,
        pro: true,
        flagship: true,
      },
      {
        name: "视频生成 2.5（灰度）",
        free: false,
        standard: false,
        pro: true,
        flagship: true,
      },
      {
        name: "数字人 A3",
        free: false,
        standard: false,
        pro: true,
        flagship: true,
      },
    ],
  },
  {
    name: "分辨率",
    rows: [
      { name: "480p", free: true, standard: true, pro: true, flagship: true },
      { name: "720p", free: false, standard: true, pro: true, flagship: true },
      {
        name: "1080p",
        free: false,
        standard: false,
        pro: true,
        flagship: true,
      },
      { name: "4K", free: false, standard: false, pro: false, flagship: true },
    ],
  },
  {
    name: "画质",
    rows: [
      { name: "标清", free: true, standard: true, pro: true, flagship: true },
      { name: "高清", free: false, standard: true, pro: true, flagship: true },
      { name: "超清", free: false, standard: false, pro: true, flagship: true },
    ],
  },
  {
    name: "功能",
    rows: [
      {
        name: "字幕处理",
        free: false,
        standard: true,
        pro: true,
        flagship: true,
      },
      {
        name: "批量生成",
        free: false,
        standard: false,
        pro: true,
        flagship: true,
      },
      {
        name: "优先队列",
        free: false,
        standard: false,
        pro: false,
        flagship: true,
      },
      {
        name: "API 调用",
        free: false,
        standard: false,
        pro: true,
        flagship: true,
      },
    ],
  },
]);

function saveGroup(group: BenefitGroup) {
  ElMessage.success(`「${group.name}」权益矩阵已保存，已写入审计日志`);
}
</script>

<template>
  <div class="page-container">
    <div class="filter-bar">
      <span class="page-tip"
        >配置 C 端各档位默认权益；用户实际权限 = 档位权益 +
        白名单加成，白名单优先级更高</span
      >
    </div>

    <div
      v-for="group in groups"
      :key="group.name"
      class="card-panel group-card"
    >
      <div class="group-header">
        <span class="group-title">{{ group.name }}</span>
        <el-button type="primary" size="small" @click="saveGroup(group)"
          >保存</el-button
        >
      </div>
      <el-table :data="group.rows" size="default" style="width: 100%">
        <el-table-column prop="name" label="权益项" min-width="200" />
        <el-table-column
          v-for="col in levelColumns"
          :key="col.key"
          :label="col.label"
          width="110"
          align="center"
        >
          <template #default="{ row }">
            <el-checkbox v-model="row[col.key]" />
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-tip {
  font-size: 13px;
  color: #909399;
}

.group-card {
  margin-bottom: 16px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .group-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
}
</style>
