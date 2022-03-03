export interface IJwtTokenInput {
  sub: string;
  tenantId: string;
  role: string;
  ip: string;
}

export interface IJwtTokenPayload extends IJwtTokenInput {
  iat: string;
  exp: number;
  jti: string;
}
