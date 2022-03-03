import * as grpc from '@grpc/grpc-js';

export interface DGraphGrpcClientOptions {
  stubs: {
    address?: string;
    credentials?: grpc.ChannelCredentials;
    options?: object;
  }[];
  debug?: boolean;
}
