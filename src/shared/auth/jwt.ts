import crypto from 'crypto';

export type JwtPayload = {
  sub: string;
  role: string;
};

const base64url = (input: Buffer | string) => {
  const b = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return b
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

const signHmacSha256 = (data: string, secret: string) => {
  return crypto.createHmac('sha256', secret).update(data).digest();
};

export const signJwt = (payload: JwtPayload, secret: string) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = base64url(signHmacSha256(signingInput, secret));
  return `${signingInput}.${signature}`;
};

export const verifyJwt = (token: string, secret: string): JwtPayload => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('INVALID_TOKEN');

  const [encodedHeader, encodedPayload, encodedSig] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = base64url(signHmacSha256(signingInput, secret));
  if (expectedSig !== encodedSig) throw new Error('INVALID_TOKEN');

  const payloadJson = Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  return JSON.parse(payloadJson) as JwtPayload;
};
