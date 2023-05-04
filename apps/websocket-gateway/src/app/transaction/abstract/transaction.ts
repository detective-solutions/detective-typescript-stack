import { CacheService, DatabaseService } from '../../services';
import { IMessage, IMessageContext, KafkaTopic, MessageEventType } from '@detective.solutions/shared/data-access';

import { KafkaEventProducer } from '../../kafka';
import { Logger } from '@nestjs/common';
import { TransactionServiceRefs } from '../../models';
import { WhiteboardWebSocketGateway } from '../../websocket';
import { buildLogContext } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Transaction {
  abstract readonly logger: Logger;

  readonly cacheService: CacheService;
  readonly databaseService: DatabaseService;
  readonly kafkaEventProducer: KafkaEventProducer;
  readonly whiteboardWebSocketGateway: WhiteboardWebSocketGateway;

  message: IMessage<any>;
  messageContext: IMessageContext;
  tenantId: string;
  casefileId: string;
  userId: string;
  nodeId: string | undefined;
  timestamp: number;
  messageBody: any;
  logContext: string;

  hasAlreadyExecuted = false;

  protected readonly missingMessageBodyErrorText =
    'Transaction cannot be executed due to missing message body information';

  constructor(serviceRefs: TransactionServiceRefs, message: IMessage<any>) {
    this.cacheService = serviceRefs.cacheService;
    this.databaseService = serviceRefs.databaseService;
    this.whiteboardWebSocketGateway = serviceRefs.whiteboardWebSocketGateway;
    this.kafkaEventProducer = serviceRefs.kafkaEventProducer;
    this.message = message;
    this.messageContext = message.context;
    this.tenantId = this.messageContext.tenantId;
    this.casefileId = this.messageContext.casefileId;
    this.userId = this.messageContext.userId;
    this.nodeId = this.messageContext?.nodeId;
    this.timestamp = this.messageContext.timestamp;
    this.messageBody = message.body;
    this.logContext = buildLogContext(this.messageContext);
  }

  abstract execute(): Promise<void>;

  protected broadcastMessage() {
    this.whiteboardWebSocketGateway.sendPropagatedBroadcastMessage(this.message);
    this.logger.verbose(`${this.logContext} Broadcasted transaction information`);
  }

  protected unicastMessage() {
    this.whiteboardWebSocketGateway.sendPropagatedUnicastMessage(this.message);
    this.logger.verbose(`${this.logContext} Broadcasted transaction information`);
  }

  protected sendKafkaMessage(targetTopic: KafkaTopic) {
    this.kafkaEventProducer.produceKafkaEvent(targetTopic, this.message);
    this.logger.verbose(`${this.logContext} Broadcasted transaction information`);
  }

  protected async handleError(error: Error, logMessage: string, rollback = true, shouldExecuteAgain = true) {
    this.logger.error(error);
    this.logger.error(logMessage);

    // Collect all error messages in separate error topic
    this.kafkaEventProducer.produceKafkaEvent(KafkaTopic.Error, {
      context: this.messageContext,
      body: error,
    });
    this.logger.error(`${this.logContext} Published error message to "${KafkaTopic.Error}" topic`);

    if (shouldExecuteAgain && !this.hasAlreadyExecuted) {
      this.hasAlreadyExecuted = true;
      await this.execute();
      return; // If execution fails, this method will be invoked again, so this invocation has to be cancelled early
    }

    if (rollback) {
      // Rollback sending client casefile state to latest cached version
      this.whiteboardWebSocketGateway.sendPropagatedUnicastMessage({
        context: { ...this.messageContext, eventType: MessageEventType.LoadWhiteboardData },
        body: await this.cacheService.getCasefileById(this.messageContext.casefileId),
      });
    }
  }
}
