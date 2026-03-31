import { useState, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Wheel from '@/components/Wheel';
import ItemList from '@/components/ItemList';
import ConfigModal from '@/components/ConfigModal';
import HistoryModal from '@/components/HistoryModal';
import ResultModal from '@/components/ResultModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useWheelSpin } from '@/hooks/useWheelSpin';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import type { HistoryItem, LimitSettings } from '@/types';

function App() {
  // === 状态管理 ===
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

  const [configOpen, setConfigOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultItem, setResultItem] = useState<string | null>(null);

  // === 转盘旋转 ===
  const handleSpinEnd = useCallback((resultIndex: number) => {
    incrementUsage();
    const selected = items[resultIndex];
    setResultItem(selected);

    // 添加历史记录
    const now = new Date();
    const record: HistoryItem = {
      id: crypto.randomUUID(),
      name: selected,
      date: now.toLocaleDateString('zh-CN'),
      time: now.toLocaleTimeString('zh-CN'),
    };
    setHistory((prev) => [record, ...prev].slice(0, 100));

    setResultOpen(true);
  }, [items, incrementUsage, setHistory]);

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

  return (
    <TooltipProvider>
      <Header />

      <main className="flex-1 px-4 py-8 md:px-8 lg:px-16">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
            {/* 左侧：转盘 */}
            <div className="flex flex-col items-center gap-4">
              <Wheel
                items={items}
                isSpinning={isSpinning}
                currentRotation={currentRotation}
              />
              <Button
                onClick={handleStartSpin}
                disabled={isSpinning || items.length === 0}
                size="lg"
              >
                {isSpinning ? '旋转中...' : '开始旋转'}
              </Button>
            </div>

            {/* 右侧：项目列表 */}
            <div className="flex-1 w-full max-w-sm">
              <ItemList
                items={items}
                onAdd={handleAddItem}
                onDelete={handleDeleteItem}
                onClear={handleClearItems}
                onOpenConfig={() => setConfigOpen(true)}
                onOpenHistory={() => setHistoryOpen(true)}
                disabled={isSpinning}
                remaining={remaining}
                limitEnabled={limitEnabled}
              />
            </div>
          </div>
        </div>
      </main>

      {/* 弹窗 */}
      <ConfigModal
        open={configOpen}
        onOpenChange={setConfigOpen}
        settings={limitSettings}
        onSave={handleSaveConfig}
        usedCount={usedCount}
        remaining={remaining}
      />

      <HistoryModal
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        history={history}
        onClear={handleClearHistory}
      />

      <ResultModal
        open={resultOpen}
        onOpenChange={setResultOpen}
        result={resultItem}
      />

      <Footer />
    </TooltipProvider>
  );
}

export default App;
