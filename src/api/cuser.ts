import { request } from "@/utils/request";
import { cusers } from "@/mock/cuser";
import type { CUser, Level, CStatus, PointsAction } from "@/mock/cuser";
import type { PageParams, PageResult } from "./common";

export type { CUser, Level, CStatus, PointsAction };

/** C端用户管理 - 接口类型定义 */

/** 用户列表查询参数 */
export interface CUserListParams extends PageParams {
  keyword?: string;
  level?: string;
  status?: string;
}

/** 用户点数流水记录 */
export interface CUserPointsLog {
  time: string;
  type: string;
  amount: number;
  balance: number;
  remark: string;
}

/** 用户生成记录 */
export interface CUserGenLog {
  time: string;
  type: string;
  model: string;
  points: number;
}

/** 用户登录设备信息 */
export interface CUserDevice {
  id: number;
  name: string;
  platform: string;
  lastActive: string;
  current: boolean;
}

/** 用户白名单（灰度模型/特殊规格等） */
export interface CUserWhitelist {
  type: string;
  name: string;
  expireAt: string;
  remark: string;
}

/** 用户首页统计卡片数据 */
export interface CUserStats {
  total: number;
  advancedCount: number;
  standardCount: number;
  basicCount: number;
}

/**
 * 获取C端用户列表（分页 + 搜索 + 筛选）
 * 真实接口：GET /api/cuser/list
 */
export const getCUserList = async (params: CUserListParams): Promise<PageResult<CUser>> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/list", "get", params);
  let data = [...cusers];
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    data = data.filter(
      (u) =>
        u.nickname.toLowerCase().includes(kw) || u.phone.includes(kw) || String(u.id).includes(kw),
    );
  }
  if (params.level) data = data.filter((u) => u.level === params.level);
  if (params.status) data = data.filter((u) => u.status === params.status);
  const total = data.length;
  const start = (params.pageNo - 1) * params.pageSize;
  const list = data.slice(start, start + params.pageSize);
  return { list, total };
};

/**
 * 获取C端用户详情（按用户ID）
 * 真实接口：GET /api/cuser/detail
 */
export const getCUserDetail = async (userId: number): Promise<CUser | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/detail", "get", { userId });
  return cusers.find((u) => u.id === userId);
};

/**
 * 调整用户会员档位（免费版/基础版/标准版/高级版）
 * 真实接口：POST /api/cuser/level
 */
export const adjustLevel = async (userId: number, level: Level): Promise<CUser | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/level", "post", { userId, level });
  const user = cusers.find((u) => u.id === userId);
  if (!user) return undefined;
  user.level = level;
  user.levelStart = new Date().toISOString().slice(0, 10);
  user.levelExpire =
    level === "免费版"
      ? ""
      : (() => {
          const d = new Date();
          d.setFullYear(d.getFullYear() + 1);
          return d.toISOString().slice(0, 10);
        })();
  return { ...user };
};

/**
 * 用户点数操作（赠送/扣减/冻结）
 * 真实接口：POST /api/cuser/points
 */
export const pointsAction = async (
  userId: number,
  action: PointsAction,
  amount: number,
  remark: string,
): Promise<CUser | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/points", "post", { userId, action, amount, remark });
  const user = cusers.find((u) => u.id === userId);
  if (!user) return undefined;
  if (action === "gift") user.points += amount;
  if (action === "deduct") user.points -= amount;
  if (action === "freeze") {
    user.points -= amount;
    user.frozenPoints += amount;
  }
  return { ...user };
};

/**
 * 封禁C端用户（需填写封禁原因，写入审计日志）
 * 真实接口：POST /api/cuser/ban
 */
export const banUser = async (userId: number, reason: string): Promise<CUser | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/ban", "post", { userId, reason });
  const user = cusers.find((u) => u.id === userId);
  if (!user) return undefined;
  user.status = "banned";
  user.banReason = reason;
  return { ...user };
};

/**
 * 解封C端用户（恢复正常状态）
 * 真实接口：POST /api/cuser/unban
 */
export const unbanUser = async (userId: number): Promise<CUser | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/unban", "post", { userId });
  const user = cusers.find((u) => u.id === userId);
  if (!user) return undefined;
  user.status = "normal";
  user.banReason = "";
  return { ...user };
};

/**
 * 冻结C端用户（账号不可登录，保留数据）
 * 真实接口：POST /api/cuser/freeze
 */
export const freezeUser = async (userId: number): Promise<CUser | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/freeze", "post", { userId });
  const user = cusers.find((u) => u.id === userId);
  if (!user) return undefined;
  user.status = "frozen";
  return { ...user };
};

/**
 * 解冻C端用户（恢复正常使用）
 * 真实接口：POST /api/cuser/unfreeze
 */
