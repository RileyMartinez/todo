import { test, expect } from '@playwright/test';
import { loginUser } from '../login-or-register/steps/login.step';
import { createTodoList, deleteTodoList } from './steps/todo-lists.steps';

test.beforeEach(async ({ page, browserName }) => {
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
});

test('Todo Lists Workflow', async ({ page }) => {
    await page.coverage.startJSCoverage();
    let todoListName = 'My First List';
    const addTodoPlaceholder = 'Add a new todo item';
    const todoItemName = 'Take out the trash';

    await createTodoList(page, todoListName);
    await deleteTodoList(page, todoListName);

    todoListName = 'My Second List';
    await createTodoList(page, todoListName);

    await page.getByRole('option', { name: todoListName }).click();
    await page.getByLabel('Edit selected list').click();
    await expect(page.locator('mat-card-title')).toContainText(todoListName);
    await expect(page.getByPlaceholder('Add a new todo item')).toBeVisible();

    await page.getByPlaceholder(addTodoPlaceholder).click();
    await page.getByPlaceholder(addTodoPlaceholder).fill(todoItemName);
    await page.getByPlaceholder(addTodoPlaceholder).press('Enter');
    await expect(page.getByRole('option', { name: todoItemName })).toBeVisible();

    await page.getByRole('option', { name: todoItemName }).click();
    await expect(page.getByText('No todo items to complete.')).toBeVisible();

    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByText('Todo Lists')).toBeVisible();
    await expect(page.getByRole('option', { name: todoListName })).toBeVisible();

    await page.getByRole('option', { name: todoListName }).click();
    await deleteTodoList(page, todoListName);

    await page.locator('button').filter({ hasText: 'menu' }).click();
    await page.getByRole('link', { name: 'Logout' }).click();
    await expect(page.locator('mat-card-header')).toContainText('Login');
});

/*  
    const jsCoverage = await page.coverage.stopJSCoverage();

    for (const entry of jsCoverage) {
        const converter = v8ToIstanbul('', 0, { source: entry.source || '' });
        await converter.load();
        converter.applyCoverage(entry.functions);
        const istanbulCoverage = converter.toIstanbul();
        console.log(istanbulCoverage);
    }
 */
