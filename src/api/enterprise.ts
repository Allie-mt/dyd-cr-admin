import { request } from "@/utils/request";
import { enterprises, getDeptTree, getStaffs, getEntRoles } from "@/mock/buser";
import type { Enterprise, DeptNode, EntStaff, EntRole } from "@/mock/buser";
import type { PageParams, PageResult } from "./common";

export type { Enterprise, DeptNode, EntStaff, EntRole };

export interface EnterpriseListParams extends PageParams {
  keyword?: string;
  plan?: string;
  status?: string;
}

export interface PointsLog {
  time: string;
  type: string;
  amount: number;
  balance: number;
  operator: string;
}

export interface EntStats {
  total: number;
  totalHint: string;
  totalHintType: "success" | "danger" | "warning";
  cUserCount: number;
  cUserCountHint: string;
  cUserCountHintType: "success" | "danger" | "warning";
  pendingRenew: number;
  pendingRenewHint: string;
  pendingRenewHintType: "success" | "danger" | "warning";
  frozen: number;
  frozenHint: string;
  frozenHintType: "success" | "danger" | "warning";
}
// 获取企业列表
export const getEnterpriseList = async (
  params: EnterpriseListParams,
): Promise<PageResult<Enterprise>> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/list", "get", params);
  let data = [...enterprises];
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    data = data.filter(
      (e) => e.name.toLowerCase().includes(kw) || e.code.toLowerCase().includes(kw),
    );
  }
  if (params.plan) data = data.filter((e) => e.plan === params.plan);
  if (params.status) data = data.filter((e) => e.status === params.status);
  const total = data.length;
  const start = (params.pageNo - 1) * params.pageSize;
  const list = data.slice(start, start + params.pageSize);
  return { list, total };
};
// 创建企业
export const createEnterprise = async (data: {
  name: string;
  creditCode: string;
  plan: string;
  adminName: string;
  adminPhone: string;
  points?: number;
  signDate?: string;
}): Promise<Enterprise> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/create", "post", data);
  const maxId = enterprises.reduce((max, e) => Math.max(max, e.id), 0);
  const signDate = data.signDate || new Date().toISOString().slice(0, 10);
  const ent: Enterprise = {
    id: maxId + 1,
    code: `ENT-${String(maxId + 1).padStart(4, "0")}`,
    name: data.name,
    creditCode: data.creditCode,
    plan: data.plan as Enterprise["plan"],
    pointsTotal: data.points ?? 50000,
    pointsUsed: 0,
    planStart: signDate,
    planExpire: (() => {
      const d = new Date(signDate);
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().slice(0, 10);
    })(),
    status: "normal",
    adminName: data.adminName,
    memberCount: 0,
    createdAt: signDate,
  };
  enterprises.push(ent);
  return { ...ent };
};
// 获取企业详情
export const getEnterpriseDetail = async (entId: number): Promise<Enterprise | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/detail", "get", { entId });
  return enterprises.find((e) => e.id === entId);
};
// 升级/降级/续费企业计划
export const changePlan = async (
  entId: number,
  action: "upgrade" | "downgrade" | "renew",
  data: { plan?: string; expireAt?: string },
): Promise<Enterprise | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/plan", "post", { entId, action, ...data });
  const ent = enterprises.find((e) => e.id === entId);
  if (!ent) return undefined;
  if (action === "renew" && data.expireAt) {
    ent.planExpire = data.expireAt;
  } else if (data.plan) {
    ent.plan = data.plan as Enterprise["plan"];
  }
  return { ...ent };
};
// 调整企业配额
export const adjustQuota = async (
  entId: number,
  action: "add" | "adjust",
  amount: number,
  remark: string,
): Promise<Enterprise | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/quota", "post", { entId, action, amount, remark });
  const ent = enterprises.find((e) => e.id === entId);
  if (!ent) return undefined;
  if (action === "add") {
    ent.pointsTotal += amount;
  } else {
    ent.pointsTotal = amount;
  }
  return { ...ent };
};
// 冻结企业
export const freezeEnterprise = async (entId: number): Promise<Enterprise | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/freeze", "post", { entId });
  const ent = enterprises.find((e) => e.id === entId);
  if (!ent) return undefined;
  ent.status = "frozen";
  return { ...ent };
};
// 解冻企业
export const unfreezeEnterprise = async (entId: number): Promise<Enterprise | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/unfreeze", "post", { entId });
  const ent = enterprises.find((e) => e.id === entId);
  if (!ent) return undefined;
  ent.status = "normal";
  return { ...ent };
};
// 注销企业
export const cancelEnterprise = async (entId: number): Promise<Enterprise | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/cancel", "post", { entId });
  const ent = enterprises.find((e) => e.id === entId);
  if (!ent) return undefined;
  ent.status = "cancelled";
  return { ...ent };
};
// 重置企业管理员密码
export const resetAdmin = async (
  entId: number,
  newAdmin: string,
): Promise<Enterprise | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/reset-admin", "post", { entId, newAdmin });
  const ent = enterprises.find((e) => e.id === entId);
  if (!ent) return undefined;
  ent.adminName = newAdmin;
  return { ...ent };
};
// 获取企业部门树
export const getDeptTreeApi = async (entId: number): Promise<DeptNode[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/dept-tree", "get", { entId });
  return getDeptTree(entId);
};
// 获取企业员工
export const getStaffsApi = async (entId: number): Promise<EntStaff[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/staffs", "get", { entId });
  return getStaffs(entId);
};
// 获取企业角色
export const getEntRolesApi = async (entId: number): Promise<EntRole[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/roles", "get", { entId });
  return getEntRoles(entId);
};
// 获取企业积分日志
export const getPointsLogs = async (entId: number): Promise<PointsLog[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/points-logs", "get", { entId });
  return [
    {
      time: "2026-09-10 14:22",
      type: "加购",
      amount: 100000,
      balance: 500000,
      operator: "财务-吴倩",
    },
    { time: "2026-08-15 09:40", type: "消耗", amount: -12450, balance: 400000, operator: "系统" },
    {
      time: "2026-07-02 16:18",
      type: "调整",
      amount: 20000,
      balance: 412450,
      operator: "系统管理员",
    },
    { time: "2026-06-11 11:05", type: "消耗", amount: -8320, balance: 392450, operator: "系统" },
  ];
};
// 获取企业统计卡片信息
export const getEntStats = async (): Promise<EntStats> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/enterprise/stats", "get");
  const RENEW_WINDOW_DAYS = 30;
  const now = Date.now();
  const pendingRenewCount = enterprises.filter((e) => {
    if (e.status === "cancelled") return false;
    const diffDays = (new Date(e.planExpire).getTime() - now) / 86400000;
    return diffDays <= RENEW_WINDOW_DAYS;
  }).length;
  const frozenCount = enterprises.filter((e) => e.status === "frozen").length;
  const newEntCount = enterprises.filter((e) => {
    const diffDays = (now - new Date(e.createdAt).getTime()) / 86400000;
    return diffDays <= 30;
  }).length;
  return {
    total: enterprises.length,
    totalHint: `近30天新增 ${newEntCount} 家`,
    totalHintType: newEntCount > 0 ? "success" : "warning",
    cUserCount: 25680,
    cUserCountHint: "近30天新增 128 人",
    cUserCountHintType: "success",
    pendingRenew: pendingRenewCount,
    pendingRenewHint: pendingRenewCount > 0 ? `${pendingRenewCount} 家即将到期` : "暂无",
    pendingRenewHintType: pendingRenewCount > 0 ? "danger" : "success",
    frozen: frozenCount,
    frozenHint: frozenCount > 0 ? `${frozenCount} 家需关注` : "暂无冻结",
    frozenHintType: frozenCount > 0 ? "warning" : "success",
  };
};
