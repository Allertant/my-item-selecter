/** 亮色模式：鲜亮柔和的多彩配色 */
export const WHEEL_COLORS_LIGHT = [
  '#4A90D9', // 钢蓝
  '#F5A623', // 琥珀橙
  '#7ED321', // 草绿
  '#D0021B', // 正红
  '#9013FE', // 紫罗兰
  '#50E3C2', // 薄荷绿
] as const;

/** 暗色模式：偏暗灰的低饱和配色 */
export const WHEEL_COLORS_DARK = [
  '#4B5563', // 暗灰
  '#6B7280', // 中灰
  '#374151', // 深灰
  '#52525B', // 灰锌
  '#3F4A5C', // 蓝灰
  '#4A4E54', // 铁灰
] as const;

/** 根据主题获取配色 */
export function getWheelColors(isDark: boolean) {
  return isDark ? WHEEL_COLORS_DARK : WHEEL_COLORS_LIGHT;
}

/** 白天模式 */
export const WHEEL_COLORS = WHEEL_COLORS_LIGHT;

/** 缓动函数：easeOutCubic */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/** 计算转盘最终旋转角度 */
export function calculateTargetRotation(
  currentRotation: number,
  resultIndex: number,
  itemCount: number,
): number {
  const minSpins = 8;
  const sliceAngle = (Math.PI * 2) / itemCount;
  const pointerAngle = (3 * Math.PI) / 2;
  const targetSliceStart = pointerAngle - sliceAngle / 2;
  const baseTargetRotation = targetSliceStart - resultIndex * sliceAngle;
  let targetRotation = baseTargetRotation + minSpins * Math.PI * 2;
  const minTotalRotation = Math.PI * 2 * (minSpins + 0.5);
  while (targetRotation - currentRotation < minTotalRotation) {
    targetRotation += Math.PI * 2;
  }
  return targetRotation;
}
