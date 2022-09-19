import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { RedisClientService } from '@detective.solutions/backend/redis-client';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisClientService) {}

  async isCasefileCached(casefileId) {
    return await this.redisService.client.exists(casefileId);
  }

  async saveCasefile(casefile: any) {
    if (!casefile) {
      throw new InternalServerErrorException();
    }
    await this.redisService.client.json.set(casefile.id, '$', casefile);
  }

  async loadCasefile(casefileId: string) {
    return await this.redisService.client.json.get(casefileId);
  }
}
