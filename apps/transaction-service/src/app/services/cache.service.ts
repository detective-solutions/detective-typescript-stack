import {
  AnyWhiteboardNode,
  ICachableCasefileForWhiteboard,
  IUserForWhiteboard,
} from '@detective.solutions/shared/data-access';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { RedisClientType, RedisDefaultModules } from 'redis';

import { DatabaseService } from './database.service';
import { RedisClientService } from '@detective.solutions/backend/redis-client';

@Injectable()
export class CacheService {
  static readonly TEMPORARY_DATA_JSON_KEY = 'temporary';
  static readonly ACTIVE_USERS_JSON_KEY = 'activeUsers';

  static readonly ACTIVE_USERS_JSON_PATH = `.${CacheService.TEMPORARY_DATA_JSON_KEY}.${CacheService.ACTIVE_USERS_JSON_KEY}`;
  static readonly NODES_PATH = '.nodes';

  readonly logger = new Logger(CacheService.name);

  private client: RedisClientType<RedisDefaultModules>;

  constructor(private readonly clientService: RedisClientService, private readonly databaseService: DatabaseService) {
    this.client = clientService.createClient();
  }

  async saveCasefile(casefile: ICachableCasefileForWhiteboard): Promise<'OK'> {
    this.logger.log(`Saving casefile "${casefile.id}" to cache`);

    // Can't match expected Redis client type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cacheResponse = await this.client.json.set(casefile.id, '.', casefile as any);
    if (cacheResponse !== 'OK') {
      throw new InternalServerErrorException(`Could not save casefile "${casefile.id}" to cache`);
    }

    return cacheResponse;
  }

  async deleteCasefile(casefileId: string): Promise<void> {
    this.logger.log(`Deleting casefile "${casefileId}" from cache`);

    // Can't match expected Redis client type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cacheResponse = await this.client.json.del(casefileId);
    // 0 or 1
    if (!cacheResponse) {
      throw new InternalServerErrorException(`Could not delete casefile "${casefileId}" from cache`);
    }
  }

  async getCasefileById(casefileId: string): Promise<ICachableCasefileForWhiteboard> {
    this.logger.log(`Requesting casefile "${casefileId}" data from cache`);
    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.client.json.get(casefileId) as any;
  }

  async getActiveUsersByCasefile(casefileId: string): Promise<IUserForWhiteboard[]> {
    this.logger.log(`Requesting all active users for casefile "${casefileId}"`);
    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.client.json.get(casefileId, { path: CacheService.ACTIVE_USERS_JSON_PATH }) as any;
  }

  async insertActiveUsers(casefileId: string, activeUsers: IUserForWhiteboard[]): Promise<'OK'> {
    this.logger.log(`Updating active users in casefile "${casefileId}"`);
    const cacheResponse = await this.client.json.set(casefileId, CacheService.ACTIVE_USERS_JSON_PATH, activeUsers);
    if (cacheResponse !== 'OK') {
      throw new InternalServerErrorException(`Could insert active users to casefile ${casefileId}`);
    }
    return cacheResponse;
  }

  async removeActiveUser(casefileId: string, userId: string): Promise<'OK' | null> {
    this.logger.log(`Removing active user "${userId}" from casefile "${casefileId}"`);

    // Check if active users are present & filter out the user that left
    let activeUsers = await this.getActiveUsersByCasefile(casefileId);
    if (!activeUsers) {
      return null;
    }
    activeUsers = activeUsers.filter((user: IUserForWhiteboard) => user.id !== userId);

    // Handle case if no uses are active on a given casefile
    if (activeUsers.length === 0) {
      await this.databaseService.saveCasefile(await this.getCasefileById(casefileId));
      await this.deleteCasefile(casefileId);
      return 'OK';
    }

    await this.unblockAllWhiteboardNodesByUserId(casefileId, userId);

    const cacheResponse = await this.client.json.set(casefileId, CacheService.ACTIVE_USERS_JSON_PATH, activeUsers);
    if (cacheResponse !== 'OK') {
      throw new InternalServerErrorException(`Could not remove active user ${userId} from casefile ${casefileId}`);
    }

    return cacheResponse;
  }

  async getNodesByCasefile(casefileId: string): Promise<AnyWhiteboardNode[]> {
    this.logger.log(`Requesting nodes for casefile "${casefileId}"`);
    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.client.json.get(casefileId, { path: CacheService.NODES_PATH }) as any;
  }

  async updateCasefileTitleFocus(casefileId: string, isFocused: string) {
    this.logger.log(`Updating focus state of title in casefile "${casefileId}"`);
    this.client.json.set(casefileId, '.isTitleFocused', isFocused);
  }

  async updateCasefileTitle(casefileId: string, title: string) {
    this.logger.log(`Updating title of casefile "${casefileId}" in cache`);
    this.client.json.set(casefileId, '.title', title);
  }

