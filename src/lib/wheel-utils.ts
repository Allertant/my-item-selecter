/** GitHub 风格黑白灰配色（白天模式） */
export const WHEEL_COLORS_LIGHT = [
  '#24292f', '#57606a', '#8b949e', '#6e7781',
  '#3a3f47', '#4a5058', '#6a737d', '#545d68',
  '#2c313a', '#7a828e', '#3d4450', '#8e959f',
  '#484f58', '#5c6370', '#9199a2', '#3b424c',
] as const;

/** 深色系配色（夜晚模式） */
export const WHEEL_COLORS_DARK = [
  '#3d4450', '#484f58', '#5c6370', '#6e7681',
  '#3a414a', '#4a515a', '#565d67', '#636b75',
  '#3f4652', '#525a64', '#4b5260', '#6a7078',
  '#434a54', '#585f69', '#606870', '#3b424c',
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
