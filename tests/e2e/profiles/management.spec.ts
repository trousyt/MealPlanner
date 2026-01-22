import { test, expect } from '@playwright/test'

test.describe('Profile Management', () => {
  // Note: These tests require an authenticated user
  // In a real test setup, you would mock auth or have a test user

  test.describe('Profile Selector Page', () => {
    test.skip('should show profile selector when authenticated without profile selected', async ({
      page,
    }) => {
      // This test would require setting up auth state
      await page.goto('/')

      // Should show "Who's using MealPlanner?" heading
      await expect(page.getByRole('heading', { name: /who's using mealplanner/i })).toBeVisible()
    })

    test.skip('should show manage profiles button', async ({ page }) => {
      await page.goto('/profiles')

      await expect(page.getByRole('button', { name: /manage profiles/i })).toBeVisible()
    })

    test.skip('should show add profile card when managing', async ({ page }) => {
      await page.goto('/profiles')

      await page.getByRole('button', { name: /manage profiles/i }).click()

      await expect(page.getByText(/add profile/i)).toBeVisible()
    })
  })

  test.describe('Profile Creation', () => {
    test.skip('should open create dialog when clicking add profile', async ({ page }) => {
      await page.goto('/profiles')

      await page.getByRole('button', { name: /manage profiles/i }).click()
      await page.getByText(/add profile/i).click()

      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByRole('heading', { name: /create profile/i })).toBeVisible()
    })

    test.skip('should show name input and color picker in create dialog', async ({ page }) => {
      await page.goto('/profiles')

      await page.getByRole('button', { name: /manage profiles/i }).click()
      await page.getByText(/add profile/i).click()

      await expect(page.getByLabel(/name/i)).toBeVisible()
      // Color picker buttons
      await expect(page.getByLabelText(/select color/i).first()).toBeVisible()
    })

    test.skip('should preview initials as name is typed', async ({ page }) => {
      await page.goto('/profiles')

      await page.getByRole('button', { name: /manage profiles/i }).click()
      await page.getByText(/add profile/i).click()

      await page.getByLabel(/name/i).fill('Test User')

      // Should show TU initials in the avatar preview
      await expect(page.getByText('TU')).toBeVisible()
    })
  })

  test.describe('Profile Editing', () => {
    test.skip('should open edit dialog when clicking edit button on profile', async ({ page }) => {
      await page.goto('/profiles')

      await page.getByRole('button', { name: /manage profiles/i }).click()

      // Click the edit button on the first profile
      await page
        .getByLabelText(/edit.*profile/i)
        .first()
        .click()

      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByRole('heading', { name: /edit profile/i })).toBeVisible()
    })

    test.skip('should show delete button when editing existing profile', async ({ page }) => {
      await page.goto('/profiles')

      await page.getByRole('button', { name: /manage profiles/i }).click()
      await page
        .getByLabelText(/edit.*profile/i)
        .first()
        .click()

      await expect(page.getByRole('button', { name: /delete profile/i })).toBeVisible()
    })

    test.skip('should show confirmation dialog when deleting profile', async ({ page }) => {
      await page.goto('/profiles')

      await page.getByRole('button', { name: /manage profiles/i }).click()
      await page
        .getByLabelText(/edit.*profile/i)
        .first()
        .click()
      await page.getByRole('button', { name: /delete profile/i }).click()

      await expect(page.getByRole('alertdialog')).toBeVisible()
      await expect(page.getByText(/are you sure/i)).toBeVisible()
    })
  })

  test.describe('Profile Selection', () => {
    test.skip('should navigate to main app when profile is selected', async ({ page }) => {
      await page.goto('/profiles')

      // Click on a profile
      await page
        .locator('[role="button"]')
        .filter({ hasText: /^(?!manage|sign out)/i })
        .first()
        .click()

      // Should navigate to main app
      await expect(page.getByText(/welcome to mealplanner/i)).toBeVisible()
    })
  })
})
