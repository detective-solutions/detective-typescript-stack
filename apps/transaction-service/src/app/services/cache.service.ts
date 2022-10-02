import {
  ICachedCasefileForWhiteboard,
  ICasefileForWhiteboard,
  IUserForWhiteboard,
} from '@detective.solutions/shared/data-access';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { DatabaseService } from './database.service';
import { RedisClientService } from '@detective.solutions/backend/redis-client';

@Injectable()
export class CacheService {
  static readonly TEMPORARY_DATA_JSON_KEY = 'temporary';
  static readonly ACTIVE_USERS_JSON_KEY = 'activeUsers';
  static readonly ACTIVE_USERS_JSON_PATH = `${CacheService.TEMPORARY_DATA_JSON_KEY}.${CacheService.ACTIVE_USERS_JSON_KEY}`;
  static readonly NODES_JSON_KEY = 'nodes';
  static readonly NODES_JSON_PATH = `${CacheService.TEMPORARY_DATA_JSON_KEY}.${CacheService.NODES_JSON_KEY}`;

  readonly logger = new Logger(CacheService.name);

  constructor(private readonly clientService: RedisClientService, private readonly databaseService: DatabaseService) {}

  async saveCasefile(casefile: ICasefileForWhiteboard): Promise<ICachedCasefileForWhiteboard> {
    this.logger.log(`Saving casefile ${casefile.id} to cache`);

    // Enhance casefile with temporary object keys
    const enhancedCasefile = {
      ...casefile,
      [CacheService.TEMPORARY_DATA_JSON_KEY]: { [CacheService.ACTIVE_USERS_JSON_KEY]: [] },
    };

    // Can't match expected Redis client type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cacheResponse = await this.clientService.client.json.set(casefile.id, '.', enhancedCasefile as any);
    if (cacheResponse !== 'OK') {
      throw new InternalServerErrorException(`Could not save casefile ${casefile.id} to cache`);
    }
    return enhancedCasefile;
  }

  async getCasefileById(casefileId: string): Promise<ICachedCasefileForWhiteboard> {
    this.logger.log(`Requesting casefile ${casefileId} data from cache`);
    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.clientService.client.json.get(casefileId) as any;
  }

  async getActiveUsersByCasefile(casefileId: string): Promise<IUserForWhiteboard[]> {
    this.logger.log(`Requesting active users for casefile ${casefileId}`);
    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.clientService.client.json.get(casefileId, { path: CacheService.ACTIVE_USERS_JSON_PATH }) as any;
  }

  async addActiveUser(userId: string, casefileId: string): Promise<IUserForWhiteboard> {
    this.logger.log(`Adding active user ${userId} to casefile ${casefileId}`);
    const whiteboardUser = await this.databaseService.getWhiteboardUserById(userId);
    const cacheResponse = await this.clientService.client.json.arrAppend(
      casefileId,
      `$.${CacheService.ACTIVE_USERS_JSON_PATH}`,
      whiteboardUser
    );
    // 0 or 1
    if (!cacheResponse) {
      throw new InternalServerErrorException(`Could not add active user to casefile ${casefileId}`);
    }
    return whiteboardUser;
  }

  async removeActiveUser(userId: string, casefileId: string): Promise<'OK'> {
    this.logger.log(`Removing active user ${userId} from casefile ${casefileId}`);
    let activeUsers = await this.getActiveUsersByCasefile(casefileId);
    activeUsers = activeUsers.filter((user: IUserForWhiteboard) => user.id !== userId);
    const cacheResponse = await this.clientService.client.json.set(
      casefileId,
      CacheService.ACTIVE_USERS_JSON_PATH,
      activeUsers
    );
    if (cacheResponse !== 'OK') {
      throw new InternalServerErrorException(`Could not remove active user ${userId} from casefile ${casefileId}`);
    }
    return cacheResponse;
  }

  async getNodesByCasefile(casefileId: string) {
    this.logger.log(`Requesting nodes for casefile ${casefileId}`);
    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.clientService.client.json.get(casefileId, { path: CacheService.NODES_JSON_PATH }) as any;
  }

  async blockWhiteboardNode(casefileId: string, nodeId: string, userId: string) {
    this.logger.log(`Mark whiteboard node ${nodeId} as blocked by user ${userId}`);
    const nodes = await this.getNodesByCasefile(casefileId);
    this.logger.debug('NODES:');
    this.logger.debug(nodes);
  }
}
