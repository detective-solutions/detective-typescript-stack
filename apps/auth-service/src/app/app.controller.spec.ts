import { AppController } from './app.controller';
import { AuthService } from '@detective.solutions/backend/auth';
import { Test } from '@nestjs/testing';
import { v4 as uuidv4 } from 'uuid';

const mockAuthService = {
  login: jest.fn(),
  logout: jest.fn(),
  refreshTokens: jest.fn(),
};

describe('AppController', () => {
  let appController: AppController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('login', () => {
    it('should invoke the authService login method with correct input parameters', async () => {
      const testServerResponse = { access_token: 'test1', refresh_token: 'test2' };
      const testRequest = { user: { id: uuidv4() }, meta: { test: '1' } };
      const testIpAddress = '127.0.0.1';

      const loginSpy = jest.spyOn(authService, 'login').mockResolvedValue(testServerResponse);

      expect(await appController.login(testRequest, testIpAddress)).toBe(testServerResponse);
      expect(loginSpy).toBeCalledTimes(1);
      expect(loginSpy).toBeCalledWith(testRequest.user, testIpAddress);
    });
  });

  describe('logout', () => {
    it('should invoke the authService logout method with correct input parameters', async () => {
      const testRequest = { user: { id: uuidv4() }, meta: { test: '1' } };
      const loginSpy = jest.spyOn(authService, 'logout');

      await appController.logout(testRequest);

      expect(loginSpy).toBeCalledTimes(1);
      expect(loginSpy).toBeCalledWith(testRequest.user);
    });
  });

  describe('refresh', () => {
    it('should invoke the authService refresh method with correct input parameters', async () => {
      const testServerResponse = { access_token: 'test1', refresh_token: 'test2' };
      const testRequest = { user: { id: uuidv4() }, meta: { test: '1' } };
      const testIpAddress = '127.0.0.1';

      const loginSpy = jest.spyOn(authService, 'refreshTokens').mockResolvedValue(testServerResponse);

      expect(await appController.refreshTokens(testRequest, testIpAddress)).toBe(testServerResponse);
      expect(loginSpy).toBeCalledTimes(1);
      expect(loginSpy).toBeCalledWith(testRequest.user, testIpAddress);
    });
  });
});
