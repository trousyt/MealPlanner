import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sanitizeAuthError } from '@/lib/authErrors'

// Mock posthog
vi.mock('posthog-js', () => ({
  default: {
    capture: vi.fn(),
  },
}))

import posthog from 'posthog-js'

describe('sanitizeAuthError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login context', () => {
    it('maps "invalid credentials" to safe message', () => {
      const result = sanitizeAuthError(new Error('Invalid credentials'), 'login')
      expect(result).toBe('Invalid email or password')
    })

    it('maps "user not found" to same safe message (prevents enumeration)', () => {
      const result = sanitizeAuthError(new Error('user not found'), 'login')
      expect(result).toBe('Invalid email or password')
    })

    it('maps "invalid password" to same safe message', () => {
      const result = sanitizeAuthError(new Error('invalid password'), 'login')
      expect(result).toBe('Invalid email or password')
    })

    it('returns generic login error for unknown errors', () => {
      const result = sanitizeAuthError(new Error('Some internal error'), 'login')
      expect(result).toBe('Unable to sign in. Please try again.')
    })
  })

  describe('signup context', () => {
    it('maps "email already exists" to safe message', () => {
      const result = sanitizeAuthError(new Error('email already exists'), 'signup')
      expect(result).toBe('An account with this email already exists')
    })

    it('maps "Email already in use" to same safe message', () => {
      const result = sanitizeAuthError(new Error('Email already in use'), 'signup')
      expect(result).toBe('An account with this email already exists')
    })

    it('returns generic signup error for unknown errors', () => {
      const result = sanitizeAuthError(new Error('Database connection failed'), 'signup')
      expect(result).toBe('Unable to create account. Please try again.')
    })
  })

  describe('network errors', () => {
    it('maps "network error" to connection message', () => {
      const result = sanitizeAuthError(new Error('network error'), 'login')
      expect(result).toBe('Unable to connect. Please check your internet connection.')
    })

    it('maps "fetch failed" to connection message', () => {
      const result = sanitizeAuthError(new Error('fetch failed'), 'signup')
      expect(result).toBe('Unable to connect. Please check your internet connection.')
    })
  })

  describe('rate limiting', () => {
    it('maps "too many requests" to rate limit message', () => {
      const result = sanitizeAuthError(new Error('too many requests'), 'login')
      expect(result).toBe('Too many attempts. Please try again later.')
    })

    it('maps "rate limit" to rate limit message', () => {
      const result = sanitizeAuthError(new Error('rate limit exceeded'), 'signup')
      expect(result).toBe('Too many attempts. Please try again later.')
    })
  })

  describe('case insensitivity', () => {
    it('matches patterns case-insensitively', () => {
      const result = sanitizeAuthError(new Error('INVALID CREDENTIALS'), 'login')
      expect(result).toBe('Invalid email or password')
    })

    it('matches mixed case patterns', () => {
      const result = sanitizeAuthError(new Error('User Not Found'), 'login')
      expect(result).toBe('Invalid email or password')
    })
  })

  describe('non-Error inputs', () => {
    it('handles string errors', () => {
      const result = sanitizeAuthError('invalid credentials', 'login')
      expect(result).toBe('Invalid email or password')
    })

    it('handles object errors', () => {
      const result = sanitizeAuthError({ message: 'unknown' }, 'login')
      expect(result).toBe('Unable to sign in. Please try again.')
    })

    it('handles null', () => {
      const result = sanitizeAuthError(null, 'login')
      expect(result).toBe('Unable to sign in. Please try again.')
    })

    it('handles undefined', () => {
      const result = sanitizeAuthError(undefined, 'signup')
      expect(result).toBe('Unable to create account. Please try again.')
    })
  })

  describe('PostHog tracking', () => {
    it('captures auth_error event with correct properties', () => {
      sanitizeAuthError(new Error('invalid credentials'), 'login')

      expect(posthog.capture).toHaveBeenCalledWith('auth_error', {
        context: 'login',
        sanitized_message: 'Invalid email or password',
        original_message: 'invalid credentials',
        error_type: 'Error',
      })
    })

    it('captures $exception event for Error instances', () => {
      const error = new Error('invalid credentials')
      sanitizeAuthError(error, 'login')

      expect(posthog.capture).toHaveBeenCalledWith('$exception', {
        $exception_message: 'invalid credentials',
        $exception_type: 'Error',
        $exception_stack_trace_raw: error.stack,
        context: 'login',
      })
    })

    it('does not capture $exception for non-Error inputs', () => {
      sanitizeAuthError('string error', 'login')

      // Should only have auth_error, not $exception
      expect(posthog.capture).toHaveBeenCalledTimes(1)
      expect(posthog.capture).toHaveBeenCalledWith('auth_error', expect.any(Object))
    })

    it('sends original error message to PostHog (not sanitized)', () => {
      sanitizeAuthError(new Error('Internal: user not found in database'), 'login')

      expect(posthog.capture).toHaveBeenCalledWith(
        'auth_error',
        expect.objectContaining({
          original_message: 'Internal: user not found in database',
          sanitized_message: 'Invalid email or password',
        })
      )
    })
  })

  describe('security: no sensitive data leakage', () => {
    it('does not leak stack traces in return value', () => {
      const error = new Error('Connection failed at /src/db/connection.ts:42')
      const result = sanitizeAuthError(error, 'login')

      expect(result).not.toContain('/src/')
      expect(result).not.toContain('.ts')
      expect(result).not.toContain('42')
    })

    it('does not leak internal paths in return value', () => {
      const error = new Error('Error in /home/user/app/convex/auth.ts')
      const result = sanitizeAuthError(error, 'login')

      expect(result).not.toContain('/home/')
      expect(result).not.toContain('convex')
    })

    it('does not leak database details in return value', () => {
      const error = new Error('MongoDB connection string: mongodb://user:pass@host')
      const result = sanitizeAuthError(error, 'login')

      expect(result).not.toContain('mongodb')
      expect(result).not.toContain('pass')
    })

    it('does not leak JWT/token info in return value', () => {
      const error = new Error('JWT_PRIVATE_KEY is invalid')
      const result = sanitizeAuthError(error, 'login')

      expect(result).not.toContain('JWT')
      expect(result).not.toContain('KEY')
    })
  })
})
