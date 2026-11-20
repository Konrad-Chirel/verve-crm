import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/register',
  '/confidentialite',
  '/cgu',
  '/auth/callback',
  '/api/keepalive',
  '/icon',
  '/apple-icon',
  '/opengraph-image',
  '/twitter-image',
  '/robots.txt',
  '/sitemap.xml',
];

export async function updateSession(request: NextRequest) {
  // Enforce HTTPS in production environments behind reverse proxies (Vercel / Cloudflare)
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = request.headers.get('host') || '';
  const isLocalHost =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]');
  if (process.env.NODE_ENV === 'production' && forwardedProto === 'http' && !isLocalHost) {
    const httpsUrl = new URL(request.url);
    httpsUrl.protocol = 'https:';
    return NextResponse.redirect(httpsUrl, 308);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/'))
  );
  const isApiRoute = pathname.startsWith('/api/');
  const isProtectedRoute = !isPublicPath;

  // Explicit demo access cookie when user clicks "Accès démo interactif" on /login (UI routes only, NEVER API routes)
  const hasDemoCookie = !isApiRoute && request.cookies.get('verve_demo_mode')?.value === '1';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtectedRoute) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Service non configuré' }, { status: 503 });
      }
      if (!hasDemoCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    return supabaseResponse;
  }

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some((c) => c.name.startsWith('sb-'));

  if (!hasAuthCookie) {
    if (isProtectedRoute) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
      }
      if (!hasDemoCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  let user = null;
  try {
    const { data } = await Promise.race([
      supabase.auth.getUser(),
      new Promise<any>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase auth refresh timeout')), 2000)
      ),
    ]);
    user = data?.user ?? null;
  } catch {
    // Proceed gracefully if Supabase is slow
  }

  if (!user && isProtectedRoute) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    if (!hasDemoCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return supabaseResponse;
}
