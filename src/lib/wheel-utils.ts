/** GitHub 风格黑白灰配色 */
export const WHEEL_COLORS = [
  '#24292f', '#57606a', '#8b949e', '#6e7781',
  '#3a3f47', '#4a5058', '#6a737d', '#545d68',
  '#2c313a', '#7a828e', '#3d4450', '#8e959f',
  '#484f58', '#5c6370', '#9199a2', '#3b424c',
] as const;

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
