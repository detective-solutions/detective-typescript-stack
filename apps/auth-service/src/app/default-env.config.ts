import * as Joi from 'joi';

import { AuthModuleEnvironment } from '@detective.solutions/backend/auth';
import { DGraphGrpcClientEnvironment } from '@detective.solutions/backend/dgraph-grpc-client';

export const defaultEnvConfig = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('development'),
  [AuthModuleEnvironment.ACCESS_TOKEN_SECRET]: Joi.string().required(),
  [AuthModuleEnvironment.ACCESS_TOKEN_EXPIRY]: Joi.string().default('5m'),
  [AuthModuleEnvironment.REFRESH_TOKEN_SECRET]: Joi.string().required(),
  [AuthModuleEnvironment.REFRESH_TOKEN_EXPIRY]: Joi.string().default('30m'),
  [DGraphGrpcClientEnvironment.DATABASE_SERVICE_NAME]: Joi.string().required(),
  [DGraphGrpcClientEnvironment.DATABASE_PORT]: Joi.string().required(),
});
