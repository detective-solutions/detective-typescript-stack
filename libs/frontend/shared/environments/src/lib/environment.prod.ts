import { LogLevel } from '@detective.solutions/frontend/shared/error-handling';

export const environment = {
  production: true,
  apiBaseUrl: '', // TODO: Configure /api base path in k8s ingress controller
  webSocketBaseUrl: '/ws',
  whiteboardUrlPath: '/casefile', // Used to identify whiteboard routes
  authMode: 'custom', // Cannot use AuthMode enum due to circular dependency
  logLevel: LogLevel.Info,
};
