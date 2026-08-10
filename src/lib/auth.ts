import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string | null;
  companyName: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'bordro-saas-super-secret-jwt-key-turkiye-2026'
);

export const AUTH_COOKIE_NAME = 'auth_session';

/**
 * Hashes a plaintext password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verifies a plaintext password against a bcrypt hash or legacy string
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash || !password) return false;
  
  // Check if hash is bcrypt ($2a$, $2b$, $2y$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$')) {
    return bcrypt.compare(password, hash);
  }

  // Fallback for legacy unhashed passwords in DB (will be upgraded on login)
  return password === hash;
}

/**
 * Signs a JWT session token with HS256 algorithm
 */
export async function signJWT(payload: SessionUser): Promise<string> {
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifies and decodes a JWT session token
 */
export async function verifyJWT(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
      role: payload.role as string,
      companyId: (payload.companyId as string) || null,
      companyName: (payload.companyName as string) || 'Şirketiniz',
    };
  } catch (err) {
    return null;
  }
}

/**
 * Gets and verifies the current session user from cookies
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  const sessionUser = await verifyJWT(token);
  return sessionUser;
}

/**
 * Sets the signed JWT session cookie in response headers
 */
export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Clears the session cookie
 */
export function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Checks if session user has any of the allowed roles
 */
export function hasRole(user: SessionUser | null, allowedRoles: string[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}
