import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  // First, update the session
  const response = await updateSession(request)
  
  // Create a supabase client to check the user's role
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
  const isAuthPage = url.pathname === '/login' || url.pathname === '/signup'
  const isAdminPage = url.pathname.startsWith('/admin')
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

    // If user is on an auth page, redirect them to their dashboard
    if (isAuthPage) {
      if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url))
      if (role === 'staff') return NextResponse.redirect(new URL('/staff', request.url))
      return NextResponse.redirect(new URL('/alumni/jobs', request.url))
    }

    // Role-based access control
    if (isAdminPage && role !== 'admin') {
      return NextResponse.redirect(new URL('/alumni/jobs', request.url))
    }

    if (isStaffPage && role !== 'staff' && role !== 'admin') {
      return NextResponse.redirect(new URL('/alumni/jobs', request.url))
    }
  } else {
    // If not logged in and trying to access protected pages
    if (isAdminPage || isStaffPage || isAlumniPage) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
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
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
