import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useUserStore } from "@/stores/user";
import { hasPermission } from "@/utils/checkPermisson";
import myLocalStorage from "@/utils/myLocalStorage";

import enterprise from "./modules/enterprise";
import cuser from "./modules/cuser";
import role from "./modules/role";
import featureSwitch from "./modules/featureSwitch";
import auditLog from "./modules/auditLog";
import whitelist from "./modules/whitelist";

const whiteList: string[] = ["/login"];

const asyncRoutes: RouteRecordRaw[] = [enterprise, cuser, role, featureSwitch, auditLog, whitelist];

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" },
  },
  {
    path: "/",
    component: () => import("@/layout/index.vue"),
    redirect: "/enterprise",
    children: asyncRoutes,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/enterprise",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const pageTitle = to.meta.title || (to.matched.at(-1)?.meta?.title as string | undefined);
  document.title = pageTitle ? `${pageTitle} · CR+ 平台后台` : "CR+ 平台后台";

  if (whiteList.includes(to.path)) {
    const userStore = useUserStore();
    if (to.path === "/login" && userStore.userRoleName) {
      return { path: "/" };
    }
    return true;
  }

  const userStore = useUserStore();

  let isLoggedIn = !!userStore.userRoleName;

  if (!isLoggedIn) {
    const token = myLocalStorage.getLocalToken();
    isLoggedIn = token !== "";

    if (isLoggedIn && !userStore.userRoleName) {
      try {
        userStore.initUserInfo();

        if (!userStore.permissionIdList || !userStore.permissionIdList.length) {
          try {
            await userStore.getPermissionIds();
          } catch (error) {
            return { path: "/login", query: { redirectUrl: encodeURIComponent(to.fullPath) } };
          }
        }

        if (!userStore.permissionIdList.length) {
          throw new Error("getPermissionIds");
        }

        isLoggedIn = !!userStore.userRoleName;
      } catch (error) {
        console.error("从 token 恢复用户信息失败:", error);
        isLoggedIn = false;
      }
    }
  }

  if (!isLoggedIn) {
    return { path: "/login", query: { redirectUrl: encodeURIComponent(to.fullPath) } };
  }

  const requiredPermission = to.meta?.permission as string | undefined;
  if (requiredPermission && !hasPermission(requiredPermission)) {
    const firstPermittedRoute = asyncRoutes.find(
      (child) => !child.meta?.permission || hasPermission(child.meta.permission as string),
    );
    if (firstPermittedRoute) {
      return { path: "/" + firstPermittedRoute.path, replace: true };
    }
    return { path: "/login" };
  }

  return true;
});

export { asyncRoutes };
export default router;
