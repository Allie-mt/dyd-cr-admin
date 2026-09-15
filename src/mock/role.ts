export interface Member {
  name: string;
  account: string;
  status: "正常" | "禁用";
}

export interface Role {
  id: number;
  name: string;
  type: "preset" | "custom";
  members: number;
  memberList: Member[];
  perms: string[];
  desc: string;
  updatedAt: string;
}

export interface Account {
  id: number;
  account: string;
  name: string;
  phone: string;
  roles: string[];
  status: "enabled" | "disabled";
  lastLoginAt: string;
  tempAuth?: { name: string; expireAt: string };
}

export const permGroups = [
  { name: "C端用户管理", perms: ["用户查看", "档位调整", "点数调整", "封禁/解封", "白名单管理"] },
  { name: "B端企业管理", perms: ["企业查看", "企业开通", "套餐变更", "配额调整", "兜底操作"] },
  { name: "财务", perms: ["订单查看", "退款审批", "发票管理", "点数加购"] },
  { name: "功能开关", perms: ["权限点管理", "模型开关", "功能开关", "会员权益配置"] },
  { name: "审计与报表", perms: ["操作日志", "登录日志", "权限变更日志", "数据报表"] },
];

export const allPerms = permGroups.flatMap((g) => g.perms);

export const roleOptions = [
  "超级管理员",
  "运营",
  "客服",
  "财务",
  "风控",
  "数据分析",
  "专项活动运营",
];

export const roles: Role[] = [
  {
    id: 1,
    name: "超级管理员",
    type: "preset",
    members: 1,
    memberList: [{ name: "张明", account: "zhangming", status: "正常" }],
    perms: allPerms,
    desc: "拥有全部权限，内置不可删除",
    updatedAt: "2026-01-10",
  },
  {
    id: 2,
    name: "运营",
    type: "preset",
    members: 3,
    memberList: [
      { name: "李婷", account: "liting", status: "正常" },
      { name: "王磊", account: "wanglei", status: "正常" },
      { name: "赵雪", account: "zhaoxue", status: "正常" },
    ],
    perms: ["用户查看", "档位调整", "企业查看", "权限点管理", "模型开关", "功能开关"],
    desc: "日常运营与功能配置",
    updatedAt: "2026-03-22",
  },
  {
    id: 3,
    name: "客服",
    type: "preset",
    members: 5,
    memberList: [
      { name: "陈芳", account: "chenfang", status: "正常" },
      { name: "刘洋", account: "liuyang", status: "正常" },
      { name: "孙静", account: "sunjing", status: "正常" },
      { name: "周杰", account: "zhoujie", status: "禁用" },
      { name: "吴敏", account: "wumin", status: "正常" },
    ],
    perms: ["用户查看", "企业查看"],
    desc: "只读查询，协助处理客诉",
    updatedAt: "2026-02-14",
  },
  {
    id: 4,
    name: "财务",
    type: "preset",
    members: 2,
    memberList: [
      { name: "郑华", account: "zhenghua", status: "正常" },
      { name: "钱丽", account: "qianli", status: "正常" },
    ],
    perms: ["用户查看", "订单查看", "退款审批", "发票管理", "点数加购"],
    desc: "财务与退款相关操作",
    updatedAt: "2026-04-08",
  },
  {
    id: 5,
    name: "风控",
    type: "preset",
    members: 1,
    memberList: [{ name: "冯刚", account: "fenggang", status: "正常" }],
    perms: ["用户查看", "封禁/解封", "操作日志", "登录日志", "权限变更日志"],
    desc: "违规处置与安全审计",
    updatedAt: "2026-05-19",
  },
  {
    id: 6,
    name: "数据分析",
    type: "preset",
    members: 2,
    memberList: [
      { name: "许悦", account: "xuyue", status: "正常" },
      { name: "韩飞", account: "hanfei", status: "正常" },
    ],
    perms: ["用户查看", "企业查看", "数据报表"],
    desc: "只读报表查看",
    updatedAt: "2026-06-02",
  },
  {
    id: 7,
    name: "专项活动运营",
    type: "custom",
    members: 2,
    memberList: [
      { name: "杨帆", account: "yangfan", status: "正常" },
      { name: "朱琳", account: "zhulin", status: "正常" },
    ],
    perms: ["用户查看", "档位调整", "点数调整", "白名单管理"],
    desc: "周年庆活动临时授权，到期自动回收",
    updatedAt: "2026-09-01",
  },
];

export const accounts: Account[] = [
  {
    id: 1,
    account: "admin",
    name: "系统管理员",
    phone: "13900000001",
    roles: ["超级管理员"],
    status: "enabled",
    lastLoginAt: "2026-09-14 09:02",
  },
  {
    id: 2,
    account: "op_chen",
    name: "陈雨薇",
    phone: "13900000002",
    roles: ["运营"],
    status: "enabled",
    lastLoginAt: "2026-09-14 08:40",
  },
  {
    id: 3,
    account: "op_liu",
    name: "刘一帆",
    phone: "13900000003",
    roles: ["运营"],
    status: "enabled",
    lastLoginAt: "2026-09-13 19:22",
    tempAuth: { name: "白名单管理", expireAt: "2026-09-30" },
  },
  {
    id: 4,
    account: "cs_zhao",
    name: "赵倩文",
    phone: "13900000004",
    roles: ["客服"],
    status: "enabled",
    lastLoginAt: "2026-09-14 08:55",
  },
  {
    id: 5,
    account: "cs_sun",
    name: "孙浩然",
    phone: "13900000005",
    roles: ["客服"],
    status: "disabled",
    lastLoginAt: "2026-08-28 17:10",
  },
  {
    id: 6,
    account: "fin_wu",
    name: "吴倩",
    phone: "13900000006",
    roles: ["财务"],
    status: "enabled",
    lastLoginAt: "2026-09-13 16:48",
  },
  {
    id: 7,
    account: "risk_zheng",
    name: "郑毅",
    phone: "13900000007",
    roles: ["风控"],
    status: "enabled",
    lastLoginAt: "2026-09-12 20:35",
  },
  {
    id: 8,
    account: "data_fang",
    name: "方雪",
    phone: "13900000008",
    roles: ["数据分析"],
    status: "enabled",
    lastLoginAt: "2026-09-11 10:18",
  },
];
