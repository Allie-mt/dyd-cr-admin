// ===== B 端共享 mock 数据（企业管理 / 部门 / 员工 / 企业角色） =====

export interface Enterprise {
  id: number;
  code: string;
  name: string;
  creditCode: string;
  plan: "初创版" | "成长版" | "专业版" | "企业定制版";
  pointsTotal: number;
  pointsUsed: number;
  planStart: string;
  planExpire: string;
  status: "normal" | "pendingRenew" | "frozen" | "cancelled";
  adminName: string;
  memberCount: number;
  createdAt: string;
}

export const enterpriseStatusText: Record<Enterprise["status"], string> = {
  normal: "正常",
  pendingRenew: "待续费",
  frozen: "冻结",
  cancelled: "注销",
};

export const enterprises: Enterprise[] = [
  {
    id: 1,
    code: "ENT-0001",
    name: "深圳市道友岛科技有限公司",
    creditCode: "91440300MA5F1A2B3C",
    plan: "企业定制版",
    pointsTotal: 500000,
    pointsUsed: 321450,
    planStart: "2025-03-12",
    planExpire: "2027-03-12",
    status: "normal",
    adminName: "陈铭",
    memberCount: 86,
    createdAt: "2025-03-12",
  },
  {
    id: 2,
    code: "ENT-0002",
    name: "杭州云启智联网络有限公司",
    creditCode: "91330100MA2XK44D5E",
    plan: "专业版",
    pointsTotal: 200000,
    pointsUsed: 155380,
    planStart: "2025-05-08",
    planExpire: "2026-05-08",
    status: "pendingRenew",
    adminName: "林晓芸",
    memberCount: 42,
    createdAt: "2025-05-08",
  },
  {
    id: 3,
    code: "ENT-0003",
    name: "北京华创视界文化传媒有限公司",
    creditCode: "91110108MA01P7Q8R9",
    plan: "初创版",
    pointsTotal: 50000,
    pointsUsed: 21074,
    planStart: "2025-06-21",
    planExpire: "2026-06-21",
    status: "normal",
    adminName: "王思远",
    memberCount: 18,
    createdAt: "2025-06-21",
  },
  {
    id: 4,
    code: "ENT-0004",
    name: "上海鹏程数科信息技术有限公司",
    creditCode: "91310000MA1FL9N2T6",
    plan: "企业定制版",
    pointsTotal: 500000,
    pointsUsed: 98213,
    planStart: "2025-08-30",
    planExpire: "2027-08-30",
    status: "normal",
    adminName: "赵一鸣",
    memberCount: 64,
    createdAt: "2025-08-30",
  },
  {
    id: 5,
    code: "ENT-0005",
    name: "广州汇智互通电子商务有限公司",
    creditCode: "91440100MA9UY3H7J2",
    plan: "成长版",
    pointsTotal: 50000,
    pointsUsed: 48890,
    planStart: "2025-10-15",
    planExpire: "2026-10-15",
    status: "frozen",
    adminName: "何美琳",
    memberCount: 12,
    createdAt: "2025-10-15",
  },
  {
    id: 6,
    code: "ENT-0006",
    name: "成都天府智能制造有限公司",
    creditCode: "91510100MA6T5W4E3D",
    plan: "专业版",
    pointsTotal: 200000,
    pointsUsed: 66402,
    planStart: "2026-01-06",
    planExpire: "2027-01-06",
    status: "normal",
    adminName: "周子昂",
    memberCount: 35,
    createdAt: "2026-01-06",
  },
  {
    id: 7,
    code: "ENT-0007",
    name: "武汉光谷软件产业有限公司",
    creditCode: "91420100MA4K8L2M1N",
    plan: "初创版",
    pointsTotal: 50000,
    pointsUsed: 0,
    planStart: "2026-02-18",
    planExpire: "2027-02-18",
    status: "cancelled",
    adminName: "吴天佑",
    memberCount: 9,
    createdAt: "2026-02-18",
  },
  {
    id: 8,
    code: "ENT-0008",
    name: "南京紫金山数媒科技有限公司",
    creditCode: "91320100MA7R6P5O4Q",
    plan: "专业版",
    pointsTotal: 200000,
    pointsUsed: 112530,
    planStart: "2026-04-25",
    planExpire: "2027-04-25",
    status: "normal",
    adminName: "孙雨桐",
    memberCount: 28,
    createdAt: "2026-04-25",
  },
  {
    id: 9,
    code: "ENT-0009",
    name: "西安丝路云科信息有限公司",
    creditCode: "91610100MA3U9V1X0Z",
    plan: "成长版",
    pointsTotal: 50000,
    pointsUsed: 15620,
    planStart: "2026-07-11",
    planExpire: "2027-07-11",
    status: "normal",
    adminName: "马国峰",
    memberCount: 15,
    createdAt: "2026-07-11",
  },
  {
    id: 10,
    code: "ENT-0010",
    name: "长沙湘江智能装备有限公司",
    creditCode: "91430100MA8Y2B6C1D",
    plan: "初创版",
    pointsTotal: 50000,
    pointsUsed: 8904,
    planStart: "2026-09-02",
    planExpire: "2027-09-02",
    status: "normal",
    adminName: "罗静怡",
    memberCount: 11,
    createdAt: "2026-09-02",
  },
];

// ===== 部门树（只读） =====
export interface DeptNode {
  id: number;
  label: string;
  memberCount: number;
  children?: DeptNode[];
}

