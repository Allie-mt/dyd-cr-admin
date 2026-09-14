<script setup lang="ts">
import { reactive } from "vue";
import { ElMessage } from "element-plus";

type ReleaseMode = "全量" | "按比例灰度" | "白名单";

interface FuncSwitch {
  key: string;
  name: string;
  desc: string;
  enabled: boolean;
  mode: ReleaseMode;
  ratio: number;
}

const funcs = reactive<FuncSwitch[]>([
  {
    key: "script",
    name: "脚本生成",
    desc: "AI 脚本创作模块",
    enabled: true,
    mode: "全量",
    ratio: 100,
  },
  {
    key: "image",
    name: "图片生成",
    desc: "文生图与图片编辑",
    enabled: true,
    mode: "全量",
    ratio: 100,
  },
  {
    key: "video",
    name: "视频生成",
    desc: "文生视频模块",
    enabled: true,
    mode: "按比例灰度",
    ratio: 50,
  },
  {
    key: "digital",
    name: "数字人",
    desc: "数字人克隆与制作",
    enabled: true,
    mode: "白名单",
    ratio: 0,
  },
  {
    key: "subtitle",
    name: "字幕处理",
    desc: "字幕识别与擦除",
    enabled: true,
    mode: "按比例灰度",
    ratio: 20,
  },
]);

const modes: ReleaseMode[] = ["全量", "按比例灰度", "白名单"];

function toggleFunc(item: FuncSwitch) {
  ElMessage.success(
    `功能「${item.name}」已${item.enabled ? "开启" : "关闭"}，已写入审计日志`,
  );
}

function saveGray(item: FuncSwitch) {
  const scope =
    item.mode === "全量"
      ? "全量发布"
      : item.mode === "白名单"
        ? "仅白名单可用"
        : `灰度放量 ${item.ratio}%`;
  ElMessage.success(`「${item.name}」发布策略已保存：${scope}`);
}
</script>

<template>
  <div class="page-container">
    <div class="filter-bar">
      <span class="page-tip"
        >全局控制功能模块上下线；灰度支持按用户比例放量或仅白名单可用，关闭总开关后灰度策略不生效</span
      >
    </div>

    <div v-for="item in funcs" :key="item.key" class="card-panel func-card">
      <div class="func-header">
        <div class="func-info">
          <span class="func-name">{{ item.name }}</span>
          <span class="func-desc">{{ item.desc }}</span>
        </div>
        <el-switch v-model="item.enabled" @change="toggleFunc(item)" />
      </div>

      <div class="func-body">
        <div class="gray-row">
          <span class="gray-label">发布策略</span>
          <el-radio-group
            v-model="item.mode"
            :disabled="!item.enabled"
            size="small"
          >
            <el-radio-button v-for="m in modes" :key="m" :value="m">{{
              m
            }}</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="item.mode === '按比例灰度' && item.enabled" class="gray-row">
          <span class="gray-label">放量比例</span>
          <el-slider
            v-model="item.ratio"
            :min="0"
            :max="100"
            :step="5"
            style="flex: 1; margin: 0 16px"
          />
          <span class="gray-value">{{ item.ratio }}%</span>
        </div>
        <el-alert
          v-if="item.mode === '白名单' && item.enabled"
          type="info"
          :closable="false"
          show-icon
          title="当前策略下仅白名单内用户可使用该功能，可前往「白名单管理」配置开白名单单"
        />
        <div class="gray-actions">
          <el-button
            type="primary"
            size="small"
            :disabled="!item.enabled"
            @click="saveGray(item)"
          >
            保存策略
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-tip {
  font-size: 13px;
  color: #909399;
}

.func-card {
  margin-bottom: 16px;
}

.func-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;

  .func-name {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
    margin-right: 10px;
  }

  .func-desc {
    font-size: 13px;
    color: #909399;
  }
}

.func-body {
  background: $primary-faint-bg;
  border-radius: 8px;
  padding: 14px 16px;
}

.gray-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;

  .gray-label {
    width: 70px;
    font-size: 13px;
    color: #606266;
    flex-shrink: 0;
  }

  .gray-value {
    width: 44px;
    text-align: right;
    font-size: 13px;
    font-weight: 600;
    color: $primary;
  }
}

.gray-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0;
}
</style>
