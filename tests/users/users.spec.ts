import { expect, test } from '@playwright/test';
import { users } from '../data/users';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

// This test suite covers the behavior of each user type
// Each user type has a different behavior — some have known bugs built in by design.
// We clear the saved session before each test so every user logs in fresh.

//storageState is cleared to ensure each test starts with a logged-out user,
// allowing us to test the login process for each user type without 
// interference from previous sessions.
test.use({ storageState: { cookies: [], origins: [] } });

// ─────────────────────────────────────────────
// locked_out_user
// This account is blocked from accessing the app.
// ─────────────────────────────────────────────
test.describe('locked_out_user', () => {

  // Verifies that a locked-out user cannot log in.
  // The system should block the attempt and display a clear error message.
  test('cannot login - shows locked out error', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.lockedOut.username, users.lockedOut.password);

    await expect(loginPage.errorMessage).toContainText('Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/\/inventory\.html$/);
  });
});

// ─────────────────────────────────────────────
// problem_user
// This account logs in successfully but has several intentional bugs:
// broken images, broken cart buttons, and a broken checkout last name field.
// ─────────────────────────────────────────────
test.describe('problem_user', () => {

  // Verifies that the problem_user can reach the inventory page after login.
  // Even though this user has bugs, the login itself should work fine.
  test('can login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(users.problem.username, users.problem.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  // BUG: All 6 product images on the inventory page show the exact same image.
  // This test reads the image URLs and confirms they are all identical —
  // which is wrong behavior. Each product should have its own unique image.
  test('BUG: all product images show the same image', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(users.problem.username, users.problem.password);
    await page.waitForURL(/\/inventory\.html$/);
    // Get the src path of all product images on the page.
    const imageSrcs = await page.locator('.inventory_item_img img').evaluateAll(
      (imgs) => imgs.map((img) => (img as HTMLImageElement).src)
    );

    // All image URLs are the same — this confirms the bug is present.
    const allSame = imageSrcs.every((src) => src === imageSrcs[0]);
    expect(allSame).toBe(true);//allSame  is a boolean that is true if all image URLs are the same
  });

  // BUG: The "Add to cart" button for some products (e.g. Bolt T-Shirt) does not work.
  // Clicking it has no effect — the cart badge stays at 0 and the button doesn't change.
  // A working button would increase the cart count to 1.
  test('BUG: some add to cart buttons do not work', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(users.problem.username, users.problem.password);
    await page.waitForURL(/\/inventory\.html$/);
    const CartCount = await inventoryPage.getCartCount();
    // Click "Add to cart" on Bolt T-Shirt — this button is broken for problem_user.
    await inventoryPage.addProductToCart('Sauce Labs Bolt T-Shirt');

    // Cart count should still be 0 because the button did nothing.
    await inventoryPage.expectCartCount(CartCount);
  });
});

// ─────────────────────────────────────────────
// performance_glitch_user
// This account works normally, but the login is intentionally slow
// (simulates a performance issue in the system).
// ─────────────────────────────────────────────
test.describe('performance_glitch_user', () => {

  // Verifies that the performance_glitch_user can log in successfully,
  // but that the login takes more than 3 seconds to complete.
  // test.slow() triples the default timeout to avoid a false failure due to slowness.
  test('login succeeds but takes more than 3 seconds (slow by design)', async ({ page }) => {
    test.slow();

    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();

    // Record the time before and after login to measure how long it took.
    const start = Date.now();
    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
    await expect(page).toHaveURL(/\/inventory\.html$/);
    const elapsed = Date.now() - start;

    await expect(inventoryPage.title).toHaveText('Products');

    // The login should take more than 3 seconds — this is the intentional glitch.
    expect(elapsed).toBeGreaterThan(3000);
  });
});

// ─────────────────────────────────────────────
// error_user
// This account logs in successfully but has a broken sort feature.
// ─────────────────────────────────────────────
test.describe('error_user', () => {

  // Verifies that the error_user can reach the inventory page after login.
  test('can login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(users.error.username, users.error.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  // BUG: Selecting "Z to A" sort does not reorder the products correctly.
  // This test reads the product names after sorting and checks that they
  // are NOT in reverse alphabetical order — confirming the sort is broken.
  test('BUG: sort Z-A does not reorder products', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(users.error.username, users.error.password);
    await page.waitForURL(/\/inventory\.html$/);

    await inventoryPage.sortSelect.selectOption('za');

    const actualNames = await inventoryPage.productNames();
    // Build what a correct Z-A sort would look like.
    const expectedZA = [...actualNames].sort((a, b) => b.localeCompare(a));

    // The actual order does NOT match Z-A — this confirms the sort bug.
    expect(actualNames).not.toEqual(expectedZA);
  });
});

// ─────────────────────────────────────────────
// visual_user
// This account logs in successfully but has visual/UI differences
// (e.g. misaligned elements) compared to the standard user.
// Visual bugs require screenshot comparison tools to fully verify —
// here we only confirm the user can access the app.
// ─────────────────────────────────────────────
test.describe('visual_user', () => {

  // Verifies that the visual_user can log in and reach the inventory page.
  test('can login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.goto();
    await loginPage.login(users.visual.username, users.visual.password);

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await expect(inventoryPage.title).toHaveText('Products');
  });
});
