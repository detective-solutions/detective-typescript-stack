import { ClientKafka } from '@nestjs/microservices';
import { MessageEventType } from '@detective.solutions/shared/data-access';
import { Test } from '@nestjs/testing';
import { WhiteboardProducer } from './whiteboard.producer';
import { kafkaClientInjectionToken } from '../utils';
import { v4 as uuidv4 } from 'uuid';

describe('WhiteboardProducer', () => {
  let whiteboardProducer: WhiteboardProducer;
  let client: ClientKafka;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WhiteboardProducer,
        {
          provide: kafkaClientInjectionToken,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    whiteboardProducer = moduleRef.get<WhiteboardProducer>(WhiteboardProducer);
    client = moduleRef.get<ClientKafka>(kafkaClientInjectionToken);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardProducer).toBeDefined();
  });

  describe('sendKafkaMessage', () => {
    it('should correctly forward the topic name and message payload to the client emit method', () => {
      const testTopicName = 'testTopic';
      const testMessage = {
        context: {
          tenantId: uuidv4(),
          casefileId: uuidv4(),
          eventType: MessageEventType.QueryTable,
          nodeId: uuidv4(),
          userId: uuidv4(),
          userRole: 'admin',
          timestamp: 123,
        },
        body: { test: '123' },
      };
      const emitSpy = jest.spyOn(client, 'emit');

      whiteboardProducer.sendKafkaMessage(testTopicName, testMessage);

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith(testTopicName, testMessage);
    });
  });
});
