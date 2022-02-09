export interface IJwtToken {
  iat: number;
  sub: string;
  exp: number;
  role: string;
}
