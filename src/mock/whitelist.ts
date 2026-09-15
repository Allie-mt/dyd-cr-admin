export type WlType = "功能" | "模型" | "规格";
export type WlStatus = "active" | "revoked" | "expired";

export interface WhitelistRow {
  id: number;
  userId: number;
  nickname: string;
  phone: string;
  type: WlType;
  perm: string;
  expireMode: "永久" | "固定时长" | "到期日";
  expireAt: string;
  status: WlStatus;
  operator: string;
  createdAt: string;
  remark: string;
}

export const whitelists: WhitelistRow[] = [
  {
    id: 1,
    userId: 1001,
    nickname: "夜航星",
    phone: "13812340921",
    type: "模型",
    perm: "视频生成 2.5（灰度）",
    expireMode: "到期日",
    expireAt: "2026-10-01",
    status: "active",
    operator: "陈雨薇",
    createdAt: "2026-09-12 16:02",
    remark: "灰度体验",
  },
  {
    id: 2,
    userId: 1002,
    nickname: "柠檬不酸",
    phone: "15620873411",
    type: "规格",
    perm: "4K 分辨率",
    expireMode: "到期日",
    expireAt: "2026-09-30",
    status: "active",
    operator: "陈雨薇",
    createdAt: "2026-09-10 14:20",
    remark: "画质内测",
  },
  {
    id: 3,
    userId: 1005,
    nickname: "一只小鹿呀",
    phone: "17705711892",
    type: "功能",
    perm: "字幕擦除（灰度）",
    expireMode: "固定时长",
    expireAt: "2026-09-24",
    status: "active",
    operator: "系统管理员",
    createdAt: "2026-09-09 11:15",
    remark: "字幕灰度放量",
  },
  {
    id: 4,
    userId: 1003,
    nickname: "山间清风",
    phone: "18973102286",
    type: "功能",
    perm: "数字人内测",
    expireMode: "永久",
    expireAt: "—",
    status: "active",
    operator: "系统管理员",
    createdAt: "2026-08-28 10:40",
    remark: "内部测试账号",
  },
  {
    id: 5,
    userId: 1009,
    nickname: "北城以北",
    phone: "15829631745",
    type: "模型",
    perm: "4K 超清生成",
    expireMode: "固定时长",
    expireAt: "2026-09-08",
    status: "expired",
    operator: "陈雨薇",
    createdAt: "2026-08-09 09:22",
    remark: "4K 内测第一批",
  },
  {
    id: 6,
    userId: 1006,
    nickname: "晚风信箱",
    phone: "15928740366",
    type: "规格",
    perm: "1080p 分辨率",
    expireMode: "到期日",
    expireAt: "2026-09-20",
    status: "revoked",
    operator: "陈雨薇",
    createdAt: "2026-08-15 15:03",
    remark: "活动临时授权，提前撤销",
  },
  {
    id: 7,
    userId: 1010,
    nickname: "苏打气泡水",
    phone: "13770389516",
    type: "功能",
    perm: "批量生成",
    expireMode: "到期日",
    expireAt: "2026-10-15",
    status: "active",
    operator: "刘一帆",
    createdAt: "2026-09-01 10:11",
    remark: "短期项目",
  },
  {
    id: 8,
    userId: 1007,
    nickname: "阿汤哥不喝汤",
    phone: "13522378098",
    type: "模型",
    perm: "数字人 S1（内测）",
    expireMode: "固定时长",
    expireAt: "2026-09-05",
    status: "expired",
    operator: "系统管理员",
    createdAt: "2026-08-06 14:48",
    remark: "内测收集反馈",
  },
];
