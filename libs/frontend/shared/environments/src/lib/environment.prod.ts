import { LogLevel } from '@detective.solutions/frontend/shared/error-handling';

export const environment = {
  production: true,
  devApiHost: '',
  baseApiPath: '/api',
  dbApiPath: '/v1/graphql',
  authApiPathV1: '/v1/auth',
  catalogApiPathV1: '/v1/catalog',
  provisioningApiPathV1: '/v1/provisioning',
  provisioningListInvoicesV1: '/payment/invoices',
  provisioningCancelSubV1: '/subscription/cancel',
  provisioningUpdateSubV1: '/subscription/update',
  provisioningPaymentSubV1: '/payment/card',
  provisioningProductV1: '/product/info',
  provisioningAllProductListV1: '/subscription/config',
  provisioningChangePaymentV1: '/payment/change',
  webSocketHost: 'dev.detective.solutions',
  webSocketApiPathV1: '/v1/ws',
  whiteboardPath: '/casefile',
  authMode: 'custom', // Cannot use AuthMode enum due to circular dependency
  logLevel: LogLevel.Info,
};
