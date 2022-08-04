import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

import { DGraphGrpcClientService } from '@detective.solutions/backend/dgraph-grpc-client';
import { TxnOptions } from 'dgraph-js';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class DatabaseService {
  private static readonly readTxnOptions: TxnOptions = { readOnly: true, bestEffort: true };
  readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dGraphClient: DGraphGrpcClientService) {}

  async getCasefileDataById(id: string) {
    interface CasefileDataApiResponse {
      id: string;
      title: string;
    }

    const query = `
      query casefileData($id: string) {
        casefileData(func: eq(Casefile.xid, $id)) @normalize {
          id: Casefile.xid
          title: Casefile.title
          Casefile.tableObjects
            {
              xid: TableObject.xid
              name: TableObject.name

            }
        }
      }
    `;

    this.logger.log(`Requesting data for casefile ${id} from the database`);

    const queryVariables = { $id: id };
    const response = (await this.sendQuery(query, queryVariables)) as CasefileDataApiResponse;
    if (!response) {
      return null;
    }
    return response;
  }

  /* istanbul ignore next */ // Ignore for test coverage (library code that is already tested)
  private async sendQuery(query: string, queryVariables: object): Promise<Record<string, any>> {
    const txn = this.dGraphClient.client.newTxn(DatabaseService.readTxnOptions);
    return (
      await txn.queryWithVars(query, queryVariables).catch((err) => {
        this.logger.error('There was an error while sending a query to the database', err);
        throw new ServiceUnavailableException();
      })
    ).getJson();
  }

  /* istanbul ignore next */ // Ignore for test coverage (library code that is already tested)
  private async sendMutation(mutationJson: object): Promise<Record<string, any>> {
    const mutation = this.dGraphClient.createMutation();
    mutation.setCommitNow(true);
    mutation.setSetJson(mutationJson);

    const txn = this.dGraphClient.client.newTxn();
    return txn.mutate(mutation).catch((err) => {
      this.logger.error('There was an error while sending a mutation to the database', err);
      throw new ServiceUnavailableException();
    });
  }
}
