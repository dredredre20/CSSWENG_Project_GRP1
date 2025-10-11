const {test, expect} = require('@playwright/test');


test.describe ('Register Page', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('/register.ejs');
    });

    test('Having all required fields', async ({page}) => {
        const emailInput = page.locator('input[name="email"]');
        const passwordInput = page.locator('input[name="password"]');
        const typeSelect = page.locator('select[name="type"]');

        await expect (emailInput).toHavaveAttribute('required', '');
        await expect (passwordInput).toHaveAttribute('required', '');
        await expect (typeSelect).toHaveAttribute('required', '');  
    });

    test('Register with empty fields', async ({page}) => {
        await page.click('button[type="submit"]');
        // await expect(page.locator('.error-message')).toHaveText('Email, password, and type are required'); // assuming error message has this class
    });

    test('Should select different user types', async ({page}) => {
        const typeSelect = page.locator('select[name="type"]');

        await typeSelect.selectOption('Supervisor');
        await expect(typeSelect).toHaveValue('Supervisor');

        await typeSelect.selectOption('SDW');
        await expect(typeSelect).toHaveValue('SDW');
    });





});
