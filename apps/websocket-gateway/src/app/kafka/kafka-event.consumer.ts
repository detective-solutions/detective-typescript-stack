import { Controller, Logger } from '@nestjs/common';
import { IKafkaMessage, KafkaTopic } from '@detective.solutions/shared/data-access';

import { EventPattern } from '@nestjs/microservices';
import { WhiteboardWebSocketGateway } from '../websocket/whiteboard-websocket.gateway';
import { broadcastWebSocketContext } from '../utils';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

@Controller()
export class KafkaEventConsumer {
  private readonly logger = new Logger(KafkaEventConsumer.name);

  constructor(private readonly whiteboardWebSocketGateway: WhiteboardWebSocketGateway) {}

  @EventPattern(KafkaTopic.QueryOutput)
  forwardQueryExecution(message: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(message.value.context)} Consuming message ${message.offset} from topic ${
        message.topic
      } with timestamp ${message.timestamp}`
    );
    this.whiteboardWebSocketGateway.sendMessageByContext(message.value, broadcastWebSocketContext);
  }
}
