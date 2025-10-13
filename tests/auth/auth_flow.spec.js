import {test, expect} from '@playwright/test';

test.describe ('Authentication Flow', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('http://localhost:3000');
    });

    test('Login as admin and register an account', async ({page}) => {

        // Go to Login Page
        await page.goto('http://localhost:3000/login');
        await expect (page).toHaveURL('http://localhost:3000/login');

        // Login as Admin, if successful, redirected to /home
        await page.fill('input[name="email"]', 'admin1@gmail.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('http://localhost:3000/home'); 
        
        // Go to Register Page
        await page.goto('http://localhost:3000/register');
        await expect (page).toHaveURL('http://localhost:3000/register');

        // Fill out the registration form
        // Change values here as needed (this values are in my local database already)
        await page.fill('input[name="email"]', 'new_acc2@gmail.com');
        await page.fill('input[name="password"]', 'new2_pass');
        await page.selectOption('select[name="type"]', 'SDW');
        await page.click('button[type="submit"]');

        // Assuming successful registration redirects to /home
        await expect(page).toHaveURL('http://localhost:3000/home');


    });


    test('Logout after login', async ({page}) => {

        // Go to Login Page
        await page.goto('http://localhost:3000/login');
        await expect (page).toHaveURL('http://localhost:3000/login'); 

        // Login as Admin, if successful, redirected to /home
        await page.fill('input[name="email"]', 'admin1@gmail.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('http://localhost:3000/home'); 

        // Click the logout button, if successful, redirected to /login
        await page.getByRole('button', { name: 'Logout' }).click();
        await expect(page).toHaveURL('http://localhost:3000/login'); 
    });


});
