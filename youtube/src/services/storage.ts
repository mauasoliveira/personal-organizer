import type { CachedData } from '../types/youtube';
import { CACHE_DURATION } from '../utils/constants';

export class StorageService {
  private static instance: StorageService;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  setItem<T>(key: string, data: T, ttl: number = CACHE_DURATION.SUBSCRIPTIONS): void {
    try {
      const cachedData: CachedData<T> = {
        data,
        cachedAt: Date.now(),
        expiresAt: Date.now() + ttl
      };
      localStorage.setItem(key, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      // Handle quota exceeded or other storage errors
      this.handleStorageError(error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cachedData: CachedData<T> = JSON.parse(item);
      
      // Check if data is expired
      if (Date.now() > cachedData.expiresAt) {
        this.removeItem(key);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      this.removeItem(key);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      // Only clear app-specific keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('yt_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => this.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  getStorageSize(): number {
    try {
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('yt_')) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  getStorageUsage(): string {
    const size = this.getStorageSize();
    return this.formatBytes(size);
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private handleStorageError(error: any): void {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // Handle quota exceeded by clearing old data
      console.warn('Storage quota exceeded, clearing old data...');
      this.clearOldData();
    }
  }

  private clearOldData(): void {
    try {
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('yt_')) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const cachedData = JSON.parse(item);
              if (cachedData.expiresAt && now > cachedData.expiresAt) {
                keysToRemove.push(key);
              }
            } catch (error) {
              // Invalid data, remove it
              keysToRemove.push(key);
            }
          }
        }
      }
      
      keysToRemove.forEach(key => this.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} expired items from storage`);
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  }

  // Utility method to export all app data
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('yt_')) {
          const item = localStorage.getItem(key);
          if (item) {
            data[key] = JSON.parse(item);
          }
        }
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
    return data;
  }

  // Utility method to import data
  importData(data: Record<string, any>): void {
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('yt_')) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }
}