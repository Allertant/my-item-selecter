import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useWheelSpin } from './useWheelSpin';
import { useUsageLimit } from './useUsageLimit';
import type { HistoryItem, LimitSettings } from '@/types';

/** 历史记录最大条数 */
const MAX_HISTORY = 100;

export function useAppLogic() {
  // === 数据 ===
  const [items, setItems] = useLocalStorage<string[]>('wheelItems', []);
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('wheelHistory', []);

  const {
    limitEnabled,
    dailyLimit,
    usedCount,
    remaining,
    canSpin,
    incrementUsage,
    limitSettings,
    saveLimitSettings,
  } = useUsageLimit();

  // === 弹窗状态 ===
  const [configOpen, setConfigOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultItem, setResultItem] = useState<string | null>(null);

  // === 旋转结果处理 ===
  const handleSpinEnd = useCallback((resultIndex: number) => {
    incrementUsage();

    const selected = items[resultIndex];
    setResultItem(selected);

    const now = new Date();
    const record: HistoryItem = {
      id: crypto.randomUUID(),
      name: selected,
      date: now.toLocaleDateString('zh-CN'),
      time: now.toLocaleTimeString('zh-CN'),
    };
    setHistory((prev) => [record, ...prev].slice(0, MAX_HISTORY));

    setResultOpen(true);
  }, [items, incrementUsage, setHistory]);

  // === 转盘旋转 ===
  const { startSpin, isSpinning, currentRotation } = useWheelSpin({
    items,
    onSpinEnd: handleSpinEnd,
  });

  const handleStartSpin = useCallback(() => {
    if (!canSpin()) {
      alert('今日使用次数已用完！请明天再试。');
      return;
    }
    startSpin();
  }, [canSpin, startSpin]);

  // === 项目操作 ===
  const handleAddItem = useCallback((name: string) => {
    setItems((prev) => [...prev, name]);
  }, [setItems]);

  const handleDeleteItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, [setItems]);

  const handleClearItems = useCallback(() => {
    if (items.length === 0) return;
    if (confirm('确定要清空所有项目吗？')) {
      setItems([]);
    }
  }, [items.length, setItems]);

  // === 历史记录 ===
  const handleClearHistory = useCallback(() => {
    if (history.length === 0) return;
    if (confirm('确定要清空所有历史记录吗？')) {
      setHistory([]);
    }
  }, [history.length, setHistory]);

  // === 配置保存 ===
  const handleSaveConfig = useCallback((newSettings: LimitSettings) => {
    saveLimitSettings(newSettings);
  }, [saveLimitSettings]);

  return {
    // 数据
    items,
    history,
    // 限制
    limitEnabled,
    dailyLimit,
    usedCount,
    remaining,
    // 旋转
    isSpinning,
    currentRotation,
    startSpin: handleStartSpin,
    // 弹窗
    configOpen,
    setConfigOpen,
    historyOpen,
    setHistoryOpen,
    resultOpen,
    setResultOpen,
    resultItem,
    // 操作
    handleAddItem,
    handleDeleteItem,
    handleClearItems,
    handleClearHistory,
    handleSaveConfig,
    limitSettings,
  };
}
