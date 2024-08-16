import { test, expect } from '@playwright/test';
import { loginUser } from './steps/login.step';

test('Login', async ({ page, browserName }) => {
    let userEmail = '';
    const userPassword = 'test123!';

    switch (browserName) {
        case 'chromium':
            userEmail = 'chromium.user@example.com';
            break;
        case 'webkit':
            userEmail = 'webkit.user@example.com';
            break;
        case 'firefox':
            userEmail = 'firefox.user@example.com';
            break;
    }

    await loginUser(page, userEmail, userPassword);
    await expect(page.getByText('Todo Lists')).toBeVisible();
});
