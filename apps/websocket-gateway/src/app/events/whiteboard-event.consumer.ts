import { Controller, Logger } from '@nestjs/common';
import { IKafkaMessage, KafkaTopic } from '@detective.solutions/shared/data-access';
import { broadcastWebSocketContext, unicastWebSocketContext } from '../utils';

import { EventPattern } from '@nestjs/microservices';
import { WhiteboardWebSocketGateway } from '../websocket/whiteboard-websocket.gateway';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

@Controller()
export class WhiteboardEventConsumer {
  private readonly logger = new Logger(WhiteboardEventConsumer.name);

  constructor(private readonly webSocketGateway: WhiteboardWebSocketGateway) {}

  @EventPattern(KafkaTopic.TransactionOutputUnicast)
  forwardUnicastTransactionOutput(message: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(message.value.context)} Consuming unicast message ${message.offset} from topic ${
        message.topic
      } with timestamp ${message.timestamp}`
    );
    this.webSocketGateway.sendMessageByContext(message.value, unicastWebSocketContext);
  }

  @EventPattern(KafkaTopic.TransactionOutputBroadcast)
  forwardBroadcastTransactionOutput(message: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(message.value.context)} Consuming broadcast message ${message.offset} from topic ${
        message.topic
      } with timestamp ${message.timestamp}`
    );
    this.webSocketGateway.sendMessageByContext(message.value, broadcastWebSocketContext);
  }

  @EventPattern(KafkaTopic.QueryOutput)
  forwardQueryExecution(message: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(message.value.context)} Consuming message ${message.offset} from topic ${
        message.topic
      } with timestamp ${message.timestamp}`
    );
    this.webSocketGateway.sendMessageByContext(message.value, broadcastWebSocketContext);
  }
}
