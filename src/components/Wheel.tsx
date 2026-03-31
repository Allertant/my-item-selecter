import { useRef, useEffect, useState, useCallback } from 'react';
import { WHEEL_COLORS } from '@/lib/wheel-utils';

interface WheelProps {
  items: string[];
  isSpinning: boolean;
  currentRotation: number;
}

/** 转盘尺寸相关常量 */
const WHEEL = {
  /** 转盘移动端尺寸 */
  SIZE_MOBILE: 380,
  /** 转盘桌面端尺寸 */
  SIZE_DESKTOP: 460,
  /** 转盘扇形边距（防止内容贴边） */
  PADDING: 12,
  /** 中心圆半径 */
  CENTER_RADIUS: 32,
  /** 中心圆文字 */
  CENTER_TEXT: 'GO',
  /** 中心圆字号 */
  CENTER_FONT_SIZE: 14,
  /** 扇形文字最大字数（超出截断） */
  MAX_TEXT_LENGTH: 6,
  /** 空状态文字 */
  EMPTY_TEXT: '请添加项目',
  /** 空状态字号 */
  EMPTY_FONT_SIZE: 14,
  /** 空状态"+"臂长 */
  PLUS_ARM: 18,
  /** 列表最大项数 */
  MAX_ITEMS: 16,
  /** 扇形字号 - 移动端 */
  FONT_SIZE_MOBILE: 15,
  /** 扇形字号 - 桌面端 */
  FONT_SIZE_DESKTOP: 17,
} as const;

/** 获取转盘实际渲染尺寸 */
function getWheelSize(containerWidth: number, isDesktop: boolean): number {
  const base = isDesktop ? WHEEL.SIZE_DESKTOP : WHEEL.SIZE_MOBILE;
  return Math.min(containerWidth || base, base);
}

/** 获取扇形文字字号 */
function getSliceFontSize(size: number): number {
  return size >= 420 ? WHEEL.FONT_SIZE_DESKTOP : WHEEL.FONT_SIZE_MOBILE;
}

export default function Wheel({ items, isSpinning, currentRotation }: WheelProps) {
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

    const dpr = window.devicePixelRatio || 1;
    const isDesktop = container.clientWidth >= WHEEL.SIZE_MOBILE;
    const size = getWheelSize(container.clientWidth, isDesktop);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.max(1, (Math.min(centerX, centerY) - WHEEL.PADDING));

    if (items.length === 0) {
      // 空白转盘 — 明显的占位圆，带阴影和粗虚线边框
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 4;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      // 粗虚线边框
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#d0d7de';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 内圈装饰虚线
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = '#e8ecf0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // "+" 图标
      const plusY = centerY - 10;
      ctx.strokeStyle = '#656d76';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - WHEEL.PLUS_ARM, plusY);
      ctx.lineTo(centerX + WHEEL.PLUS_ARM, plusY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, plusY - WHEEL.PLUS_ARM);
      ctx.lineTo(centerX, plusY + WHEEL.PLUS_ARM);
      ctx.stroke();

      // 提示文字
      ctx.fillStyle = '#8b949e';
      ctx.font = `500 ${WHEEL.EMPTY_FONT_SIZE}px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(WHEEL.EMPTY_TEXT, centerX, centerY + 28);
      return;
    }

    const sliceAngle = (Math.PI * 2) / items.length;
    const sliceFontSize = getSliceFontSize(size);

    // 绘制扇形
    items.forEach((item, index) => {
      const startAngle = index * sliceAngle + currentRotation;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = WHEEL_COLORS[index % WHEEL_COLORS.length];
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 绘制文字
      const midAngle = startAngle + sliceAngle / 2;
      const textRadius = radius * 0.6;
      const textX = centerX + Math.cos(midAngle) * textRadius;
      const textY = centerY + Math.sin(midAngle) * textRadius;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
      ctx.shadowBlur = 2;
      ctx.fillStyle = '#ffffff';
      ctx.font = `600 ${sliceFontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif`;

      const text = item.length > WHEEL.MAX_TEXT_LENGTH
        ? item.substring(0, WHEEL.MAX_TEXT_LENGTH - 1) + '…'
        : item;
      ctx.fillText(text, textX, textY);
      ctx.restore();
    });

    // 中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, WHEEL.CENTER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#d0d7de';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#1f2328';
    ctx.font = `700 ${WHEEL.CENTER_FONT_SIZE}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(WHEEL.CENTER_TEXT, centerX, centerY);
  }, [items, currentRotation, dimensions]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (items.length === 0 || isSpinning) {
      setShowTooltip(false);
      return;
    }

    const rect = canvasRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius = Math.min(centerX, centerY) - WHEEL.PADDING;

    if (distance > radius || distance < WHEEL.CENTER_RADIUS) {
      setShowTooltip(false);
      return;
    }

    let angle = Math.atan2(dy, dx);
    if (angle < 0) angle += Math.PI * 2;

    const normalizedRotation = currentRotation % (Math.PI * 2);
    const effectiveAngle = (angle - normalizedRotation + Math.PI * 2) % (Math.PI * 2);
    const sliceAngle = (Math.PI * 2) / items.length;
    const index = Math.floor(effectiveAngle / sliceAngle);

    if (index >= 0 && index < items.length) {
      setTooltipText(items[index]);
      setTooltipPos({ x: e.clientX + 12, y: e.clientY - 28 });
      setShowTooltip(true);
    }
  }, [items, isSpinning, currentRotation]);

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] lg:w-[460px] lg:h-[460px] max-w-full aspect-square flex items-center justify-center"
      >
        <canvas
          ref={canvasRef}
          className="cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {/* 指针 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
            <path d="M10 24L0 4C0 1.79 1.79 0 4 0H16C18.21 0 20 1.79 20 4L10 24Z" fill="#1f2328" />
          </svg>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-50 rounded-md bg-fg px-2.5 py-1 text-xs text-canvas shadow-sm pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          {tooltipText}
        </div>
      )}
    </>
  );
}
