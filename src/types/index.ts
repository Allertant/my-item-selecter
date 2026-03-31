/** 转盘项目 */
export interface WheelItem {
  id: string;
  name: string;
}

/** 历史记录项 */
export interface HistoryItem {
  id: string;
  name: string;
  date: string;
  time: string;
}

/** 使用限制设置 */
export interface LimitSettings {
  enabled: boolean;
  dailyLimit: number;
  usedCount: number;
  lastDate: string;
}
