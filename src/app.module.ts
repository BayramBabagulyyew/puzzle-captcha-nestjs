import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacheControlMiddleware } from './middleware/setCache.middleware';
import { RedisCacheModule } from './config/redisCache.module';
import { UserDataController } from './lib/UserData';

@Module({
  imports: [RedisCacheModule],
  controllers: [AppController],
  providers: [AppService, UserDataController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CacheControlMiddleware)

  }
}
