// 角色权限 API
import { request } from "@/utils/request";
import { roles, accounts, permGroups, allPerms, roleOptions } from "@/mock/role";
import type { Role, Account, Member } from "@/mock/role";
import type { PageParams, PageResult } from "./common";

export type { Role, Account, Member };

export interface AccountListParams extends PageParams {
  keyword?: string;
  role?: string;
  status?: string;
}

// 获取所有角色权限
export const getRoleList = (): Promise<Role[]> => {
  return request("/api/role/list", "get");
};
// 创建角色权限
export const createRole = (name: string, desc: string): Promise<Role> => {
  return request("/api/role/create", "post", { name, desc });
};
// 更新角色权限

export const updateRolePerms = (roleId: number, perms: string[]): Promise<void> => {
  return request("/api/role/perms", "post", { roleId, perms });
};
// 删除角色权限
export const deleteRole = (roleId: number): Promise<void> => {
  return request("/api/role/delete", "post", { roleId });
};
// 获取所有账号权限
export const getAccountList = (params: AccountListParams): Promise<PageResult<Account>> => {
  return request("/api/role/accounts", "get", params);
};
// 创建账号权限
export const createAccount = (data: {
  account: string;
  name: string;
  phone: string;
  roles: string[];
}): Promise<Account> => {
  return request("/api/role/account/create", "post", data);
};
// 分配角色权限
export const assignRoles = (accountId: number, roles: string[]): Promise<void> => {
  return request("/api/role/account/assign", "post", { accountId, roles });
};

export const toggleAccount = (accountId: number, enabled: boolean): Promise<void> => {
  return request("/api/role/account/toggle", "post", { accountId, enabled });
};
// 重置账号密码
export const resetPassword = (accountId: number): Promise<void> => {
  return request("/api/role/account/reset-pwd", "post", { accountId });
};
// 授权账号临时登录
export const grantTempAuth = (accountId: number, name: string, expireAt: string): Promise<void> => {
  return request("/api/role/account/temp-auth", "post", { accountId, name, expireAt });
};

// ===== Mock 降级 =====
export const mockGetRoleList = (): Role[] => roles;
export const mockGetAccountList = (params: AccountListParams): PageResult<Account> => {
  let data = [...accounts];
  if (params.keyword) {
    const kw = params.keyword.toLowerCase();
    data = data.filter(
      (a) =>
        a.name.toLowerCase().includes(kw) ||
        a.account.toLowerCase().includes(kw) ||
        a.phone.includes(kw),
    );
  }
  if (params.role) data = data.filter((a) => a.roles.includes(params.role!));
  if (params.status) data = data.filter((a) => a.status === params.status);
  const total = data.length;
  const start = (params.page - 1) * params.pageSize;
  const list = data.slice(start, start + params.pageSize);
  return { list, total };
};
export const mockPermGroups = permGroups;
export const mockAllPerms = allPerms;
export const mockRoleOptions = roleOptions;
