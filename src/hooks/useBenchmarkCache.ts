
import { useState, useCallback } from 'react';

interface CacheEntry {
  data: string;
  timestamp: number;
  description: string;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export const useBenchmarkCache = () => {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

  const getCachedData = useCallback((description: string): string | null => {
    const key = description.toLowerCase().trim();
    const entry = cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry.data;
    }
    
    return null;
  }, [cache]);

  const setCachedData = useCallback((description: string, data: string) => {
    const key = description.toLowerCase().trim();
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      description
    };
    
    setCache(prev => new Map(prev).set(key, entry));
  }, []);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return {
    getCachedData,
    setCachedData,
    clearCache
  };
};
