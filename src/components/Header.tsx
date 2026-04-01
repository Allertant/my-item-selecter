import { Target, Settings, History, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onOpenConfig: () => void;
  onOpenHistory: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Header({ onOpenConfig, onOpenHistory, theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-header text-white px-4 py-2.5 sm:px-6 lg:px-10 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Target className="h-[18px] w-[18px] lg:h-5 lg:w-5" />
        <h1 className="text-sm lg:text-base font-semibold tracking-wide">幸运转盘</h1>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-md hover:bg-white/10 transition-colors"
          aria-label={theme === 'dark' ? '切换到白天模式' : '切换到夜晚模式'}
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />
          }
        </button>
        <button
          onClick={onOpenConfig}
          className="p-2 rounded-md hover:bg-white/10 transition-colors"
          aria-label="配置"
        >
          <Settings className="h-4 w-4" />
        </button>
        <button
          onClick={onOpenHistory}
          className="p-2 rounded-md hover:bg-white/10 transition-colors"
          aria-label="历史记录"
        >
          <History className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
