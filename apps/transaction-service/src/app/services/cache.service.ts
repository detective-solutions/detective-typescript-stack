import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

import { ICasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { RedisClientService } from '@detective.solutions/backend/redis-client';

@Injectable()
export class CacheService {
  readonly logger = new Logger(CacheService.name);

  constructor(private readonly redisService: RedisClientService) {}

  async isCasefileCached(casefileId: string): Promise<number> {
    this.logger.verbose(`Checking if casefile ${casefileId} is cached already`);
    return await this.redisService.client.exists(casefileId);
  }

  async saveCasefile(casefile: any): Promise<string> {
    if (!casefile) {
      throw new InternalServerErrorException();
    }
    this.logger.log(`Saving casefile ${casefile?.id} to cache`);
    const response = await this.redisService.client.json.set(casefile.id, '$', casefile);

    if (!response || response !== 'OK') {
      throw new InternalServerErrorException();
    }
    return response;
  }

  async getCasefileById(casefileId: string): Promise<ICasefileForWhiteboard> {
    this.logger.log(`Requesting casefile ${casefileId} data from cache`);
    return this.redisService.client.json.get(casefileId) as any;
  }
}
