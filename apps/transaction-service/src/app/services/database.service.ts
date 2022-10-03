import {
  AnyWhiteboardNode,
  ICachableCasefileForWhiteboard,
  ICasefileForWhiteboard,
  IEmbeddingWhiteboardNode,
  ITableWhiteboardNode,
  IUserForWhiteboard,
  IUserQueryWhiteboardNode,
  IWhiteboardNodePositionUpdate,
  WhiteboardNodeType,
} from '@detective.solutions/shared/data-access';
import { CachableCasefileForWhiteboardDTO, CasefileForWhiteboardDTO } from '../models';
import {
  IGetCasefileById,
  IGetUid,
  createGetUidByTypeQuery,
  getCasefileByIdQuery,
  getCasefileByIdQueryName,
  getUidByTypeQueryName,
} from './queries';
import { IGetUserById, getUserByIdQuery, getUserByIdQueryName } from './queries/get-user-by-id.query';
import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';

import { DGraphGrpcClientService } from '@detective.solutions/backend/dgraph-grpc-client';
import { TxnOptions } from 'dgraph-js';
import { UserForWhiteboardDTO } from '@detective.solutions/backend/shared/data-access';
import { validateDto } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class DatabaseService {
  static readonly readTxnOptions: TxnOptions = { readOnly: true, bestEffort: true };
  static readonly mutationNodeReference = '_:new_node';

  readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly dGraphClient: DGraphGrpcClientService) {}

  async getCachableCasefileById(id: string): Promise<ICachableCasefileForWhiteboard> | null {
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
    const casefileData = response[getCasefileByIdQueryName][0] as ICasefileForWhiteboard;
    await validateDto(CasefileForWhiteboardDTO, casefileData, this.logger);

    // Convert ICasefileForWhiteboard to ICachableCasefileForWhiteboard
    const convertedCasefile = {
      id: casefileData.id,
      title: casefileData.title,
      description: casefileData.description,
      // TODO: Check if additional types are needed
      nodes: [
        ...(casefileData.tables
          ? (casefileData.tables.map((node) => {
              return { ...node, type: WhiteboardNodeType.TABLE };
            }) as AnyWhiteboardNode[])
          : []),
        ...(casefileData.embeddings
          ? (casefileData?.embeddings?.map((node) => {
              return { ...node, type: WhiteboardNodeType.EMBEDDING };
            }) as AnyWhiteboardNode[])
          : []),
      ],
      temporary: { activeUsers: [] },
    };
    await validateDto(CachableCasefileForWhiteboardDTO, convertedCasefile, this.logger);

    return convertedCasefile;
  }

  async getWhiteboardUserById(userId: string): Promise<IUserForWhiteboard> | null {
    this.logger.log(`Requesting info for user ${userId} from database`);

    const queryVariables = { $id: userId };
    const response = (await this.sendQuery(getUserByIdQuery, queryVariables)) as IGetUserById;
    if (!response) {
      return null;
    }

    if (!response[getUserByIdQueryName]) {
      this.logger.error(`Incoming database response object is missing ${getUserByIdQueryName} property`);
      throw new InternalServerErrorException();
    }

    if (response[getUserByIdQueryName].length > 1) {
      this.logger.error(`Found more than one user with id ${userId}`);
      throw new InternalServerErrorException();
    }

    if (response[getUserByIdQueryName].length === 0) {
      this.logger.warn(`No user found for the given id ${userId}`);
      return null;
    }

    this.logger.verbose(`Received data for user ${userId}`);
    const userData = response[getUserByIdQueryName][0];
    await validateDto(UserForWhiteboardDTO, userData, this.logger);

    return userData;
  }

  async insertTableOccurrenceToCasefile(
    casefileId: string,
    tableWhiteboardNode: ITableWhiteboardNode
  ): Promise<Record<string, any> | null> {
    const basicMutationJson = await this.createBasicNodeInsertMutation(tableWhiteboardNode);
    const finalMutationJson = {
      uid: DatabaseService.mutationNodeReference,
      [`${tableWhiteboardNode.type}.entity`]: {
        uid: await this.getUidByType(tableWhiteboardNode.entity.id, 'Table'),
      },
      [`${tableWhiteboardNode.type}.casefile`]: {
        uid: await this.getUidByType(casefileId, 'Casefile'),
        'Casefile.tables': { uid: DatabaseService.mutationNodeReference },
      },
      ...basicMutationJson,
    };

    return this.sendMutation(finalMutationJson).catch(() => {
      this.logger.error(
        `There was a problem while trying to add a ${tableWhiteboardNode.type} node to casefile ${casefileId}`
      );
      return null;
    });
  }

  async insertUserQueryOccurrenceToCasefile(
    casefileId: string,
    userQueryWhiteboardNode: IUserQueryWhiteboardNode
  ): Promise<Record<string, any> | null> {
    const basicMutationJson = await this.createBasicNodeInsertMutation(userQueryWhiteboardNode);
    const finalMutationJson = {
      uid: DatabaseService.mutationNodeReference,
      [`${userQueryWhiteboardNode.type}.author`]: {
        uid: await this.getUidByType(userQueryWhiteboardNode.author.id, 'User'),
      },
      [`${userQueryWhiteboardNode.type}.entity`]: {
        uid: await this.getUidByType(userQueryWhiteboardNode.entity.id, 'UserQuery'),
      },
      [`${userQueryWhiteboardNode.type}.casefile`]: {
        uid: await this.getUidByType(casefileId, 'Casefile'),
        'Casefile.queries': { uid: DatabaseService.mutationNodeReference },
      },
      ...basicMutationJson,
    };

    return this.sendMutation(finalMutationJson).catch(() => {
      this.logger.error(
        `There was a problem while trying to add a ${userQueryWhiteboardNode.type} node to casefile ${casefileId}`
      );
      return null;
    });
  }

  async insertEmbeddingToCasefile(
    casefileId: string,
    embeddingWhiteboardNode: IEmbeddingWhiteboardNode
  ): Promise<Record<string, any> | null> {
    const basicMutationJson = await this.createBasicNodeInsertMutation(embeddingWhiteboardNode);
    const finalMutationJson = {
      uid: DatabaseService.mutationNodeReference,
      [`${embeddingWhiteboardNode.type}.href`]: embeddingWhiteboardNode.href,
      [`${embeddingWhiteboardNode.type}.author`]: {
        uid: await this.getUidByType(embeddingWhiteboardNode.author.id, 'User'),
      },
      [`${embeddingWhiteboardNode.type}.casefile`]: {
        uid: await this.getUidByType(casefileId, 'Casefile'),
        'Casefile.embeddings': { uid: DatabaseService.mutationNodeReference },
      },
      ...basicMutationJson,
    };

    return this.sendMutation(finalMutationJson).catch(() => {
      this.logger.error(
        `There was a problem while trying to add a ${embeddingWhiteboardNode} node to casefile ${casefileId}`
      );
      return null;
    });
  }

  async deleteNodeInCasefile(nodeId: string, nodeType: WhiteboardNodeType) {
    const mutationJson = {
      uid: await this.getUidByType(nodeId, nodeType),
    };
    return this.sendDeleteMutation(mutationJson).catch(() => {
      this.logger.error(`There was a problem while trying to delete node ${nodeId} of type ${nodeType}`);
      return null;
    });
  }

  async updateNodePositionsInCasefile(
    casefileId: string,
    updatedNodes: IWhiteboardNodePositionUpdate[]
  ): Promise<Record<string, any> | null> {
    const mutations = [];
    for (const node of updatedNodes) {
      mutations.push({
        uid: await this.getUidByType(node.id, node.type),
        [`${node.type}.x`]: node.x,
        [`${node.type}.y`]: node.y,
      });
    }

    return this.sendMutation(mutations).catch(() => {
      this.logger.error(`There was a problem updating node positions in casefile ${casefileId}`);
      return null;
    });
  }

  async getUidByType(id: string, type: string): Promise<string> {
    this.logger.log(`Requesting uid for type ${type} from database`);

    const queryVariables = { $id: id };
    const queryResponse = (await this.sendQuery(createGetUidByTypeQuery(type), queryVariables)) as IGetUid;
    if (!queryResponse) {
      return null;
    }

    if (!queryResponse[getUidByTypeQueryName]) {
      this.logger.error(`Incoming database response object is missing ${getUidByTypeQueryName} property`);
      throw new InternalServerErrorException();
    }

    if (queryResponse[getUidByTypeQueryName].length > 1) {
      this.logger.error(`Found more than one objects with id ${id} while fetching uid`);
      throw new InternalServerErrorException();
    }

    if (queryResponse[getUidByTypeQueryName].length === 0) {
      this.logger.error(`No object found for the given id ${id}`);
      return null;
    }

    const uid = queryResponse[getUidByTypeQueryName][0]?.uid;
    if (!uid) {
      this.logger.error(`${getUidByTypeQueryName} is missing "uid" property`);
      throw new InternalServerErrorException();
    }

    return uid;
  }

  private async createBasicNodeInsertMutation(addedWhiteboardNode: AnyWhiteboardNode) {
    return {
      [`${addedWhiteboardNode.type}.xid`]: addedWhiteboardNode.id,
      [`${addedWhiteboardNode.type}.title`]: addedWhiteboardNode.title,
      [`${addedWhiteboardNode.type}.x`]: addedWhiteboardNode.x,
      [`${addedWhiteboardNode.type}.y`]: addedWhiteboardNode.y,
      [`${addedWhiteboardNode.type}.width`]: addedWhiteboardNode.width,
      [`${addedWhiteboardNode.type}.height`]: addedWhiteboardNode.height,
      [`${addedWhiteboardNode.type}.locked`]: addedWhiteboardNode.locked,
      [`${addedWhiteboardNode.type}.lastUpdatedBy`]: {
        uid: await this.getUidByType(addedWhiteboardNode.lastUpdatedBy.id, 'User'),
      },
      [`${addedWhiteboardNode.type}.lastUpdated`]: addedWhiteboardNode.lastUpdated,
      [`${addedWhiteboardNode.type}.created`]: addedWhiteboardNode.created,
      'dgraph.type': addedWhiteboardNode.type,
    };
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

  /* istanbul ignore next */ // Ignore for test coverage (library code that is already tested)
  private async sendDeleteMutation(mutationJson: object): Promise<Record<string, any>> {
    const mutation = this.dGraphClient.createMutation();
    mutation.setCommitNow(true);
    mutation.setDeleteJson(mutationJson);

    const txn = this.dGraphClient.client.newTxn();
    return txn.mutate(mutation).catch((err) => {
      this.logger.error('There was an error while sending a mutation to the database', err);
      throw new ServiceUnavailableException();
    });
  }
}
