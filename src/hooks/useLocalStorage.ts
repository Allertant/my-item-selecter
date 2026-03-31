import { useState, useEffect, useCallback } from 'react';

/**
 * localStorage 读写 Hook
 * 支持泛型，自动序列化/反序列化 JSON
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => {
      const resolved = newValue instanceof Function ? newValue(prev) : newValue;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // localStorage 满 or 不可用，静默处理
      }
      return resolved;
    });
  }, [key]);

  return [value, setStoredValue];
}
