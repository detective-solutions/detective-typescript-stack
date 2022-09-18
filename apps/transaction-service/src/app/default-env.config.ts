import * as Joi from 'joi';

import { DGraphGrpcClientEnvironment } from '@detective.solutions/backend/dgraph-grpc-client';
import { RedisOMClientEnvironment } from '@detective.solutions/backend/redis-om-client';

export const defaultEnvConfig = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  KAFKA_SERVICE_NAME: Joi.string().required(),
  KAFKA_PORT: Joi.string().required(),
  KAFKA_CONNECTION_RETRIES: Joi.number().default(30),
  [RedisOMClientEnvironment.REDIS_SERVICE_NAME]: Joi.string().required(),
  [RedisOMClientEnvironment.REDIS_PORT]: Joi.number().required(),
  [DGraphGrpcClientEnvironment.DATABASE_SERVICE_NAME]: Joi.string().required(),
  [DGraphGrpcClientEnvironment.DATABASE_PORT]: Joi.string().required(),
});
