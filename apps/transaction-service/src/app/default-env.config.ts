import * as Joi from 'joi';

export const defaultEnvConfig = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  KAFKA_SERVICE_NAME: Joi.string().required(),
  KAFKA_PORT: Joi.string().required(),
  KAFKA_CONNECTION_RETRIES: Joi.number().default(30),
  DATABASE_GRPC_SERVICE_NAME: Joi.string().required(),
  DATABASE_GRPC_PORT: Joi.string().required(),
});
