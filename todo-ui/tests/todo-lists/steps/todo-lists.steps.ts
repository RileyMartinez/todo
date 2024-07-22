import { Page, expect } from '@playwright/test';

export async function createTodoList(page: Page, todoListName: string) {
    await page.getByLabel('Create new list').click();
    await expect(page.getByRole('heading', { name: 'Create Todo List' })).toBeVisible();
    await page.getByLabel('Title').click();
    await page.getByLabel('Title').fill(todoListName);
    await page.getByRole('button', { name: 'Create' }).click();
    await expect(page.getByRole('option', { name: todoListName })).toBeVisible();
}

export async function deleteTodoList(page: Page, todoListName: string) {
    await page.getByRole('option', { name: todoListName }).click();
    await page.getByLabel('Delete selected list').click();
    await expect(page.getByRole('heading', { name: 'Delete Todo List' })).toBeVisible();
    await page.getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('No lists found. Create a new')).toBeVisible();
}
