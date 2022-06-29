import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { WhiteboardProducer } from '../kafka/whiteboard.producer';
import { WhiteboardWebSocketGateway } from './whiteboard-websocket.gateway';

const mockWhiteboardProducer = {
  sendKafkaMessage: jest.fn(),
};

const mockJwtService = {};

describe('WhiteboardWebsocketGateway', () => {
  let webSocketGateway: WhiteboardWebSocketGateway;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        WhiteboardWebSocketGateway,
        { provide: WhiteboardProducer, useValue: mockWhiteboardProducer },
        { provide: JwtService, useValue: mockJwtService },
        ConfigService,
      ],
    }).compile();

    webSocketGateway = moduleRef.get<WhiteboardWebSocketGateway>(WhiteboardWebSocketGateway);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(webSocketGateway).toBeDefined();
  });
});
