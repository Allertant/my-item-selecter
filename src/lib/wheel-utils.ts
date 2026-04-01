/** GitHub 风格双色交替配色（白天模式） */
export const WHEEL_COLORS_LIGHT = [
  '#656d76', '#c9d1d9',
] as const;

/** GitHub 风格双色交替配色（夜晚模式） */
export const WHEEL_COLORS_DARK = [
  '#30363d', '#21262d',
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
  const minSpins = 5;
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
