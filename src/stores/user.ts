import { defineStore } from "pinia";
import { Base64 } from "js-base64";
import myLocalStorage from "@/utils/myLocalStorage";
import { dropToken } from "@/api/user";
import { getPermissionIdList } from "@/api/common";

export interface AdminUser {
  userId: string;
  username: string;
  nickname: string;
  role: string;
  avatar?: string;
  allUserRoleTypes: string[];
}

export const useUserStore = defineStore("user", {
  state: () => ({
    token: myLocalStorage.getLocalToken() as string,
    userInfo: null as AdminUser | null,
    permissionIdList: [] as string[],
  }),

  getters: {
    userRoleName: (state): string => {
      return state.userInfo?.nickname || "";
    },
    userId: (state): string => {
      return state.userInfo?.userId || "";
    },
    userName: (state): string => {
      return state.userInfo?.username || "";
    },
    avatar: (state): string => {
      return state.userInfo?.avatar || "";
    },
  },

  actions: {
    initUserInfo(): void {
      try {
        const accessToken = myLocalStorage.getLocalToken();
        const avatar = myLocalStorage.getLocalAvatar();
        if (!accessToken) {
          throw new Error("Token is empty");
        }
        const list = accessToken.split(".");
        if (list && list.length > 1) {
          const listCode = JSON.parse(Base64.decode(list[1]));
          const roleTypes = listCode.authorities
            ? listCode.authorities.map((item: string) => {
                return item.substring(0, item.lastIndexOf("#"));
              })
            : [];
          this.userInfo = {
            userId: listCode.userId || "",
            username: listCode.userName || "",
            nickname: listCode.nickname || "",
            role: listCode.role_name || "",
            avatar: avatar || "",
            allUserRoleTypes: listCode.authorities || [],
          };
        }
      } catch (error) {
        console.error("Failed to parse token:", error);
        throw error;
      }
    },

    async logout() {
      try {
        await dropToken();
      } catch {
        // ignore
      }
      this.clearUserInfo();
    },

    setPermissionList(scopes: string[]) {
      this.permissionIdList = scopes;
    },

    clearUserInfo() {
      this.token = "";
      this.userInfo = null;
      this.permissionIdList = [];
      myLocalStorage.removeAll();
    },

    async getPermissionIds(): Promise<void> {
      try {
        const { data } = await getPermissionIdList();
        if (data && data.menuCodeList) {
          let codes: string[] = [];
          if (data.permissionCodeList) {
            const permissionCodeList = data.permissionCodeList.map((str: string) => {
              return str.replace(/^(GET#:|POST#:)/, "");
            });
            codes = [...data.menuCodeList, ...permissionCodeList];
          } else {
            codes = data.menuCodeList;
          }
          this.permissionIdList = codes;
        } else {
          throw new Error("账户权限码获取失败！");
        }
      } catch (error) {
        throw new Error(error as string);
      }
    },
  },
});
