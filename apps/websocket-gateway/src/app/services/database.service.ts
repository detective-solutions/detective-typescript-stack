import {
  AnyWhiteboardNode,
  ICachableCasefileForWhiteboard,
  ICasefileForWhiteboard,
  IDisplayWhiteboardNode,
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
} from '../queries';
import {
  IGetUserById,
  getWhiteboardUserByIdQuery,
  getWhiteboardUserByIdQueryName,
} from '../queries/get-whiteboard-user-by-id.query';
import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';

import { DGraphGrpcClientService } from '@detective.solutions/backend/dgraph-grpc-client';
import { TxnOptions } from 'dgraph-js';
import { UserForWhiteboardDTO } from '@detective.solutions/backend/shared/data-access';
import { formatDate } from '@detective.solutions/shared/utils';
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
    const response = (await this.sendQuery(getWhiteboardUserByIdQuery, queryVariables)) as IGetUserById;
    if (!response) {
      return null;
    }

    if (!response[getWhiteboardUserByIdQueryName]) {
      this.logger.error(`Incoming database response object is missing ${getWhiteboardUserByIdQueryName} property`);
      throw new InternalServerErrorException();
    }

    if (response[getWhiteboardUserByIdQueryName].length > 1) {
      this.logger.error(`Found more than one user with id ${userId}`);
      throw new InternalServerErrorException();
    }

    if (response[getWhiteboardUserByIdQueryName].length === 0) {
      this.logger.warn(`No user found for the given id ${userId}`);
      return null;
    }

    this.logger.verbose(`Received data for user ${userId}`);
    const userData = response[getWhiteboardUserByIdQueryName][0];
    await validateDto(UserForWhiteboardDTO, userData, this.logger);

    return userData;
  }

  async saveCasefile(casefile: ICachableCasefileForWhiteboard): Promise<Record<string, any> | null> {
    const setMutations = [];
    const deleteMutations = [];

    let casefileUid: string;
    try {
      casefileUid = await this.getUidByType(casefile.id, 'Casefile');
    } catch (error) {
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
          deleteMutations.push(await this.getDeleteNodeInCasefileMutation(deletedNode.id, deletedNode.type));
        }
      }
    } catch (error) {
      this.logger.error(
        `Could not determine deleted nodes while saving casefile ${casefile.id}. Skipping delete mutations ...`
      );
      console.error(error);
    }

    // Generating mutations for added/updated nodes
    try {
      for (const [index, node] of casefile.nodes.entries()) {
        switch (node.type) {
          case WhiteboardNodeType.TABLE: {
            setMutations.push(
              await this.getTableOccurrenceToCasefileMutation(casefileUid, node as ITableWhiteboardNode, index)
            );
            break;
          }
          case WhiteboardNodeType.USER_QUERY: {
            setMutations.push(
              await this.getUserQueryOccurrenceToCasefileMutation(casefileUid, node as IUserQueryWhiteboardNode, index)
            );
            break;
          }
          case WhiteboardNodeType.DISPLAY: {
            // TODO: Remove me!
            console.log('SAVING DISPLAY');
            console.log(node);

            setMutations.push(
              await this.getDisplayOccurrenceToCasefileMutation(casefileUid, node as IDisplayWhiteboardNode, index)
            );
            break;
          }
          case WhiteboardNodeType.EMBEDDING: {
            setMutations.push(
              await this.getEmbeddingToCasefileMutation(casefileUid, node as IEmbeddingWhiteboardNode, index)
            );
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
      setMutations.push({
        uid: casefileUid,
        'Casefile.title': casefile.title ?? null,
        'Casefile.description': casefile.description ?? null,
      });
    } catch (error) {
      this.logger.error(`Could not create metadata mutation while saving casefile ${casefile.id}`);
    }

    return this.sendMutation(setMutations, deleteMutations).catch(() => {
      this.logger.error(`There was a problem while trying to save casefile "${casefile.id}"`);
      return null;
    });
  }

  async getTableOccurrenceToCasefileMutation(
    casefileUid: string,
    tableWhiteboardNode: ITableWhiteboardNode,
    index: number
  ): Promise<Record<string, any> | null> {
    const uid = await this.getUidByType(tableWhiteboardNode.id, 'TableOccurrence');
    const basicMutationJson = await this.createBasicNodeInsertMutation(tableWhiteboardNode);
    return {
      uid: uid ?? `${DatabaseService.mutationNodeReference}_${index}`,
      ...basicMutationJson,
      [`${tableWhiteboardNode.type}.entity`]: {
        uid: (await this.getUidByType(tableWhiteboardNode.entity.id, 'Table')) ?? null,
      },
      [`${tableWhiteboardNode.type}.casefile`]: {
        uid: casefileUid,
        'Casefile.tables': { uid: uid ?? `${DatabaseService.mutationNodeReference}_${index}` },
      },
    };
  }

  async getUserQueryOccurrenceToCasefileMutation(
    casefileUid: string,
    userQueryWhiteboardNode: IUserQueryWhiteboardNode,
    index: number
  ): Promise<Record<string, any> | null> {
    const uid = await this.getUidByType(userQueryWhiteboardNode.id, 'TableOccurrence');
    const basicMutationJson = await this.createBasicNodeInsertMutation(userQueryWhiteboardNode);
    return {
      uid: uid ?? `${DatabaseService.mutationNodeReference}_${index}`,
      ...basicMutationJson,
      [`${userQueryWhiteboardNode.type}.author`]: {
        uid: (await this.getUidByType(userQueryWhiteboardNode.author, 'User')) ?? null,
      },
      [`${userQueryWhiteboardNode.type}.entity`]: {
        uid: (await this.getUidByType(userQueryWhiteboardNode.entity.id, 'UserQuery')) ?? null,
      },
      [`${userQueryWhiteboardNode.type}.casefile`]: {
        uid: casefileUid,
        'Casefile.queries': { uid: uid ?? `${DatabaseService.mutationNodeReference}_${index}` },
      },
    };
  }

  // TODO: Add unit tests
  async getDisplayOccurrenceToCasefileMutation(
    casefileUid: string,
    displayWhiteboardNode: IDisplayWhiteboardNode,
    index: number
  ): Promise<Record<string, any> | null> {
    const uid = await this.getUidByType(displayWhiteboardNode.id, 'DisplayOccurrence');
    const basicMutationJson = await this.createBasicNodeInsertMutation(displayWhiteboardNode);
    return {
      uid: uid ?? `${DatabaseService.mutationNodeReference}_${index}`,
      ...basicMutationJson,
      [`${displayWhiteboardNode.type}.filePageUrls`]: displayWhiteboardNode.filePageUrls,
      [`${displayWhiteboardNode.type}.expires`]: displayWhiteboardNode.expires,
      [`${displayWhiteboardNode.type}.currentFilePageUrl`]: displayWhiteboardNode.currentFilePageUrl,
      [`${displayWhiteboardNode.type}.currentFilePageIndex`]: displayWhiteboardNode.currentPageIndex,
      // TODO: Add additional node properties
      [`${displayWhiteboardNode.type}.author`]: {
        uid: (await this.getUidByType(displayWhiteboardNode.author, 'User')) ?? null,
      },
      [`${displayWhiteboardNode.type}.entity`]: {
        uid: (await this.getUidByType(displayWhiteboardNode.entity.id, 'Display')) ?? null,
      },
      [`${displayWhiteboardNode.type}.casefile`]: {
        uid: casefileUid,
        'Casefile.displays': { uid: uid ?? `${DatabaseService.mutationNodeReference}_${index}` },
      },
    };
  }

  async getEmbeddingToCasefileMutation(
    casefileUid: string,
    embeddingWhiteboardNode: IEmbeddingWhiteboardNode,
    index: number
  ): Promise<Record<string, any> | null> {
    const uid = await this.getUidByType(embeddingWhiteboardNode.id, 'Embedding');
    const basicMutationJson = await this.createBasicNodeInsertMutation(embeddingWhiteboardNode);
    return {
      uid: uid ?? `${DatabaseService.mutationNodeReference}_${index}`,
      ...basicMutationJson,
      [`${embeddingWhiteboardNode.type}.author`]: {
        uid: (await this.getUidByType(embeddingWhiteboardNode.author, 'User')) ?? null,
      },
      [`${embeddingWhiteboardNode.type}.casefile`]: {
        uid: casefileUid,
        'Casefile.embeddings': { uid: uid ?? `${DatabaseService.mutationNodeReference}_${index}` },
      },
    };
  }

  async getDeleteNodeInCasefileMutation(nodeId: string, nodeType: WhiteboardNodeType): Promise<Record<string, any>> {
    return {
      uid: await this.getUidByType(nodeId, nodeType),
    };
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
      this.logger.warn(
        `Found more than one objects with id ${id} while fetching uid. Using the first returned entry for now.`
      );
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
        uid: (await this.getUidByType(addedWhiteboardNode.lastUpdatedBy, 'User')) ?? null,
      },
      [`${addedWhiteboardNode.type}.lastUpdated`]: addedWhiteboardNode.lastUpdated ?? formatDate(new Date()),
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
  private async sendMutation(
    setMutationJson?: object | object[],
    deleteMutationJson?: object | object[]
  ): Promise<Record<string, any>> {
    const mutation = this.dGraphClient.createMutation();
    mutation.setCommitNow(true);

    if (setMutationJson) {
      mutation.setSetJson(setMutationJson);
    }
    if (deleteMutationJson) {
      mutation.setDeleteJson(deleteMutationJson);
    }

    const txn = this.dGraphClient.client.newTxn();
    return txn.mutate(mutation).catch((err) => {
      this.logger.error('There was an error while sending a mutation to the database', err);
      throw new ServiceUnavailableException();
    });
  }
}
