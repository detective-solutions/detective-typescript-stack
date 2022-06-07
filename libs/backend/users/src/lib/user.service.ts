import { Injectable, InternalServerErrorException, Logger, ServiceUnavailableException } from '@nestjs/common';

import { DGraphGrpcClientService } from '@detective.solutions/backend/dgraph-grpc-client';
import { JwtUserInfo } from './dto/user.dto';
import { TxnOptions } from 'dgraph-js';
import { validateDto } from '@detective.solutions/backend/shared/utils';

/* eslint-disable @typescript-eslint/no-explicit-any */

@Injectable()
export class UserService {
  private static readonly readTxnOptions: TxnOptions = { readOnly: true, bestEffort: true };
  readonly logger = new Logger(UserService.name);

  constructor(private readonly dGraphClient: DGraphGrpcClientService) {}

  async checkPassword(email: string, password: string): Promise<boolean | null> {
    interface PasswordCheckApiResponse {
      passwordCheck: { isValid: boolean }[];
    }

    const query = `
      query passwordCheck($email: string, $password: string) {
        passwordCheck(func: eq(User.email, $email)) @normalize {
          isValid: checkpwd(User.password, $password)
        }
      }
    `;

    this.logger.log('Requesting credential check from the database');

    const queryVariables = { $email: email, $password: password };
    const response = (await this.sendQuery(query, queryVariables)) as PasswordCheckApiResponse;
    if (!response) {
      return null;
    }

    if (!response.passwordCheck) {
      this.logger.error('Incoming password check object is missing "passwordCheck" property');
      throw new InternalServerErrorException();
    }

    if (response.passwordCheck.length > 1) {
      this.logger.error(`Found more than one user with email address ${email} during password check. Aborting ...`);
      throw new InternalServerErrorException();
    }

    const passwordCheck = response.passwordCheck[0];

    if (!('isValid' in passwordCheck)) {
      this.logger.error('Incoming password check object is missing "isValid" property');
      throw new InternalServerErrorException();
    }

    return passwordCheck.isValid;
  }

  async getJwtUserInfoByEmail(email: string): Promise<JwtUserInfo | null> {
    interface IApiResponse {
      jwtUserInfo: JwtUserInfo[];
    }

    // Make sure the query matches JWTUserInfo properties
    const query = `
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

    this.logger.log('Requesting user information for token creation');

    const queryVariables = { $email: email };
    const response = (await this.sendQuery(query, queryVariables)) as IApiResponse;
    if (!response) {
      return null;
    }

    if (!response.jwtUserInfo) {
      this.logger.error('Incoming database response object is missing "jwtUserInfo" property');
      throw new InternalServerErrorException();
    }

    if (response.jwtUserInfo.length > 1) {
      this.logger.error(`Found more than one user with email address ${email}. Aborting ...`);
      throw new InternalServerErrorException();
    }

    if (response.jwtUserInfo.length === 0) {
      this.logger.warn(`No user found for the given email address ${email}`);
      return null;
    }

    this.logger.log('Validating incoming user information');
    const jwtUserInfo = response.jwtUserInfo[0];
    await validateDto(JwtUserInfo, jwtUserInfo, this.logger);

    return jwtUserInfo;
  }

  async getJwtUserInfoById(id: string): Promise<JwtUserInfo | null> {
    interface IApiResponse {
      jwtUserInfo: JwtUserInfo[];
    }

    // Make sure the query matches JWTUserInfo properties
    const query = `
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

    this.logger.log('Requesting JwtUserInfo object from database');

    const queryVariables = { $id: id };
    const response = (await this.sendQuery(query, queryVariables)) as IApiResponse;
    if (!response) {
      return null;
    }

    if (!response.jwtUserInfo) {
      this.logger.error('Incoming database response object is missing "jwtUserInfo" property');
      throw new InternalServerErrorException();
    }

    if (response.jwtUserInfo.length > 1) {
      this.logger.error(`Found more than one user with id ${id}. Aborting ...`);
      throw new InternalServerErrorException();
    }

    if (response.jwtUserInfo.length === 0) {
      this.logger.warn(`No user found for the given id ${id}`);
      return null;
    }

    this.logger.log('Validating incoming JwtUserInfo object');
    const jwtUserInfo = response.jwtUserInfo[0];
    await validateDto(JwtUserInfo, jwtUserInfo, this.logger);

    return jwtUserInfo;
  }

  async removeRefreshTokenId(id: string): Promise<void | null> {
    const mutationJson = {
      uid: id,
      'User.refreshTokenId': '',
    };

    return this.sendMutation(mutationJson).catch(() => {
      this.logger.error(`There was a problem while trying to remove the refresh token id for user ${id}`);
      return null;
    });
  }

  async updateRefreshTokenId(id: string, refreshTokenId: string): Promise<Record<string, any> | null> {
    const mutationJson = {
      uid: id,
      'User.refreshTokenId': refreshTokenId,
    };

    return this.sendMutation(mutationJson).catch(() => {
      return null;
    });
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
