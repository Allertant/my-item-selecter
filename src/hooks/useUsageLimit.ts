import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { LimitSettings } from '@/types';

const DEFAULT_LIMIT: LimitSettings = {
  enabled: false,
  dailyLimit: 5,
  usedCount: 0,
  lastDate: '',
};

// 从旧版 localStorage 迁移限制设置
function migrateOldLimitSettings(): LimitSettings {
  const enabled = localStorage.getItem('limitEnabled') === 'true';
  const dailyLimit = parseInt(localStorage.getItem('dailyLimit') || '5');
  const usedCount = parseInt(localStorage.getItem('usedCount') || '0');
  const lastDate = localStorage.getItem('lastDate') || '';

  // 清除旧 key
  localStorage.removeItem('limitEnabled');
  localStorage.removeItem('dailyLimit');
  localStorage.removeItem('usedCount');
  localStorage.removeItem('lastDate');

  return { enabled, dailyLimit, usedCount, lastDate };
}

function getToday(): string {
  return new Date().toDateString();
}

function getInitialLimitSettings(): LimitSettings {
  // 如果新版 key 已有数据，直接使用
  const stored = localStorage.getItem('wheelLimitSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_LIMIT;
    }
  }
  // 尝试从旧版迁移
  const oldEnabled = localStorage.getItem('limitEnabled');
  if (oldEnabled !== null) {
    const migrated = migrateOldLimitSettings();
    localStorage.setItem('wheelLimitSettings', JSON.stringify(migrated));
    return migrated;
  }
  return DEFAULT_LIMIT;
}

export function useUsageLimit() {
  const [settings, setSettings] = useLocalStorage<LimitSettings>('wheelLimitSettings', getInitialLimitSettings());

  // 检查是否新的一天，如果是则重置使用次数
  const ensureDateFresh = useCallback(() => {
    const today = getToday();
    if (settings.lastDate !== today) {
      setSettings((prev) => ({ ...prev, usedCount: 0, lastDate: today }));
    }
  }, [settings.lastDate, setSettings]);

  const canSpin = useCallback(() => {
    ensureDateFresh();
    const today = getToday();
    const lastDate = settings.lastDate || today;
    const usedCount = lastDate === today ? settings.usedCount : 0;

    if (settings.enabled && usedCount >= settings.dailyLimit) {
      return false;
    }
    return true;
  }, [settings, ensureDateFresh]);

  const incrementUsage = useCallback(() => {
    const today = getToday();
    setSettings((prev) => ({
      ...prev,
      usedCount: prev.lastDate === today ? prev.usedCount + 1 : 1,
      lastDate: today,
    }));
  }, [setSettings]);

  const remaining = settings.enabled
    ? Math.max(0, settings.dailyLimit - (settings.lastDate === getToday() ? settings.usedCount : 0))
    : Infinity;

  const usedCount = settings.lastDate === getToday() ? settings.usedCount : 0;

  const saveLimitSettings = useCallback((newSettings: LimitSettings) => {
    setSettings(newSettings);
  }, [setSettings]);

  return {
    limitEnabled: settings.enabled,
    dailyLimit: settings.dailyLimit,
    usedCount,
    remaining,
    canSpin,
    incrementUsage,
    limitSettings: settings,
    saveLimitSettings,
    toggleLimit: useCallback(() => setSettings((p) => ({ ...p, enabled: !p.enabled })), [setSettings]),
    setDailyLimit: useCallback((n: number) => setSettings((p) => ({ ...p, dailyLimit: n })), [setSettings]),
  };
}
