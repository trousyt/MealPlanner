import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  // Generate unique email for each test run
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  const testName = 'Test User'

  test('should successfully sign up a new user', async ({ page }) => {
    // Go to home page - AuthGuard will show auth page
    await page.goto('/')

    // Wait for auth page to load
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

    // Wait for loading state
    await expect(page.getByRole('button', { name: /creating account/i })).toBeVisible()

    // After successful signup, should see the authenticated content
    // Either the profiles page or dashboard
    await expect(
      page.getByText(/welcome to mealplanner|select.*profile|create.*profile/i)
    ).toBeVisible({ timeout: 15000 })
  })

  test('should show error for duplicate email signup', async ({ browser }) => {
    const duplicateEmail = `duplicate-${Date.now()}@example.com`

    // First signup
    const context1 = await browser.newContext()
    const page1 = await context1.newPage()

    await page1.goto('/')
    await page1.getByRole('button', { name: /sign up/i }).click()

    await page1.getByLabel(/name/i).fill(testName)
    await page1.getByLabel(/email/i).fill(duplicateEmail)
    await page1.getByLabel(/^password$/i).fill(testPassword)
    await page1.getByLabel(/confirm password/i).fill(testPassword)
    await page1.getByRole('button', { name: /create account/i }).click()

    await expect(
      page1.getByText(/welcome to mealplanner|select.*profile|create.*profile/i)
    ).toBeVisible({ timeout: 15000 })

    await context1.close()

    // Second signup with same email but DIFFERENT password - should show error
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()

    await page2.goto('/')
    await page2.getByRole('button', { name: /sign up/i }).click()

    await page2.getByLabel(/name/i).fill(testName)
    await page2.getByLabel(/email/i).fill(duplicateEmail)
    await page2.getByLabel(/^password$/i).fill('DifferentPassword456!')
    await page2.getByLabel(/confirm password/i).fill('DifferentPassword456!')
    await page2.getByRole('button', { name: /create account/i }).click()

    // Should show sanitized error (original: "Account {email} already exists")
    await expect(page2.getByText(/already exists|unable to create account/i)).toBeVisible({
      timeout: 10000,
    })

    await context2.close()
  })

  test('should successfully login with existing credentials', async ({ browser }) => {
    // First create a user in one context
    const loginEmail = `login-${Date.now()}@example.com`

    const context1 = await browser.newContext()
    const page1 = await context1.newPage()

    await page1.goto('/')
    await page1.getByRole('button', { name: /sign up/i }).click()

    await page1.getByLabel(/name/i).fill(testName)
    await page1.getByLabel(/email/i).fill(loginEmail)
    await page1.getByLabel(/^password$/i).fill(testPassword)
    await page1.getByLabel(/confirm password/i).fill(testPassword)
    await page1.getByRole('button', { name: /create account/i }).click()

    // Wait for signup to complete
    await expect(
      page1.getByText(/welcome to mealplanner|select.*profile|create.*profile/i)
    ).toBeVisible({ timeout: 15000 })

    await context1.close()

    // Now login with the same credentials in a fresh context
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()

    await page2.goto('/')
    await expect(page2.getByRole('heading', { name: /welcome back/i })).toBeVisible()

    await page2.getByLabel(/email/i).fill(loginEmail)
    await page2.getByLabel(/password/i).fill(testPassword)
    await page2.getByRole('button', { name: /sign in/i }).click()

    // Wait for loading state
    await expect(page2.getByRole('button', { name: /signing in/i })).toBeVisible()

    // After successful login, should see authenticated content
    await expect(
      page2.getByText(/welcome to mealplanner|select.*profile|create.*profile/i)
    ).toBeVisible({ timeout: 15000 })

    await context2.close()
  })

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.goto('/')

    // Try to login with non-existent user
    await page.getByLabel(/email/i).fill('nonexistent@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show sanitized error (same message for wrong email or password)
    await expect(page.getByText(/invalid email or password|unable to sign in/i)).toBeVisible({
      timeout: 15000,
    })
  })
})