  async updateNodePositions(casefileId: string, userId: string, positionUpdates: any[]): Promise<any[]> {
    this.logger.log(`Updating positions of whiteboard node in casefile "${casefileId}"`);
    const cachedNodes = await this.getNodesByCasefile(casefileId);

    // Check if node is already blocked by another user. If yes, abort blocking process to avoid inconsistency!
    const filteredPositionUpdates = positionUpdates.filter((update: any) =>
      cachedNodes.some((node: AnyWhiteboardNode) => node.id === update.id && node?.temporary?.blockedBy === userId)
    );

    filteredPositionUpdates.forEach((update: any) => {
      cachedNodes.forEach((node: AnyWhiteboardNode) => {
        if (node.id === update.id) {
          node.x = update.x;
          node.y = update.y;
        }
      });
    });

    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.client.json.set(casefileId, CacheService.NODES_PATH, cachedNodes as any);
    // Only return position updates for nodes that are not blocked by other users
    return filteredPositionUpdates;
  }

  async updateNodeSize(casefileId: string, updatedNodeId: string, userId: string, sizeUpdate: any): Promise<boolean> {
    this.logger.log(`Updating size of whiteboard node in casefile "${casefileId}"`);
    const cachedNodes = await this.getNodesByCasefile(casefileId);

    // Check if node is already blocked by another user. If yes, abort blocking process to avoid inconsistency!
    if (
      cachedNodes.some((node: AnyWhiteboardNode) => node.id === updatedNodeId && node?.temporary?.blockedBy !== userId)
    ) {
      return false;
    }

    cachedNodes.forEach((node: AnyWhiteboardNode) => {
      if (node.id === updatedNodeId) {
        node.width = sizeUpdate.width;
        node.height = sizeUpdate.height;
      }
    });

    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.client.json.set(casefileId, CacheService.NODES_PATH, cachedNodes as any);
    return true;
  }

  async updateNodeProperties(
    casefileId: string,
    userId: string,
    nodeId: string,
    updatedProperties: Record<string, any>
  ): Promise<void> {
    const cachedNodes = await this.getNodesByCasefile(casefileId);

    cachedNodes.forEach((node: AnyWhiteboardNode) => {
      if (node.id === nodeId) {
        // Check if node is already blocked by another user. If yes, abort property update process to avoid inconsistency!
        if (node?.temporary?.blockedBy !== null && node?.temporary?.blockedBy !== userId) {
          this.logger.warn(
            `Properties of whiteboard node "${node.id}" cannot be updated, because it is blocked by another user`
          );
        } else {
          Object.entries(updatedProperties).forEach(([propertyToUpdate, updateValue]) => {
            this.logger.log(
              `Updating ${propertyToUpdate} property of whiteboard node "${nodeId}" in casefile "${casefileId}"`
            );
            node[propertyToUpdate] = updateValue;
          });
        }
      }
    });

    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.client.json.set(casefileId, CacheService.NODES_PATH, cachedNodes as any);
  }

  async updateNodeBlock(casefileId: string, userId: string | null, nodeId: string): Promise<boolean> {
    this.logger.log(`Marking whiteboard node "${nodeId}" as blocked by user "${userId}"`);
    const cachedNodes = await this.getNodesByCasefile(casefileId);

    // Check if node is already blocked by another user. If yes, abort blocking process to avoid inconsistency!
    if (
      !cachedNodes ||
      cachedNodes.length === 0 ||
      cachedNodes.some((node: AnyWhiteboardNode) => node.id === nodeId && node?.temporary?.blockedBy === userId)
    ) {
      return false;
    }

    cachedNodes.forEach((node: AnyWhiteboardNode) => {
      if (node.id === nodeId) {
        node.temporary = { blockedBy: userId };
      }
    });

    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.client.json.set(casefileId, CacheService.NODES_PATH, cachedNodes as any);
    return true;
  }

  async unblockAllWhiteboardNodesByUserId(casefileId: string, userId: string): Promise<void> {
    this.logger.log(`Unblocking all whiteboard nodes blocked by user "${userId}" in casefile "${casefileId}"`);
    const cachedNodes = await this.getNodesByCasefile(casefileId);

    cachedNodes.forEach((node: AnyWhiteboardNode) => {
      if (node?.temporary?.blockedBy === userId) {
        node.temporary = { blockedBy: null };
      }
    });

    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.client.json.set(casefileId, CacheService.NODES_PATH, cachedNodes as any);
  }

  async addNode(casefileId: string, node: AnyWhiteboardNode): Promise<void> {
    this.logger.log(`Adding node "${node.id}" to casefile "${casefileId}"`);

    const cacheResponse = await this.client.json.arrAppend(
      casefileId,
      CacheService.NODES_PATH,
      // Can't match Redis client return type with domain type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node as any
    );
    // 0 or 1
    if (!cacheResponse) {
      throw new InternalServerErrorException(`Could not add node ${node?.id} to casefile ${casefileId}`);
    }
  }

  async deleteNode(casefileId: string, nodeId: string): Promise<'OK'> {
    this.logger.log(`Deleting node "${nodeId}" from casefile "${casefileId}"`);

    let cachedNodes = await this.getNodesByCasefile(casefileId);
    cachedNodes = cachedNodes.filter((node: AnyWhiteboardNode) => node.id !== nodeId);

    const cacheResponse = await this.client.json.set(
      casefileId,
      CacheService.NODES_PATH,
      // Can't match Redis client return type with domain type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cachedNodes as any
    );
    if (cacheResponse !== 'OK') {
      throw new InternalServerErrorException(`Could not remove node "${nodeId}" from casefile "${casefileId}"`);
    }
    return cacheResponse;
  }
}
