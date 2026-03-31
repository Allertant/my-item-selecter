import { Target, Settings, History } from 'lucide-react';

interface HeaderProps {
  onOpenConfig: () => void;
  onOpenHistory: () => void;
}

export default function Header({ onOpenConfig, onOpenHistory }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-header text-white px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <Target size={20} />
        <h1 className="text-sm font-semibold tracking-wide">幸运转盘</h1>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onOpenConfig}
          className="p-2 rounded-md hover:bg-white/10 transition-colors"
          title="配置"
        >
          <Settings size={16} />
        </button>
        <button
          onClick={onOpenHistory}
          className="p-2 rounded-md hover:bg-white/10 transition-colors"
          title="历史记录"
        >
          <History size={16} />
        </button>
      </div>
    </header>
  );
}
