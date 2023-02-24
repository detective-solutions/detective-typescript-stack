import {
  AnyWhiteboardNode,
  ICachableCasefileForWhiteboard,
  IUserForWhiteboard,
  IWhiteboardNodePropertiesUpdate,
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

  private timeoutCache: { casefileId: string; timeout: NodeJS.Timeout }[] = [];
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
    this.removeTimeoutCacheById(casefileId);
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

    // TODO: Remove me after debugging!
    console.log('ACTIVE USERS');
    console.log(activeUsers);

    if (!activeUsers) {
      return null;
    }
    activeUsers = activeUsers.filter((user: IUserForWhiteboard) => user.id !== userId);

    // Handle case if no uses are active on a given casefile
    if (activeUsers.length === 0) {
      // Create timeout to prevent deleting cache instantly if users return in the meantime
      const casefileTimeout = setTimeout(async () => {
        await this.databaseService.saveCasefile(await this.getCasefileById(casefileId));
        await this.deleteCasefile(casefileId);
        this.removeTimeoutCacheById(casefileId);
      }, 5000);

      // Save timeout temporarily to be able to remove it if a user returns to casefile
      this.timeoutCache.push({ casefileId, timeout: casefileTimeout });
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

  async updateNodeProperties(
    casefileId: string,
    userId: string,
    nodePropertyUpdates: IWhiteboardNodePropertiesUpdate[]
  ): Promise<void> {
    const cachedNodes = await this.getNodesByCasefile(casefileId);
    const temporaryKey = 'temporary';

    for (const nodePropertyUpdate of nodePropertyUpdates) {
      const correspondingCachedNode = cachedNodes.find(
        (cachedNode: AnyWhiteboardNode) => cachedNode.id === nodePropertyUpdate.nodeId
      );

      if (!correspondingCachedNode) {
        this.logger.log(`Skipping node property update due to missing corresponding cache node`);
        this.logger.verbose(nodePropertyUpdate);
        continue;
      }

      if (this.isNodeAlreadyBlocked(correspondingCachedNode, userId)) {
        this.logger.warn(
          `Properties of whiteboard node "${correspondingCachedNode.id}" cannot be updated as it is blocked by another user`
        );
        continue;
      }

      // eslint-disable-next-line prefer-const
      let { nodeId, ...actualPropertyUpdate } = nodePropertyUpdate;

      // Flatten property update object in case of a nested temporary property update
      const isTemporaryPropertyUpdate = Object.keys(actualPropertyUpdate).includes(temporaryKey);
      if (isTemporaryPropertyUpdate) {
        actualPropertyUpdate = actualPropertyUpdate[temporaryKey] as Record<string, string | number | boolean | null>;
      }

      for (const [propertyToUpdate, updateValue] of Object.entries(actualPropertyUpdate)) {
        this.logger.log(
          `Updating ${
            isTemporaryPropertyUpdate ? temporaryKey : ''
          } ${propertyToUpdate} property of node "${nodeId}" in casefile "${casefileId}"`
        );

        if (isTemporaryPropertyUpdate) {
          // Check if temporary key already exists
          if (!correspondingCachedNode[temporaryKey]) {
            correspondingCachedNode[temporaryKey] = {};
          }
          // Update temporary property
          correspondingCachedNode[temporaryKey][propertyToUpdate] = updateValue;
        } else {
          // Update regular property
          correspondingCachedNode[propertyToUpdate] = updateValue;
        }

        this.logger.debug('Sending updated node to cache:');
        this.logger.debug(correspondingCachedNode);
      }
    }

    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.client.json.set(casefileId, CacheService.NODES_PATH, cachedNodes as any);
  }

  async unblockAllWhiteboardNodesByUserId(casefileId: string, userId: string): Promise<void> {
    this.logger.log(`Unblocking all nodes blocked by user "${userId}" in casefile "${casefileId}"`);
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

  private isNodeAlreadyBlocked(nodeToCheck: AnyWhiteboardNode, currentUserId: string): boolean {
    const blockedBy = nodeToCheck?.temporary?.blockedBy;
    return blockedBy && blockedBy !== currentUserId;
  }

  private removeTimeoutCacheById(casefileId: string) {
    // Check if a deletion timeout exists for given id. If yes, remove it.
    const timeoutCache = this.timeoutCache.find((timeoutCache) => timeoutCache.casefileId === casefileId);
    if (timeoutCache) {
      clearInterval(timeoutCache.timeout);
      this.timeoutCache = this.timeoutCache.filter((timeoutCache) => timeoutCache.casefileId !== casefileId);
    }
  }
}
