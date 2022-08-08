import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';

import { Casefile } from '@detective.solutions/backend/shared/data-access';
import { DGraphGrpcClientService } from '@detective.solutions/backend/dgraph-grpc-client';
import { ICasefile } from '@detective.solutions/shared/data-access';
import { TxnOptions } from 'dgraph-js';
import { validateDto } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class DatabaseService {
  private static readonly readTxnOptions: TxnOptions = { readOnly: true, bestEffort: true };
  readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dGraphClient: DGraphGrpcClientService) {}

  async getCasefileById(id: string): Promise<Casefile> | null {
    interface ICasefileDataApiResponse {
      casefileData: ICasefile[];
    }

    // Make sure the query matches Casefile DTO properties
    const query = `
      query casefileData($id: string) {
        casefileData(func: eq(Casefile.xid, $id)) {
          id: Casefile.xid
          title: Casefile.title
          tables: Casefile.tables @normalize
            {
              id: TableOccurrence.xid
              title: TableOccurrence.title
              x: TableOccurrence.x
              y: TableOccurrence.y
              width: TableOccurrence.width
              height: TableOccurrence.height
              TableOccurrence.entity {
                name: Table.name
                description: Table.description
              }
            }
          queries: Casefile.queries @normalize
            {
              id: UserQueryOccurrence.xid
              name: UserQueryOccurrence.name
              x: UserQueryOccurrence.x
              y: UserQueryOccurrence.y
              width: UserQueryOccurrence.width
              height: UserQueryOccurrence.height
              UserQueryOccurrence.entity {
                code: UserQuery.code
              }
            }
        }
      }
    `;

    this.logger.verbose(`Requesting data for casefile ${id}`);

    const queryVariables = { $id: id };
    const response = (await this.sendQuery(query, queryVariables)) as ICasefileDataApiResponse;
    if (!response) {
      return null;
    }

    if (!response.casefileData) {
      this.logger.error('Incoming database response object is missing "jwtUserInfo" property');
      throw new InternalServerErrorException();
    }

    if (response.casefileData.length > 1) {
      this.logger.error(`Found more than one casefile with id ${id}`);
      throw new InternalServerErrorException();
    }

    if (response.casefileData.length === 0) {
      this.logger.warn(`No casefile found for the given id ${id}`);
      return null;
    }

    this.logger.verbose(`Received data for casefile ${id}`);
    const casefileData = response.casefileData[0];
    await validateDto(Casefile, casefileData, this.logger);

    return casefileData;
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
