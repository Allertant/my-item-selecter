import { useRef, useEffect, useState, useCallback } from 'react';
import { createDrawContext, clearCanvas, drawEmptyWheel, drawSlices, drawCenter } from '@/lib/wheel-drawing';
import { WheelTooltip } from '@/components/WheelTooltip';

interface WheelProps {
  items: string[];
  isSpinning: boolean;
  currentRotation: number;
  isDark: boolean;
}

/** 转盘尺寸相关常量 */
const WHEEL = {
  SIZE_MOBILE: 380,
  SIZE_DESKTOP: 460,
  PADDING: 12,
  CENTER_RADIUS: 32,
} as const;

/** 获取转盘实际渲染尺寸 */
function getWheelSize(containerWidth: number, isDesktop: boolean): number {
  const base = isDesktop ? WHEEL.SIZE_DESKTOP : WHEEL.SIZE_MOBILE;
  return Math.min(containerWidth || base, base);
}

/** 获取鼠标悬停的扇形索引 */
function getHoveredSliceIndex(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  currentRotation: number,
  itemCount: number,
): number | null {
  const x = clientX - canvasRect.left;
  const y = clientY - canvasRect.top;
  const centerX = canvasRect.width / 2;
  const centerY = canvasRect.height / 2;
  const dx = x - centerX;
  const dy = y - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const radius = Math.min(centerX, centerY) - WHEEL.PADDING;

  if (distance > radius || distance < WHEEL.CENTER_RADIUS) return null;

  let angle = Math.atan2(dy, dx);
  if (angle < 0) angle += Math.PI * 2;

  const normalizedRotation = currentRotation % (Math.PI * 2);
  const effectiveAngle = (angle - normalizedRotation + Math.PI * 2) % (Math.PI * 2);
  const sliceAngle = (Math.PI * 2) / itemCount;
  const index = Math.floor(effectiveAngle / sliceAngle);

  return index >= 0 && index < itemCount ? index : null;
}

export default function Wheel({ items, isSpinning, currentRotation, isDark }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipText, setTooltipText] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const isDesktop = container.clientWidth >= WHEEL.SIZE_MOBILE;
    const size = getWheelSize(container.clientWidth, isDesktop);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const dc = createDrawContext(ctx, size);
    clearCanvas(dc);

    if (items.length === 0) {
      drawEmptyWheel(dc, isDark);
    } else {
      drawSlices(dc, items, currentRotation, isDark);
      drawCenter(dc, isDark);
    }
  }, [items, currentRotation, dimensions, isDark]);

  useEffect(() => {
    const handleResize = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (items.length === 0 || isSpinning || !canvasRef.current) {
      setShowTooltip(false);
      return;
    }
    const rect = canvasRef.current.getBoundingClientRect();
    const index = getHoveredSliceIndex(e.clientX, e.clientY, rect, currentRotation, items.length);
    if (index !== null) {
      setTooltipText(items[index]);
      setTooltipPos({ x: e.clientX + 12, y: e.clientY - 28 });
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }
  }, [items, isSpinning, currentRotation]);

  const handleMouseLeave = useCallback(() => setShowTooltip(false), []);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-[340px] sm:w-[380px] lg:w-[460px] max-w-full aspect-square flex items-center justify-center"
      >
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-fg drop-shadow-sm" />
        </div>
        <canvas
          ref={canvasRef}
          className="cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
      </div>
      <WheelTooltip text={tooltipText} position={tooltipPos} visible={showTooltip} />
    </>
  );
}
