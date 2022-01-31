import { AuthService } from './auth.service';
import { Test } from '@nestjs/testing';
import { UsersService } from '@detective.solutions/backend/users';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, UsersService],
    }).compile();

    service = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
