export interface IJwtTokenPayload {
  sub: string;
  tenantId: string;
  role: string;
}

export interface IJwtToken extends IJwtTokenPayload {
  iat: string;
  exp: number;
}
