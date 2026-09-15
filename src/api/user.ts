import { request } from "@/utils/request";
// 登录
export const userAccountLogin = (params?: any): Promise<any> => {
  return request("/dyd-auth/oauth/token", "post", params);
};
// 退出登录
export const dropToken = (params?: any): Promise<any> => {
  return request("/dyd-auth/oauth/logout", "post", params);
};
