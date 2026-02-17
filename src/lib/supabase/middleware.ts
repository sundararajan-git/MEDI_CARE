import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// update the user session for every request
export async function updateSession(request: NextRequest) {

  // response
  let supabaseResponse = NextResponse.next({
    request,
  });

  // connect
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // get user data
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicPaths = ["/login", "/signup"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  // if use not found &  protected page return the auth page
  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // if use found & auth pages return the app 
  if (user && isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
