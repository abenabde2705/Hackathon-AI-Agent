import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // IMPORTANT: DO NOT remove this. This refreshes the session if it's expired.
  // This is the core refresh logic.
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch (error) {
    console.debug('Supabase auth refresh error in middleware:', error)
  }

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname === '/login' || pathname === '/signup'
  const isAdminPath = pathname.startsWith('/admin')
  const isDashboardPath = pathname.startsWith('/dashboard')
  const isHomePath = pathname === '/'

  if (user) {
    // Fetch user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'alumni'

    // Helper for role-based redirection
    const getDashboardRedirect = () => {
      if (role === 'admin') return '/admin/staff'
      if (role === 'staff') return '/dashboard'
      return '/dashboard/jobs'
    }

    // Redirect logged-in users from Auth pages or Home page
    if (isAuthPage || isHomePath) {
      const url = request.nextUrl.clone()
      url.pathname = getDashboardRedirect()
      const redirectResponse = NextResponse.redirect(url)
      // Copy cookies from supabaseResponse to the redirectResponse
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    // Protect /admin (Admin only)
    if (isAdminPath && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = getDashboardRedirect()
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

    // Protect /dashboard (Management part: /dashboard itself, /dashboard/scrape, /dashboard/import)
    const isManagementPath = pathname === '/dashboard' || 
                             pathname.startsWith('/dashboard/scrape') || 
                             pathname.startsWith('/dashboard/import')
                             
    if (isManagementPath && role !== 'admin' && role !== 'staff') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/jobs'
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }

  } else {
    // Not logged in: block protected pages
    if (isAdminPath || isDashboardPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const redirectResponse = NextResponse.redirect(url)
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value)
      })
      return redirectResponse
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
