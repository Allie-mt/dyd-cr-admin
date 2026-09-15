import type { RouteRecordRaw } from "vue-router";

const auditLog: RouteRecordRaw = {
  path: "audit-log",
  name: "AuditLog",
  component: () => import("@/views/audit-log/index.vue"),
  meta: { title: "审计日志", icon: "Document", permission: "" },
};

export default auditLog;
