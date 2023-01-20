import * as Joi from 'joi';

import { AuthEnvironment } from '@detective.solutions/backend/shared/data-access';
import { DGraphGrpcClientEnvironment } from '@detective.solutions/backend/dgraph-grpc-client';

export const defaultEnvConfig = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production').default('production'),
  [AuthEnvironment.ACCESS_TOKEN_SECRET]: Joi.string().required(),
  [AuthEnvironment.ACCESS_TOKEN_EXPIRY]: Joi.string().default('5m'),
  [AuthEnvironment.REFRESH_TOKEN_SECRET]: Joi.string().required(),
  [AuthEnvironment.REFRESH_TOKEN_EXPIRY]: Joi.string().default('30m'),
  [DGraphGrpcClientEnvironment.DATABASE_SERVICE_NAME]: Joi.string().required(),
  [DGraphGrpcClientEnvironment.DATABASE_PORT]: Joi.string().required(),
});
