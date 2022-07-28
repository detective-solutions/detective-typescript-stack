import { LogLevel } from '@detective.solutions/frontend/shared/error-handling';

export const environment = {
  production: true,
  baseApiPath: '/api',
  dbApiPath: '/v1/graphql',
  authApiPathV1: '/v1/auth',
  catalogApiPathV1: '/v1/catalog',
  webSocketApiPathV1: '/v1/ws',
  whiteboardPath: '/casefile',
  authMode: 'custom', // Cannot use AuthMode enum due to circular dependency
  logLevel: LogLevel.Info,
};
