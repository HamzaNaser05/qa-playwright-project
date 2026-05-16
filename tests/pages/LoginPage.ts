import { expect, type Locator, type Page } from '@playwright/test';

// Page Object Model for the Login page (https://www.saucedemo.com/).
// This class holds all the locators and actions related to the login form.
// Using a Page Object avoids repeating the same selectors across multiple test files.
export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;  // The username text field
  readonly passwordInput: Locator;  // The password text field
  readonly loginButton: Locator;    // The "Login" submit button
  readonly errorMessage: Locator;   // The red error banner shown on failed login attempts

  // The constructor runs once when we create a new LoginPage instance.
  // It finds each element on the page using its data-test attribute,
  // which is more reliable than using CSS classes or text.
  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton   = page.locator('[data-test="login-button"]');
    this.errorMessage  = page.locator('[data-test="error"]');
  }

  // Navigates the browser to the login page (the root URL "/").
  // baseURL is set in playwright.config.ts, so "/" becomes "https://www.saucedemo.com/".
  async goto() {
    await this.page.goto('/');
  }

  // Fills in the username and password fields, then clicks the Login button.
  // Passing empty strings simulates leaving a field blank.
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  // Asserts that the login button is visible on screen,
  // which confirms the browser is currently showing the login page.
  async expectOnLoginPage() {
    await expect(this.loginButton).toBeVisible();
  }
}
