import { ThrottlerStorage } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

// Интерфейс ThrottlerStorageRecord не экспортируется из пакета, определяем его здесь
interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

@Injectable()
export class ThrottlerRedisStorage implements ThrottlerStorage {
  constructor(private readonly redisService: RedisService) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    try {
      const client = this.redisService.getClient();
      if (!client || !client.status || client.status !== 'ready') {
        // Если Redis недоступен, возвращаем базовую запись (fallback к in-memory)
        return this.getDefaultRecord(ttl);
      }

      const now = Date.now();
      const ttlSeconds = Math.ceil(ttl / 1000);
      const blockKey = `${key}:block`;
      const hitsKey = `${key}:hits`;
      const expiresKey = `${key}:expires`;

      // Проверяем, заблокирован ли ключ
      const blockExists = await client.exists(blockKey);
      let blockExpiresAt: string | null = null;
      if (blockExists) {
        blockExpiresAt = await client.get(blockKey);
      }
      
      const blockExpiresAtTime = blockExpiresAt ? parseInt(blockExpiresAt) : 0;
      const timeToBlockExpire = blockExpiresAtTime > now
        ? Math.ceil((blockExpiresAtTime - now) / 1000)
        : 0;

      if (blockExists && blockExpiresAtTime > now) {
        // Ключ заблокирован - получаем текущее количество запросов
        const currentHits = await client.get(hitsKey);
        const totalHits = currentHits ? parseInt(currentHits) : limit;
        
        return {
          totalHits,
          timeToExpire: 0,
          isBlocked: true,
          timeToBlockExpire,
        };
      }

      // Увеличиваем счетчик запросов
      const totalHits = await client.incr(hitsKey);
      
      // Устанавливаем TTL для счетчика, если это первый запрос
      if (totalHits === 1) {
        await client.setex(expiresKey, ttlSeconds, now.toString());
      }

      // Получаем время истечения
      const expiresAtStr = await client.get(expiresKey);
      const expiresAt = expiresAtStr ? parseInt(expiresAtStr) : now + ttl;
      const timeToExpire = Math.ceil((expiresAt - now) / 1000);

      // Если превышен лимит, блокируем ключ
      if (totalHits > limit) {
        const blockExpiresAtTime = now + blockDuration;
        await client.setex(blockKey, Math.ceil(blockDuration / 1000), blockExpiresAtTime.toString());
        
        return {
          totalHits,
          timeToExpire,
          isBlocked: true,
          timeToBlockExpire: Math.ceil(blockDuration / 1000),
        };
      }

      // Обновляем TTL для счетчика
      await client.expire(hitsKey, ttlSeconds);

      return {
        totalHits,
        timeToExpire,
        isBlocked: false,
        timeToBlockExpire: 0,
      };
    } catch (error) {
      // В случае ошибки возвращаем базовую запись
      return this.getDefaultRecord(ttl);
    }
  }

  private getDefaultRecord(ttl: number): ThrottlerStorageRecord {
    return {
      totalHits: 0,
      timeToExpire: Math.ceil(ttl / 1000),
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }
}

