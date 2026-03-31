export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-header text-white px-6 py-3 flex items-center gap-3 shadow-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2 L14 10 L12 12 L10 10 Z" />
        <path d="M12 12 L14 14 L12 22 L10 14 Z" />
        <path d="M2 12 L10 10 L12 12 L10 14 Z" />
        <path d="M22 12 L14 10 L12 12 L14 14 Z" />
      </svg>
      <h1 className="text-base font-semibold">幸运转盘</h1>
    </header>
  );
}
