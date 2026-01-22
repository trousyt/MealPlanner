import posthog from 'posthog-js'

/**
 * Known error patterns mapped to safe, user-facing messages.
 * All patterns are matched case-insensitively.
 */
const AUTH_ERROR_MAP: Record<string, string> = {
  // Login errors - all map to same message (prevents user enumeration)
  'invalid credentials': 'Invalid email or password',
  'invalid password': 'Invalid email or password',
  'user not found': 'Invalid email or password',
  'account not found': 'Invalid email or password',
  'incorrect password': 'Invalid email or password',

  // Signup errors
  'email already exists': 'An account with this email already exists',
  'email already in use': 'An account with this email already exists',
  'user already exists': 'An account with this email already exists',

  // Network errors
  'network error': 'Unable to connect. Please check your internet connection.',
  'fetch failed': 'Unable to connect. Please check your internet connection.',
  'failed to fetch': 'Unable to connect. Please check your internet connection.',

  // Rate limiting
  'too many requests': 'Too many attempts. Please try again later.',
  'rate limit': 'Too many attempts. Please try again later.',
}

const GENERIC_LOGIN_ERROR = 'Unable to sign in. Please try again.'
const GENERIC_SIGNUP_ERROR = 'Unable to create account. Please try again.'

/**
 * Sanitizes authentication errors for user display while capturing
 * full error details to PostHog for debugging.
 *
 * @param error - The original error from the auth system
 * @param context - Whether this is a 'login' or 'signup' flow
 * @returns A safe, user-friendly error message
 */
export function sanitizeAuthError(error: unknown, context: 'login' | 'signup'): string {
  const originalMessage = error instanceof Error ? error.message : String(error)
  const lowerMessage = originalMessage.toLowerCase()

  // Find matching safe message
  let safeMessage: string | undefined
  for (const [pattern, safe] of Object.entries(AUTH_ERROR_MAP)) {
    if (lowerMessage.includes(pattern)) {
      safeMessage = safe
      break
    }
  }
  safeMessage ??= context === 'login' ? GENERIC_LOGIN_ERROR : GENERIC_SIGNUP_ERROR

  // Capture full details to PostHog for debugging
  posthog.capture('auth_error', {
    context,
    sanitized_message: safeMessage,
    original_message: originalMessage,
    error_type: error instanceof Error ? error.name : typeof error,
  })

  // Capture as exception for stack traces
  if (error instanceof Error) {
    posthog.capture('$exception', {
      $exception_message: originalMessage,
      $exception_type: error.name,
      $exception_stack_trace_raw: error.stack,
      context,
    })
  }

  return safeMessage
}
