import { Test, TestingModule } from '@nestjs/testing';
import { UserLogin, UsersService } from '@detective.solutions/backend/users';

import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

describe('AuthService', () => {
  const testUser: UserLogin = { email: 'tester@detective.solutions', password: 'test' };

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
    const res = await service.validateUser(testUser.email, testUser.password);
    expect(res.email).toEqual(testUser.email);
  });

  it('should not return the password when validateUser is called with valid credentials', async () => {
    const res = await service.validateUser(testUser.email, testUser.password);
    expect(res.password).toBeFalsy();
  });

  it('should return null when validateUser is called with invalid credentials', async () => {
    const res = await service.validateUser('xxx', 'xxx');
    expect(res).toBeNull();
  });

  it('should return a JWT object when login is called with valid credentials', async () => {
    const res = await service.login({ email: testUser.email, password: testUser.password });
    expect(res.access_token).toBeDefined();
  });
});
