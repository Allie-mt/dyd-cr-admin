<!-- 登录页面 -->
<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { md5 } from "js-md5";
import { userAccountLogin } from "@/api/user";
import myLocalStorage from "@/utils/myLocalStorage";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const formRef = ref<FormInstance>();
const loading = ref(false);
const showPassword = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
  remember: true,
});

const rules: FormRules<typeof loginForm> = {
  username: [{ required: true, message: "请输入账号", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

async function routerPush() {
  try {
    await userStore.getPermissionIds();
  } catch (error) {
    ElMessage.error("权限服务出错，请联系技术人员处理。");
    return;
  }

  if (!userStore.permissionIdList.length) {
    ElMessage.warning("您没有权限访问，请联系管理员。");
    myLocalStorage.removeAll();
    return;
  }

  const redirectUrl = route.query.redirectUrl as string;
  if (redirectUrl) {
    const decoded = decodeURIComponent(redirectUrl);
    if (decoded !== "/" && decoded !== "/login") {
      router.push(decoded);
      return;
    }
  }
  const redirect = route.query.redirect as string;
  if (redirect && redirect !== "/login") {
    router.push(redirect);
  } else {
    router.push("/");
  }
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false);
  if (!valid) return;

  loading.value = true;
  try {
    const res = await userAccountLogin({
      username: loginForm.username,
      password: md5(loginForm.password),
    });
    if (res.code === "000000" && res.data) {
      const { data } = res;

      userStore.clearUserInfo();

      myLocalStorage.setLocalToken(data.access_token);
      myLocalStorage.setRefreshToken(data.refresh_token);
      if (data.avatar) {
        myLocalStorage.setLocalAvatar(data.avatar);
      }

      userStore.initUserInfo();

      await routerPush();
    } else {
      ElMessage.error(res.msg || res.error_description || "登录失败");
    }
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : "登录失败");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <!-- 左侧品牌区 -->
    <div class="brand-pane">
      <div class="brand-grid" />
      <div class="brand-glow brand-glow--1" />
      <div class="brand-glow brand-glow--2" />
      <div class="brand-body">
        <div class="brand-mark">CR+</div>
        <h1 class="brand-title">CR+ 平台后台</h1>
        <p class="brand-sub">企业级权限管控与运营中枢</p>
        <ul class="brand-features">
          <li>
            <span class="dot" />
            企业管理与 C 端用户一体化治理
          </li>
          <li>
            <span class="dot" />
            细粒度角色权限与菜单授权
          </li>
          <li>
            <span class="dot" />
            功能开关 · 审计日志 · 白名单体系
          </li>
        </ul>
      </div>
      <div class="brand-footer">© 2026 CR+ Platform · 权限体系 v1.0</div>
    </div>

    <!-- 右侧表单区 -->
    <div class="form-pane">
      <div class="login-card">
        <h2 class="login-title">欢迎回来</h2>
        <p class="login-desc">请使用平台管理员账号登录</p>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          size="large"
          @keyup.enter="handleLogin"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="账号"
              :prefix-icon="'User'"
              autocomplete="username"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="密码"
              :prefix-icon="'Lock'"
              autocomplete="current-password"
            >
              <template #suffix>
                <el-icon class="pwd-toggle" @click="showPassword = !showPassword">
                  <View v-if="showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
          </div>

          <el-button
            class="login-btn"
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
          >
            {{ loading ? "登录中…" : "登 录" }}
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  display: flex;
  height: 100%;
  background: #fff;
}

// ===== 左侧品牌区 =====
.brand-pane {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 46%;
  min-width: 420px;
  padding: 64px;
  color: #fff;
  background: linear-gradient(150deg, $primary 0%, $primary-dark 55%, $primary-deep 100%);
  overflow: hidden;

  // 点阵纹理
  .brand-grid {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(rgba(255, 255, 255, 0.14) 1px, transparent 1px);
    background-size: 26px 26px;
  }

  // 柔光装饰
  .brand-glow {
    position: absolute;
    border-radius: 50%;
    filter: blur(70px);

    &--1 {
      width: 340px;
      height: 340px;
      right: -100px;
      top: -80px;
      background: rgba(255, 255, 255, 0.12);
    }

    &--2 {
      width: 260px;
      height: 260px;
      left: -70px;
      bottom: -60px;
      background: rgba(0, 0, 0, 0.18);
    }
  }

  .brand-body {
    position: relative;
    z-index: 1;
  }

  .brand-mark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.12);
    border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(6px);
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 1px;
    margin-bottom: 28px;
  }

  .brand-title {
    font-size: 34px;
    font-weight: 700;
    letter-spacing: 2px;
    margin-bottom: 12px;
  }

  .brand-sub {
    font-size: 15px;
    opacity: 0.85;
    margin-bottom: 44px;
  }

  .brand-features {
    list-style: none;

    li {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      font-size: 14px;
      opacity: 0.92;

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #7dd3fc;
        flex-shrink: 0;
      }
    }
  }

  .brand-footer {
    position: absolute;
    bottom: 28px;
    left: 64px;
    font-size: 12px;
    opacity: 0.55;
  }
}

// ===== 右侧表单区 =====
.form-pane {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
}

.login-card {
  width: 380px;
  padding: 44px 40px 32px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 58, 104, 0.1);
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: $text-main;
}

.login-desc {
  margin: 8px 0 28px;
  font-size: 14px;
  color: $text-secondary;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  font-weight: 600;
  letter-spacing: 6px;
}

.login-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 24px;
  padding: 9px;
  font-size: 13px;
  color: $primary;
  background: $primary-faint-bg;
  border-radius: 6px;

  .el-icon {
    font-size: 14px;
  }
}

.pwd-toggle {
  cursor: pointer;
  color: $text-secondary;

  &:hover {
    color: $primary;
  }
}

// 小屏时隐藏品牌区
@media (max-width: 900px) {
  .brand-pane {
    display: none;
  }
}
</style>
