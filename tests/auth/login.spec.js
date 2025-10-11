const {test, expect} = require('@playwright/test');

test.describe ('Login Page', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('/login.ejs');
    });


    test('Login with valid credentials', async ({page}) => {
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
      //   await expect(page).toHaveURL('/dashboard'); // assuming successful login redirects to /dashboard
    });


    test('Login with invalid credentials', async ({page}) => {
        await page.fill('input[name="email"]', 'test@gmail.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
      //  await expect(page.locator('.error-message')).toHaveText('Invalid email or password'); // assuming error message has this class
    });

    test('Login with empty fields', async ({page}) => {
        await page.click('button[type="submit"]');
      //  await expect(page.locator('.error-message')).toHaveText('Email and password are required'); // assuming error message has this class
    });

     

    
});