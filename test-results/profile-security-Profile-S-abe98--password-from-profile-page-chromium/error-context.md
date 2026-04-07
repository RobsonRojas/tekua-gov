# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile-security.spec.ts >> Profile Security >> should allow user to change password from profile page
- Location: tests/profile-security.spec.ts:13:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:5173/"
Received: "http://localhost:5173/login"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:5173/login"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - button "Alterar Idioma / Change Language" [ref=e5] [cursor=pointer]:
    - img [ref=e6]
  - generic [ref=e11]:
    - generic [ref=e12]:
      - heading "Tekua" [level=3] [ref=e13]
      - paragraph [ref=e14]: Sign in to access governance services.
    - alert [ref=e15]:
      - img [ref=e17]
      - generic [ref=e19]: Invalid login credentials.
    - generic [ref=e20]:
      - generic [ref=e22]:
        - generic [ref=e23]:
          - text: Email
          - generic [ref=e24]: "*"
        - generic [ref=e25]:
          - img [ref=e27]
          - textbox "Email" [ref=e30]: test@tekua.com
          - group:
            - generic: Email *
      - generic [ref=e32]:
        - generic [ref=e33]:
          - text: Password
          - generic [ref=e34]: "*"
        - generic [ref=e35]:
          - img [ref=e37]
          - textbox "Password" [ref=e40]: password123
          - button "toggle password visibility" [ref=e42] [cursor=pointer]:
            - img [ref=e43]
          - group:
            - generic: Password *
      - button "Sign In" [ref=e46] [cursor=pointer]:
        - img [ref=e48]
        - text: Sign In
      - link "Forgot password?" [ref=e52] [cursor=pointer]:
        - /url: /forgot-password
    - separator [ref=e53]:
      - paragraph [ref=e55]: Restricted Access
    - alert [ref=e56]:
      - img [ref=e58]
      - generic [ref=e60]: Only registered members can access this portal.
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Profile Security', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login flow
  6  |     await page.goto('/login');
  7  |     await page.fill('input[type="email"]', 'test@tekua.com');
  8  |     await page.fill('input[type="password"]', 'password123');
  9  |     await page.click('button[type="submit"]');
> 10 |     await expect(page).toHaveURL('/');
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  11 |   });
  12 | 
  13 |   test('should allow user to change password from profile page', async ({ page }) => {
  14 |     // Navigate to profile
  15 |     await page.click('a[href="/profile"]');
  16 |     await expect(page).toHaveURL('/profile');
  17 | 
  18 |     // Should see personal info by default
  19 |     await expect(page.locator('text=Personal Information')).toBeVisible();
  20 | 
  21 |     // Click Security tab
  22 |     await page.click('button:has-text("Security")');
  23 |     
  24 |     // Should see Change Password form
  25 |     await expect(page.locator('text=Change Password')).toBeVisible();
  26 | 
  27 |     // Fill form
  28 |     await page.fill('#new-password', 'newSecurePassword123');
  29 |     await page.fill('#confirm-password', 'newSecurePassword123');
  30 |     
  31 |     // Intercept update call
  32 |     await page.route('**/auth/v1/user', async route => {
  33 |       await route.fulfill({
  34 |         status: 200,
  35 |         contentType: 'application/json',
  36 |         body: JSON.stringify({ id: 'user-id', email: 'test@tekua.com' }),
  37 |       });
  38 |     });
  39 | 
  40 |     // Submit
  41 |     await page.click('button:has-text("Update Password")');
  42 | 
  43 |     // Success message
  44 |     await expect(page.locator('text=Password updated successfully')).toBeVisible();
  45 |   });
  46 | 
  47 |   test('should show error if passwords do not match', async ({ page }) => {
  48 |     await page.click('a[href="/profile"]');
  49 |     await page.click('button:has-text("Security")');
  50 | 
  51 |     await page.fill('#new-password', 'password123');
  52 |     await page.fill('#confirm-password', 'differentPassword');
  53 |     
  54 |     await page.click('button:has-text("Update Password")');
  55 | 
  56 |     await expect(page.locator('text=Passwords do not match')).toBeVisible();
  57 |   });
  58 | });
  59 | 
```