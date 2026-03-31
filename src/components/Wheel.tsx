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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 绘制转盘（包含 Canvas 初始化，确保 setupCanvas 一定在绘制前执行）
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    // 每次绘制前重新计算尺寸，防止容器未渲染导致 size 为 0
    const containerWidth = container.clientWidth || 400;
    const size = Math.min(400, containerWidth);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 重置 transform 后设置缩放
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = Math.min(centerX, centerY) - 10;

    if (items.length === 0) {
      // 空白转盘 — 明显的占位圆，带阴影和粗虚线边框
      // 阴影
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;

      // 外圈填充 + 粗虚线边框
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#1f2328';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([10, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 内圈装饰虚线
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = '#d0d7de';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // "+" 图标（居中偏上）
      const plusY = centerY - 10;
      const armLen = 18;
      ctx.strokeStyle = '#1f2328';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - armLen, plusY);
      ctx.lineTo(centerX + armLen, plusY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(centerX, plusY - armLen);
      ctx.lineTo(centerX, plusY + armLen);
      ctx.stroke();

      // 提示文字（居中偏下）
      ctx.fillStyle = '#656d76';
      ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('请添加项目', centerX, centerY + 28);
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
  }, [items, currentRotation, dimensions]);
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div ref={containerRef} className="relative w-[400px] h-[400px] max-w-full aspect-square flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="cursor-pointer rounded-full"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        {/* 指针 */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10">
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
