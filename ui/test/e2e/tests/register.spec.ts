import { test } from '../fixtures';
import { expect } from '@playwright/test';

test('register', async ({ page }) => {
    await page.goto('http://localhost:4200/login-or-register');
    await page.getByRole('tab', { name: 'Register' }).click();
    await page.getByLabel('Email').click();
    await page.getByLabel('Email').fill('chromium.dev@example.com');
    await page.getByLabel('Email').press('Tab');
    await page.getByLabel('Password', { exact: true }).fill('test123!');
    await page.getByLabel('Password', { exact: true }).press('Tab');
    await page.getByLabel('Hide password').press('Tab');
    await page.getByRole('button', { name: 'Create' }).press('Enter');
    await page.locator('button').filter({ hasText: 'menu' }).click();
    await expect(page.getByText('Todo Lists')).toBeVisible();
    await page.getByRole('link', { name: 'Logout' }).click();
});
