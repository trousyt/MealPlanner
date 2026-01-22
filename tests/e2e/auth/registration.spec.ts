import { test, expect } from '@playwright/test'

test.describe('User Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth')
  })

  test('should show login form by default', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
  })

  test('should switch to sign up form when clicking sign up link', async ({ page }) => {
    await page.getByRole('button', { name: /sign up/i }).click()

    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible()
    await expect(page.getByLabel(/name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/^password$/i)).toBeVisible()
    await expect(page.getByLabel(/confirm password/i)).toBeVisible()
  })

  test('should show error for mismatched passwords', async ({ page }) => {
    await page.getByRole('button', { name: /sign up/i }).click()

    await page.getByLabel(/name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/^password$/i).fill('password123')
    await page.getByLabel(/confirm password/i).fill('different123')
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/passwords do not match/i)).toBeVisible()
  })

  test('should show error for short password', async ({ page }) => {
    await page.getByRole('button', { name: /sign up/i }).click()

    await page.getByLabel(/name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/^password$/i).fill('short')
    await page.getByLabel(/confirm password/i).fill('short')
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.getByText(/password must be at least 8 characters/i)).toBeVisible()
  })

  test('should be able to switch between login and signup forms', async ({ page }) => {
    // Start on login
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()

    // Switch to signup
    await page.getByRole('button', { name: /sign up/i }).click()
    await expect(page.getByRole('heading', { name: /create an account/i })).toBeVisible()

    // Switch back to login
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible()
  })
})
