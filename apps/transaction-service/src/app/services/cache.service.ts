import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { ICachedCasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { RedisClientService } from '@detective.solutions/backend/redis-client';

@Injectable()
export class CacheService {
  readonly logger = new Logger(CacheService.name);

  constructor(private readonly clientService: RedisClientService) {}

  async isCasefileCached(casefileId: string): Promise<number> {
    this.logger.verbose(`Checking if casefile ${casefileId} is cached already`);
    return this.clientService.client.exists(casefileId);
  }

  async saveCasefile(casefile: ICachedCasefileForWhiteboard): Promise<string> {
    if (!casefile) {
      throw new InternalServerErrorException();
    }
    this.logger.log(`Saving casefile ${casefile?.id} to cache`);
    // Can't match expected Redis client type with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await this.clientService.client.json.set(casefile.id, '.', casefile as any);

    if (!response || response !== 'OK') {
      throw new InternalServerErrorException();
    }
    return response;
  }

  async getCasefileById(casefileId: string): Promise<ICachedCasefileForWhiteboard> {
    this.logger.log(`Requesting casefile ${casefileId} data from cache`);
    // Can't match Redis client return types with domain type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.clientService.client.json.get(casefileId) as any;
  }

  async getActiveUsers(casefileId: string) {
    this.logger.log(`Requesting active connection information for casefile ${casefileId} from cache`);
    return this.clientService.client.json.get(`.${casefileId}.active-users`);
  }

  async setActiveUser(userId: string, casefileId: string) {
    this.logger.log(`Adding active user ${userId} to casefile ${casefileId}`);
    const response = await this.clientService.client.json.set(casefileId, '.active-users', userId);

    if (!response || response !== 'OK') {
      throw new InternalServerErrorException();
    }
    return response;
  }
}
