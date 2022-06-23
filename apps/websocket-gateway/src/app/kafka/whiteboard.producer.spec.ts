import { ClientKafka } from '@nestjs/microservices';
import { Test } from '@nestjs/testing';
import { WhiteboardProducer } from './whiteboard.producer';

describe('WhiteboardProducer', () => {
  let whiteboardProducer: WhiteboardProducer;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [WhiteboardProducer, ClientKafka],
    }).compile();

    whiteboardProducer = moduleRef.get<WhiteboardProducer>(WhiteboardProducer);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(whiteboardProducer).toBeDefined();
  });
});
