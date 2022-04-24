import { DgraphClient, DgraphClientStub, Mutation } from 'dgraph-js';
import { Inject, Injectable } from '@nestjs/common';
import { DGRAPH_MODULE_OPTIONS } from './dgraph-grpc-client.constants';
import { DGraphGrpcClientOptions } from './interfaces';

@Injectable()
export class DGraphGrpcClientService {
  private _client!: DgraphClient | null;
  private _stubs!: DgraphClientStub[] | null;

  get client(): DgraphClient | null {
    if (this._client) {
      return this._client;
    }
    return null;
  }

  get stubs(): DgraphClientStub[] | null {
    if (this._stubs && this._stubs.length > 0) {
      return this._stubs;
    }
    return null;
  }

  constructor(@Inject(DGRAPH_MODULE_OPTIONS) options: DGraphGrpcClientOptions) {
    this.createClient(options);
  }

  createClient(options: DGraphGrpcClientOptions) {
    if (!this._client) {
      this._stubs = options.stubs.map((stub) => {
        return new DgraphClientStub(stub.address, stub.credentials, stub.options);
      });
      this._client = new DgraphClient(...this._stubs);
      if (options.debug) {
        this._client.setDebugMode();
      }
    }
    return this._client;
  }

  createMutation() {
    return new Mutation();
  }

  close() {
    if (this._stubs) {
      this._stubs.forEach((stub) => {
        stub.close();
      });
      this._stubs = null;
    }
    this._client = null;
  }
}
