import { IRedisOMClientOptions, REDIS_OM_CLIENT_MODULE_OPTIONS } from './models';
import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';

import { Client } from 'redis-om';

@Injectable()
export class RedisOMClientService extends Client implements OnModuleDestroy {
  constructor(@Inject(REDIS_OM_CLIENT_MODULE_OPTIONS) moduleOptions: IRedisOMClientOptions) {
    super();
    (async () => {
      await this.open(`redis://${moduleOptions.address}`);
    })();
  }

  public async onModuleDestroy() {
    await this.close();
  }
}
