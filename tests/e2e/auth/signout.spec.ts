import { test, expect } from '@playwright/test'

test.describe('Sign Out Flow', () => {
  const testEmail = `signout-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Test User'

  test('should sign out from dashboard and return to login page', async ({ page }) => {
    // First, sign up a new user
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()

    // Switch to signup form
    await page.getByRole('button', { name: /sign up/i }).click()
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible()

    // Fill out signup form
    await page.getByLabel(/name/i).fill(testName)
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/^password$/i).fill(testPassword)
    await page.getByLabel(/confirm password/i).fill(testPassword)

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click()

    // Wait for authenticated content (dashboard or profile selector)
    await expect(
      page.getByText(/welcome to mealplanner|select.*profile|create.*profile/i)
    ).toBeVisible({ timeout: 15000 })

    // If we're on profile selector, we need to create a profile first to get to dashboard
    const profileSelector = page.getByText(/select.*profile|create.*profile/i)
    if (await profileSelector.isVisible().catch(() => false)) {
      // Create a profile to get to dashboard
      const createButton = page.getByRole('button', { name: /create.*profile|add.*profile|\+/i })
      if (await createButton.isVisible().catch(() => false)) {
        await createButton.click()
        // Fill profile form if needed
        const nameInput = page.getByLabel(/name/i)
        if (await nameInput.isVisible().catch(() => false)) {
          await nameInput.fill('Test Profile')
          await page.getByRole('button', { name: /save|create|submit/i }).click()
        }
      }
    }

    // Now we should be on the dashboard - wait for it
    await expect(page.getByText('Welcome to MealPlanner!')).toBeVisible({ timeout: 15000 })

    // Click the sign out button
    await page.getByRole('button', { name: /sign out/i }).click()

    // After sign out, should return to login page
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible({
      timeout: 15000,
    })

    // Verify we're logged out by checking for sign in button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
  })
})
