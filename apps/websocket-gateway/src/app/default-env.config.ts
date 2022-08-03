import * as Joi from 'joi';

export const defaultEnvConfig = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(), // TODO: Make AuthModule work without specifying this secret
  KAFKA_SERVICE_NAME: Joi.string().required(),
  KAFKA_PORT: Joi.string().required(),
  KAFKA_CONNECTION_RETRIES: Joi.number().default(30),
});
