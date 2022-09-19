import { IRedisClientOptions, REDIS_CLIENT_MODULE_OPTIONS } from './models';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType, RedisDefaultModules, createClient } from 'redis';

@Injectable()
export class RedisClientService implements OnModuleDestroy {
  readonly logger = new Logger(RedisClientService.name);

  client: RedisClientType<RedisDefaultModules>;

  constructor(@Inject(REDIS_CLIENT_MODULE_OPTIONS) moduleOptions: IRedisClientOptions) {
    this.client = createClient({ url: `redis://${moduleOptions.address}` });
    this.client.on('error', (err) => this.logger.error('Redis Client Error', err));
    this.client.connect();
  }

  public async onModuleDestroy() {
    await this.client.quit();
  }
}
