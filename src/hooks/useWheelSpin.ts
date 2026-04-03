import { useState, useRef, useCallback } from 'react';
import { easeOutCubic, calculateTargetRotation } from '@/lib/wheel-utils';

interface UseWheelSpinOptions {
  items: string[];
  /** 每帧绘制回调，直接操作 Canvas 绕过 React re-render */
  onFrame?: (rotation: number) => void;
  onSpinEnd?: (resultIndex: number) => void;
}

export function useWheelSpin({ items, onFrame, onSpinEnd }: UseWheelSpinOptions) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const animationRef = useRef<number>(0);
  // 用 ref 存储最新回调，避免 animate 闭包 stale
  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const startSpin = useCallback(() => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    const resultIndex = Math.floor(Math.random() * items.length);
    const targetRotation = calculateTargetRotation(currentRotation, resultIndex, items.length);
    const startRotation = currentRotation;
    const totalRotation = targetRotation - startRotation;
    const duration = 4000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const rotation = startRotation + totalRotation * easedProgress;

      // 直接调用绘制回调，绕过 React state 更新
      onFrameRef.current?.(rotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 动画结束，更新一次 state 供 tooltip 等功能使用
        setCurrentRotation(rotation);
        setIsSpinning(false);
        onSpinEnd?.(resultIndex);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [isSpinning, items, currentRotation, onSpinEnd]);

  // 清理动画帧
  const cancelSpin = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }
    setIsSpinning(false);
  }, []);

  return { startSpin, isSpinning, currentRotation, cancelSpin };
}
