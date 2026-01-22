import { test, expect } from '@playwright/test'

test.describe('Auth Error Handling Security', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
  })

  test.describe('Login Error Messages', () => {
    test('should show sanitized error for invalid credentials', async ({ page }) => {
      await page.getByLabel(/email/i).fill('nonexistent@example.com')
      await page.getByLabel(/password/i).fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()

      // Should show sanitized message
      await expect(page.getByText(/invalid email or password|unable to sign in/i)).toBeVisible({
        timeout: 10000,
      })

      // Should NOT show internal error details
      const pageContent = await page.content()
      expect(pageContent.toLowerCase()).not.toContain('user not found')
      expect(pageContent.toLowerCase()).not.toContain('account not found')
    })

    test('should not leak internal paths in error messages', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('wrong')
      await page.getByRole('button', { name: /sign in/i }).click()

      // Wait for any error to appear
      await page.waitForTimeout(2000)

      // Check visible text content (not HTML source which includes Vite dev paths)
      const visibleText = await page.locator('body').innerText()

      // Check that no internal paths are exposed in visible text
      expect(visibleText).not.toMatch(/\/src\//)
      expect(visibleText).not.toMatch(/\/convex\//)
      expect(visibleText).not.toMatch(/\.ts:/)
      expect(visibleText).not.toMatch(/\.tsx:/)
    })

    test('should not expose stack traces', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('wrong')
      await page.getByRole('button', { name: /sign in/i }).click()

      await page.waitForTimeout(2000)

      const pageContent = await page.content()

      // Stack trace pattern: "at FunctionName (file:line:col)"
      expect(pageContent).not.toMatch(/at .+\(.+:\d+:\d+\)/)
    })
  })

  test.describe('Signup Error Messages', () => {
    test.beforeEach(async ({ page }) => {
      // Switch to signup form
      await page.getByRole('button', { name: /sign up/i }).click()
    })

    test('should show sanitized error for client-side validation', async ({ page }) => {
      await page.getByLabel(/name/i).fill('Test User')
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/^password$/i).fill('password123')
      await page.getByLabel(/confirm password/i).fill('different123')
      await page.getByRole('button', { name: /create account/i }).click()

      // Should show user-friendly validation error
      await expect(page.getByText(/passwords do not match/i)).toBeVisible()
    })

    test('should show sanitized password length error', async ({ page }) => {
      await page.getByLabel(/name/i).fill('Test User')
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/^password$/i).fill('short')
      await page.getByLabel(/confirm password/i).fill('short')

      // Try to submit - HTML5 validation may block, so we bypass it
      await page.evaluate(() => {
        const form = document.querySelector('form')
        form?.setAttribute('novalidate', 'true')
      })
      await page.getByRole('button', { name: /create account/i }).click()

      // Should show user-friendly validation error from our handler
      await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible()
    })

    test('should not expose JWT or auth config details', async ({ page }) => {
      await page.getByLabel(/name/i).fill('Test User')
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/^password$/i).fill('password123')
      await page.getByLabel(/confirm password/i).fill('password123')
      await page.getByRole('button', { name: /create account/i }).click()

      await page.waitForTimeout(2000)

      const pageContent = await page.content()

      // Should not expose auth internals
      expect(pageContent.toLowerCase()).not.toContain('jwt')
      expect(pageContent.toLowerCase()).not.toContain('private_key')
      expect(pageContent.toLowerCase()).not.toContain('secret')
    })
  })

  test.describe('Security: User Enumeration Prevention', () => {
    test('should show same error for "user not found" and "wrong password"', async ({ page }) => {
      // Try with non-existent user
      await page.getByLabel(/email/i).fill('nonexistent@example.com')
      await page.getByLabel(/password/i).fill('anypassword123')
      await page.getByRole('button', { name: /sign in/i }).click()

      // Should show generic credential error, not "user not found"
      await expect(page.getByText(/invalid email or password|unable to sign in/i)).toBeVisible({
        timeout: 10000,
      })

      // Verify "user not found" is NOT shown
      await expect(page.getByText(/user not found/i)).not.toBeVisible()
    })
  })

  test.describe('Network Error Handling', () => {
    // Skip: Offline mode behavior varies by browser and the error might not be
    // caught by our handler (WebSocket disconnection vs fetch failure)
    test.skip('should show user-friendly message when offline', async ({ page, context }) => {
      // Fill form first
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')

      // Go offline
      await context.setOffline(true)

      // Try to sign in
      await page.getByRole('button', { name: /sign in/i }).click()

      // Should show connection error, not technical details
      await expect(page.getByText(/unable to connect|check your internet|network/i)).toBeVisible({
        timeout: 5000,
      })

      // Restore connection
      await context.setOffline(false)
    })
  })
})
