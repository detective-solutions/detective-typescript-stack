import { IGetCasefileById, getCasefileByIdQuery, getCasefileByIdQueryName } from './queries';
import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';

import { CasefileForWhiteboard } from '../models';
import { DGraphGrpcClientService } from '@detective.solutions/backend/dgraph-grpc-client';
import { ICasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { TxnOptions } from 'dgraph-js';
import { validateDto } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class DatabaseService {
  private static readonly readTxnOptions: TxnOptions = { readOnly: true, bestEffort: true };
  readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dGraphClient: DGraphGrpcClientService) {}

  async getCasefileById(id: string): Promise<ICasefileForWhiteboard> | null {
    this.logger.verbose(`Requesting data for casefile ${id}`);

    const queryVariables = { $id: id };
    const response = (await this.sendQuery(getCasefileByIdQuery, queryVariables)) as IGetCasefileById;
    if (!response) {
      return null;
    }

    if (!response[getCasefileByIdQueryName]) {
      this.logger.error(`Incoming database response object is missing ${getCasefileByIdQueryName} property`);
      throw new InternalServerErrorException();
    }

    if (response[getCasefileByIdQueryName].length > 1) {
      this.logger.error(`Found more than one casefile with id ${id}`);
      throw new InternalServerErrorException();
    }

    if (response[getCasefileByIdQueryName].length === 0) {
      this.logger.warn(`No casefile found for the given id ${id}`);
      return null;
    }

    this.logger.verbose(`Received data for casefile ${id}`);
    const casefileData = response[getCasefileByIdQueryName][0];
    await validateDto(CasefileForWhiteboard, casefileData, this.logger);

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
