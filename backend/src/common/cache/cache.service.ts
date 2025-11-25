import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly memoryCache = new Map<string, { value: any; expiresAt: number }>();
  private readonly defaultTTL = 300; // 5 минут по умолчанию

  constructor(private readonly redisService: RedisService) {}

  /**
   * Получить значение из кэша
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Сначала пробуем Redis
      const client = this.redisService.getClient();
      if (client && client.status === 'ready') {
        const value = await this.redisService.get(key);
        if (value) {
          return JSON.parse(value) as T;
        }
      }

      // Fallback к памяти
      const cached = this.memoryCache.get(key);
      if (cached && cached.expiresAt > Date.now()) {
        return cached.value as T;
      }

      // Удаляем устаревший кэш
      if (cached) {
        this.memoryCache.delete(key);
      }

      return null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}: ${error.message}`);
      return null;
    }
  }

  /**
   * Сохранить значение в кэш
   */
  async set(key: string, value: any, ttl: number = this.defaultTTL): Promise<void> {
    try {
      const serialized = JSON.stringify(value);

      // Сохраняем в Redis
      const client = this.redisService.getClient();
      if (client && client.status === 'ready') {
        await this.redisService.set(key, serialized, ttl);
      }

      // Также сохраняем в памяти как fallback
      this.memoryCache.set(key, {
        value,
        expiresAt: Date.now() + ttl * 1000,
      });

      // Очищаем память от устаревших записей периодически
      if (this.memoryCache.size > 1000) {
        this.cleanExpired();
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Удалить значение из кэша
   */
  async delete(key: string): Promise<void> {
    try {
      await this.redisService.del(key);
      this.memoryCache.delete(key);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Удалить все ключи по паттерну
   */
  async deletePattern(pattern: string): Promise<void> {
    try {
      await this.redisService.flushPattern(pattern);
      // Очищаем память
      const keys = Array.from(this.memoryCache.keys());
      const regex = new RegExp(pattern.replace('*', '.*'));
      keys.forEach((key) => {
        if (regex.test(key)) {
          this.memoryCache.delete(key);
        }
      });
    } catch (error) {
      this.logger.error(`Cache deletePattern error for pattern ${pattern}: ${error.message}`);
    }
  }

  /**
   * Проверить существование ключа
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = this.redisService.getClient();
      if (client && client.status === 'ready') {
        return await this.redisService.exists(key);
      }
      return this.memoryCache.has(key);
    } catch (error) {
      return false;
    }
  }

  /**
   * Очистить устаревшие записи из памяти
   */
  private cleanExpired(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.memoryCache.forEach((value, key) => {
      if (value.expiresAt <= now) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.memoryCache.delete(key));
  }

  /**
   * Получить или установить значение (get-or-set pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = this.defaultTTL,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttl);
    return value;
  }
}

