import { defineMiddleware } from 'astro:middleware';

const PROTECTED_PREFIXES = ['/library', '/collections', '/profile'];
const PUBLIC_PREFIXES = ['/', '/watch', '/login', '/register', '/verify-email', '/reset-password'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isPublic(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (!isProtected(pathname) || isPublic(pathname)) {
    return next();
  }

  const cookieHeader = context.request.headers.get('cookie') ?? '';
  const hasSessionCookies =
    cookieHeader.includes('refreshToken=') && cookieHeader.includes('deviceId=');

  if (!hasSessionCookies) {
    return context.redirect(`/login?next=${encodeURIComponent(pathname)}`);
  }

  return next();
});
