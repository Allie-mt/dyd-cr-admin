export interface OpLog {
  time: string;
  operator: string;
  action: string;
  target: string;
  before: string;
  after: string;
  ip: string;
}

export interface LoginLog {
  time: string;
  user: string;
  ip: string;
  device: string;
  result: "成功" | "失败";
  failReason?: string;
}

export interface PermLog {
  time: string;
  operator: string;
  targetType: "后台账号" | "C端用户" | "企业" | "白名单";
  target: string;
  changeType: string;
  before: string;
  after: string;
}

export const opLogs: OpLog[] = [
  {
    time: "2026-09-14 09:32",
    operator: "吴倩（财务）",
    action: "加购点数",
    target: "深圳市道友岛科技（ENT-0001）",
    before: "余额 400,000",
    after: "余额 500,000",
    ip: "10.8.2.31",
  },
  {
    time: "2026-09-14 09:05",
    operator: "系统管理员",
    action: "模型开关",
    target: "视频生成 2.5（灰度）",
    before: "灰度 20%",
    after: "灰度 50%",
    ip: "10.8.1.12",
  },
  {
    time: "2026-09-13 18:44",
    operator: "郑毅（风控）",
    action: "封禁账号",
    target: "C端用户 Momo酱（1008）",
    before: "正常",
    after: "封禁（涉嫌售卖他人肖像）",
    ip: "10.8.3.77",
  },
  {
    time: "2026-09-13 15:21",
    operator: "陈雨薇（运营）",
    action: "调整会员档位",
    target: "C端用户 北城以北（1009）",
    before: "标准版",
    after: "专业版",
    ip: "10.8.2.08",
  },
  {
    time: "2026-09-13 11:36",
    operator: "系统管理员",
    action: "重置企业管理员",
    target: "广州汇智互通（ENT-0005）",
    before: "何美琳",
    after: "何美琳（重新指定）",
    ip: "10.8.1.12",
  },
  {
    time: "2026-09-12 20:18",
    operator: "吴倩（财务）",
    action: "退款审批",
    target: "订单 R20260912001",
    before: "待审批",
    after: "已退款 ¥299.00",
    ip: "10.8.2.31",
  },
  {
    time: "2026-09-12 16:02",
    operator: "陈雨薇（运营）",
    action: "白名单开白",
    target: "C端用户 夜航星（1001）",
    before: "无",
    after: "视频生成 2.5 · 至 2026-10-01",
    ip: "10.8.2.08",
  },
  {
    time: "2026-09-11 10:47",
    operator: "系统管理员",
    action: "冻结企业",
    target: "广州汇智互通（ENT-0005）",
    before: "正常",
    after: "冻结（安全风险处置）",
    ip: "10.8.1.12",
  },
  {
    time: "2026-09-10 14:29",
    operator: "陈雨薇（运营）",
    action: "强制调整配额",
    target: "杭州云启智联（ENT-0002）",
    before: "总配额 180,000",
    after: "总配额 200,000",
    ip: "10.8.2.08",
  },
  {
    time: "2026-09-09 09:15",
    operator: "系统管理员",
    action: "套餐变更",
    target: "成都天府智造（ENT-0006）",
    before: "标准版",
    after: "专业版",
    ip: "10.8.1.12",
  },
];

export const loginLogs: LoginLog[] = [
  {
    time: "2026-09-14 09:02",
    user: "系统管理员",
    ip: "10.8.1.12",
    device: "Chrome 129 · macOS",
    result: "成功",
  },
  {
    time: "2026-09-14 08:55",
    user: "赵倩文（客服）",
    ip: "10.8.4.21",
    device: "Chrome 129 · Windows",
    result: "成功",
  },
  {
    time: "2026-09-14 08:40",
    user: "陈雨薇（运营）",
    ip: "10.8.2.08",
    device: "Safari 18 · macOS",
    result: "成功",
  },
  {
    time: "2026-09-14 03:12",
    user: "admin",
    ip: "203.156.x.x",
    device: "未知",
    result: "失败",
    failReason: "密码错误 5 次，已锁定 30 分钟",
  },
  {
    time: "2026-09-13 19:22",
    user: "刘一帆（运营）",
    ip: "10.8.2.15",
    device: "Chrome 129 · Windows",
    result: "成功",
  },
  {
    time: "2026-09-13 16:48",
    user: "吴倩（财务）",
    ip: "10.8.2.31",
    device: "Edge 129 · Windows",
    result: "成功",
  },
  {
    time: "2026-09-13 14:33",
    user: "孙浩然（客服）",
    ip: "10.8.4.30",
    device: "Chrome 128 · Windows",
    result: "失败",
    failReason: "账号已禁用",
  },
  {
    time: "2026-09-12 20:35",
    user: "郑毅（风控）",
    ip: "10.8.3.77",
    device: "Chrome 129 · macOS",
    result: "成功",
  },
  {
    time: "2026-09-11 10:18",
    user: "方雪（数据分析）",
    ip: "10.8.5.11",
    device: "Safari 18 · macOS",
    result: "成功",
  },
];

export const permLogs: PermLog[] = [
  {
    time: "2026-09-14 09:40",
    operator: "系统管理员",
    targetType: "后台账号",
    target: "刘一帆（运营）",
    changeType: "临时授权",
    before: "无",
    after: "白名单管理 · 至 2026-09-30",
  },
  {
    time: "2026-09-13 17:12",
    operator: "系统管理员",
    targetType: "白名单",
    target: "批量开白 36 人",
    changeType: "新增白名单",
    before: "无",
    after: "4K 分辨率 · 至 2026-09-30",
  },
  {
    time: "2026-09-13 15:21",
    operator: "陈雨薇（运营）",
    targetType: "C端用户",
    target: "北城以北（1009）",
    changeType: "会员档位变更",
    before: "标准版",
    after: "专业版",
  },
  {
    time: "2026-09-12 16:02",
    operator: "陈雨薇（运营）",
    targetType: "C端用户",
    target: "夜航星（1001）",
    changeType: "白名单加成",
    before: "无",
    after: "视频生成 2.5",
  },
  {
    time: "2026-09-12 11:08",
    operator: "系统管理员",
    targetType: "后台账号",
    target: "孙浩然（客服）",
    changeType: "禁用账号",
    before: "启用",
    after: "禁用",
  },
  {
    time: "2026-09-11 10:05",
    operator: "系统管理员",
    targetType: "企业",
    target: "成都天府智造（ENT-0006）",
    changeType: "套餐变更",
    before: "标准版",
    after: "专业版",
  },
  {
    time: "2026-09-10 14:29",
    operator: "陈雨薇（运营）",
    targetType: "企业",
    target: "杭州云启智联（ENT-0002）",
    changeType: "配额调整",
    before: "总配额 180,000",
    after: "总配额 200,000",
  },
  {
    time: "2026-09-09 15:33",
    operator: "系统管理员",
    targetType: "后台账号",
    target: "新账号 op_liu",
    changeType: "创建账号并分配角色",
    before: "无",
    after: "角色：运营",
  },
];
