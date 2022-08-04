import { Controller, Logger } from '@nestjs/common';
import { broadcastWebSocketContext, unicastWebSocketContext } from '../utils';

import { EventPattern } from '@nestjs/microservices';
import { IKafkaMessage } from '@detective.solutions/shared/data-access';
import { WhiteboardWebSocketGateway } from '../websocket/whiteboard-websocket.gateway';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

@Controller()
export class WhiteboardConsumer {
  private readonly logger = new Logger(WhiteboardConsumer.name);

  constructor(private readonly webSocketGateway: WhiteboardWebSocketGateway) {}

  @EventPattern('transaction_output_unicast')
  forwardUnicastTransactionOutput(data: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(data.value.context)} Consuming unicast message ${data.offset} from topic ${
        data.topic
      } with timestamp ${data.timestamp}`
    );
    this.webSocketGateway.sendMessageByContext(data.value, unicastWebSocketContext);
  }

  @EventPattern('transaction_output_broadcast')
  forwardBroadcastTransactionOutput(data: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(data.value.context)} Consuming broadcast message ${data.offset} from topic ${
        data.topic
      } with timestamp ${data.timestamp}`
    );
    this.webSocketGateway.sendMessageByContext(data.value, broadcastWebSocketContext);
  }

  @EventPattern('casefile')
  forwardQueryExecution(data: IKafkaMessage) {
    this.logger.verbose(
      `${buildLogContext(data.value.context)} Consuming message ${data.offset} from topic ${
        data.topic
      } with timestamp ${data.timestamp}`
    );
    this.webSocketGateway.sendMessageByContext(data.value, broadcastWebSocketContext);
  }
}
