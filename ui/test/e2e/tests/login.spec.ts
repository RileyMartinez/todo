import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:4200/login-or-register');
    await page.getByLabel('Email').click();
    await page.getByLabel('Email').fill('chromium.dev@example.com');
    await page.getByLabel('Email').press('Tab');
    await page.getByLabel('Password', { exact: true }).fill('test123!');
    await page.getByLabel('Password', { exact: true }).press('Tab');
    await page.getByLabel('Hide password').press('Tab');
    await page.getByRole('button', { name: 'Login' }).press('Enter');
    await expect(page.getByText('Todo Lists')).toBeVisible();
    await page.locator('button').filter({ hasText: 'menu' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page.locator('mat-card-title')).toContainText('Login');
});
