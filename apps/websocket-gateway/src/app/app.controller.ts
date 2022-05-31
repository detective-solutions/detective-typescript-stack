import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { WhiteboardDataGateway } from './websocket-gateways';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Controller()
export class AppController {
  constructor(private readonly whiteboardDataGateway: WhiteboardDataGateway) {}

  @EventPattern('casefile')
  forwardQueryExecution(data: any) {
    console.log('FORWARD EVENT WITH DATA', data.value);
    this.whiteboardDataGateway.broadcastMessage(JSON.stringify(data.value));
  }
}
