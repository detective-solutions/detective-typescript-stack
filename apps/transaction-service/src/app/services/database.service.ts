import { ICasefileForWhiteboard, ITableOccurrence } from '@detective.solutions/shared/data-access';
import {
  IGetCasefileById,
  IGetUid,
  createGetUidQueryByType,
  getCasefileByIdQuery,
  getCasefileByIdQueryName,
  getUidQueryName,
} from './queries';
import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';

import { CasefileForWhiteboard } from '../models';
import { DGraphGrpcClientService } from '@detective.solutions/backend/dgraph-grpc-client';
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

  // TODO: Add correct parameter type
  async addWhiteboardNode(casefileId: string, addedNode: ITableOccurrence) {
    const mutationJson = {
      'TableOccurrence.title': addedNode.title,
      'TableOccurrence.x': addedNode.x,
      'TableOccurrence.y': addedNode.y,
      'TableOccurrence.width': addedNode.width,
      'TableOccurrence.height': addedNode.height,
      'TableOccurrence.locked': String(addedNode.locked),
      'TableOccurrence.lastUpdatedBy': await this.getUidByType(addedNode.lastUpdatedBy.id, 'User'),
      'TableOccurrence.lastUpdated': addedNode.lastUpdated,
      'TableOccurrence.created': addedNode.created,
      'TableOccurrence.entity': {
        uid: await this.getUidByType(addedNode.entity.id, 'Table'),
      },
      'TableOccurrence.casefile': {
        uid: await this.getUidByType(casefileId, 'Casefile'),
      },
      'dgraph.type': 'TableOccurrence',
    };

    console.log(mutationJson);

    return this.sendMutation(mutationJson).catch(() => {
      this.logger.error(`There was a problem while trying to add a node to casefile ${casefileId}`);
      return null;
    });
  }

  async getUidByType(id: string, type: string): Promise<string> {
    this.logger.log(`Requesting uid for type ${type} from database`);

    const queryVariables = { $id: id };
    const queryResponse = (await this.sendQuery(createGetUidQueryByType(type), queryVariables)) as IGetUid;
    if (!queryResponse) {
      return null;
    }

    if (!queryResponse[getUidQueryName]) {
      this.logger.error(`Incoming database response object is missing ${getUidQueryName} property`);
      throw new InternalServerErrorException();
    }

    if (queryResponse[getUidQueryName].length > 1) {
      this.logger.error(`Found more than one objects with id ${id} while fetching uid`);
      throw new InternalServerErrorException();
    }

    if (queryResponse[getUidQueryName].length === 0) {
      this.logger.error(`No object found for the given id ${id}`);
      return null;
    }

    const uid = queryResponse[getUidQueryName][0]?.uid;
    if (!uid) {
      this.logger.error(`${getUidQueryName} is missing "uid" property`);
      throw new InternalServerErrorException();
    }

    return uid;
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
