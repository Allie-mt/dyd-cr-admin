export type Scope = "全部用户" | "白名单" | "灰度 20%" | "灰度 50%";
export type ReleaseMode = "全量" | "按比例灰度" | "白名单";

export interface AIModel {
  id: number;
  name: string;
  category: string;
  enabled: boolean;
  scope: Scope;
  updatedAt: string;
}

export interface FuncSwitch {
  key: string;
  name: string;
  desc: string;
  enabled: boolean;
  mode: ReleaseMode;
  ratio: number;
}

export interface BenefitRow {
  name: string;
  free: boolean;
  standard: boolean;
  pro: boolean;
  flagship: boolean;
}

export interface BenefitGroup {
  name: string;
  rows: BenefitRow[];
}

export interface PermPoint {
  code: string;
  name: string;
  enabled: boolean;
  desc: string;
}

export interface PermGroup {
  module: string;
  points: PermPoint[];
}

export const scopes: Scope[] = ["全部用户", "灰度 20%", "灰度 50%", "白名单"];
export const modes: ReleaseMode[] = ["全量", "按比例灰度", "白名单"];

export const models: AIModel[] = [
  {
    id: 1,
    name: "视频生成 2.0",
    category: "视频生成",
    enabled: true,
    scope: "全部用户",
    updatedAt: "2026-08-01",
  },
  {
    id: 2,
    name: "视频生成 2.5（灰度）",
    category: "视频生成",
    enabled: true,
    scope: "灰度 20%",
    updatedAt: "2026-09-10",
  },
  {
    id: 3,
    name: "4K 超清生成",
    category: "视频生成",
    enabled: true,
    scope: "白名单",
    updatedAt: "2026-09-05",
  },
  {
    id: 4,
    name: "数字人 A3",
    category: "数字人",
    enabled: true,
    scope: "全部用户",
    updatedAt: "2026-06-18",
  },
  {
    id: 5,
    name: "数字人 S1（内测）",
    category: "数字人",
    enabled: false,
    scope: "白名单",
    updatedAt: "2026-09-12",
  },
  {
    id: 6,
    name: "脚本大师",
    category: "脚本生成",
    enabled: true,
    scope: "全部用户",
    updatedAt: "2026-03-25",
  },
  {
    id: 7,
    name: "字幕擦除 Pro",
    category: "字幕处理",
    enabled: true,
    scope: "灰度 50%",
    updatedAt: "2026-09-08",
  },
  {
    id: 8,
    name: "图片生成 3.0",
    category: "图片生成",
    enabled: true,
    scope: "全部用户",
    updatedAt: "2026-05-14",
  },
];

export const funcs: FuncSwitch[] = [
  {
    key: "script",
    name: "脚本生成",
    desc: "AI 脚本创作模块",
    enabled: true,
    mode: "全量",
    ratio: 100,
  },
  {
    key: "image",
    name: "图片生成",
    desc: "文生图与图片编辑",
    enabled: true,
    mode: "全量",
    ratio: 100,
  },
  {
    key: "video",
    name: "视频生成",
    desc: "文生视频模块",
    enabled: true,
    mode: "按比例灰度",
    ratio: 50,
  },
  {
    key: "digital",
    name: "数字人",
    desc: "数字人克隆与制作",
    enabled: true,
    mode: "白名单",
    ratio: 0,
  },
  {
    key: "subtitle",
    name: "字幕处理",
    desc: "字幕识别与擦除",
    enabled: true,
    mode: "按比例灰度",
    ratio: 20,
  },
];

export const benefitGroups: BenefitGroup[] = [
  {
    name: "可用模型",
    rows: [
      { name: "脚本大师", free: true, standard: true, pro: true, flagship: true },
      { name: "图片生成 3.0", free: true, standard: true, pro: true, flagship: true },
      { name: "视频生成 2.0", free: false, standard: true, pro: true, flagship: true },
      { name: "视频生成 2.5（灰度）", free: false, standard: false, pro: true, flagship: true },
      { name: "数字人 A3", free: false, standard: false, pro: true, flagship: true },
    ],
  },
  {
    name: "分辨率",
    rows: [
      { name: "480p", free: true, standard: true, pro: true, flagship: true },
      { name: "720p", free: false, standard: true, pro: true, flagship: true },
      { name: "1080p", free: false, standard: false, pro: true, flagship: true },
      { name: "4K", free: false, standard: false, pro: false, flagship: true },
    ],
  },
  {
    name: "画质",
    rows: [
      { name: "标清", free: true, standard: true, pro: true, flagship: true },
      { name: "高清", free: false, standard: true, pro: true, flagship: true },
      { name: "超清", free: false, standard: false, pro: true, flagship: true },
    ],
  },
  {
    name: "功能",
    rows: [
      { name: "字幕处理", free: false, standard: true, pro: true, flagship: true },
      { name: "批量生成", free: false, standard: false, pro: true, flagship: true },
      { name: "优先队列", free: false, standard: false, pro: false, flagship: true },
      { name: "API 调用", free: false, standard: false, pro: true, flagship: true },
    ],
  },
];

export const permGroups: PermGroup[] = [
  {
    module: "C端用户管理",
    points: [
      { code: "cuser:view", name: "用户查看", enabled: true, desc: "查看 C 端用户列表与详情" },
      { code: "cuser:level", name: "档位调整", enabled: true, desc: "调整用户会员档位" },
      { code: "cuser:points", name: "点数调整", enabled: true, desc: "赠送/扣减/冻结用户点数" },
      { code: "cuser:ban", name: "封禁/解封", enabled: true, desc: "控制用户账号状态" },
      { code: "cuser:whitelist", name: "白名单管理", enabled: true, desc: "灰度开白与临时授权" },
    ],
  },
  {
    module: "B端企业管理",
    points: [
      { code: "ent:view", name: "企业查看", enabled: true, desc: "查看企业与组织架构" },
      { code: "ent:create", name: "企业开通", enabled: true, desc: "新建企业租户" },
      { code: "ent:plan", name: "套餐变更", enabled: true, desc: "企业套餐升降级与续期" },
      { code: "ent:quota", name: "配额调整", enabled: true, desc: "调整企业点数总配额" },
      {
        code: "ent:fallback",
        name: "兜底操作",
        enabled: true,
        desc: "重置管理员/临时冻结/强制调额",
      },
    ],
  },
  {
    module: "财务",
    points: [
      { code: "fin:order", name: "订单查看", enabled: true, desc: "查看订单记录" },
      { code: "fin:refund", name: "退款审批", enabled: true, desc: "处理退款申请" },
      { code: "fin:invoice", name: "发票管理", enabled: true, desc: "发票开具与查看" },
      { code: "fin:recharge", name: "点数加购", enabled: true, desc: "企业点数加购入账" },
    ],
  },
  {
    module: "审计与报表",
    points: [
      { code: "audit:op", name: "操作日志", enabled: true, desc: "查看后台写操作日志" },
      { code: "audit:login", name: "登录日志", enabled: true, desc: "查看后台登录日志" },
      { code: "audit:perm", name: "权限变更日志", enabled: true, desc: "查看权限/配额变更" },
      { code: "audit:report", name: "数据报表", enabled: true, desc: "运营数据报表查看" },
    ],
  },
];
