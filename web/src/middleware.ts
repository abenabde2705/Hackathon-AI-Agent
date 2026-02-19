import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // First, update the session
  const response = await updateSession(request)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isAuthPage = url.pathname === '/login'
  const isStaffPage = url.pathname.startsWith('/staff')
  const isAlumniPage = url.pathname.startsWith('/alumni')

  if (user) {
    // Fetch user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'alumni'

    // If user is on login page, redirect them to their dashboard
    if (isAuthPage) {
      if (role === 'admin') {
        return NextResponse.redirect(new URL('/staff', request.url))
      }
      return NextResponse.redirect(new URL('/alumni', request.url))
    }

    // Protect /staff (admin only)
    if (isStaffPage && role !== 'admin') {
      return NextResponse.redirect(new URL('/alumni', request.url))
    }

    // Protect /alumni (must be logged in) -> already logged, so OK
  } else {
    // Not logged in: block protected pages
    if (isStaffPage || isAlumniPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
