import { useRef, useEffect, useState, useCallback } from 'react';
import { WHEEL_COLORS } from '@/lib/wheel-utils';

interface WheelProps {
  items: string[];
  isSpinning: boolean;
  currentRotation: number;
}

export default function Wheel({ items, isSpinning, currentRotation }: WheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipText, setTooltipText] = useState('');
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeRef = useRef(400);

  // 设置 Canvas（高 DPI 适配）
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const containerWidth = container.clientWidth;
    const isMobile = window.innerWidth <= 600;
    const maxSize = isMobile ? 280 : 400;
    const size = Math.min(maxSize, containerWidth);

    sizeRef.current = size;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
  }, []);

  // 绘制转盘
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = sizeRef.current;
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // 重置 transform 后设置缩放
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    if (items.length === 0) {
      // 空白转盘
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f6f8fa';
      ctx.fill();
      ctx.strokeStyle = '#d0d7de';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#656d76';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('请添加项目', centerX, centerY);
      return;
    }

    const sliceAngle = (Math.PI * 2) / items.length;

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
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制文字
      const midAngle = startAngle + sliceAngle / 2;
      const textRadius = radius * 0.6;
      const textX = centerX + Math.cos(midAngle) * textRadius;
      const textY = centerY + Math.sin(midAngle) * textRadius;

      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 16px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';

      const text = item.length > 6 ? item.substring(0, 5) + '...' : item;
      ctx.fillText(text, textX, textY);
      ctx.restore();
    });

    // 中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#d0d7de';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#24292f';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GO', centerX, centerY);
  }, [items, currentRotation]);

  // 窗口大小变化时重新设置
  useEffect(() => {
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, [setupCanvas]);

  // 鼠标悬停 Tooltip
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
    const radius = Math.min(centerX, centerY) - 10;

    if (distance > radius || distance < 30) {
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
      <div ref={containerRef} className="relative inline-flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="cursor-pointer rounded-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {/* 指针 */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
          <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-fg" />
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          className="fixed z-50 rounded bg-fg px-2 py-1 text-xs text-canvas pointer-events-none"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          {tooltipText}
        </div>
      )}
    </>
  );
}
