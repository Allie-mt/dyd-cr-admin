import axios from "axios";
import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { Base64 } from "js-base64";
import router from "@/router";
import myLocalStorage from "@/utils/myLocalStorage";
import { ElMessage } from "element-plus";

export const baseURL = import.meta.env.VITE_API_BASE_URL as string;
export const url = baseURL;
const key = import.meta.env.VITE_APP_KEY as string;
const value = import.meta.env.VITE_APP_VALUE as string;

// 扩展 AxiosRequestConfig 接口
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  isRefreshOp?: boolean;
}

// 扩展 AxiosInstance 接口
interface CustomAxiosInstance extends AxiosInstance {
  setToken: (token: string) => void;
}

// 创建axios实例
const instance = axios.create({
  // axios 的一些配置，baseURL  timeout
  baseURL: url,
  headers: {
    "X-Requested-With": "",
  },
  timeout: 60000,
}) as CustomAxiosInstance;

instance.setToken = (token: string): void => {
  instance.defaults.headers.Authorization = `Bearer ${token}`;
};

// 是否正在刷新的标记
let isRefreshing = false;
// 重试队列，每一项将是一个待执行的函数形式
let waitingRequests: Array<(token: string) => void> = [];

// 请求拦截器
instance.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    config.headers.version = myLocalStorage.getData("currentIpConfig")
      ? myLocalStorage.getData("currentIpConfig")
      : "10.30.64.92,10.30.64.93,10.30.64.96";
    config.headers.version2 = myLocalStorage.getData("currentIpConfig")
      ? myLocalStorage.getData("currentIpConfig")
      : "10.30.64.92,10.30.64.93,10.30.64.96";
    // 在这里可以添加请求头等操作
    if (config.url && config.url.startsWith("/api")) {
      config.url = "/dyd-op-api" + config.url;
    }
    if (config.method === "post" && config.url === "/dyd-auth/oauth/token") {
      if (config.data && config.data.password) {
        config.data.grant_type = "password";
      } else {
        config.isRefreshOp = true;
        if (!config.data) {
          config.data = {};
        }
        config.data.grant_type = "refresh_token";
        config.data.refresh_token = myLocalStorage.getRefreshToken();
      }
      const encodedCredentials = Base64.encode(`${key}:${value}`);
      config.headers.Authorization = `Basic ${encodedCredentials}`;
      config.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
    } else {
      config.isRefreshOp = false;
      const token = myLocalStorage.getLocalToken();
      // 2. 判断是否有token
      if (token) {
        // 3. 设置token
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // 在这里处理响应数据
    const codeList = ["999999", "F00001", "A00212"];
    if (response.data.code && codeList.includes(response.data.code)) {
      ElMessage({
        dangerouslyUseHTMLString: true,
        type: "error",
        message: "" + response.data.msg ? response.data.msg : "系统执行出错",
      });
      return;
    }
    if (response.data.code && response.data.code === "999998") {
      console.log(response.data, "===查看是否走到了这里===");
      ElMessage({
        dangerouslyUseHTMLString: true,
        type: "error",
        message: "" + response.data.msg ? response.data.msg : "系统执行出错",
      });
      return response.data;
    }
    return response.data;
  },
  (error: any) => {
    // 主动取消的请求，静默处理不提示
    if (error?.name === "CanceledError" || error?.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }
    // 在这里处理错误
    if (!error.response) {
      ElMessage({
        type: "warning",
        message: "" + error,
      });
      return Promise.reject(error);
    } else {
      const errData = error.response.data;
      const codeList = ["000000", "A00301", "A00701", "A00901", "A00902", "A00214"];
      if (
        errData &&
        errData.code &&
        !codeList.includes(errData.code) &&
        errData.code !== "999999"
      ) {
        console.log(errData);

        ElMessage({
          dangerouslyUseHTMLString: true,
          type: "error",
          message: "" + errData.msg ? errData.msg : "系统执行出错",
        });
        return;
      }

      let data: string | null = null;
      if (error.config.url === "/dyd-auth/oauth/token" && error.config.data) {
        const dataList = error.config.data.split("&");
        const lastItem = dataList[dataList.length - 1];
        if (lastItem) {
          data = lastItem.split("=")[1];
        }
      }
      if (
        (error.response.config && error.response.config.isRefreshOp) ||
        (error.config.url === "/dyd-auth/oauth/token" && data === "refresh_token")
      ) {
        loginOut();
      } else {
        const httpStatus = error.response.status;
        if (httpStatus === 401) {
          if (error.response.data.code === "A00214") {
            const config = error.response.config as CustomAxiosRequestConfig; // 错误请求的 config
            if (!isRefreshing) {
              isRefreshing = true;
              return refreshToken()
                .then((res: any) => {
                  if (res && res.data) {
                    const token = res.data.access_token;
                    const refreshToken = res.data.refresh_token;
                    if (token && refreshToken) {
                      // 更新localStorage内的token
                      myLocalStorage.setLocalToken(token);
                      // 更新axios header中的token
                      instance.setToken(token);
                      // 更新localStorage内的refresh-token
                      myLocalStorage.setRefreshToken(refreshToken);
                      config.headers.Authorization = `Bearer ${token}`;
                      // 已经刷新了token，将所有队列中的请求进行重试
                      waitingRequests.forEach((cb) => cb(token));
                      waitingRequests = [];
                      return instance(config);
                    } else {
                      loginOut();
                    }
                  } else {
                    loginOut();
                  }
                })
                .catch((Err: any) => {
                  const errConfig = Err.config || error.config;
                  if (errConfig.url === "/dyd-auth/oauth/token") {
                    loginOut();
                  }
                })
                .finally(() => {
                  isRefreshing = false;
                });
            } else {
              // 正在刷新token，将返回一个未执行resolve的promise
              return new Promise((resolve) => {
                // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
                waitingRequests.push((token: string) => {
                  config.headers.Authorization = `Bearer ${token}`;
                  resolve(instance(config));
                });
              });
            }
          } else if (error.response.data.code === "A00213") {
            ElMessage({
              message:
                "接口 " + error.response.config.url + " " + error.response.data.msg ||
                error.response.data.error,
              type: "error",
            });
          } else {
            ElMessage({
              message: error.response.data.msg || error.response.data.error,
              type: "error",
            });
          }
        } else if (httpStatus === 500) {
          ElMessage({
            message: error.response.data.msg || error.response.data.error,
            type: "error",
          });
          if (error.response.data.code === 6001013) {
            loginOut();
          }
        } else if (httpStatus === 503) {
          ElMessage({
            message: "API服务正在升级中，请稍后再试！",
            type: "error",
            showClose: true,
            duration: 3000,
          });
        } else {
          if (error.config.url === "/dyd-auth/oauth/token") {
            loginOut();
            return;
          }
          let msg = "";
          if (error.response.data) {
            msg = error.response.data.msg || error.response.data.error;
          } else {
            msg = error;
          }
          ElMessage({
            type: "error",
            showClose: true,
            duration: 5000,
            customClass: "httpError",
            message: msg,
          });
        }
      }
    }
    return Promise.reject(error);
  },
);

