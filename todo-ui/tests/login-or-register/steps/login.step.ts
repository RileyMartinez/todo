import { Page } from '@playwright/test';

export async function loginUser(page: Page, userEmail: string, userPassword: string) {
    const loginUrl = 'http://localhost:4200/login-or-register';
    const emailLabel = 'Email';

    await page.goto(loginUrl);
    await page.getByLabel(emailLabel).click();
    await page.getByLabel(emailLabel).fill(userEmail);
    await page.getByLabel(emailLabel).press('Tab');
    await page.getByLabel('Password', { exact: true }).fill(userPassword);
    await page.getByRole('button', { name: 'Login' }).click();
}
