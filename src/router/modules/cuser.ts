import type { RouteRecordRaw } from "vue-router";

const cuser: RouteRecordRaw = {
  path: "cuser",
  name: "CUser",
  component: () => import("@/views/cuser/index.vue"),
  meta: { title: "C端用户管理", icon: "User", permission: "" },
};

export default cuser;
