import { Client, ClientKafka } from '@nestjs/microservices';

import { Injectable } from '@nestjs/common';
import { microserviceConfig } from './microservice-config';

@Injectable()
export class AppService {
  @Client(microserviceConfig)
  client: ClientKafka;

  sendTestMessage() {
    this.client.emit<string>('test1', 'some entity ' + new Date());
  }

  getData(): { message: string } {
    return { message: 'Welcome to websocket-gateway!' };
  }
}
