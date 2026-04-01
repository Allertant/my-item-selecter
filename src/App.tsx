import { TooltipProvider } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Wheel from '@/components/Wheel';
import ItemList from '@/components/ItemList';
import ConfigModal from '@/components/ConfigModal';
import HistoryModal from '@/components/HistoryModal';
import ResultModal from '@/components/ResultModal';
import { useAppLogic } from '@/hooks/useAppLogic';

function App() {
  const {
    items, history, remaining, isSpinning, currentRotation, startSpin,
    configOpen, setConfigOpen, historyOpen, setHistoryOpen,
    resultOpen, setResultOpen, resultItem,
    handleAddItem, handleDeleteItem, handleClearItems,
    handleClearHistory, handleSaveConfig, limitSettings, limitEnabled,
  } = useAppLogic();

  return (
    <TooltipProvider>
      <Header
        onOpenConfig={() => setConfigOpen(true)}
        onOpenHistory={() => setHistoryOpen(true)}
      />
      <main className="flex-1 px-4 py-6 md:px-6 lg:py-10 xl:py-14">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center lg:flex-row lg:items-start lg:gap-10 xl:gap-14 lg:justify-center">
            <div className="flex flex-col items-center lg:flex-shrink-0">
              <Wheel items={items} isSpinning={isSpinning} currentRotation={currentRotation} />
              <Button onClick={startSpin} disabled={isSpinning || items.length === 0} size="lg" className="mt-6">
                开始旋转
              </Button>
            </div>
            <div className="mt-8 lg:mt-0 w-full max-w-md mx-auto lg:mx-0 lg:flex-1 xl:max-w-md">
              <ItemList
                items={items} onAdd={handleAddItem} onDelete={handleDeleteItem}
                onClear={handleClearItems} disabled={isSpinning}
                remaining={remaining} limitEnabled={limitEnabled}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ConfigModal open={configOpen} onOpenChange={setConfigOpen} settings={limitSettings} onSave={handleSaveConfig} usedCount={limitSettings.usedCount} remaining={remaining} />
      <HistoryModal open={historyOpen} onOpenChange={setHistoryOpen} history={history} onClear={handleClearHistory} />
      <ResultModal open={resultOpen} onOpenChange={setResultOpen} result={resultItem} />
    </TooltipProvider>
  );
}

export default App;
