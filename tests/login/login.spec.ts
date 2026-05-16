import { expect, test } from "@playwright/test";
import { users } from "../data/users";
import { LoginPage } from "../pages/LoginPage";
import { InventoryPage } from "../pages/InventoryPage";

// This test suite covers the Login feature.
// It verifies that users can log in with valid credentials,
// and that the system rejects invalid or incomplete login attempts.
// We clear the saved session so every test starts as a logged-out user.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Login feature", () => {
  let loginPage: LoginPage;

  // Before each test: open the login page so every test starts fresh.
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // Verifies that a user with correct username and password
  // is successfully redirected to the inventory (products) page.
  test("logs in with valid credentials", async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText("Products");
  });

  // Verifies that a locked-out user cannot log in.
  // The system should show a clear error message instead of granting access.
  test("rejects locked out user", async () => {
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.errorMessage).toContainText(
      "Sorry, this user has been locked out.",
    );
  });

  // Verifies that entering a username and password that do not exist
  // results in an error message — not access to the app.
  test("rejects invalid credentials", async () => {
    await loginPage.login("wrong_user", "wrong_password");

    await expect(loginPage.errorMessage).toContainText(
      "Username and password do not match",
    );
  });

  // Verifies that submitting the form without a username
  // shows a validation error asking the user to provide one.
  test("requires username", async () => {
    await loginPage.login("", users.standard.password);

    await expect(loginPage.errorMessage).toContainText("Username is required");
  });

  // Verifies that submitting the form without a password
  // shows a validation error asking the user to provide one.
  test("requires password", async () => {
    await loginPage.login(users.standard.username, "");

    await expect(loginPage.errorMessage).toContainText("Password is required");
  });
});
