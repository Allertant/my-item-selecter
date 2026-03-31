import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: string | null;
}

export default function ResultModal({ open, onOpenChange, result }: ResultModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>抽选结果</DialogTitle>
          <DialogDescription>转盘已为你做出选择</DialogDescription>
        </DialogHeader>

        {result && (
          <div className="py-6 text-center">
            <p className="text-2xl font-bold text-fg">{result}</p>
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={() => onOpenChange(false)}>确定</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
