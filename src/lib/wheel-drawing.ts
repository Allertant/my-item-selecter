import { getWheelColors } from './wheel-utils';

/** 转盘绘制相关常量 */
const DRAW = {
  /** 扇形边距 */
  PADDING: 12,
  /** 中心圆半径 */
  CENTER_RADIUS: 32,
  /** 中心圆文字 */
  CENTER_TEXT: 'GO',
  /** 中心圆字号 */
  CENTER_FONT_SIZE: 14,
  /** 扇形文字最大字数 */
  MAX_TEXT_LENGTH: 6,
  /** 空状态文字 */
  EMPTY_TEXT: '请添加项目',
  /** 空状态字号 */
  EMPTY_FONT_SIZE: 14,
  /** 空状态"+"臂长 */
  PLUS_ARM: 18,
  /** 扇形字号 - 移动端 */
  FONT_SIZE_MOBILE: 15,
  /** 扇形字号 - 桌面端 */
  FONT_SIZE_DESKTOP: 17,
  /** 字体栈 */
  FONT_STACK: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif',
  /** 字体栈（无中文） */
  FONT_STACK_EN: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

/** 白天模式绘制颜色 */
const COLORS_LIGHT = {
  emptyFill: '#ffffff',
  emptyBorder: '#d0d7de',
  emptyInnerCircle: '#e8ecf0',
  plusIcon: '#656d76',
  emptyText: '#8b949e',
  sliceText: '#ffffff',
  sliceSeparator: 'rgba(255, 255, 255, 0.8)',
  sliceTextShadow: 'rgba(0, 0, 0, 0.4)',
  centerFill: '#ffffff',
  centerBorder: '#d0d7de',
  centerText: '#1f2328',
  centerTextShadow: 'none',
} as const;

/** 夜晚模式绘制颜色 */
const COLORS_DARK = {
  emptyFill: '#0d1117',
  emptyBorder: '#30363d',
  emptyInnerCircle: '#21262d',
  plusIcon: '#8b949e',
  emptyText: '#6e7681',
  sliceText: '#e6edf3',
  sliceSeparator: 'rgba(48, 54, 61, 0.8)',
  sliceTextShadow: 'rgba(0, 0, 0, 0.6)',
  centerFill: '#e6edf3',
  centerBorder: '#30363d',
  centerText: '#1f2328',
  centerTextShadow: 'none',
} as const;

function getDrawColors(isDark: boolean) {
  return isDark ? COLORS_DARK : COLORS_LIGHT;
}

/** 绘制上下文信息 */
interface DrawContext {
  ctx: CanvasRenderingContext2D;
  size: number;
  centerX: number;
  centerY: number;
  radius: number;
}

/** 创建绘制上下文 */
export function createDrawContext(
  ctx: CanvasRenderingContext2D,
  size: number,
): DrawContext {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.max(1, Math.min(centerX, centerY) - DRAW.PADDING);
  return { ctx, size, centerX, centerY, radius };
}

/** 获取扇形文字字号 */
export function getSliceFontSize(size: number): number {
  return size >= 420 ? DRAW.FONT_SIZE_DESKTOP : DRAW.FONT_SIZE_MOBILE;
}

/** 清空画布 */
export function clearCanvas(dc: DrawContext) {
  dc.ctx.clearRect(0, 0, dc.size, dc.size);
}

/** 绘制空白转盘 */
export function drawEmptyWheel(dc: DrawContext, isDark: boolean) {
  const { ctx, centerX, centerY, radius } = dc;
  const c = getDrawColors(isDark);

  // 圆 + 阴影
  ctx.save();
  ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.06)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = c.emptyFill;
  ctx.fill();
  ctx.restore();

  // 粗虚线边框
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = c.emptyBorder;
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  // 内圈装饰虚线
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.65, 0, Math.PI * 2);
  ctx.strokeStyle = c.emptyInnerCircle;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  // "+" 图标
  const plusY = centerY - 10;
  ctx.strokeStyle = c.plusIcon;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(centerX - DRAW.PLUS_ARM, plusY);
  ctx.lineTo(centerX + DRAW.PLUS_ARM, plusY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(centerX, plusY - DRAW.PLUS_ARM);
  ctx.lineTo(centerX, plusY + DRAW.PLUS_ARM);
  ctx.stroke();

  // 提示文字
  ctx.fillStyle = c.emptyText;
  ctx.font = `500 ${DRAW.EMPTY_FONT_SIZE}px ${DRAW.FONT_STACK}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(DRAW.EMPTY_TEXT, centerX, centerY + 28);
}

/** 绘制扇形 */
export function drawSlices(dc: DrawContext, items: string[], currentRotation: number, isDark: boolean) {
  const { ctx, centerX, centerY, radius, size } = dc;
  const c = getDrawColors(isDark);
  const sliceAngle = (Math.PI * 2) / items.length;
  const fontSize = getSliceFontSize(size);
  const colors = getWheelColors(isDark);

  items.forEach((item, index) => {
    const startAngle = index * sliceAngle + currentRotation;
    const endAngle = startAngle + sliceAngle;

    // 扇形填充
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();
    ctx.strokeStyle = c.sliceSeparator;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 扇形文字
    const midAngle = startAngle + sliceAngle / 2;
    const textRadius = radius * 0.6;
    const textX = centerX + Math.cos(midAngle) * textRadius;
    const textY = centerY + Math.sin(midAngle) * textRadius;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = c.sliceTextShadow;
    ctx.shadowBlur = 2;
    ctx.fillStyle = c.sliceText;
    ctx.font = `600 ${fontSize}px ${DRAW.FONT_STACK}`;

    const text = item.length > DRAW.MAX_TEXT_LENGTH
      ? item.substring(0, DRAW.MAX_TEXT_LENGTH - 1) + '…'
      : item;
    ctx.fillText(text, textX, textY);
    ctx.restore();
  });
}

/** 绘制中心圆 */
export function drawCenter(dc: DrawContext, isDark: boolean) {
  const { ctx, centerX, centerY } = dc;
  const c = getDrawColors(isDark);

  ctx.beginPath();
  ctx.arc(centerX, centerY, DRAW.CENTER_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = c.centerFill;
  ctx.fill();
  ctx.strokeStyle = c.centerBorder;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = c.centerText;
  ctx.font = `700 ${DRAW.CENTER_FONT_SIZE}px ${DRAW.FONT_STACK_EN}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(DRAW.CENTER_TEXT, centerX, centerY);
}
