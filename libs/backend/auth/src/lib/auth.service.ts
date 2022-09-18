import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { IAuthServerResponse, IJwtTokenInput, IJwtTokenPayload } from '@detective.solutions/shared/data-access';
import { JwtUserInfo, UserService } from '@detective.solutions/backend/users';

import { AuthModuleEnvironment } from './interfaces/auth-environment.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, inputPassword: string): Promise<JwtUserInfo> {
    const user = await this.userService.getJwtUserInfoByEmail(email);
    if (!user) {
      this.logger.warn('Provided email does not exist in the database. Returning Unauthorized (401)');
      throw new UnauthorizedException();
    }

    const passwordMatches = await this.userService.checkPassword(email, inputPassword);
    if (!passwordMatches) {
      this.logger.warn('Provided password does not match. Returning Unauthorized (401)');
      throw new UnauthorizedException();
    }

    return user;
  }

  async login(jwtUserInfo: JwtUserInfo, ipAddress: string): Promise<IAuthServerResponse> {
    this.logger.log(
      `Logging in user (${jwtUserInfo.id}) for tenant ${jwtUserInfo.tenantId} (IP address: ${ipAddress})`
    );

    if (!ipAddress) {
      this.logger.error('Incoming request is missing IP information for signing the access and refresh tokens');
      throw new BadRequestException();
    }

    return this.getTokens(jwtUserInfo, ipAddress);
  }

  async logout(payload: IJwtTokenPayload): Promise<void> {
    this.logger.log(
      `Logging out user ${payload.sub} with role ${payload.role} for tenant ${payload.tenantId} (Refresh token ID: ${payload.jti})`
    );

    this.userService.removeRefreshTokenId(payload.sub);
  }

  async refreshTokens(payload: IJwtTokenPayload, requestIpAddress: string): Promise<IAuthServerResponse> {
    this.logger.log(
      `Refreshing token for user (${payload.sub}) with role ${payload.role} for tenant ${payload.tenantId} (Refresh token ID: ${payload.jti})`
    );

    if (payload.ip !== requestIpAddress) {
      this.logger.warn(
        `Mismatch between JWT payload IP (${payload.ip}) and requesting IP (${requestIpAddress}). Returning Unauthorized (401)`
      );
      throw new UnauthorizedException();
    }

    this.logger.log(
      `Requesting IP address ${requestIpAddress} matches with IP address stored within the refresh token`
    );

    const jwtUserInfo = await this.userService.getJwtUserInfoById(payload.sub);

    // If refresh token ID is missing the user is already logged out
    if (!jwtUserInfo || !jwtUserInfo.refreshTokenId) {
      this.logger.warn(
        'JwtUserInfo is missing refresh token ID. User is already logged out. Returning Unauthorized (401)'
      );
      throw new UnauthorizedException();
    }

    const idsMatch = payload.jti === jwtUserInfo.refreshTokenId;
    if (!idsMatch) {
      this.logger.warn(
        'The incoming refresh token ID does not match the ID stored in the database. Returning Unauthorized (401)'
      );
      throw new UnauthorizedException();
    }

    return this.getTokens(jwtUserInfo, requestIpAddress);
  }

  async getTokens(jwtUserInfo: JwtUserInfo, ipAddress: string): Promise<IAuthServerResponse> {
    const jwtPayload: IJwtTokenInput = {
      sub: jwtUserInfo.id,
      tenantId: jwtUserInfo.tenantId,
      role: jwtUserInfo.role,
      ip: ipAddress,
    };

    const jwtId = uuidv4(); // Using UUID v4 as JWT Ids for for improved randomness

    this.logger.log('Generating authorization tokens');

    // Token secrets will be automatically cached after the first retrieval
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>(AuthModuleEnvironment.ACCESS_TOKEN_SECRET),
        expiresIn: this.config.get<string>(AuthModuleEnvironment.ACCESS_TOKEN_EXPIRY),
      }),

      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>(AuthModuleEnvironment.REFRESH_TOKEN_SECRET),
        expiresIn: this.config.get<string>(AuthModuleEnvironment.REFRESH_TOKEN_EXPIRY),
        jwtid: jwtId,
      }),
    ]);

    this.logger.log('Updating refresh token id in the database');

    const response = await this.userService.updateRefreshTokenId(jwtUserInfo.id, jwtId);
    if (!response) {
      throw new ServiceUnavailableException();
    }

    this.logger.log('Authorization tokens were generated successfully');
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
