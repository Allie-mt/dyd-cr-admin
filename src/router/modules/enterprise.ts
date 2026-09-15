import type { RouteRecordRaw } from "vue-router";

const enterprise: RouteRecordRaw = {
  path: "enterprise",
  name: "Enterprise",
  component: () => import("@/views/enterprise/index.vue"),
  meta: { title: "企业管理", icon: "OfficeBuilding", permission: "" },
};

export default enterprise;