const defaultDeptTree: DeptNode[] = [
  { id: 1, label: "总经理办公室", memberCount: 3 },
  {
    id: 2,
    label: "内容创作部",
    memberCount: 12,
    children: [
      { id: 21, label: "视频组", memberCount: 6 },
      { id: 22, label: "文案组", memberCount: 4 },
      { id: 23, label: "设计组", memberCount: 2 },
    ],
  },
  {
    id: 3,
    label: "技术研发部",
    memberCount: 10,
    children: [
      { id: 31, label: "前端组", memberCount: 4 },
      { id: 32, label: "算法组", memberCount: 4 },
      { id: 33, label: "测试组", memberCount: 2 },
    ],
  },
  { id: 4, label: "市场运营部", memberCount: 6 },
];

export const deptTrees: Record<number, DeptNode[]> = {
  1: [
    { id: 1, label: "集团总部", memberCount: 5 },
    {
      id: 2,
      label: "数字内容事业部",
      memberCount: 38,
      children: [
        { id: 21, label: "短视频制作组", memberCount: 16 },
        { id: 22, label: "数字人运营组", memberCount: 12 },
        { id: 23, label: "字幕后期组", memberCount: 10 },
      ],
    },
    {
      id: 3,
      label: "技术研发中心",
      memberCount: 28,
      children: [
        { id: 31, label: "AI 算法组", memberCount: 12 },
        { id: 32, label: "平台研发组", memberCount: 10 },
        { id: 33, label: "数据工程组", memberCount: 6 },
      ],
    },
    { id: 4, label: "商业化中心", memberCount: 15 },
  ],
  2: defaultDeptTree,
};

export function getDeptTree(entId: number): DeptNode[] {
  return deptTrees[entId] || defaultDeptTree;
}

// ===== 企业员工（只读） =====
export interface EntStaff {
  id: number;
  name: string;
  account: string;
  dept: string;
  roles: string[];
  pointsQuota: number;
  status: "active" | "disabled";
  lastLoginAt: string;
}

const staffPool: EntStaff[] = [
  {
    id: 1,
    name: "陈铭",
    account: "chenming",
    dept: "集团总部",
    roles: ["企业管理员"],
    pointsQuota: 50000,
    status: "active",
    lastLoginAt: "2026-09-14 09:12",
  },
  {
    id: 2,
    name: "许文倩",
    account: "xuwenqian",
    dept: "数字内容事业部 · 短视频制作组",
    roles: ["内容编辑"],
    pointsQuota: 8000,
    status: "active",
    lastLoginAt: "2026-09-14 08:47",
  },
  {
    id: 3,
    name: "高翔",
    account: "gaoxiang",
    dept: "技术研发中心 · AI 算法组",
    roles: ["研发工程师"],
    pointsQuota: 20000,
    status: "active",
    lastLoginAt: "2026-09-13 22:31",
  },
  {
    id: 4,
    name: "杜若飞",
    account: "duruofei",
    dept: "数字内容事业部 · 数字人运营组",
    roles: ["数字人运营"],
    pointsQuota: 15000,
    status: "active",
    lastLoginAt: "2026-09-14 07:55",
  },
  {
    id: 5,
    name: "白晓露",
    account: "baixiaolu",
    dept: "商业化中心",
    roles: ["销售专员"],
    pointsQuota: 5000,
    status: "disabled",
    lastLoginAt: "2026-08-30 18:22",
  },
  {
    id: 6,
    name: "郑秋实",
    account: "zhengqiushi",
    dept: "技术研发中心 · 平台研发组",
    roles: ["研发工程师", "内容编辑"],
    pointsQuota: 12000,
    status: "active",
    lastLoginAt: "2026-09-12 20:09",
  },
  {
    id: 7,
    name: "袁小满",
    account: "yuanxiaoman",
    dept: "数字内容事业部 · 字幕后期组",
    roles: ["后期制作"],
    pointsQuota: 10000,
    status: "active",
    lastLoginAt: "2026-09-13 16:44",
  },
  {
    id: 8,
    name: "康桥",
    account: "kangqiao",
    dept: "数字内容事业部 · 短视频制作组",
    roles: ["内容编辑"],
    pointsQuota: 8000,
    status: "active",
    lastLoginAt: "2026-09-14 09:30",
  },
];

export function getStaffs(entId: number): EntStaff[] {
  if (entId === 2) {
    return staffPool.slice(0, 5).map((s, i) => ({ ...s, id: i + 1 }));
  }
  return staffPool;
}

// ===== 企业内角色（只读） =====
export interface EntRole {
  id: number;
  name: string;
  builtIn: boolean;
  permissions: string[];
  memberCount: number;
  description: string;
}

const entRolePool: EntRole[] = [
  {
    id: 1,
    name: "企业管理员",
    builtIn: true,
    permissions: [
      "组织架构管理",
      "成员管理",
      "角色管理",
      "点数分配",
      "全部功能使用权",
    ],
    memberCount: 1,
    description: "企业内最高权限，由平台指定",
  },
  {
    id: 2,
    name: "内容编辑",
    builtIn: false,
    permissions: ["脚本生成", "视频生成", "字幕处理"],
    memberCount: 4,
    description: "内容创作岗位",
  },
  {
    id: 3,
    name: "数字人运营",
    builtIn: false,
    permissions: ["脚本生成", "视频生成", "数字人制作"],
    memberCount: 2,
    description: "数字人内容运营",
  },
  {
    id: 4,
    name: "后期制作",
    builtIn: false,
    permissions: ["字幕处理", "图片生成"],
    memberCount: 2,
    description: "后期处理岗位",
  },
  {
    id: 5,
    name: "研发工程师",
    builtIn: false,
    permissions: ["API 调用", "点数查询"],
    memberCount: 3,
    description: "技术对接岗位",
  },
  {
    id: 6,
    name: "销售专员",
    builtIn: true,
    permissions: ["点数查询"],
    memberCount: 1,
    description: "只读账户",
  },
];

export function getEntRoles(_entId: number): EntRole[] {
  return entRolePool;
}
