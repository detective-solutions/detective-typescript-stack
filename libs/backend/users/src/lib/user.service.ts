import {
  IGetJwtUserInfoByEmail,
  IGetJwtUserInfoById,
  IGetUserUid,
  IPasswordCheck,
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
import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';

import { DGraphGrpcClientService } from '@detective.solutions/backend/dgraph-grpc-client';
import { JwtUserInfo } from './models';
import { TxnOptions } from 'dgraph-js';
import { validateDto } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class UserService {
  private static readonly readTxnOptions: TxnOptions = { readOnly: true, bestEffort: true };
  readonly logger = new Logger(UserService.name);

  constructor(private readonly dGraphClient: DGraphGrpcClientService) {}

  async checkPassword(email: string, password: string): Promise<boolean | null> {
    this.logger.log('Requesting credential check from the database');

    const queryVariables = { $email: email, $password: password };
    const response = (await this.sendQuery(passwordCheckQuery, queryVariables)) as IPasswordCheck;
    if (!response) {
      return null;
    }

    if (!response[passwordCheckQueryName]) {
      this.logger.error(`Incoming password check object is missing ${passwordCheckQueryName} property`);
      throw new InternalServerErrorException();
    }

    if (response[passwordCheckQueryName].length > 1) {
      this.logger.error(`Found more than one user with email address ${email} during password check`);
      throw new InternalServerErrorException();
    }

    const passwordCheck = response[passwordCheckQueryName][0];

    if (!(passwordCheckResponseProperty in passwordCheck)) {
      this.logger.error(`Incoming password check object is missing ${passwordCheckResponseProperty} property`);
      throw new InternalServerErrorException();
    }

    return passwordCheck[passwordCheckResponseProperty];
  }

  async getJwtUserInfoByEmail(email: string): Promise<JwtUserInfo | null> {
    this.logger.log('Requesting JwtUserInfo object from database');

    const queryVariables = { $email: email };
    const response = (await this.sendQuery(getJwtUserInfoByEmailQuery, queryVariables)) as IGetJwtUserInfoByEmail;
    if (!response) {
      return null;
    }

    if (!response[getJwtUserInfoByEmailQueryName]) {
      this.logger.error(`Incoming database response object is missing ${getJwtUserInfoByEmailQueryName} property`);
      throw new InternalServerErrorException();
    }

    if (response[getJwtUserInfoByEmailQueryName].length > 1) {
      this.logger.error(`Found more than one user with email address ${email}`);
      throw new InternalServerErrorException();
    }

    if (response[getJwtUserInfoByEmailQueryName].length === 0) {
      this.logger.warn(`No user found for the given email address ${email}`);
      return null;
    }

    this.logger.log('Validating incoming user information');
    const jwtUserInfo = response[getJwtUserInfoByEmailQueryName][0];
    await validateDto(JwtUserInfo, jwtUserInfo, this.logger);

    return jwtUserInfo;
  }

  async getJwtUserInfoById(id: string): Promise<JwtUserInfo | null> {
    this.logger.log('Requesting JwtUserInfo object from database');

    const queryVariables = { $id: id };
    const response = (await this.sendQuery(getJwtUserInfoByIdQuery, queryVariables)) as IGetJwtUserInfoById;
    if (!response) {
      return null;
    }

    if (!response[getJwtUserInfoByIdQueryName]) {
      this.logger.error(`Incoming database response object is missing ${getJwtUserInfoByIdQueryName} property`);
      throw new InternalServerErrorException();
    }

    if (response[getJwtUserInfoByIdQueryName].length > 1) {
      this.logger.error(`Found more than one user with id ${id}`);
      throw new InternalServerErrorException();
    }

    if (response[getJwtUserInfoByIdQueryName].length === 0) {
      this.logger.warn(`No user found for the given id ${id}`);
      return null;
    }

    this.logger.log('Validating incoming JwtUserInfo object');
    const jwtUserInfo = response[getJwtUserInfoByIdQueryName][0];
    await validateDto(JwtUserInfo, jwtUserInfo, this.logger);

    return jwtUserInfo;
  }

  async removeRefreshTokenId(id: string): Promise<void | null> {
    const mutationJson = {
      uid: await this.getUserUid(id),
      'User.refreshTokenId': '',
    };

    return this.sendMutation(mutationJson).catch(() => {
      this.logger.error(`There was a problem while trying to remove the refresh token id for user ${id}`);
      return null;
    });
  }

  async updateRefreshTokenId(id: string, refreshTokenId: string): Promise<Record<string, any> | null> {
    const mutationJson = {
      uid: await this.getUserUid(id),
      'User.refreshTokenId': refreshTokenId,
    };

    return this.sendMutation(mutationJson).catch(() => {
      return null;
    });
  }

  async getUserUid(id: string): Promise<string> {
    this.logger.log('Requesting user uid from database');

    const queryVariables = { $id: id };
    const queryResponse = (await this.sendQuery(getUserUidQuery, queryVariables)) as IGetUserUid;
    if (!queryResponse) {
      return null;
    }

    if (!queryResponse[getUserUidQueryName]) {
      this.logger.error(`Incoming database response object is missing ${getUserUidQueryName} property`);
      throw new InternalServerErrorException();
    }

    if (queryResponse[getUserUidQueryName].length > 1) {
      this.logger.error(`Found more than one user with id ${id} while fetching uid`);
      throw new InternalServerErrorException();
    }

    if (queryResponse[getUserUidQueryName].length === 0) {
      this.logger.error(`No user found for the given id ${id}`);
      return null;
    }

    const userUid = queryResponse[getUserUidQueryName][0]?.uid;
    if (!userUid) {
      this.logger.error(`${getJwtUserInfoByEmailQueryName} is missing "uid" property`);
      throw new InternalServerErrorException();
    }

    return userUid;
  }

  /* istanbul ignore next */ // Ignore for test coverage (library code that is already tested)
  private async sendQuery(query: string, queryVariables: object): Promise<Record<string, any>> {
    const txn = this.dGraphClient.client.newTxn(UserService.readTxnOptions);
    return (
      await txn.queryWithVars(query, queryVariables).catch((err) => {
        this.logger.error('There was an error while sending a query to the database', err);
        throw new ServiceUnavailableException();
      })
    ).getJson();
  }

  /* istanbul ignore next */ // Ignore for test coverage (library code that is already tested)
  private async sendMutation(mutationJson: object): Promise<Record<string, any>> {
    const mutation = this.dGraphClient.createMutation();
    mutation.setCommitNow(true);
    mutation.setSetJson(mutationJson);

    const txn = this.dGraphClient.client.newTxn();
    return txn.mutate(mutation).catch((err) => {
      this.logger.error('There was an error while sending a mutation to the database', err);
      throw new ServiceUnavailableException();
    });
  }
}
