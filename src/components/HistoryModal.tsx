import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type { HistoryItem } from '@/types';

interface HistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: HistoryItem[];
  onClear: () => void;
}

export default function HistoryModal({
  open,
  onOpenChange,
  history,
  onClear,
}: HistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>历史记录</DialogTitle>
          <DialogDescription>查看过往抽选结果</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2 max-h-[300px] overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-sm text-fg-subtle text-center py-4">暂无历史记录</p>
          ) : (
            history.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 border border-border rounded-md bg-canvas-subtle"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-fg-subtle">{item.date} {item.time}</span>
                </div>
                <span className="text-xs text-fg-subtle">#{history.length - index}</span>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" size="sm" onClick={onClear}>
              <Trash2 className="h-3.5 w-3.5" />
              清空历史
            </Button>
            <Button onClick={() => onOpenChange(false)}>关闭</Button>
          </DialogFooter>
        )}

        {history.length === 0 && (
          <DialogFooter>
            <Button onClick={() => onOpenChange(false)}>关闭</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
