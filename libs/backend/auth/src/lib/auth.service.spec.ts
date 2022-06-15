import { BadRequestException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IJwtTokenPayload, UserRole } from '@detective.solutions/shared/data-access';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthEnvironment } from './interfaces/auth-environment.enum';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from '@detective.solutions/backend/users';
import jwtDecode from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';

const mockUserService = {
  getJwtUserInfoByEmail: jest.fn(),
  getJwtUserInfoById: jest.fn(),
  checkPassword: jest.fn(),
  updateRefreshTokenId: jest.fn(),
  removeRefreshTokenId: jest.fn(),
};

describe('AuthService', () => {
  const testUser = {
    id: uuidv4(),
    email: 'test@test.com',
    password: 'test',
    tenantId: uuidv4(),
    role: UserRole.BASIC,
    refreshTokenId: uuidv4(),
  };

  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule,
        ConfigModule,
        JwtModule.register({
          secret: 'testSecret',
          signOptions: { expiresIn: '1m' },
        }),
      ],
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === AuthEnvironment.ACCESS_TOKEN_SECRET || key === AuthEnvironment.REFRESH_TOKEN_SECRET) {
                return 'testSecret';
              }
              if (key === AuthEnvironment.ACCESS_TOKEN_EXPIRY || key === AuthEnvironment.REFRESH_TOKEN_EXPIRY) {
                return '1m';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);

    // Disable logger for test runs
    authService.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return a user object when validateUser is called with valid credentials', async () => {
      const jwtUserInfoSpy = jest.spyOn(userService, 'getJwtUserInfoByEmail').mockResolvedValue({
        id: testUser.id,
        role: testUser.role,
        tenantId: testUser.tenantId,
        refreshTokenId: testUser.refreshTokenId,
      });
      const checkPasswordSpy = jest.spyOn(userService, 'checkPassword').mockResolvedValue(true);

      const res = await authService.validateUser(testUser.email, testUser.password);

      expect(res.id).toEqual(testUser.id);
      expect(jwtUserInfoSpy).toBeCalledTimes(1);
      expect(checkPasswordSpy).toBeCalledTimes(1);
    });

    it('should throw an UnauthorizedException if no user is found for the given email', async () => {
      const jwtUserInfoSpy = jest.spyOn(userService, 'getJwtUserInfoByEmail').mockResolvedValue(null);

      const validationPromise = authService.validateUser(testUser.email, testUser.password);

      await expect(validationPromise).rejects.toThrow(UnauthorizedException);
      expect(jwtUserInfoSpy).toBeCalledTimes(1);
    });

    it('should throw an UnauthorizedException if the passwords do not match', async () => {
      const jwtUserInfoSpy = jest.spyOn(userService, 'getJwtUserInfoByEmail').mockResolvedValue({
        id: testUser.id,
        role: testUser.role,
        tenantId: testUser.tenantId,
        refreshTokenId: testUser.refreshTokenId,
      });
      const checkPasswordSpy = jest.spyOn(userService, 'checkPassword').mockResolvedValue(false);

      const validationPromise = authService.validateUser(testUser.email, testUser.password);

      await expect(validationPromise).rejects.toThrow(UnauthorizedException);
      expect(jwtUserInfoSpy).toBeCalledTimes(1);
      expect(checkPasswordSpy).toBeCalledTimes(1);
    });
  });

  describe('login', () => {
    it('should return valid access and refresh tokens as JSON Web Token', async () => {
      jest.spyOn(userService, 'updateRefreshTokenId').mockResolvedValue({});

      const res = await authService.login(testUser, '127.0.0.1');

      expect(res).toBeTruthy();
      expect(res).toHaveProperty('access_token');
      expect(res).toHaveProperty('refresh_token');
    });

    it('should throw a BadRequestException if the incoming request is missing an IP address', async () => {
      const loginPromise = authService.login(testUser, undefined);

      await expect(loginPromise).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', () => {
    const testTokenPayload = {
      sub: '1x0',
      tenantId: '2x0',
      role: UserRole.BASIC,
      ip: '127.0.0.1',
      iat: '123',
      exp: 123,
      jti: '123',
    };

    it('should return true if the refresh token ID was removed from the database', async () => {
      const removeRefreshTokenIdSpy = jest.spyOn(userService, 'removeRefreshTokenId');

      await authService.logout(testTokenPayload);

      expect(removeRefreshTokenIdSpy).toBeCalledTimes(1);
    });
  });

  describe('refreshToken', () => {
    const testTokenPayload = {
      sub: '1x0',
      tenantId: '2x0',
      role: UserRole.BASIC,
      ip: '127.0.0.1',
      iat: '123',
      exp: 123,
      jti: testUser.refreshTokenId,
    };

    it('should return new valid access and refresh tokens as JSON Web Token', async () => {
      const jwtUserInfoSpy = jest.spyOn(userService, 'getJwtUserInfoById').mockResolvedValue({
        id: testUser.id,
        role: testUser.role,
        tenantId: testUser.tenantId,
        refreshTokenId: testUser.refreshTokenId,
      });
      jest.spyOn(userService, 'updateRefreshTokenId').mockResolvedValue({});

      const res = await authService.refreshTokens(testTokenPayload, testTokenPayload.ip);

      expect(res).toBeTruthy();
      expect(res).toHaveProperty('access_token');
      expect(res).toHaveProperty('refresh_token');
      expect(jwtUserInfoSpy).toBeCalledTimes(1);
    });

    it('should throw an UnauthorizedException if the request IP addresses differs from the IP address in the refresh token', async () => {
      const loginPromise = authService.refreshTokens(testTokenPayload, '721.1.2.0');

      await expect(loginPromise).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an UnauthorizedException if no user is found for the incoming token subject', async () => {
      const jwtUserInfoSpy = jest.spyOn(userService, 'getJwtUserInfoById').mockResolvedValue(null);

      const loginPromise = authService.refreshTokens(testTokenPayload, testTokenPayload.ip);

      await expect(loginPromise).rejects.toThrow(UnauthorizedException);
      expect(jwtUserInfoSpy).toBeCalledTimes(1);
    });

    it('should throw an UnauthorizedException if the incoming token ID differs from the refresh token ID in the database', async () => {
      const jwtUserInfoSpy = jest.spyOn(userService, 'getJwtUserInfoById').mockResolvedValue({
        id: testUser.id,
        role: testUser.role,
        tenantId: testUser.tenantId,
        refreshTokenId: 'differentTokenId',
      });

      const loginPromise = authService.refreshTokens(testTokenPayload, testTokenPayload.ip);

      await expect(loginPromise).rejects.toThrow(UnauthorizedException);
      expect(jwtUserInfoSpy).toBeCalledTimes(1);
    });
  });

  describe('getTokens', () => {
    const testUserInfo = {
      id: testUser.id,
      role: testUser.role,
      tenantId: testUser.tenantId,
      refreshTokenId: testUser.refreshTokenId,
    };

    it('should return valid access and refresh tokens in JSON Web Token format', async () => {
      const testIpAddress = '127.0.0.1';
      const updateRefreshTokenIdSpy = jest.spyOn(userService, 'updateRefreshTokenId').mockResolvedValue({});

      const res = await authService.getTokens(testUserInfo, testIpAddress);

      expect(res).toBeTruthy();
      expect(res).toHaveProperty('access_token');
      expect(res).toHaveProperty('refresh_token');
      expect(updateRefreshTokenIdSpy).toBeCalledTimes(1);

      const decodedAccessToken = jwtDecode(res.access_token) as IJwtTokenPayload;
      expect(decodedAccessToken).toHaveProperty('sub');
      expect(decodedAccessToken.sub).toBe(testUserInfo.id);
      expect(decodedAccessToken).toHaveProperty('tenantId');
      expect(decodedAccessToken.tenantId).toBe(testUserInfo.tenantId);
      expect(decodedAccessToken).toHaveProperty('role');
      expect(decodedAccessToken.role).toBe(testUserInfo.role);
      expect(decodedAccessToken).toHaveProperty('iat');
      expect(decodedAccessToken).toHaveProperty('exp');

      const decodedRefreshToken = jwtDecode(res.refresh_token) as IJwtTokenPayload;
      expect(decodedRefreshToken).toHaveProperty('sub');
      expect(decodedRefreshToken.sub).toBe(testUserInfo.id);
      expect(decodedRefreshToken).toHaveProperty('tenantId');
      expect(decodedRefreshToken.tenantId).toBe(testUserInfo.tenantId);
      expect(decodedRefreshToken).toHaveProperty('role');
      expect(decodedRefreshToken.role).toBe(testUserInfo.role);
      expect(decodedRefreshToken).toHaveProperty('ip');
      expect(decodedRefreshToken.ip).toBe(testIpAddress);
      expect(decodedRefreshToken).toHaveProperty('iat');
      expect(decodedRefreshToken).toHaveProperty('exp');
      expect(decodedRefreshToken).toHaveProperty('jti');
    });

    it('should thrown an ServiceUnavailableException of the refresh token ID could not be updated in the database', async () => {
      const updateRefreshTokenIdSpy = jest.spyOn(userService, 'updateRefreshTokenId').mockResolvedValue(null);

      const getTokenPromise = authService.getTokens(testUserInfo, '127.0.0.1');

      await expect(getTokenPromise).rejects.toThrow(ServiceUnavailableException);
      expect(updateRefreshTokenIdSpy).toBeCalledTimes(1);
    });
  });
});
