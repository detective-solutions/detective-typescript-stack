import {
  AnyWhiteboardNode,
  ICachableCasefileForWhiteboard,
  ICasefileForWhiteboard,
  IEmbeddingWhiteboardNode,
  ITableWhiteboardNode,
  IUserForWhiteboard,
  IUserQueryWhiteboardNode,
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
    // Merge different node types under "nodes" key for better handling
    const convertedCasefile = {
      id: casefileData.id,
      title: casefileData.title,
      description: casefileData.description,
      nodes: [
        ...(casefileData.tables
          ? (casefileData.tables.map((node) => {
              return { ...node, type: WhiteboardNodeType.TABLE };
            }) as AnyWhiteboardNode[])
          : []),
        ...(casefileData.queries
          ? (casefileData.queries.map((node) => {
              return { ...node, type: WhiteboardNodeType.USER_QUERY };
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
    this.logger.log(`Requesting info for user "${userId}" from database`);

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

  async saveCasefile(casefile: ICachableCasefileForWhiteboard): Promise<Record<string, any> | null> {
    const mutations = [];

    const casefileUid = await this.getUidByType(casefile.id, 'Casefile');
    if (!casefileUid) {
      throw new InternalServerErrorException(`Could not retrieve casefile UID for casefile ${casefile.id}`);
    }

    // Generating mutations for deleted nodes
    try {
      const currentlySavedCasefile = await this.getCachableCasefileById(casefile.id);
      const deletedNodes = currentlySavedCasefile.nodes.filter(
        (node: AnyWhiteboardNode) => !casefile.nodes.some((cachedNode: AnyWhiteboardNode) => node.id === cachedNode.id)
      );
      if (deletedNodes && deletedNodes.length > 0) {
        for (const deletedNode of deletedNodes) {
          mutations.push(await this.getDeleteNodeInCasefileMutation(deletedNode.id, deletedNode.type));
        }
      }
      console.debug('DELETED NODE MUTATIONS', mutations); // TODO: Remove me!
    } catch (error) {
      this.logger.error(
        `Could not determine deleted nodes while saving casefile ${casefile.id}. Skipping delete mutations ...`
      );
      console.error(error);
    }

    // Generating mutations for added/updated nodes
    try {
      for (const node of casefile.nodes) {
        switch (node.type) {
          case WhiteboardNodeType.TABLE: {
            mutations.push(await this.getTableOccurrenceToCasefileMutation(casefileUid, node as ITableWhiteboardNode));
            break;
          }
          case WhiteboardNodeType.USER_QUERY: {
            mutations.push(
              await this.getUserQueryOccurrenceToCasefileMutation(casefileUid, node as IUserQueryWhiteboardNode)
            );
            break;
          }
          case WhiteboardNodeType.EMBEDDING: {
            mutations.push(await this.getEmbeddingToCasefileMutation(casefileUid, node as IEmbeddingWhiteboardNode));
            break;
          }
          default: {
            throw new InternalServerErrorException(
              `Could not match given node type ${node.type} for saving the node to the database`
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(`Could not generate all node mutations while saving casefile ${casefile.id}`);
      console.error(error);
    }

    // Generating mutation for casefile metadata
    try {
      mutations.push({
        uid: casefileUid,
        'Casefile.title': casefile.title ?? null,
        'Casefile.description': casefile.description ?? null,
      });
    } catch (error) {
      this.logger.error(`Could not create metadata mutation while saving casefile ${casefile.id}`);
    }

    return this.sendMutation(mutations).catch(() => {
      this.logger.error(`There was a problem while trying to save casefile "${casefile.id}"`);
      return null;
    });
  }

  async getTableOccurrenceToCasefileMutation(
    casefileUid: string,
    tableWhiteboardNode: ITableWhiteboardNode
  ): Promise<Record<string, any> | null> {
    console.log('Creating mutation for', tableWhiteboardNode);
    const basicMutationJson = await this.createBasicNodeInsertMutation(tableWhiteboardNode);
    return {
      uid: DatabaseService.mutationNodeReference,
      ...basicMutationJson,
      [`${tableWhiteboardNode.type}.entity`]: {
        uid: await this.getUidByType(tableWhiteboardNode.entity.id, 'Table'),
      },
      [`${tableWhiteboardNode.type}.casefile`]: {
        uid: casefileUid,
        'Casefile.tables': { uid: DatabaseService.mutationNodeReference },
      },
    };
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

  async getUserQueryOccurrenceToCasefileMutation(
    casefileUid: string,
    userQueryWhiteboardNode: IUserQueryWhiteboardNode
  ): Promise<Record<string, any> | null> {
    const basicMutationJson = await this.createBasicNodeInsertMutation(userQueryWhiteboardNode);
    return {
      uid: DatabaseService.mutationNodeReference,
      ...basicMutationJson,
      [`${userQueryWhiteboardNode.type}.author`]: {
        uid: await this.getUidByType(userQueryWhiteboardNode.author, 'User'),
      },
      [`${userQueryWhiteboardNode.type}.entity`]: {
        uid: await this.getUidByType(userQueryWhiteboardNode.entity.id, 'UserQuery'),
      },
      [`${userQueryWhiteboardNode.type}.casefile`]: {
        uid: casefileUid,
        'Casefile.queries': { uid: DatabaseService.mutationNodeReference },
      },
    };
  }

  async insertUserQueryOccurrenceToCasefile(
    casefileId: string,
    userQueryWhiteboardNode: IUserQueryWhiteboardNode
  ): Promise<Record<string, any> | null> {
    const basicMutationJson = await this.createBasicNodeInsertMutation(userQueryWhiteboardNode);
    const finalMutationJson = {
      uid: DatabaseService.mutationNodeReference,
      [`${userQueryWhiteboardNode.type}.author`]: {
        uid: await this.getUidByType(userQueryWhiteboardNode.author, 'User'),
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

  async getEmbeddingToCasefileMutation(
    casefileUid: string,
    embeddingWhiteboardNode: IEmbeddingWhiteboardNode
  ): Promise<Record<string, any> | null> {
    const basicMutationJson = await this.createBasicNodeInsertMutation(embeddingWhiteboardNode);
    return {
      uid: DatabaseService.mutationNodeReference,
      ...basicMutationJson,
      [`${embeddingWhiteboardNode.type}.href`]: embeddingWhiteboardNode.href,
      [`${embeddingWhiteboardNode.type}.author`]: {
        uid: await this.getUidByType(embeddingWhiteboardNode.author, 'User'),
      },
      [`${embeddingWhiteboardNode.type}.casefile`]: {
        uid: casefileUid,
        'Casefile.embeddings': { uid: DatabaseService.mutationNodeReference },
      },
    };
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
        uid: await this.getUidByType(embeddingWhiteboardNode.author, 'User'),
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

  async getDeleteNodeInCasefileMutation(nodeId: string, nodeType: WhiteboardNodeType): Promise<Record<string, any>> {
    return {
      uid: await this.getUidByType(nodeId, nodeType),
    };
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
      [`${addedWhiteboardNode.type}.title`]: addedWhiteboardNode.title ?? null,
      [`${addedWhiteboardNode.type}.x`]: addedWhiteboardNode.x,
      [`${addedWhiteboardNode.type}.y`]: addedWhiteboardNode.y,
      [`${addedWhiteboardNode.type}.width`]: addedWhiteboardNode.width,
      [`${addedWhiteboardNode.type}.height`]: addedWhiteboardNode.height,
      [`${addedWhiteboardNode.type}.locked`]: addedWhiteboardNode.locked ?? null,
      [`${addedWhiteboardNode.type}.lastUpdatedBy`]: {
        uid: await this.getUidByType(addedWhiteboardNode.lastUpdatedBy, 'User'),
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
