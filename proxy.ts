import { NextResponse, type NextRequest } from 'next/server';

/**
 * Directory-URL resolution for the embedded 观潮 snapshot.
 *
 * `public/guanchao-live/` is a `next build --output export` of the 观潮 site. That
 * exporter writes **directory** URLs — `markets/index.html`, `briefs/index.html`
 * — and every link inside the snapshot points at the directory form
 * (`/guanchao-live/markets/`). Next serves files from `public/` by exact path, so
 * it happily returns `.../index.html` but has no idea what `.../markets/` means:
 * it tries to route it as an app path, fails to find one, and 404s.
 *
 * A real static host (nginx, EdgeOne Pages) resolves that for free via its
 * `index.html` directory-index rule. `next start` does not, which would have made
 * the snapshot navigable in production but broken on every local check — the
 * worst possible split, because the local check is what we actually verify with.
 *
 * So the resolution is made explicit here. This is the only reason the file
 * exists; nothing about the VC site itself depends on it.
 *
 * The matcher below is deliberately narrow: it runs only on `/guanchao-live/*`,
 * so no other route on the site pays for this proxy.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /*
   * Containment check.
   *
   * `nextUrl.pathname` is already normalised by the platform, but this route
   * serves bytes straight off disk, so the guard is written out rather than
   * assumed: a traversal segment or a backslash must never reach the filesystem.
   */
  if (pathname.includes('..') || pathname.includes('\\') || pathname.includes('//')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const rest = pathname.slice('/guanchao-live'.length);

  // A file request (script, stylesheet, image, .txt) — let it pass through
  // untouched. Only bare directory paths need help.
  const lastSegment = rest.split('/').filter(Boolean).pop() ?? '';
  const looksLikeFile = lastSegment.includes('.');
  if (looksLikeFile && !rest.endsWith('/')) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = rest.endsWith('/')
    ? `/guanchao-live${rest}index.html`
    : `/guanchao-live${rest}/index.html`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/guanchao-live/:path*',
};
