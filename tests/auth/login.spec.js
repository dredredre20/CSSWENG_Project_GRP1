// const {test, expect} = require('@playwright/test');

import {test, expect} from '@playwright/test';




test.describe ('Login Page', () => {
    test.beforeEach(async ({page}) => {

        // For the future state of the development, when this software is deployed, url must not be fixed to localhost
        // it must be dynamic based on the deployment server's address
        // however, for the meantime, since this is still in development, we will use localhost
        // also, port number must be dynamic as well
        await page.goto('http://localhost:3000/login');
    });


    test('Login with valid credentials', async ({page}) => {
        await page.fill('input[name="email"]', 'admin1@gmail.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('http://localhost:3000/home'); // assuming successful login redirects to /dashboard
    });


    test('Login with invalid credentials', async ({page}) => {
        await page.fill('input[name="email"]', 'test@gmail.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');
        await expect(page).not.toHaveURL('http://localhost:3000/home');
        
        // await expect(page.locator('.error-message')).toHaveText('Invalid email or password'); // assuming error message has this class
    });

    test('Login with empty fields', async ({page}) => {
        await page.click('button[type="submit"]');
        await expect(page).not.toHaveURL('http://localhost:3000/home');

      //  await expect(page.locator('.error-message')).toHaveText('Email and password are required'); // assuming error message has this class
    });

    // Logging in with special character inputs
    test('Logging with inputs of special characters: /<>[]{}+_-=!@#$%^&*()', async ({page}) => {
        await page.fill('input[name="email"]', '#$%^{[()]}');
        await page.fill('input[name="password"]', '""&&^^##');
        await page.click('button[type="submit"]');
        await expect(page).not.toHaveURL('http://localhost:3000/home');

      //  await expect(page.locator('.error-message')).toHaveText('Email and password are required'); // assuming error message has this class
    });

    test('Logging with inputs of all numbers', async ({page}) => {
        await page.fill('input[name="email"]', '6701830');
        await page.fill('input[name="password"]', '9704631');
        await page.click('button[type="submit"]');
        await expect(page).not.toHaveURL('http://localhost:3000/home');

      //  await expect(page.locator('.error-message')).toHaveText('Email and password are required'); // assuming error message has this class
    });


    /*
        ~~~~~ EDIT THIS LATER ~~~~~
    */
    test('Concurrent Logins', async ({page}) => {
        await page.fill('input[name="email"]', '6701830');
        await page.fill('input[name="password"]', '9704631');
        await page.click('button[type="submit"]');
        await expect(page).not.toHaveURL('http://localhost:3000/home');

      //  await expect(page.locator('.error-message')).toHaveText('Email and password are required'); // assuming error message has this class
    });
     

    
});