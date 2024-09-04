import { CacheModule } from '@nestjs/cache-manager';
import { CacheStore, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { RedisClientOptions } from 'redis';

@Module({
  imports: [
    CacheModule.registerAsync<RedisClientOptions>({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        const store = await redisStore({
          socket: {
            host: 'localhost',//config.get('CACHEMODULE_HOST'),
            port: 6379//+config.get('CACHEMODULE_PORT'),
          },
          password: '',//config.get('CACHEMODULE_SECRET'),
        });

        return {
          store: store as unknown as CacheStore,
          ttl: parseInt(config.get('CACHEMODULE_TTL')),
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class RedisCacheModule { }
