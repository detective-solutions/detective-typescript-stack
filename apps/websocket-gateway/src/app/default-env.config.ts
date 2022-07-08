import * as Joi from 'joi';

export const defaultEnvConfig = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  SERVER_PORT: Joi.number().default(7777),
  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(), // TODO: Make AuthModule work without specifying this secret
  KAFKA_SERVICE_NAME: Joi.string().required(),
  KAFKA_PORT: Joi.string().required(),
});
