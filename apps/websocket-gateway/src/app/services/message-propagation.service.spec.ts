import { MessageEventType, UserRole } from '@detective.solutions/shared/data-access';

import { IPropagationMessage } from '../models';
import { MessagePropagationService } from './message-propagation.service';
import { RedisClientService } from '@detective.solutions/backend/redis-client';
import { Test } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-empty-function */

const mockRedisClientService = {
  createClient: jest.fn().mockReturnValue({ publish: jest.fn(), subscribe: jest.fn(), unsubscribe: jest.fn() }),
};

const testChannelName = 'test_channel';
const testSubscribeCallback = () => {};
const testMessage: IPropagationMessage = {
  context: {
    tenantId: uuidv4(),
    casefileId: uuidv4(),
    eventType: MessageEventType.WhiteboardUserJoined,
    nodeId: uuidv4(),
    userId: uuidv4(),
    userRole: UserRole.ADMIN,
    timestamp: 123,
  },
  body: { test: '123' },
  propagationSourceId: uuidv4(),
};

describe('MessagePropagationService', () => {
  let messagePropagationService: MessagePropagationService;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [MessagePropagationService, { provide: RedisClientService, useValue: mockRedisClientService }],
    }).compile();

    messagePropagationService = app.get<MessagePropagationService>(MessagePropagationService);
  });

  it('should be defined', () => {
    expect(messagePropagationService).toBeDefined();
  });

  describe('propagateMessage', () => {
    it('should correctly forward the given message to the given channel', () => {
      const publisherClient = messagePropagationService.publisherClient;
      const publisherClientSpy = jest.spyOn(publisherClient, 'publish');

      messagePropagationService.propagateMessage(testChannelName, testMessage);

      expect(publisherClientSpy).toHaveBeenCalledTimes(1);
      expect(publisherClientSpy).toHaveBeenCalledWith(testChannelName, JSON.stringify(testMessage));
    });
  });

  describe('subscribeToChannel', () => {
    it('should correctly forward the given message to the given channel', () => {
      const subscriberClient = messagePropagationService.subscriberClient;
      const subscriberClientSpy = jest.spyOn(subscriberClient, 'subscribe');

      messagePropagationService.subscribeToChannel(testChannelName, testSubscribeCallback);

      expect(subscriberClientSpy).toHaveBeenCalledTimes(1);
      expect(subscriberClientSpy).toHaveBeenCalledWith(testChannelName, testSubscribeCallback);
    });
  });

  describe('onModuleDestroy', () => {
    it('should correctly unsubscribe all existing subscriptions', () => {
      const subscriberClient = messagePropagationService.subscriberClient;
      const unsubscribeSpy = jest.spyOn(subscriberClient, 'unsubscribe');

      messagePropagationService.subscribeToChannel('test_channel_1', testSubscribeCallback);
      messagePropagationService.subscribeToChannel('test_channel_2', testSubscribeCallback);
      messagePropagationService.subscribeToChannel('test_channel_3', testSubscribeCallback);
      messagePropagationService.onModuleDestroy();

      expect(unsubscribeSpy).toHaveBeenCalledTimes(3);
    });
  });
});
