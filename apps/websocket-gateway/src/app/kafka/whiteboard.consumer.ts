import { Controller } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { WhiteboardWebSocketGateway } from '../websocket/whiteboard-websocket.gateway';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Controller()
export class WhiteboardConsumer {
  constructor(private readonly webSocketGateway: WhiteboardWebSocketGateway) {}

  @EventPattern('casefile')
  // TODO: Investigate response type
  forwardQueryExecution(data: any) {
    console.log('FORWARD EVENT WITH DATA', data.value);
    this.webSocketGateway.broadcastMessage(JSON.stringify(data.value));
  }
}
