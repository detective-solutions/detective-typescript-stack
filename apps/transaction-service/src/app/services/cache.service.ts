import { Injectable, InternalServerErrorException } from '@nestjs/common';

import { ICasefileForWhiteboard } from '@detective.solutions/shared/data-access';
import { RedisClientService } from '@detective.solutions/backend/redis-client';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisClientService) {}

  async saveCasefile(casefile: ICasefileForWhiteboard) {
    if (!casefile) {
      throw new InternalServerErrorException();
    }
    await this.redisService.client.json.set(casefile.id, '$', JSON.stringify(casefile));
  }

  async loadCasefile(casefileId: string) {
    return JSON.parse(await this.redisService.client.get(casefileId)) as ICasefileForWhiteboard;
  }
}
