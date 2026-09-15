import { request } from "@/utils/request";
import { whitelists } from "@/mock/whitelist";
import type { WhitelistRow, WlType, WlStatus } from "@/mock/whitelist";
import type { PageParams, PageResult } from "./common";

export type { WhitelistRow, WlType, WlStatus };

/** 白名单管理 - 接口类型定义 */

/** 白名单列表查询参数 */
export interface WhitelistListParams extends PageParams {
  keyword?: string;
  type?: string;
  status?: string;
}

/**
 * 获取白名单列表（分页 + 搜索 + 筛选）
 * 真实接口：GET /api/whitelist/list
 */
export const getWhitelist = async (
  params: WhitelistListParams,
): Promise<PageResult<WhitelistRow>> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/whitelist/list", "get", params);
  let data = [...whitelists];
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    data = data.filter(
      (w) =>
        w.nickname.toLowerCase().includes(kw) ||
        w.phone.includes(kw) ||
        w.perm.toLowerCase().includes(kw),
    );
  }
  if (params.type) data = data.filter((w) => w.type === params.type);
  if (params.status) data = data.filter((w) => w.status === params.status);
  const total = data.length;
  const start = (params.pageNo - 1) * params.pageSize;
  const list = data.slice(start, start + params.pageSize);
  return { list, total };
};

/**
 * 添加单条白名单权限
 * 真实接口：POST /api/whitelist/add
 */
export const addWhitelist = async (data: {
  userId: number;
  type: WlType;
  perm: string;
  expireMode: string;
  expireAt: string;
  remark: string;
}): Promise<WhitelistRow> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/whitelist/add", "post", data);
  const row: WhitelistRow = {
    id: Date.now(),
    userId: data.userId,
    nickname: "新开白用户",
    phone: "",
    type: data.type,
    perm: data.perm,
    expireMode: data.expireMode as WhitelistRow["expireMode"],
    expireAt: data.expireAt,
    status: "active",
    operator: "系统管理员",
    createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    remark: data.remark || "单个开白",
  };
  whitelists.unshift(row);
  return { ...row };
};

/**
 * 撤销白名单权限（立即回落至档位默认）
 * 真实接口：POST /api/whitelist/revoke
 */
export const revokeWhitelist = async (id: number): Promise<void> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/whitelist/revoke", "post", { id });
  const item = whitelists.find((w) => w.id === id);
  if (item) item.status = "revoked";
};

/**
 * 批量添加白名单权限（按条件筛选用户批量开白）
 * 真实接口：POST /api/whitelist/batch-add
 */
export const batchAddWhitelist = async (data: {
  userIds: number[];
  type: WlType;
  perm: string;
  expireMode: string;
  expireAt: string;
  remark: string;
}): Promise<void> => {
  // TODO: 对接真实接口后删除 mock 降级，取消下方注释
  // return request("/api/whitelist/batch-add", "post", data);
};
