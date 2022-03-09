import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtUserInfo } from './dto/user.dto';
import { Test } from '@nestjs/testing';
import { UserRole } from '@detective.solutions/shared/data-access';
import { UserService } from './user.service';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */
describe('UserService', () => {
  const testUserCredentials = { id: '1x0', email: 'test@test.com', password: 'testPassword', refreshTokenId: uuidv4() };

  let userService: UserService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DGraphGrpcClientModule.register({ stubs: [{ address: 'test' }], debug: true })],
      providers: [UserService],
    }).compile();

    userService = module.get<UserService>(UserService);

    // Disable logger for test runs
    userService.logger.localInstance.setLogLevels([]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(userService).toBeTruthy();
  });

  describe('checkPassword', () => {
    const passwordCheckQuery = `
      query passwordCheck($email: string, $password: string) {
        passwordCheck(func: eq(User.email, $email)) @normalize {
          isValid: checkpwd(User.password, $password)
        }
      }
    `;

    it('should return true if the database password check returns true', async () => {
      const createQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue({
        passwordCheck: [{ isValid: true }],
      });

      const res = await userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      expect(res).toBe(true);
      expect(createQuerySpy).toBeCalledTimes(1);
      expect(createQuerySpy).toBeCalledWith(passwordCheckQuery, {
        $email: testUserCredentials.email,
        $password: testUserCredentials.password,
      });
    });

    it('should return null if the database password check returns an empty response', async () => {
      const createQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      expect(res).toBe(null);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the database response misses the "passwordCheck" property', async () => {
      const createQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue({
        isValid: true,
      });

      const checkPasswordPromise = userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      await expect(checkPasswordPromise).rejects.toThrow(InternalServerErrorException);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one user is returned from the database password check.', async () => {
      const createQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue({
        passwordCheck: [{ isValid: true }, { isValid: true }],
      });

      const checkPasswordPromise = userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      await expect(checkPasswordPromise).rejects.toThrow(InternalServerErrorException);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the incoming password check object misses the "isValid" property', async () => {
      const createQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue({
        passwordCheck: [{ isCorrect: true }],
      });

      const checkPasswordPromise = userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      await expect(checkPasswordPromise).rejects.toThrow(InternalServerErrorException);
      expect(createQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('getJwtUserInfoByEmail', () => {
    const testJwtUserInfo = {
      id: '1x0',
      tenantId: '2x0',
      role: UserRole.BASIC,
      refreshTokenId: uuidv4(),
    } as JwtUserInfo;

    const userInfoByEmailQuery = `
      query jwtUserInfo($email: string) {
        jwtUserInfo(func: eq(User.email, $email)) @normalize {
          id: uid
          User.tenants
            {
              tenantId: uid
            }
          role: User.role
        }
      }
    `;

    it('should return JwtUserInfo object with all mandatory properties', async () => {
      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ jwtUserInfo: [testJwtUserInfo] });

      const res = await userService.getJwtUserInfoByEmail(testUserCredentials.email);

      expect(res).toBe(testJwtUserInfo);
      expect(createQuerySpy).toBeCalledTimes(1);
      expect(createQuerySpy).toBeCalledWith(userInfoByEmailQuery, {
        $email: testUserCredentials.email,
      });
    });

    it('should return null if the database query returns an empty response', async () => {
      const createQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await userService.getJwtUserInfoByEmail(testUserCredentials.email);

      expect(res).toBe(null);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the database response misses the "jwtUserInfo" property', async () => {
      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ testJwtUserInfo });

      const getJwtUserInfoPromise = userService.getJwtUserInfoByEmail(testUserCredentials.email);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one user is returned for the given email address', async () => {
      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ jwtUserInfo: [testJwtUserInfo, testJwtUserInfo] });

      const getJwtUserInfoPromise = userService.getJwtUserInfoByEmail(testUserCredentials.email);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should return null if no user is returned for the given email address', async () => {
      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ jwtUserInfo: [] });

      const res = await userService.getJwtUserInfoByEmail(testUserCredentials.email);

      expect(res).toBe(null);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the validation for the incoming JwtUserInfo object fails', async () => {
      const modifiedJwtUserInfo = testJwtUserInfo;
      modifiedJwtUserInfo.id = ''; // id should not be empty
      modifiedJwtUserInfo.tenantId = ''; // tenantId should not be empty

      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ jwtUserInfo: [modifiedJwtUserInfo] });

      const getJwtUserInfoPromise = userService.getJwtUserInfoByEmail(testUserCredentials.email);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(createQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('getJwtUserInfoById', () => {
    const testJwtUserInfo = {
      id: '1x0',
      tenantId: '2x0',
      role: UserRole.BASIC,
      refreshTokenId: uuidv4(),
    } as JwtUserInfo;

    const userInfoByIdQuery = `
      query jwtUserInfo($id: string) {
        jwtUserInfo(func: uid($id)) @normalize {
          id: uid
          User.tenants
            {
              tenantId: uid
            }
          role: User.role
          refreshTokenId: User.refreshTokenId
        }
      }
    `;

    it('should return JwtUserInfo object with all mandatory properties', async () => {
      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ jwtUserInfo: [testJwtUserInfo] });

      const res = await userService.getJwtUserInfoById(testUserCredentials.id);

      expect(res).toBe(testJwtUserInfo);
      expect(createQuerySpy).toBeCalledTimes(1);
      expect(createQuerySpy).toBeCalledWith(userInfoByIdQuery, {
        $id: testUserCredentials.id,
      });
    });

    it('should return null if the database query returns an empty response', async () => {
      const createQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await userService.getJwtUserInfoById(testUserCredentials.id);

      expect(res).toBe(null);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the database response misses the "jwtUserInfo" property', async () => {
      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ testJwtUserInfo });

      const getJwtUserInfoPromise = userService.getJwtUserInfoById(testUserCredentials.id);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one user is returned for the given id', async () => {
      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ jwtUserInfo: [testJwtUserInfo, testJwtUserInfo] });

      const getJwtUserInfoPromise = userService.getJwtUserInfoById(testUserCredentials.id);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should return null if no user is returned for the given id', async () => {
      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ jwtUserInfo: [] });

      const res = await userService.getJwtUserInfoById(testUserCredentials.id);

      expect(res).toBe(null);
      expect(createQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the validation for the incoming JwtUserInfo object fails', async () => {
      const modifiedJwtUserInfo = testJwtUserInfo;
      modifiedJwtUserInfo.id = ''; // id should not be empty
      modifiedJwtUserInfo.refreshTokenId = '123'; // refreshTokenId should be an UUID

      const createQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ jwtUserInfo: [modifiedJwtUserInfo] });

      const getJwtUserInfoPromise = userService.getJwtUserInfoById(testUserCredentials.id);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(createQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('removeRefreshTokenId', () => {
    it('should invoke a database mutation with the correct mutation object', async () => {
      const mutationJson = {
        uid: testUserCredentials.id,
        'User.refreshTokenId': '',
      };
      const createMutationSpy = jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      await userService.removeRefreshTokenId(testUserCredentials.id);

      expect(createMutationSpy).toBeCalledTimes(1);
      expect(createMutationSpy).toBeCalledWith(mutationJson);
    });

    it('should return null if an error occurred while removing the refresh token id from the database', async () => {
      const createMutationSpy = jest.spyOn(UserService.prototype as any, 'sendMutation').mockRejectedValue(null);

      const res = await userService.removeRefreshTokenId(testUserCredentials.id);

      expect(res).toBe(null);
      expect(createMutationSpy).toBeCalledTimes(1);
    });
  });

  describe('updateRefreshTokenId', () => {
    it('should return a valid object reference if the database mutation was successful ', async () => {
      const mutationJson = {
        uid: testUserCredentials.id,
        'User.refreshTokenId': testUserCredentials.refreshTokenId,
      };
      const createMutationSpy = jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const res = await userService.updateRefreshTokenId(testUserCredentials.id, testUserCredentials.refreshTokenId);

      expect(res).toBeTruthy();
      expect(createMutationSpy).toBeCalledTimes(1);
      expect(createMutationSpy).toBeCalledWith(mutationJson);
    });

    it('should return null if an error occurred while updating the refresh token id in the database', async () => {
      const createMutationSpy = jest.spyOn(UserService.prototype as any, 'sendMutation').mockRejectedValue(null);

      const res = await userService.updateRefreshTokenId(testUserCredentials.id, testUserCredentials.refreshTokenId);

      expect(res).toBe(null);
      expect(createMutationSpy).toBeCalledTimes(1);
    });
  });
});