export const unfreezeUser = async (userId: number): Promise<CUser | undefined> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/unfreeze", "post", { userId });
  const user = cusers.find((u) => u.id === userId);
  if (!user) return undefined;
  user.status = "normal";
  return { ...user };
};

/**
 * 发送警告通知给C端用户（站内信/推送）
 * 真实接口：POST /api/cuser/warn
 */
export const warnUser = async (userId: number, content: string): Promise<void> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/warn", "post", { userId, content });
};

/**
 * 设置用户功能限制（禁用指定功能模块）
 * 真实接口：POST /api/cuser/restrict
 */
export const restrictFuncs = async (userId: number, funcs: string[]): Promise<void> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/restrict", "post", { userId, funcs });
};

/**
 * 获取用户点数流水记录（充值/消耗/冻结/调整等）
 * 真实接口：GET /api/cuser/points/logs
 */
export const getPointsLogs = async (userId: number): Promise<CUserPointsLog[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/points/logs", "get", { userId });
  return [
    {
      time: "2026-09-13 21:17",
      type: "生成消耗",
      amount: -120,
      balance: 8570,
      remark: "视频生成 2.0 · 30s",
    },
    { time: "2026-09-12 18:35", type: "赠送", amount: 500, balance: 8690, remark: "活动奖励" },
    { time: "2026-09-10 14:02", type: "冻结", amount: -500, balance: 8190, remark: "争议订单冻结" },
    {
      time: "2026-09-08 09:26",
      type: "生成消耗",
      amount: -80,
      balance: 8690,
      remark: "数字人制作 · 1min",
    },
    {
      time: "2026-09-05 16:48",
      type: "充值",
      amount: 2000,
      balance: 8770,
      remark: "标准版续费赠送",
    },
  ];
};

/**
 * 获取用户AI生成记录（视频/数字人/脚本等生成历史）
 * 真实接口：GET /api/cuser/gen-logs
 */
export const getGenLogs = async (userId: number): Promise<CUserGenLog[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/gen-logs", "get", { userId });
  return [
    { time: "2026-09-14 10:02", type: "视频生成", model: "视频生成 2.0", points: -120 },
    { time: "2026-09-13 21:17", type: "数字人制作", model: "数字人 A3", points: -80 },
    { time: "2026-09-12 19:40", type: "脚本生成", model: "脚本大师", points: -10 },
  ];
};

/**
 * 获取用户登录设备列表（用于设备管理和踢下线）
 * 真实接口：GET /api/cuser/devices
 */
export const getDevices = async (userId: number): Promise<CUserDevice[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/devices", "get", { userId });
  return [
    {
      id: 1,
      name: "iPhone 15 Pro",
      platform: "iOS 18.1 · App",
      lastActive: "2026-09-14 09:18",
      current: true,
    },
    {
      id: 2,
      name: "Chrome 浏览器",
      platform: "Windows 11 · Web",
      lastActive: "2026-09-12 21:40",
      current: false,
    },
    {
      id: 3,
      name: "HUAWEI Mate 60",
      platform: "HarmonyOS 5 · App",
      lastActive: "2026-09-08 12:05",
      current: false,
    },
  ];
};

/**
 * 踢用户下线（强制登出指定设备）
 * 真实接口：POST /api/cuser/kick-device
 */
export const kickDevice = async (userId: number, deviceId: number): Promise<void> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/kick-device", "post", { userId, deviceId });
};

/**
 * 获取用户白名单列表（灰度模型、特殊规格等权限）
 * 真实接口：GET /api/cuser/whitelists
 */
export const getWhitelists = async (userId: number): Promise<CUserWhitelist[]> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/whitelists", "get", { userId });
  return [
    { type: "模型", name: "视频生成 2.5（灰度）", expireAt: "2026-10-01", remark: "灰度体验" },
    { type: "规格", name: "4K 分辨率", expireAt: "2026-09-30", remark: "画质内测" },
  ];
};

/**
 * 获取C端用户首页统计卡片数据（总人数、各档位人数及动态提示）
 * 真实接口：GET /api/cuser/stats
 */
export const getCUserStats = async (): Promise<CUserStats> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/cuser/stats", "get");
  const now = Date.now();
  const newCount = cusers.filter((u) => {
    const diffDays = (now - new Date(u.registeredAt).getTime()) / 86400000;
    return diffDays <= 30;
  }).length;
  const advancedCount = cusers.filter((u) => u.level === "高级版").length;
  const standardCount = cusers.filter((u) => u.level === "标准版").length;
  const basicCount = cusers.filter((u) => u.level === "基础版").length;
  return {
    total: cusers.length,
    advancedCount,
    standardCount,
    basicCount,
  };
};
