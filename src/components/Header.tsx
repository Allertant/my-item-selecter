import { Target } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-header text-white px-6 py-3 flex items-center gap-3 shadow-sm">
      <Target size={22} />
      <h1 className="text-base font-semibold">幸运转盘</h1>
    </header>
  );
}
