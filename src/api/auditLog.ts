import { request } from "@/utils/request";
import { opLogs, loginLogs, permLogs } from "@/mock/auditLog";
import type { OpLog, LoginLog, PermLog } from "@/mock/auditLog";

export type { OpLog, LoginLog, PermLog };

/** 审计日志 - 接口类型定义 */

/**
 * 获取操作日志（后台所有写操作记录：加购、封号、套餐变更等）
 * 真实接口：GET /api/audit/op-logs
 */
export const getOpLogs = async (params?: {
  keyword?: string;
  action?: string;
  dateRange?: string[];
}): Promise<OpLog[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/audit/op-logs", "get", params);
  return opLogs;
};

/**
 * 获取登录日志（后台管理员登录成功/失败记录）
 * 真实接口：GET /api/audit/login-logs
 */
export const getLoginLogs = async (params?: {
  keyword?: string;
  result?: string;
  dateRange?: string[];
}): Promise<LoginLog[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/audit/login-logs", "get", params);
  return loginLogs;
};

/**
 * 获取权限变更日志（角色分配、白名单、套餐变更等权限操作记录）
 * 真实接口：GET /api/audit/perm-logs
 */
export const getPermLogs = async (params?: {
  keyword?: string;
  targetType?: string;
  dateRange?: string[];
}): Promise<PermLog[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/audit/perm-logs", "get", params);
  return permLogs;
};
