import {
  AnyWhiteboardNode,
  ICachableCasefileForWhiteboard,
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
  static readonly NODES_PATH = '.nodes';

  readonly logger = new Logger(CacheService.name);

  constructor(private readonly clientService: RedisClientService, private readonly databaseService: DatabaseService) {}

  async saveCasefile(casefile: ICachableCasefileForWhiteboard): Promise<'OK'> {
    this.logger.log(`Saving casefile ${casefile.id} to cache`);

    // Can't match expected Redis client type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cacheResponse = await this.clientService.client.json.set(casefile.id, '.', casefile as any);
    if (cacheResponse !== 'OK') {
      throw new InternalServerErrorException(`Could not save casefile ${casefile.id} to cache`);
    }
    return cacheResponse;
  }

  async getCasefileById(casefileId: string): Promise<ICachableCasefileForWhiteboard> {
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
      `.${CacheService.ACTIVE_USERS_JSON_PATH}`,
      whiteboardUser
    );
    // 0 or 1
    if (!cacheResponse) {
      throw new InternalServerErrorException(`Could not add active user ${userId} to casefile ${casefileId}`);
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

  async getNodesByCasefile(casefileId: string): Promise<AnyWhiteboardNode[]> {
    this.logger.log(`Requesting nodes for casefile ${casefileId}`);
    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.clientService.client.json.get(casefileId, { path: CacheService.NODES_PATH }) as any;
  }

  async updateWhiteboardNodeBlock(casefileId: string, nodeId: string, userId: string | null): Promise<boolean> {
    this.logger.log(`Mark whiteboard node ${nodeId} as blocked by user ${userId}`);

    const nodes = await this.getNodesByCasefile(casefileId);
    // Check if node is already blocked by another user. If yes, abort blocking process to avoid inconsistency!
    if (nodes.some((node: AnyWhiteboardNode) => node.id === nodeId && node?.temporary?.blockedBy)) {
      return false;
    }
    // Update blockedBy property
    nodes.map((node: AnyWhiteboardNode) => (node.id === nodeId ? (node.temporary = { blockedBy: userId }) : node));

    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.clientService.client.json.set(casefileId, CacheService.NODES_PATH, nodes as any);
    return true;
  }

  async addNode(casefileId: string, node: AnyWhiteboardNode): Promise<void> {
    this.logger.log(`Adding node ${node?.id} to casefile ${casefileId}`);

    const cacheResponse = await this.clientService.client.json.arrAppend(
      casefileId,
      CacheService.NODES_PATH,
      node as any
    );
    // 0 or 1
    if (!cacheResponse) {
      throw new InternalServerErrorException(`Could not add node ${node?.id} to casefile ${casefileId}`);
    }
  }

  async deleteNode(casefileId: string, nodeId: string): Promise<'OK'> {
    this.logger.log(`Deleting node ${nodeId} from casefile ${casefileId}`);

    let nodes = await this.getNodesByCasefile(casefileId);
    nodes = nodes.filter((node: AnyWhiteboardNode) => node.id !== nodeId);

    // Can't match Redis client return type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cacheResponse = await this.clientService.client.json.set(casefileId, CacheService.NODES_PATH, nodes as any);
    if (cacheResponse !== 'OK') {
      throw new InternalServerErrorException(`Could not remove node ${nodeId} from casefile ${casefileId}`);
    }

    return cacheResponse;
  }
}
