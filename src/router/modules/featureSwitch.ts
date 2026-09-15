import type { RouteRecordRaw } from "vue-router";

const featureSwitch: RouteRecordRaw = {
  path: "feature-switch",
  redirect: "/feature-switch/points",
  meta: { title: "功能开关管理", icon: "Open", permission: "" },
  children: [
    {
      path: "points",
      name: "PermPoints",
      component: () => import("@/views/feature-switch/points.vue"),
      meta: { title: "权限点管理", permission: "" },
    },
    {
      path: "models",
      name: "ModelSwitch",
      component: () => import("@/views/feature-switch/models.vue"),
      meta: { title: "模型开关", permission: "" },
    },
    {
      path: "funcs",
      name: "FuncSwitch",
      component: () => import("@/views/feature-switch/funcs.vue"),
      meta: { title: "功能开关", permission: "" },
    },
    {
      path: "benefits",
      name: "Benefits",
      component: () => import("@/views/feature-switch/benefits.vue"),
      meta: { title: "会员权益配置", permission: "" },
    },
  ],
};

export default featureSwitch;
