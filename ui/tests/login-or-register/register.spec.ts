import { test, expect } from '@playwright/test';
import { registerUser } from './steps/register.step';

test.describe('Register', () => {
    test.skip('should allow me to register a new account', async ({ page }) => {
        const userEmail = 'riley.m.martinez+test5@gmail.com';
        const userPassword = 'test123!';

        await registerUser(page, userEmail, userPassword);
        await expect(page.locator('mat-card-title')).toContainText('Todo Lists');
    });
});
