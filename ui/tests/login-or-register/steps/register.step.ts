import { Page } from '@playwright/test';

export async function registerUser(page: Page, userEmail: string, userPassword: string) {
    const registerUrl = 'http://localhost:4200/login-or-register';
    const emailLabel = 'Email';

    await page.goto(registerUrl);
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByLabel(emailLabel).click();
    await page.getByLabel(emailLabel).fill(userEmail);
    await page.getByLabel(emailLabel).press('Tab');
    await page.getByLabel('Password', { exact: true }).fill(userPassword);
    await page.getByLabel('Confirm Password').fill(userPassword);
    await page.getByRole('button', { name: 'Register' }).click();
}
