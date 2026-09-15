import { request } from "@/utils/request";

export interface PageParams {
  pageNo: number;
  pageSize: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
}

export const getPermissionIdList = (): Promise<any> => {
  return request("/dyd-customer-api/api/common/user/menu/permission/code/list", "post");
};
