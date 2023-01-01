// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  devApiHost: 'dev.detective.solutions',
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
  provisioningSendInviteV1: '/invite/user',
  uploadApiAccessV1: 'v1/viewpoint/access',
  uploadApiFileV1: 'v1/upload/file',
  webSocketApiPathV1: '/v1/ws',
  whiteboardPath: '/casefile',
  authMode: 'custom', // Cannot use AuthMode enum due to circular dependency
  productDoc: 'https://detective-solutions.github.io/',
  productDocMasking: 'masking.html',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
