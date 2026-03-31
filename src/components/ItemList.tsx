import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Settings, History } from 'lucide-react';

interface ItemListProps {
  items: string[];
  onAdd: (name: string) => void;
  onDelete: (index: number) => void;
  onClear: () => void;
  onOpenConfig: () => void;
  onOpenHistory: () => void;
  disabled: boolean;
  remaining: number;
  limitEnabled: boolean;
}

export default function ItemList({
  items,
  onAdd,
  onDelete,
  onClear,
  onOpenConfig,
  onOpenHistory,
  disabled,
  remaining,
  limitEnabled,
}: ItemListProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = () => {
    const text = inputValue.trim();
    if (!text) return;
    if (items.length >= 16) {
      alert('最多只能添加16个项目');
      return;
    }
    onAdd(text);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-fg-muted">自定义项目</h2>

      {/* 输入区域 */}
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入项目内容"
          maxLength={20}
          disabled={disabled}
          className="flex-1"
        />
        <Button onClick={handleAdd} disabled={disabled || items.length >= 16} size="sm">
          <Plus className="h-4 w-4" />
          添加
        </Button>
      </div>

      {/* 使用限制提示 */}
      {limitEnabled && remaining !== Infinity && (
        <p className="text-xs text-fg-subtle">
          今日剩余 {remaining} 次
        </p>
      )}

      {/* 项目列表 */}
      <div className="border border-border rounded-md bg-canvas overflow-hidden">
        {items.length === 0 ? (
          <p className="p-4 text-sm text-fg-subtle text-center">暂无项目，请添加项目</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-center justify-between px-3 py-2 group">
                <span className="text-sm truncate">{item}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDelete(index)}
                  disabled={disabled}
                >
                  <Trash2 className="h-3.5 w-3.5 text-fg-muted" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={disabled || items.length === 0}
        >
          <Trash2 className="h-3.5 w-3.5" />
          清空所有
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onOpenConfig}>
            <Settings className="h-3.5 w-3.5" />
            配置
          </Button>
          <Button variant="ghost" size="sm" onClick={onOpenHistory}>
            <History className="h-3.5 w-3.5" />
            历史
          </Button>
        </div>
      </div>
    </div>
  );
}
