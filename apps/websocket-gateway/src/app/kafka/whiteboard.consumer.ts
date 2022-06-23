import { Controller, Logger } from '@nestjs/common';
import { broadcastWebSocketContext, buildLogContext } from '../utils';

import { EventPattern } from '@nestjs/microservices';
import { IKafkaMessage } from '@detective.solutions/shared/data-access';
import { WhiteboardWebSocketGateway } from '../websocket/whiteboard-websocket.gateway';

@Controller()
export class WhiteboardConsumer {
  private readonly logger = new Logger(WhiteboardConsumer.name);

  constructor(private readonly webSocketGateway: WhiteboardWebSocketGateway) {}

  @EventPattern('casefile')
  forwardQueryExecution(data: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(data.value.context)} - Consuming message ${data.offset} from topic ${
        data.topic
      } with timestamp ${data.timestamp}`
    );
    this.webSocketGateway.sendMessageByContext(data.value, broadcastWebSocketContext);
  }
}
