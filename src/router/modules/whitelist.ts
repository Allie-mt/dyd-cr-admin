import type { RouteRecordRaw } from "vue-router";

const whitelist: RouteRecordRaw = {
  path: "whitelist",
  name: "Whitelist",
  component: () => import("@/views/whitelist/index.vue"),
  meta: { title: "白名单管理", icon: "CircleCheck", permission: "" },
};

export default whitelist;
