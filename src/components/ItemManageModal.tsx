import { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, X } from 'lucide-react';

interface ItemManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: string[];
  onAdd: (name: string) => void;
  onDelete: (index: number) => void;
  onClear: () => void;
  disabled: boolean;
  remaining: number;
  limitEnabled: boolean;
}

export default function ItemManageModal({
  open,
  onOpenChange,
  items,
  onAdd,
  onDelete,
  onClear,
  disabled,
  remaining,
  limitEnabled,
}: ItemManageModalProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 打开时自动聚焦输入框
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setInputValue('');
    }
  }, [open]);

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-canvas flex flex-col" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      {/* 顶栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <h2 className="text-base font-semibold text-fg">管理项目{items.length > 0 ? ` (${items.length}项)` : ''}</h2>
        <button
          onClick={() => onOpenChange(false)}
          className="p-2 rounded-md hover:bg-canvas-subtle"
          aria-label="关闭"
        >
          <X className="h-5 w-5 text-fg-muted" />
        </button>
      </div>

      {/* 可滚动内容区 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {/* 输入区域 */}
        <div className="flex gap-2 shrink-0">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // iOS Safari 键盘收起后还原 scrollTop
              setTimeout(() => {
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
              }, 100);
            }}
            placeholder="输入项目内容"
            maxLength={20}
            disabled={disabled}
            className="flex-1"
            ref={inputRef}
          />
          <Button onClick={handleAdd} disabled={disabled || items.length >= 16} size="sm">
            <Plus className="h-4 w-4" />
            添加
          </Button>
        </div>

        {/* 使用限制提示 */}
        {limitEnabled && remaining !== Infinity && (
          <p className="text-xs text-fg-subtle shrink-0">
            今日剩余 {remaining} 次
          </p>
        )}

        {/* 项目列表 */}
        <div className="border border-border rounded-md bg-canvas-subtle flex-1">
          {items.length === 0 ? (
            <p className="p-8 text-sm text-fg-subtle text-center">暂无项目，请添加</p>
          ) : (
            <ul className="divide-y divide-border">
              {items.map((item, index) => (
                <li key={`${item}-${index}`} className="flex items-center justify-between px-3 py-3">
                  <span className="text-sm truncate">{item}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
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
        <div className="flex items-center shrink-0 pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            disabled={disabled || items.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5" />
            清空所有
          </Button>
        </div>
      </div>

      {/* iOS 安全区底部间距 */}
      <div className="shrink-0" style={{ height: 'env(safe-area-inset-bottom, 0px)' }} />
    </div>
  );
}
