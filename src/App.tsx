import { useState, useCallback } from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Wheel from '@/components/Wheel';
import ItemList from '@/components/ItemList';
import ItemManageModal from '@/components/ItemManageModal';
import ConfigModal from '@/components/ConfigModal';
import HistoryModal from '@/components/HistoryModal';
import { useAppLogic } from '@/hooks/useAppLogic';
import { useTheme } from '@/hooks/useTheme';
import { PartyPopper, ListChecks } from 'lucide-react';

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
  const [mobileManageOpen, setMobileManageOpen] = useState(false);

  // 同步 focus + 展开并打开管理页（移动端点击空白转盘时）
  const handleEmptyClick = useCallback(() => {
    setMobileManageOpen(true);
  }, []);

  return (
    <TooltipProvider>
      <Header
        onOpenConfig={() => setConfigOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <main className="flex-1 flex flex-col items-center justify-center overflow-hidden px-4 py-4 md:px-6 lg:py-10 xl:py-14">
        <div className="mx-auto max-w-5xl flex flex-col items-center lg:flex-row lg:items-start lg:gap-10 xl:gap-14 lg:justify-center">
          <div className="flex flex-col items-center lg:flex-shrink-0">
            {/* 结果内联展示 - 预留固定高度避免布局移位 */}
            <div className="h-10 lg:h-12 flex items-center justify-center">
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
            <Wheel items={items} isSpinning={isSpinning} currentRotation={currentRotation} isDark={isDark} onEmptyClick={handleEmptyClick} />
            <div className="flex items-center gap-3 mt-4 lg:mt-6">
              <Button onClick={startSpin} disabled={isSpinning || items.length === 0} size="lg">
                开始旋转
              </Button>
              {/* 移动端：管理项目入口 */}
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileManageOpen(true)}
                aria-label="管理项目"
              >
                <ListChecks className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {/* PC 端：右侧面板 */}
          <div className="hidden lg:block w-full max-w-md lg:flex-1 xl:max-w-md">
            <ItemList
              items={items} onAdd={handleAddItem} onDelete={handleDeleteItem}
              onClear={handleClearItems} disabled={isSpinning}
              remaining={remaining} limitEnabled={limitEnabled}
            />
          </div>
        </div>
      </main>
      <Footer />
      <ItemManageModal
        open={mobileManageOpen}
        onOpenChange={setMobileManageOpen}
        items={items}
        onAdd={handleAddItem}
        onDelete={handleDeleteItem}
        onClear={handleClearItems}
        disabled={isSpinning}
        remaining={remaining}
        limitEnabled={limitEnabled}
      />
      <ConfigModal open={configOpen} onOpenChange={setConfigOpen} settings={limitSettings} onSave={handleSaveConfig} usedCount={limitSettings.usedCount} remaining={remaining} />
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} history={history} onClear={handleClearHistory} />
    </TooltipProvider>
  );
}

export default App;
