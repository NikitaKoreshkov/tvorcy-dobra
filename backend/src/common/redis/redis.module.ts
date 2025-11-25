import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ThrottlerRedisStorage } from './throttler-redis.storage';

@Global()
@Module({
  providers: [RedisService, ThrottlerRedisStorage],
  exports: [RedisService, ThrottlerRedisStorage],
})
export class RedisModule {}

