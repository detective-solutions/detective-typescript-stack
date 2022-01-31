import { BackendUsersService } from './backend-users.service';
import { Test } from '@nestjs/testing';

describe('BackendUsersService', () => {
  let service: BackendUsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BackendUsersService],
    }).compile();

    service = module.get(BackendUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
