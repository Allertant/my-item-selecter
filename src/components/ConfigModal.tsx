import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { LimitSettings } from '@/types';

interface ConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: LimitSettings;
  onSave: (settings: LimitSettings) => void;
  usedCount: number;
  remaining: number;
}

export default function ConfigModal({
  open,
  onOpenChange,
  settings,
  onSave,
  usedCount,
  remaining,
}: ConfigModalProps) {
  const [localEnabled, setLocalEnabled] = useState(settings.enabled);
  const [localLimit, setLocalLimit] = useState(settings.dailyLimit);

  // 弹窗打开时同步外部状态
  useEffect(() => {
    if (open) {
      setLocalEnabled(settings.enabled);
      setLocalLimit(settings.dailyLimit);
    }
  }, [open, settings.enabled, settings.dailyLimit]);

  const handleSave = () => {
    onSave({
      ...settings,
      enabled: localEnabled,
      dailyLimit: localLimit,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>使用限制设置</DialogTitle>
          <DialogDescription>配置每日使用次数限制</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* 开关 */}
          <div className="flex items-center justify-between">
            <span className="text-sm">开启每日使用限制</span>
            <Switch
              checked={localEnabled}
              onCheckedChange={setLocalEnabled}
            />
          </div>

          {/* 每日次数 */}
          <div className="flex items-center justify-between">
            <span className="text-sm">每日可用次数</span>
            <Input
              type="number"
              min={1}
              max={100}
              value={localLimit}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 1 && v <= 100) setLocalLimit(v);
              }}
              className="w-20 text-center"
            />
          </div>

          {/* 使用情况 */}
          <div className="border-t border-border pt-3 text-sm text-fg-muted space-y-1">
            <p>今日已使用：{usedCount} 次</p>
            <p>剩余次数：{remaining === Infinity ? '∞' : remaining} 次</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSave}>确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
