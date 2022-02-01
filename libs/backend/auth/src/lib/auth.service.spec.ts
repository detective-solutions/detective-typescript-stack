import { Test, TestingModule } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { IUser } from '@detective.solutions/shared/data-access';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from '@detective.solutions/backend/users';

describe('AuthService', () => {
  const testUser: IUser = { email: 'tester@detective.solutions', password: 'test' };
  let service: AuthService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        JwtModule.register({
          secret: 'testSecret',
          signOptions: { expiresIn: '30s' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(() => testUser),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user object when validateUser is called with valid credentials', async () => {
    const res = await service.validateUser('tester@detective.solutions', 'test');
    expect(res.email).toEqual('tester@detective.solutions');
  });

  it('should not return the password when validateUser is called with valid credentials', async () => {
    const res = await service.validateUser('tester@detective.solutions', 'test');
    expect(res.password).toBeFalsy();
  });

  it('should return null when validateUser is called with invalid credentials', async () => {
    const res = await service.validateUser('xxx', 'xxx');
    expect(res).toBeNull();
  });

  it('should return a JWT object when login is called with valid credentials', async () => {
    const res = await service.login({ email: 'tester@detective.solutions', password: 'test' });
    expect(res.access_token).toBeDefined();
  });
});
