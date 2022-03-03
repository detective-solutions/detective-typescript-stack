import { AuthEnvironment, AuthModule, AuthService, LocalStrategy } from '@detective.solutions/backend/auth';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { IJwtTokenPayload, UserRole } from '@detective.solutions/shared/data-access';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtUserInfo, UserService } from '@detective.solutions/backend/users';

import { AppController } from './app.controller';
import { Test } from '@nestjs/testing';
import { defaultEnvConfig } from './default-env.config';
import jwtDecode from 'jwt-decode';
import { v4 as uuidv4 } from 'uuid';

let app: NestFastifyApplication;
let configService: ConfigService;
let jwtService: JwtService;

beforeAll(async () => {
  process.env.NODE_ENV = 'production';

  const moduleRef = await Test.createTestingModule({
    imports: [
      AuthModule,
      ConfigModule.forRoot({ isGlobal: true, validationSchema: defaultEnvConfig }),
      JwtModule.register({}),
    ],
    providers: [AuthService],
    controllers: [AppController],
  }).compile();

  app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  configService = moduleRef.get<ConfigService>(ConfigService);
  jwtService = moduleRef.get<JwtService>(JwtService);

  // Disable loggers for test run
  moduleRef.get<LocalStrategy>(LocalStrategy).logger.localInstance.setLogLevels([]);
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('AppController', () => {
  describe('/POST login', () => {
    it('should return a valid access and refresh token', () => {
      const testJwtUserInfo = {
        id: '1x0',
        tenantId: '2x0',
        role: UserRole.BASIC,
      } as JwtUserInfo;

      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });

      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      return app
        .inject({
          method: 'POST',
          payload: { email: 'test@test.com', password: 'testPassword' },
          url: '/auth/login',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(201);
          expect(result.body).toBeTruthy();

          const body = JSON.parse(result.body);
          expect(body).toHaveProperty('access_token');
          expect(body).toHaveProperty('refresh_token');

          const decodedAccessToken = jwtDecode(body.access_token) as IJwtTokenPayload;

          expect(decodedAccessToken).toHaveProperty('sub');
          expect(decodedAccessToken.sub).toBe(testJwtUserInfo.id);

          expect(decodedAccessToken).toHaveProperty('tenantId');
          expect(decodedAccessToken.tenantId).toBe(testJwtUserInfo.tenantId);

          expect(decodedAccessToken).toHaveProperty('exp');
          expect(decodedAccessToken.exp).toBeTruthy();

          expect(decodedAccessToken).toHaveProperty('iat');
          expect(decodedAccessToken.iat).toBeTruthy();

          expect(decodedAccessToken).toHaveProperty('role');
          expect(decodedAccessToken.role).toBe(UserRole.BASIC);

          expect(decodedAccessToken).not.toHaveProperty('jti');

          expect(decodedAccessToken).toHaveProperty('ip');
          expect(decodedAccessToken.iat).toBeTruthy();

          const decodedRefreshToken = jwtDecode(body.refresh_token) as IJwtTokenPayload;

          expect(decodedRefreshToken).toHaveProperty('sub');
          expect(decodedRefreshToken.sub).toBe(testJwtUserInfo.id);

          expect(decodedRefreshToken).toHaveProperty('tenantId');
          expect(decodedRefreshToken.tenantId).toBe(testJwtUserInfo.tenantId);

          expect(decodedRefreshToken).toHaveProperty('exp');
          expect(decodedRefreshToken.exp).toBeTruthy();

          expect(decodedRefreshToken).toHaveProperty('iat');
          expect(decodedRefreshToken.iat).toBeTruthy();

          expect(decodedRefreshToken).toHaveProperty('role');
          expect(decodedRefreshToken.role).toBe(UserRole.BASIC);

          expect(decodedRefreshToken).toHaveProperty('jti');

          expect(decodedRefreshToken).toHaveProperty('ip');
          expect(decodedRefreshToken.iat).toBeTruthy();
        });
    });

    it('should return Unauthorized (401) if the given email address is not available in the database', async () => {
      jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValueOnce({ jwtUserInfo: [] });

      return app
        .inject({
          method: 'POST',
          payload: { email: 'test@test.com', password: 'testPassword' },
          url: '/auth/login',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });

    it('should return Bad Request (400) if the given email address is invalid', async () => {
      return app
        .inject({
          method: 'POST',
          payload: { email: 'test.com', password: 'testPassword' },
          url: '/auth/login',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(400);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 400, message: 'Bad Request' });
        });
    });

    it('should return Unauthorized (401) if the given password does not match the password saved in the database', async () => {
      const testJwtUserInfo = {
        id: '1x0',
        tenantId: '2x0',
        role: UserRole.BASIC,
      } as JwtUserInfo;

      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: false }],
        });

      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      return app
        .inject({
          method: 'POST',
          payload: { email: 'test@test.com', password: 'testPassword' },
          url: '/auth/login',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });
  });

  describe('/POST logout', () => {
    const testJwtUserInfo = {
      id: '1x0',
      tenantId: '2x0',
      role: UserRole.BASIC,
      refreshTokenId: uuidv4(),
    } as JwtUserInfo;

    it('should return true if the logout process was successful', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      const accessToken = JSON.parse(loginResponse.body).access_token;

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${accessToken}` },
          url: '/auth/logout',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(201);
          expect(result.body).toBeTruthy();
          const body = JSON.parse(result.body);
          expect(body).toBe(true);
        });
    });

    it('should return false if the logout process was not successful', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValueOnce({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      const accessToken = JSON.parse(loginResponse.body).access_token;

      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${accessToken}` },
          url: '/auth/logout',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(201);
          expect(result.body).toBeTruthy();
          const body = JSON.parse(result.body);
          expect(body).toBe(false);
        });
    });

    it('should return Unauthorized (401) if the given access token has expired', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      // Decode the access token, update the expiry date and sign a modified version
      const accessToken = JSON.parse(loginResponse.body).access_token;
      const decodedAccessToken = jwtDecode(accessToken) as IJwtTokenPayload;
      decodedAccessToken.exp = 123;
      const modifiedAccessToken = await jwtService.signAsync(decodedAccessToken, {
        secret: configService.get<string>(AuthEnvironment.ACCESS_TOKEN_SECRET),
      });

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${modifiedAccessToken}` }, // use modified access token here
          url: '/auth/logout',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });

    it('should return Unauthorized (401) if the given access token is malformed', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      // Create a malformed token by appending a random string
      const accessToken = JSON.parse(loginResponse.body).access_token;
      const malformedAccessToken = accessToken + '13fq2';

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${malformedAccessToken}` }, // use malformed access token here
          url: '/auth/logout',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });

    it('should return Unauthorized (401) if the given access token has been modified', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      // Decode the access token and sign a modified version with a different secret
      const accessToken = JSON.parse(loginResponse.body).access_token;
      const decodedAccessToken = jwtDecode(accessToken) as IJwtTokenPayload;
      const modifiedAccessToken = await jwtService.signAsync(decodedAccessToken, {
        secret: 'attackerSecret',
      });

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${modifiedAccessToken}` }, // use modified access token here
          url: '/auth/logout',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });
  });

  describe('/POST refresh', () => {
    const testJwtUserInfo = {
      id: '1x0',
      tenantId: '2x0',
      role: UserRole.BASIC,
    } as JwtUserInfo;

    it('should return a valid access and refresh tokens', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      const refreshToken = JSON.parse(loginResponse.body).refresh_token;
      const decodedRefreshToken = jwtDecode(refreshToken) as IJwtTokenPayload;

      // Clone testJwtUserInfo and add refresh token id to mocked JwtUserInfo response
      const clonedTestJwtUserInfo = Object.assign({}, testJwtUserInfo);
      clonedTestJwtUserInfo.refreshTokenId = decodedRefreshToken.jti;
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [clonedTestJwtUserInfo] });

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${refreshToken}` },
          url: '/auth/refresh',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(201);
          expect(result.body).toBeTruthy();

          const body = JSON.parse(result.body);
          expect(body).toHaveProperty('access_token');
          expect(body).toHaveProperty('refresh_token');

          const decodedAccessToken = jwtDecode(body.access_token) as IJwtTokenPayload;

          expect(decodedAccessToken).toHaveProperty('sub');
          expect(decodedAccessToken.sub).toBe(testJwtUserInfo.id);

          expect(decodedAccessToken).toHaveProperty('tenantId');
          expect(decodedAccessToken.tenantId).toBe(testJwtUserInfo.tenantId);

          expect(decodedAccessToken).toHaveProperty('exp');
          expect(decodedAccessToken.exp).toBeTruthy();

          expect(decodedAccessToken).toHaveProperty('iat');
          expect(decodedAccessToken.iat).toBeTruthy();

          expect(decodedAccessToken).toHaveProperty('role');
          expect(decodedAccessToken.role).toBe(UserRole.BASIC);

          expect(decodedAccessToken).not.toHaveProperty('jti');

          expect(decodedAccessToken).toHaveProperty('ip');
          expect(decodedAccessToken.iat).toBeTruthy();

          const decodedRefreshToken = jwtDecode(body.refresh_token) as IJwtTokenPayload;

          expect(decodedRefreshToken).toHaveProperty('sub');
          expect(decodedRefreshToken.sub).toBe(testJwtUserInfo.id);

          expect(decodedRefreshToken).toHaveProperty('tenantId');
          expect(decodedRefreshToken.tenantId).toBe(testJwtUserInfo.tenantId);

          expect(decodedRefreshToken).toHaveProperty('exp');
          expect(decodedRefreshToken.exp).toBeTruthy();

          expect(decodedRefreshToken).toHaveProperty('iat');
          expect(decodedRefreshToken.iat).toBeTruthy();

          expect(decodedRefreshToken).toHaveProperty('role');
          expect(decodedRefreshToken.role).toBe(UserRole.BASIC);

          expect(decodedRefreshToken).toHaveProperty('jti');

          expect(decodedRefreshToken).toHaveProperty('ip');
          expect(decodedRefreshToken.iat).toBeTruthy();
        });
    });

    it('should return Unauthorized (401) if the token ip address property mismatches the requests ip address', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      const refreshToken = JSON.parse(loginResponse.body).refresh_token;
      const decodedRefreshToken = jwtDecode(refreshToken) as IJwtTokenPayload;
      decodedRefreshToken.ip = '1.2.3.4';
      const modifiedRefreshToken = await jwtService.signAsync(decodedRefreshToken, {
        secret: configService.get<string>(AuthEnvironment.REFRESH_TOKEN_SECRET),
      });

      // Clone testJwtUserInfo and add refresh token id to mocked JwtUserInfo response
      const clonedTestJwtUserInfo = Object.assign({}, testJwtUserInfo);
      clonedTestJwtUserInfo.refreshTokenId = decodedRefreshToken.jti;
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [clonedTestJwtUserInfo] });

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${modifiedRefreshToken}` },
          url: '/auth/refresh',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });

    it('should return Unauthorized (401) if the user has already been logged out', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      const refreshToken = JSON.parse(loginResponse.body).refresh_token;

      // Clone testJwtUserInfo and add refresh token id to mocked JwtUserInfo response
      const clonedTestJwtUserInfo = Object.assign({}, testJwtUserInfo);
      clonedTestJwtUserInfo.refreshTokenId = '';
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [clonedTestJwtUserInfo] });

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${refreshToken}` },
          url: '/auth/refresh',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });

    it('should return Unauthorized (401) if the given refresh token has expired', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test1@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      // Decode the refresh token, update the expiry date and sign a modified version
      const refreshToken = JSON.parse(loginResponse.body).refresh_token;
      const decodedRefreshToken = jwtDecode(refreshToken) as IJwtTokenPayload;
      decodedRefreshToken.exp = 123;
      const modifiedRefreshToken = await jwtService.signAsync(decodedRefreshToken, {
        secret: configService.get<string>(AuthEnvironment.REFRESH_TOKEN_SECRET),
      });

      // Clone testJwtUserInfo and add refresh token id to mocked JwtUserInfo response
      const clonedTestJwtUserInfo = Object.assign({}, testJwtUserInfo);
      clonedTestJwtUserInfo.refreshTokenId = decodedRefreshToken.jti;
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [clonedTestJwtUserInfo] });

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${modifiedRefreshToken}` }, // use modified refresh token here
          url: '/auth/refresh',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });

    it('should return Unauthorized (401) if the given refresh token is malformed', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      // Create a malformed token by appending a random string
      const refreshToken = JSON.parse(loginResponse.body).refresh_token;
      const malformedRefreshToken = refreshToken + '32fq';

      // Clone testJwtUserInfo and add refresh token id to mocked JwtUserInfo response
      const clonedTestJwtUserInfo = Object.assign({}, testJwtUserInfo);
      const decodedRefreshToken = jwtDecode(refreshToken) as IJwtTokenPayload;
      clonedTestJwtUserInfo.refreshTokenId = decodedRefreshToken.jti;
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [clonedTestJwtUserInfo] });

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${malformedRefreshToken}` }, // use malformed refresh token here
          url: '/auth/refresh',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });

    it('should return Unauthorized (401) if the given refresh token has been modified', async () => {
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [testJwtUserInfo] })
        .mockResolvedValueOnce({
          passwordCheck: [{ isValid: true }],
        });
      jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const loginResponse = await app.inject({
        method: 'POST',
        payload: { email: 'test@test.com', password: 'testPassword' },
        url: '/auth/login',
      });

      // Decode the refresh token and sign a modified version with a different secret
      const refreshToken = JSON.parse(loginResponse.body).refresh_token;
      const decodedRefreshToken = jwtDecode(refreshToken) as IJwtTokenPayload;
      const modifiedRefreshToken = await jwtService.signAsync(decodedRefreshToken, {
        secret: 'attackerSecret',
      });

      // Clone testJwtUserInfo and add refresh token id to mocked JwtUserInfo response
      const clonedTestJwtUserInfo = Object.assign({}, testJwtUserInfo);
      clonedTestJwtUserInfo.refreshTokenId = decodedRefreshToken.jti;
      jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValueOnce({ jwtUserInfo: [clonedTestJwtUserInfo] });

      return app
        .inject({
          method: 'POST',
          headers: { authorization: `Bearer ${modifiedRefreshToken}` }, // use modified refresh token here
          url: '/auth/refresh',
        })
        .then((result) => {
          expect(result.statusCode).toEqual(401);
          expect(JSON.parse(result.body)).toEqual({ statusCode: 401, message: 'Unauthorized' });
        });
    });
  });
});

afterAll(async () => {
  await app.close();
});
