export type Level = "免费版" | "基础版" | "标准版" | "高级版";
export type CStatus = "normal" | "frozen" | "banned";
export type PointsAction = "gift" | "deduct" | "freeze";

export interface CUser {
  id: number;
  nickname: string;
  phone: string;
  level: Level;
  levelStart: string;
  levelExpire: string;
  points: number;
  frozenPoints: number;
  status: CStatus;
  banReason: string;
  registeredAt: string;
  lastLoginAt: string;
}

export const levels: Level[] = ["免费版", "基础版", "标准版", "高级版"];

export const statusOptions: { label: string; value: CStatus }[] = [
  { label: "正常", value: "normal" },
  { label: "冻结", value: "frozen" },
  { label: "封禁", value: "banned" },
];

export const cusers: CUser[] = [
  {
    id: 1001,
    nickname: "夜航星",
    phone: "13812340921",
    level: "高级版",
    levelStart: "2026-03-14",
    levelExpire: "2027-03-14",
    points: 12480,
    frozenPoints: 0,
    status: "normal",
    banReason: "",
    registeredAt: "2025-03-14 20:18",
    lastLoginAt: "2026-09-14 08:42",
  },
  {
    id: 1002,
    nickname: "柠檬不酸",
    phone: "15620873411",
    level: "高级版",
    levelStart: "2026-01-02",
    levelExpire: "2027-01-02",
    points: 8450,
    frozenPoints: 500,
    status: "normal",
    banReason: "",
    registeredAt: "2025-04-02 12:05",
    lastLoginAt: "2026-09-13 22:10",
  },
  {
    id: 1003,
    nickname: "山间清风",
    phone: "18973102286",
    level: "基础版",
    levelStart: "2026-06-19",
    levelExpire: "2026-12-19",
    points: 2100,
    frozenPoints: 0,
    status: "normal",
    banReason: "",
    registeredAt: "2025-04-19 09:33",
    lastLoginAt: "2026-09-14 07:55",
  },
  {
    id: 1004,
    nickname: "Gordon_Liu",
    phone: "13699812304",
    level: "免费版",
    levelStart: "2025-05-27",
    levelExpire: "",
    points: 60,
    frozenPoints: 0,
    status: "banned",
    banReason: "批量爬取生成接口，违反服务协议",
    registeredAt: "2025-05-27 16:44",
    lastLoginAt: "2026-07-30 21:03",
  },
  {
    id: 1005,
    nickname: "一只小鹿呀",
    phone: "17705711892",
    level: "高级版",
    levelStart: "2026-08-11",
    levelExpire: "2026-11-11",
    points: 5620,
    frozenPoints: 1000,
    status: "normal",
    banReason: "",
    registeredAt: "2025-06-11 10:27",
    lastLoginAt: "2026-09-12 19:36",
  },
  {
    id: 1006,
    nickname: "晚风信箱",
    phone: "15928740366",
    level: "基础版",
    levelStart: "2026-04-08",
    levelExpire: "2026-10-08",
    points: 1780,
    frozenPoints: 0,
    status: "frozen",
    banReason: "",
    registeredAt: "2025-07-08 21:52",
    lastLoginAt: "2026-09-14 09:18",
  },
  {
    id: 1007,
    nickname: "阿汤哥不喝汤",
    phone: "13522378098",
    level: "免费版",
    levelStart: "2025-08-23",
    levelExpire: "",
    points: 330,
    frozenPoints: 0,
    status: "normal",
    banReason: "",
    registeredAt: "2025-08-23 14:11",
    lastLoginAt: "2026-09-11 08:27",
  },
  {
    id: 1008,
    nickname: "Momo酱",
    phone: "18615209432",
    level: "免费版",
    levelStart: "2025-09-30",
    levelExpire: "",
    points: 0,
    frozenPoints: 0,
    status: "banned",
    banReason: "涉嫌售卖他人肖像生成数字人视频",
    registeredAt: "2025-09-30 18:39",
    lastLoginAt: "2026-05-14 12:00",
  },
  {
    id: 1009,
    nickname: "北城以北",
    phone: "15829631745",
    level: "高级版",
    levelStart: "2026-02-17",
    levelExpire: "2027-02-17",
    points: 9340,
    frozenPoints: 200,
    status: "normal",
    banReason: "",
    registeredAt: "2025-11-17 08:09",
    lastLoginAt: "2026-09-13 23:47",
  },
  {
    id: 1010,
    nickname: "苏打气泡水",
    phone: "13770389516",
    level: "基础版",
    levelStart: "2026-07-05",
    levelExpire: "2027-01-05",
    points: 3460,
    frozenPoints: 0,
    status: "normal",
    banReason: "",
    registeredAt: "2026-01-05 11:24",
    lastLoginAt: "2026-09-14 06:30",
  },
];
