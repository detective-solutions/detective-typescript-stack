import * as Joi from 'joi';

export const defaultEnvConfig = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  SERVER_PORT: Joi.number().default(1111),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  ACCESS_TOKEN_EXPIRY: Joi.string().default('5m'),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_EXPIRY: Joi.string().default('30m'),
  DATABASE_GRPC_SERVICE_NAME: Joi.string().required(),
  DATABASE_GRPC_PORT: Joi.string().required(),
});
