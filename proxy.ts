import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas protegidas (exigem login)
  const isProtectedRoute = 
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/portal") ||
    (request.nextUrl.pathname.startsWith("/api") && !request.nextUrl.pathname.includes("/auth"));

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Se o usuário está logado, vamos verificar o status de aprovação
  if (user) {
    const { data: profile } = await supabase
      .from("perfis_usuarios")
      .select("status")
      .eq("id", user.id)
      .single();

    const status = profile?.status || "pendente";

    // Se pendente, só pode acessar a página /pendente (ou /login /cadastro)
    if (status === "pendente" && !request.nextUrl.pathname.startsWith("/pendente") && !request.nextUrl.pathname.startsWith("/login")) {
      const url = request.nextUrl.clone();
      url.pathname = "/pendente";
      return NextResponse.redirect(url);
    }

    // Se aprovado, não pode acessar login, cadastro nem pendente
    if (status === "aprovado" && (
        request.nextUrl.pathname.startsWith("/login") || 
        request.nextUrl.pathname.startsWith("/cadastro") || 
        request.nextUrl.pathname.startsWith("/pendente")
    )) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
