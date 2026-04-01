interface WheelTooltipProps {
  text: string;
  position: { x: number; y: number };
  visible: boolean;
}

export function WheelTooltip({ text, position, visible }: WheelTooltipProps) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-md bg-fg px-2 py-1 text-xs text-canvas shadow-md"
      style={{ left: position.x, top: position.y }}
    >
      {text}
    </div>
  );
}