function loginOut(): void {
  const accessToken = myLocalStorage.getLocalToken();
  const refreshToken = myLocalStorage.getRefreshToken();
  if (!accessToken && !refreshToken) {
    return;
  }
  myLocalStorage.removeAll();

  // 获取当前路径用于重定向
  let fullPath = "";
  if (!router.currentRoute.value.fullPath.startsWith("/login")) {
    fullPath = encodeURIComponent(router.currentRoute.value.fullPath);
  }

  // 先跳转到登录页，然后再刷新，避免token被清除后刷新导致的问题
  if (fullPath) {
    router.push("/login?redirectUrl=" + fullPath).then(() => {
      // 延迟刷新，确保路由跳转完成
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  } else {
    router.push("/login").then(() => {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    });
  }
}

function refreshToken(): Promise<any> {
  return instance.post("/dyd-auth/oauth/token");
}

function clearSpaces(item: any): any {
  // 过滤参数前后空格
  if (item === null || item === undefined) {
    return item;
  }
  if (typeof item === "string") {
    // 字符串过滤前后空格
    return item.replace(/^\x20*|\x20*$/g, "");
  } else if (typeof item === "object") {
    if (Array.isArray(item)) {
      return item.map((items) => {
        return clearSpaces(items);
      });
    } else {
      // 对象过滤前后空格
      const keyList = Object.keys(item);
      if (keyList && keyList.length > 0) {
        keyList.forEach((key) => {
          item[key] = clearSpaces(item[key]);
        });
      }
      return item;
    }
  } else {
    return item;
  }
}

export default instance;

// 请求工具函数
export function request(
  url: string,
  method: string,
  submitData?: any,
  signal?: AbortSignal,
): Promise<any> {
  if (submitData) {
    // 请求参数
    const keyList = Object.keys(submitData);
    if (keyList && keyList.length > 0) {
      keyList.forEach((key) => {
        // 字符串过滤前后空格
        submitData[key] = clearSpaces(submitData[key]);
      });
    }
  }
  // 负责发请求：请求地址，请求方式，提交的数据
  return instance({
    url,
    method,
    signal,
    // 1. 如果是get请求  需要使用params来传递submitData   ?a=10&c=10
    // 2. 如果不是get请求  需要使用data来传递submitData   请求体传参
    // [] 设置一个动态的key, 写js表达式，js表达式的执行结果当作KEY
    // method参数：get,Get,GET  转换成小写再来判断
    // 在对象，['params']:submitData ===== params:submitData 这样理解
    [method.toLowerCase() === "get" ? "params" : "data"]: submitData,
  });
}
