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

  readonly logger = new Logger(CacheService.name);

  constructor(private readonly clientService: RedisClientService, private readonly databaseService: DatabaseService) {}

  async saveCasefile(casefile: ICasefileForWhiteboard): Promise<ICachedCasefileForWhiteboard> {
    if (!casefile) {
      throw new InternalServerErrorException();
    }
    this.logger.log(`Saving casefile ${casefile?.id} to cache`);
    const enhancedCasefile = {
      ...casefile,
      [CacheService.TEMPORARY_DATA_JSON_KEY]: { [CacheService.ACTIVE_USERS_JSON_KEY]: [] },
    };
    // Can't match expected Redis client type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this.clientService.client.json.set(casefile.id, '.', enhancedCasefile as any);

    if (!response || response !== 'OK') {
      throw new InternalServerErrorException(`Could not save casefile ${casefile.id} to cache`);
    }
    return enhancedCasefile;
  }

  async getCasefileById(casefileId: string): Promise<ICachedCasefileForWhiteboard> {
    this.logger.log(`Requesting casefile ${casefileId} data from cache`);
    // Can't match Redis client return types with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.clientService.client.json.get(casefileId) as any;
  }

  async getActiveWhiteboardUsersByCasefile(casefileId: string): Promise<IUserForWhiteboard[]> {
    this.logger.log(`Requesting active connection information for casefile ${casefileId} from cache`);
    // Can't match Redis client return types with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.clientService.client.json.get(casefileId, { path: CacheService.ACTIVE_USERS_JSON_PATH }) as any;
  }

  async addActiveWhiteboardUser(userId: string, casefileId: string): Promise<IUserForWhiteboard> {
    this.logger.log(`Adding active user ${userId} to casefile ${casefileId}`);
    const whiteboardUser = await this.databaseService.getUserById(userId);
    const response = (await this.clientService.client.json.arrAppend(
      casefileId,
      `$.${CacheService.ACTIVE_USERS_JSON_PATH}`,
      whiteboardUser
    )) as number;
    if (!response) {
      throw new InternalServerErrorException(`Could not join new user to cache for casefile ${casefileId}`);
    }
    return whiteboardUser;
  }

  async removeActiveWhiteboardUser(userId: string, casefileId: string) {
    this.logger.log(`Remove active user ${userId} from casefile ${casefileId}`);
    const activeUsers = await this.getActiveWhiteboardUsersByCasefile(casefileId);
    console.log('ACTIVE USERS BEFORE', activeUsers);
    activeUsers.filter((user: IUserForWhiteboard) => user.id !== userId);
    console.log('ACTIVE USERS AFTER', activeUsers);
    const response = await this.clientService.client.json.set(
      casefileId,
      CacheService.ACTIVE_USERS_JSON_PATH,
      activeUsers
    );
    if (!response) {
      throw new InternalServerErrorException(`Could not remove user (${userId}) from casefile cache (${casefileId})`);
    }
    this.logger.debug('REMOVED USER FROM CACHE RESPONSE');
    console.debug(response);
    return response;
  }
}
