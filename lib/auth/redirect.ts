// Same-origin redirect handling for the auth pages. The login/signup `?redirect=`
// is user-controlled, so it MUST be validated — otherwise `?redirect=//evil.com`
// becomes an open redirect that bounces users off-site after they sign in.

function hasControlChar(value: string): boolean {
  for (let i = 0; i < value.length; i++) if (value.charCodeAt(i) < 32) return true
  return false
}

/** Return `value` only when it is a safe same-origin path; otherwise `fallback`. */
export function safeRedirect(value: string | null | undefined, fallback: string): string {
  if (!value) return fallback
  if (!value.startsWith('/')) return fallback                            // must be root-relative
  if (value.startsWith('//') || value.startsWith('/\\')) return fallback // protocol-relative
  if (value.includes('\\') || hasControlChar(value)) return fallback
  if (value.length > 512) return fallback
  return value
}

/** Build a login URL that returns to `redirectTo` once a safe path is given. */
export function loginHref(lang: string, redirectTo?: string | null): string {
  const safe = redirectTo ? safeRedirect(redirectTo, '') : ''
  return safe ? `/${lang}/login?redirect=${encodeURIComponent(safe)}` : `/${lang}/login`
}

/** Build a signup URL that returns to `redirectTo` once a safe path is given. */
export function signupHref(lang: string, redirectTo?: string | null): string {
  const safe = redirectTo ? safeRedirect(redirectTo, '') : ''
  return safe ? `/${lang}/signup?redirect=${encodeURIComponent(safe)}` : `/${lang}/signup`
}
