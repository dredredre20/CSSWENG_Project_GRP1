import {test, expect} from '@playwright/test';

test.describe ('File upload', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('http://localhost:3000');
    })

    test('File upload test', async ({page}) => {
        // Log in with 
    });

});