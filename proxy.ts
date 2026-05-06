import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Giriş gerektirmeyen rotalar
const ACIK_ROTALAR = ["/login", "/register", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Açık rotalara doğrudan geç
  if (ACIK_ROTALAR.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // Supabase SSR client — cookie'leri response'a aktarıyoruz
  let proxyResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          proxyResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            proxyResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Oturumu kontrol et — getUser() her zaman server'a istek atar, güvenli
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Giriş yapılmamışsa /login'e yönlendir
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Giriş sonrası nereye dönülecek
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return proxyResponse;
}

export const config = {
  matcher: [
    /*
     * Şunlar HARİÇ tüm rotaları yakala:
     *   - _next/static (statik dosyalar)
     *   - _next/image (resim optimizasyonu)
     *   - favicon.ico, sitemap.xml, robots.txt
     *   - /login, /register, /reset-password (açık rotalar)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|login|register|reset-password).*)",
  ],
};
