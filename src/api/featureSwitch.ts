// 功能开关 API
import { request } from "@/utils/request";
import { models, funcs, benefitGroups, permGroups, scopes, modes } from "@/mock/featureSwitch";
import type {
  AIModel,
  FuncSwitch,
  BenefitGroup,
  PermGroup,
  PermPoint,
  Scope,
  ReleaseMode,
} from "@/mock/featureSwitch";

export type { AIModel, FuncSwitch, BenefitGroup, PermGroup, PermPoint, Scope, ReleaseMode };
// 获取所有模型
export const getModels = (): Promise<AIModel[]> => {
  return request("/api/feature/models", "get");
};
// 切换模型开关
export const toggleModel = (modelId: number, enabled: boolean): Promise<void> => {
  return request("/api/feature/model/toggle", "post", { modelId, enabled });
};
// 切换模型作用域
export const changeModelScope = (modelId: number, scope: Scope): Promise<void> => {
  return request("/api/feature/model/scope", "post", { modelId, scope });
};
// 获取所有功能开关
export const getFuncs = (): Promise<FuncSwitch[]> => {
  return request("/api/feature/funcs", "get");
};
// 切换功能开关
export const toggleFunc = (key: string, enabled: boolean): Promise<void> => {
  return request("/api/feature/func/toggle", "post", { key, enabled });
};
// 保存功能灰度
export const saveFuncGray = (key: string, mode: ReleaseMode, ratio: number): Promise<void> => {
  return request("/api/feature/func/gray", "post", { key, mode, ratio });
};
// 获取所有功能灰度
export const getBenefits = (): Promise<BenefitGroup[]> => {
  return request("/api/feature/benefits", "get");
};
// 保存功能灰度
export const saveBenefits = (group: string, rows: Record<string, boolean>[]): Promise<void> => {
  return request("/api/feature/benefits/save", "post", { group, rows });
};
// 获取所有权限点
export const getPermPoints = (): Promise<PermGroup[]> => {
  return request("/api/feature/perm-points", "get");
};
// 切换权限点开关
export const togglePermPoint = (code: string, enabled: boolean): Promise<void> => {
  return request("/api/feature/perm-point/toggle", "post", { code, enabled });
};

// ===== Mock 降级 =====
export const mockGetModels = (): AIModel[] => models;
export const mockGetFuncs = (): FuncSwitch[] => funcs;
export const mockGetBenefits = (): BenefitGroup[] => benefitGroups;
export const mockGetPermPoints = (): PermGroup[] => permGroups;
export const mockScopes = scopes;
export const mockModes = modes;
