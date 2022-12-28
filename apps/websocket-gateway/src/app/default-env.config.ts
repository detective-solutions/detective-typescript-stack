import * as Joi from 'joi';

import { AuthEnvironment, KafkaClientEnvironment } from '@detective.solutions/backend/shared/data-access';

import { DGraphGrpcClientEnvironment } from '@detective.solutions/backend/dgraph-grpc-client';
import { RedisClientEnvironment } from '@detective.solutions/backend/redis-client';

export const defaultEnvConfig = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('production'),
  [AuthEnvironment.ACCESS_TOKEN_SECRET]: Joi.string().required(),
  [RedisClientEnvironment.REDIS_SERVICE_NAME]: Joi.string().required(),
  [RedisClientEnvironment.REDIS_PORT]: Joi.number().required(),
  [DGraphGrpcClientEnvironment.DATABASE_SERVICE_NAME]: Joi.string().required(),
  [DGraphGrpcClientEnvironment.DATABASE_PORT]: Joi.string().required(),
  [KafkaClientEnvironment.KAFKA_SERVICE_NAME]: Joi.string().required(),
  [KafkaClientEnvironment.KAFKA_PORT]: Joi.string().required(),
  [KafkaClientEnvironment.KAFKA_CONNECTION_RETRIES]: Joi.number().default(10),
  [KafkaClientEnvironment.KAFKA_CONSUMER_GROUP_ID]: Joi.string().optional(),
});
