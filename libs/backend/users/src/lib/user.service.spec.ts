import {
  getJwtUserInfoByEmailQuery,
  getJwtUserInfoByEmailQueryName,
  getJwtUserInfoByIdQuery,
  getJwtUserInfoByIdQueryName,
  getUserUidQuery,
  getUserUidQueryName,
  passwordCheckQuery,
  passwordCheckQueryName,
  passwordCheckResponseProperty,
} from './queries';

import { DGraphGrpcClientModule } from '@detective.solutions/backend/dgraph-grpc-client';
import { InternalServerErrorException } from '@nestjs/common';
import { JwtUserInfo } from './models';
import { Test } from '@nestjs/testing';
import { UserRole } from '@detective.solutions/shared/data-access';
import { UserService } from './user.service';
import { v4 as uuidv4 } from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

describe('UserService', () => {
  const testUserCredentials = {
    id: uuidv4(),
    email: 'test@test.com',
    password: 'testPassword',
    refreshTokenId: uuidv4(),
  };

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
    it('should return true if the database password check returns true', async () => {
      const sendQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue({
        passwordCheck: [{ [passwordCheckResponseProperty]: true }],
      });

      const res = await userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      expect(res).toBe(true);
      expect(sendQuerySpy).toBeCalledTimes(1);
      expect(sendQuerySpy).toBeCalledWith(passwordCheckQuery, {
        $email: testUserCredentials.email,
        $password: testUserCredentials.password,
      });
    });

    it('should return null if the database password check returns an empty response', async () => {
      const sendQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it(`should throw an InternalServerErrorException if the database response misses the ${passwordCheckQueryName} property`, async () => {
      const sendQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue({
        [passwordCheckResponseProperty]: true,
      });

      const checkPasswordPromise = userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      await expect(checkPasswordPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one user is returned from the database password check.', async () => {
      const sendQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue({
        passwordCheck: [{ [passwordCheckResponseProperty]: true }, { [passwordCheckResponseProperty]: true }],
      });

      const checkPasswordPromise = userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      await expect(checkPasswordPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it(`should throw an InternalServerErrorException if the incoming password check object misses the ${passwordCheckResponseProperty} property`, async () => {
      const sendQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue({
        passwordCheck: [{ isCorrect: true }],
      });

      const checkPasswordPromise = userService.checkPassword(testUserCredentials.email, testUserCredentials.password);

      await expect(checkPasswordPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('getJwtUserInfoByEmail', () => {
    const testResponse: JwtUserInfo = {
      id: uuidv4(),
      tenantId: uuidv4(),
      role: UserRole.BASIC,
      refreshTokenId: uuidv4(),
    };

    it('should return JwtUserInfo object with all mandatory properties', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getJwtUserInfoByEmailQueryName]: [testResponse] });

      const res = await userService.getJwtUserInfoByEmail(testUserCredentials.email);

      expect(res).toBe(testResponse);
      expect(sendQuerySpy).toBeCalledTimes(1);
      expect(sendQuerySpy).toBeCalledWith(getJwtUserInfoByEmailQuery, {
        $email: testUserCredentials.email,
      });
    });

    it('should return null if the database query returns an empty response', async () => {
      const sendQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await userService.getJwtUserInfoByEmail(testUserCredentials.email);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it(`should throw an InternalServerErrorException if the database response misses the ${getJwtUserInfoByEmailQueryName} property`, async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ testJwtUserInfo: testResponse });

      const getJwtUserInfoPromise = userService.getJwtUserInfoByEmail(testUserCredentials.email);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one user is returned for the given email address', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getJwtUserInfoByEmailQueryName]: [testResponse, testResponse] });

      const getJwtUserInfoPromise = userService.getJwtUserInfoByEmail(testUserCredentials.email);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should return null if no user is returned for the given email address', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getJwtUserInfoByEmailQueryName]: [] });

      const res = await userService.getJwtUserInfoByEmail(testUserCredentials.email);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the validation for the incoming JwtUserInfo object fails', async () => {
      const modifiedJwtUserInfo = testResponse;
      modifiedJwtUserInfo.id = ''; // id should not be empty
      modifiedJwtUserInfo.tenantId = ''; // tenantId should not be empty

      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getJwtUserInfoByEmailQueryName]: [modifiedJwtUserInfo] });

      const getJwtUserInfoPromise = userService.getJwtUserInfoByEmail(testUserCredentials.email);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('getJwtUserInfoById', () => {
    const testResponse: JwtUserInfo = {
      id: uuidv4(),
      tenantId: uuidv4(),
      role: UserRole.BASIC,
      refreshTokenId: uuidv4(),
    };

    it('should return JwtUserInfo object with all mandatory properties', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getJwtUserInfoByIdQueryName]: [testResponse] });

      const res = await userService.getJwtUserInfoById(testUserCredentials.id);

      expect(res).toBe(testResponse);
      expect(sendQuerySpy).toBeCalledTimes(1);
      expect(sendQuerySpy).toBeCalledWith(getJwtUserInfoByIdQuery, {
        $id: testUserCredentials.id,
      });
    });

    it('should return null if the database query returns an empty response', async () => {
      const sendQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await userService.getJwtUserInfoById(testUserCredentials.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it(`should throw an InternalServerErrorException if the database response misses the ${getJwtUserInfoByIdQueryName} property`, async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ testJwtUserInfo: testResponse });

      const getJwtUserInfoPromise = userService.getJwtUserInfoById(testUserCredentials.id);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one user is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getJwtUserInfoByIdQueryName]: [testResponse, testResponse] });

      const getJwtUserInfoPromise = userService.getJwtUserInfoById(testUserCredentials.id);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should return null if no user is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getJwtUserInfoByIdQueryName]: [] });

      const res = await userService.getJwtUserInfoById(testUserCredentials.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the validation for the incoming JwtUserInfo object fails', async () => {
      const modifiedJwtUserInfo = testResponse;
      modifiedJwtUserInfo.id = ''; // id should not be empty
      modifiedJwtUserInfo.refreshTokenId = '123'; // refreshTokenId should be an UUID

      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getJwtUserInfoByIdQueryName]: [modifiedJwtUserInfo] });

      const getJwtUserInfoPromise = userService.getJwtUserInfoById(testUserCredentials.id);

      await expect(getJwtUserInfoPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });
  });

  describe('removeRefreshTokenId', () => {
    it('should invoke a database mutation with the correct mutation object', async () => {
      const userUid = '123';
      jest.spyOn(userService, 'getUserUid').mockResolvedValue(userUid);

      const mutationJson = {
        uid: userUid,
        'User.refreshTokenId': '',
      };
      const sendMutationSpy = jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      await userService.removeRefreshTokenId(testUserCredentials.id);

      expect(sendMutationSpy).toBeCalledTimes(1);
      expect(sendMutationSpy).toBeCalledWith(mutationJson);
    });

    it('should return null if an error occurred while removing the refresh token id from the database', async () => {
      jest.spyOn(userService, 'getUserUid').mockResolvedValue('');

      const sendMutationSpy = jest.spyOn(UserService.prototype as any, 'sendMutation').mockRejectedValue(null);

      const res = await userService.removeRefreshTokenId(testUserCredentials.id);

      expect(res).toBe(null);
      expect(sendMutationSpy).toBeCalledTimes(1);
    });
  });

  describe('updateRefreshTokenId', () => {
    it('should return a valid object reference if the database mutation was successful ', async () => {
      const userUid = '123';
      jest.spyOn(userService, 'getUserUid').mockResolvedValue(userUid);

      const mutationJson = {
        uid: userUid,
        'User.refreshTokenId': testUserCredentials.refreshTokenId,
      };
      const sendMutationSpy = jest.spyOn(UserService.prototype as any, 'sendMutation').mockResolvedValue({});

      const res = await userService.updateRefreshTokenId(testUserCredentials.id, testUserCredentials.refreshTokenId);

      expect(res).toBeTruthy();
      expect(sendMutationSpy).toBeCalledTimes(1);
      expect(sendMutationSpy).toBeCalledWith(mutationJson);
    });

    it('should return null if an error occurred while updating the refresh token id in the database', async () => {
      jest.spyOn(userService, 'getUserUid').mockResolvedValue('');
      const sendMutationSpy = jest.spyOn(UserService.prototype as any, 'sendMutation').mockRejectedValue(null);

      const res = await userService.updateRefreshTokenId(testUserCredentials.id, testUserCredentials.refreshTokenId);

      expect(res).toBe(null);
      expect(sendMutationSpy).toBeCalledTimes(1);
    });
  });

  describe('getUserUid', () => {
    const testResponse = {
      uid: '123',
    };

    it('should return a valid user uid', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getUserUidQueryName]: [testResponse] });

      const res = await userService.getUserUid(testUserCredentials.id);

      expect(res).toBe(testResponse.uid);
      expect(sendQuerySpy).toBeCalledTimes(1);
      expect(sendQuerySpy).toBeCalledWith(getUserUidQuery, {
        $id: testUserCredentials.id,
      });
    });

    it('should return null if the database query returns an empty response', async () => {
      const sendQuerySpy = jest.spyOn(UserService.prototype as any, 'sendQuery').mockResolvedValue(undefined);

      const res = await userService.getUserUid(testUserCredentials.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it(`should throw an InternalServerErrorException if the database response misses the ${getUserUidQueryName} property`, async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ testUserUid: testResponse });

      const getUserUidPromise = userService.getUserUid(testUserCredentials.id);

      await expect(getUserUidPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if more than one user uid is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getUserUidQueryName]: [testResponse, testResponse] });

      const getUserUidPromise = userService.getUserUid(testUserCredentials.id);

      await expect(getUserUidPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should return null if no user uid is returned for the given id', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getUserUidQueryName]: [] });

      const res = await userService.getUserUid(testUserCredentials.id);

      expect(res).toBe(null);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });

    it('should throw an InternalServerErrorException if the returned object is missing a uid key', async () => {
      const sendQuerySpy = jest
        .spyOn(UserService.prototype as any, 'sendQuery')
        .mockResolvedValue({ [getUserUidQueryName]: [{}] });

      const getUserUidPromise = userService.getUserUid(testUserCredentials.id);

      await expect(getUserUidPromise).rejects.toThrow(InternalServerErrorException);
      expect(sendQuerySpy).toBeCalledTimes(1);
    });
  });
});
