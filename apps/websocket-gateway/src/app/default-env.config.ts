import * as Joi from 'joi';

import { DGraphGrpcClientEnvironment } from '@detective.solutions/backend/dgraph-grpc-client';
import { RedisClientEnvironment } from '@detective.solutions/backend/redis-client';

export const defaultEnvConfig = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(), // TODO: Make AuthModule work without specifying this secret
  [RedisClientEnvironment.REDIS_SERVICE_NAME]: Joi.string().required(),
  [RedisClientEnvironment.REDIS_PORT]: Joi.number().required(),
  [DGraphGrpcClientEnvironment.DATABASE_SERVICE_NAME]: Joi.string().required(),
  [DGraphGrpcClientEnvironment.DATABASE_PORT]: Joi.string().required(),
  KAFKA_SERVICE_NAME: Joi.string().required(),
  KAFKA_PORT: Joi.string().required(),
  KAFKA_CONNECTION_RETRIES: Joi.number().default(10),
  KAFKA_CONSUMER_GROUP_ID: Joi.string().optional(),
});
