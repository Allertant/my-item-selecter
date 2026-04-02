import { useState, useRef, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Wheel from '@/components/Wheel';
import ItemList from '@/components/ItemList';
import ConfigModal from '@/components/ConfigModal';
import HistoryModal from '@/components/HistoryModal';
import { useAppLogic } from '@/hooks/useAppLogic';
import { useTheme } from '@/hooks/useTheme';
import { PartyPopper } from 'lucide-react';

function App() {
  const {
    items, history, remaining, isSpinning, currentRotation, startSpin,
    configOpen, setConfigOpen, historyOpen, setHistoryOpen,
    resultItem,
    handleAddItem, handleDeleteItem, handleClearItems,
    handleClearHistory, handleSaveConfig, limitSettings, limitEnabled,
  } = useAppLogic();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [expandRequest, setExpandRequest] = useState(0);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // 同步 focus + 展开，确保 iOS Safari 弹出键盘
  const handleEmptyClick = useCallback(() => {
    setExpandRequest(v => v + 1);
    // 折叠状态下 input DOM 仍存在，同步 focus 可触发 iOS 键盘
    mobileInputRef.current?.focus();
  }, []);

  return (
    <TooltipProvider>
      <Header
        onOpenConfig={() => setConfigOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex-1 px-4 py-6 md:px-6 lg:py-10 xl:py-14">
        <div className="mx-auto max-w-5xl">
          {/* 移动端：转盘+结果在上，列表在下。PC 端：左右双栏 */}
          <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-10 xl:gap-14 lg:justify-center">
            <div className="flex flex-col items-center lg:flex-shrink-0">
              <Wheel items={items} isSpinning={isSpinning} currentRotation={currentRotation} isDark={isDark} onEmptyClick={handleEmptyClick} />
              <Button onClick={startSpin} disabled={isSpinning || items.length === 0} size="lg" className="mt-6">
                开始旋转
              </Button>
              {/* 结果内联展示 - 预留固定高度避免布局移位 */}
              <div className="mt-3 h-9 flex items-center justify-center">
                {resultItem && (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-canvas border border-border">
                    <PartyPopper className="h-4 w-4 text-fg-muted shrink-0" />
                    <span className="text-sm text-fg">
                      选中了
                      <span className="font-semibold mx-1">{resultItem}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* PC 端：右侧面板 */}
            <div className="hidden lg:block w-full max-w-md lg:flex-1 xl:max-w-md">
              <ItemList
                items={items} onAdd={handleAddItem} onDelete={handleDeleteItem}
                onClear={handleClearItems} disabled={isSpinning}
                remaining={remaining} limitEnabled={limitEnabled}
                expandRequest={expandRequest}
              />
            </div>
          </div>
          {/* 移动端：列表放在最下方 */}
          <div className="mt-8 w-full max-w-md mx-auto lg:hidden">
            <ItemList
              items={items} onAdd={handleAddItem} onDelete={handleDeleteItem}
              onClear={handleClearItems} disabled={isSpinning}
              remaining={remaining} limitEnabled={limitEnabled}
              expandRequest={expandRequest}
              inputRef={mobileInputRef}
            />
          </div>
        </div>
      </main>
      <Footer />
      <ConfigModal open={configOpen} onOpenChange={setConfigOpen} settings={limitSettings} onSave={handleSaveConfig} usedCount={limitSettings.usedCount} remaining={remaining} />
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} history={history} onClear={handleClearHistory} />
    </TooltipProvider>
  );
}

export default App;
