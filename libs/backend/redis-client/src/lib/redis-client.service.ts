import { IRedisClientOptions, REDIS_CLIENT_MODULE_OPTIONS } from './models';
import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType, RedisDefaultModules, createClient } from 'redis';

@Injectable()
export class RedisClientService implements OnModuleDestroy {
  readonly logger = new Logger(RedisClientService.name);

  clients: RedisClientType<RedisDefaultModules>[] = [];

  private moduleOptions: IRedisClientOptions;

  constructor(@Inject(REDIS_CLIENT_MODULE_OPTIONS) moduleOptions: IRedisClientOptions) {
    this.moduleOptions = moduleOptions;
  }

  createClient(): RedisClientType<RedisDefaultModules> {
    const client = createClient({
      url: `redis://${this.moduleOptions.address}`,
    });
    client.on('error', (err) => this.logger.error('Redis Client Error', err));
    client.connect();
    this.clients.push(client as RedisClientType<RedisDefaultModules>);
    return client as RedisClientType<RedisDefaultModules>;
  }

  async onModuleDestroy() {
    for (const client of this.clients) {
      await client.quit();
    }
  }
}
