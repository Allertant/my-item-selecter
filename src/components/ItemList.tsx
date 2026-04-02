import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface ItemListProps {
  items: string[];
  onAdd: (name: string) => void;
  onDelete: (index: number) => void;
  onClear: () => void;
  disabled: boolean;
  remaining: number;
  limitEnabled: boolean;
  /** 外部触发展开（每次值变化时展开并聚焦输入框） */
  expandRequest?: number;
  /** 外部传入的 input ref，用于同步 focus 触发 iOS 键盘 */
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export default function ItemList({
  items,
  onAdd,
  onDelete,
  onClear,
  disabled,
  remaining,
  limitEnabled,
  expandRequest,
  inputRef,
}: ItemListProps) {
  const [inputValue, setInputValue] = useState('');
  const [collapsed, setCollapsed] = useLocalStorage('wheel-collapsed', true);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const lastExpandRequest = useRef(expandRequest);

  // 同步外部 ref 到内部 ref
  useEffect(() => {
    if (inputRef && 'current' in inputRef) {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = internalInputRef.current;
    }
  }, [inputRef]);

  // 外部请求展开时，展开列表并聚焦输入框（只在值变化时触发，跳过初始挂载）
  useEffect(() => {
    if (expandRequest !== undefined && expandRequest !== lastExpandRequest.current) {
      lastExpandRequest.current = expandRequest;
      setCollapsed(false);
      // 等折叠动画完成后聚焦（非移动端场景的 fallback）
      setTimeout(() => internalInputRef.current?.focus(), 250);
    }
  }, [expandRequest, setCollapsed]);

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
    <div className="flex flex-col gap-3">
      {/* 标题栏（可点击折叠） */}
      <button
        type="button"
        className="flex items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg cursor-pointer select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
        <span>自定义项目{items.length > 0 ? ` (${items.length}项)` : ''}</span>
      </button>

      {/* 可折叠内容区域 */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{
          gridTemplateRows: collapsed ? '0fr' : '1fr',
        }}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-3">
            {/* 输入区域 */}
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  // iOS Safari 键盘收起后不会自动还原 scrollTop，导致页面偏移 Header 不可见
                  // 用 setTimeout 等待键盘收起动画完成后再归零
                  setTimeout(() => {
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }, 100);
                }}
                placeholder="输入项目内容"
                maxLength={20}
                disabled={disabled}
                className="flex-1"
                ref={internalInputRef}
              />
              <Button onClick={handleAdd} disabled={disabled || items.length >= 16} size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">添加</span>
              </Button>
            </div>

            {/* 使用限制提示 */}
            {limitEnabled && remaining !== Infinity && (
              <p className="text-xs text-fg-subtle">
                今日剩余 {remaining} 次
              </p>
            )}

            {/* 项目列表 */}
            <div className="border border-border rounded-md bg-canvas">
              {items.length === 0 ? (
                <p className="p-6 text-sm text-fg-subtle text-center">暂无项目，请添加</p>
              ) : (
                <ul className="divide-y divide-border">
                  {items.map((item, index) => (
                    <li key={`${item}-${index}`} className="flex items-center justify-between px-3 py-2.5 group">
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
            <div className="flex items-center">
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
        </div>
      </div>
    </div>
  );
}
