import type { RouteRecordRaw } from "vue-router";

const role: RouteRecordRaw = {
  path: "role",
  redirect: "/role/platform",
  meta: { title: "角色与权限管理", icon: "Key", permission: "" },
  children: [
    {
      path: "platform",
      name: "PlatformRole",
      component: () => import("@/views/role/platform.vue"),
      meta: { title: "平台角色", permission: "" },
    },
    {
      path: "accounts",
      name: "Accounts",
      component: () => import("@/views/role/accounts.vue"),
      meta: { title: "后台账号", permission: "" },
    },
  ],
};

export default role;
