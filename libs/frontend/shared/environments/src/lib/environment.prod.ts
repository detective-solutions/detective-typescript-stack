import { LogLevel } from '@detective.solutions/frontend/shared/error-handling';

export const environment = {
  production: true,
  devApiHost: '',
  baseApiPath: '/api',
  dbApiPath: '/v1/graphql',
  authApiPathV1: '/v1/auth',
  catalogApiPathV1: '/v1/catalog',
  provisioningListInvoicesV1: 'v1/payment/invoices',
  provisioningCancelSubV1: 'v1/subscription/cancel',
  provisioningUpdateSubV1: 'v1/subscription/update',
  provisioningPaymentSubV1: 'v1/payment/card',
  provisioningProductV1: 'v1/product/info',
  provisioningAllProductListV1: 'v1/subscription/config',
  provisioningChangePaymentV1: 'v1/payment/change',
  webSocketHost: 'dev.detective.solutions',
  webSocketApiPathV1: '/v1/ws',
  whiteboardPath: '/casefile',
  authMode: 'custom', // Cannot use AuthMode enum due to circular dependency
  logLevel: LogLevel.Info,
};
