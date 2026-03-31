import { useState, useRef, useCallback } from 'react';
import { easeOutCubic, calculateTargetRotation } from '@/lib/wheel-utils';

interface UseWheelSpinOptions {
  items: string[];
  onSpinEnd?: (resultIndex: number) => void;
}

export function useWheelSpin({ items, onSpinEnd }: UseWheelSpinOptions) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const animationRef = useRef<number>(0);

  const startSpin = useCallback(() => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    const resultIndex = Math.floor(Math.random() * items.length);
    const targetRotation = calculateTargetRotation(currentRotation, resultIndex, items.length);
    const startRotation = currentRotation;
    const totalRotation = targetRotation - startRotation;
    const duration = 3000;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const rotation = startRotation + totalRotation * easedProgress;
      setCurrentRotation(rotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
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
