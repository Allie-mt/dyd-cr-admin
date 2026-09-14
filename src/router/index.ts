import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useUserStore } from "@/stores/user";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "首页", icon: "Odometer" },
      },
      // ===== 企业管理（B 端） =====
      {
        path: "enterprise",
        name: "Enterprise",
        component: () => import("@/views/enterprise/index.vue"),
        meta: { title: "企业管理", icon: "OfficeBuilding" },
      },
      // ===== C 端用户管理 =====
      {
        path: "cuser",
        name: "CUser",
        component: () => import("@/views/cuser/index.vue"),
        meta: { title: "C端用户管理", icon: "User" },
      },
      // ===== 角色与权限管理 =====
      {
        path: "role",
        redirect: "/role/platform",
        meta: { title: "角色与权限管理", icon: "Key" },
        children: [
          {
            path: "platform",
            name: "PlatformRole",
            component: () => import("@/views/role/platform.vue"),
            meta: { title: "平台角色" },
          },
          {
            path: "accounts",
            name: "Accounts",
            component: () => import("@/views/role/accounts.vue"),
            meta: { title: "后台账号" },
          },
        ],
      },
      // ===== 功能开关管理 =====
      {
        path: "feature-switch",
        redirect: "/feature-switch/points",
        meta: { title: "功能开关管理", icon: "Open" },
        children: [
          {
            path: "points",
            name: "PermPoints",
            component: () => import("@/views/feature-switch/points.vue"),
            meta: { title: "权限点管理" },
          },
          {
            path: "models",
            name: "ModelSwitch",
            component: () => import("@/views/feature-switch/models.vue"),
            meta: { title: "模型开关" },
          },
          {
            path: "funcs",
            name: "FuncSwitch",
            component: () => import("@/views/feature-switch/funcs.vue"),
            meta: { title: "功能开关" },
          },
          {
            path: "benefits",
            name: "Benefits",
            component: () => import("@/views/feature-switch/benefits.vue"),
            meta: { title: "会员权益配置" },
          },
        ],
      },
      // ===== 审计日志 =====
      {
        path: "audit-log",
        name: "AuditLog",
        component: () => import("@/views/audit-log/index.vue"),
        meta: { title: "审计日志", icon: "Document" },
      },
      // ===== 白名单管理 =====
      {
        path: "whitelist",
        name: "Whitelist",
        component: () => import("@/views/whitelist/index.vue"),
        meta: { title: "白名单管理", icon: "CircleCheck" },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 登录守卫：无 token 一律回登录页
router.beforeEach((to) => {
  const userStore = useUserStore();
  const pageTitle =
    to.meta.title || (to.matched.at(-1)?.meta?.title as string | undefined);
  document.title = pageTitle ? `${pageTitle} · CR+ 平台后台` : "CR+ 平台后台";

  if (!userStore.token && to.name !== "Login") {
    return { name: "Login", query: { redirect: to.fullPath } };
  }
  if (userStore.token && to.name === "Login") {
    return { path: "/" };
  }
});

export default router;
