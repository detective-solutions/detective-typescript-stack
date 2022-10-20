import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType, RedisDefaultModules } from 'redis';

import { IPropagationMessage } from '../models';
import { RedisClientService } from '@detective.solutions/backend/redis-client';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class MessagePropagationService implements OnModuleDestroy {
  readonly logger = new Logger(MessagePropagationService.name);

  private readonly publisherClient: RedisClientType<RedisDefaultModules>;
  private readonly subscriberClient: RedisClientType<RedisDefaultModules>;
  private readonly subscribedChannels = new Set<string>();

  constructor(private readonly clientService: RedisClientService) {
    this.publisherClient = clientService.createClient();
    this.subscriberClient = clientService.createClient();
  }

  propagateEvent(channel: string, message: IPropagationMessage) {
    this.publisherClient.publish(channel, JSON.stringify(message));
  }

  subscribeToChannel(channel: string, callback: (message: string) => void) {
    this.subscribedChannels.add(channel);
    this.subscriberClient.subscribe(channel, callback as any);
  }

  onModuleDestroy() {
    this.subscribedChannels.forEach((channel: string) => this.subscriberClient.unsubscribe(channel));
  }
}
