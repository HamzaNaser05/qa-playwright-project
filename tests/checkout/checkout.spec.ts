import { expect, test } from '@playwright/test';
import { checkoutCustomer } from '../data/users';
import { productPrices, products } from '../data/products';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { InventoryPage } from '../pages/InventoryPage';

// This test suite covers the Checkout feature.
// It verifies the complete purchase flow (add → cart → checkout → complete),
// form validation (missing fields), and cancellation behavior.
test.describe('Checkout feature', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  // Before each test: navigate to the inventory page.
  // The user is already logged in via the saved session (auth.setup.ts).
  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    await inventoryPage.goto();
  });

  // Verifies the full checkout flow with a single item.
  // Steps: add Backpack → open cart → proceed to checkout →
  // fill in customer info → verify overview page shows correct item and subtotal →
  // finish → confirm the order complete page is displayed.
  test('completes checkout with one item', async () => {
    await inventoryPage.addProductToCart(products.backpack);

    await inventoryPage.openCart();
    await cartPage.expectProducts([products.backpack]);
    await cartPage.checkout();

    await checkoutPage.fillCustomerInformation(checkoutCustomer);
    await checkoutPage.continue();
    await checkoutPage.expectOverviewForProducts([products.backpack]); // Verify the correct product appears in the checkout overview.
    await checkoutPage.expectSubtotal(productPrices[products.backpack]); // Verify the subtotal is correct for the single item.
    await checkoutPage.finish();
    await checkoutPage.expectComplete();
  });

  // Verifies the full checkout flow with multiple items.
  // Steps: add 3 products → open cart → proceed to checkout →
  // fill in customer info → verify all items appear in the overview
  // with the correct subtotal → finish → confirm order complete.
  test('completes checkout with multiple items', async () => {
    const selectedProducts = [products.backpack, products.bikeLight, products.fleeceJacket];

    for (const product of selectedProducts) {
      await inventoryPage.addProductToCart(product);
    }

    await inventoryPage.openCart();
    await cartPage.expectProducts(selectedProducts);
    await cartPage.checkout();

    await checkoutPage.fillCustomerInformation(checkoutCustomer);
    await checkoutPage.continue();
    await checkoutPage.expectOverviewForProducts(selectedProducts);
    await checkoutPage.expectSubtotal(productPrices[products.backpack] + productPrices[products.bikeLight] + productPrices[products.fleeceJacket]);
    await checkoutPage.finish();
    await checkoutPage.expectComplete();
  });

  // Verifies that clicking "Continue" on checkout step 1
  // without entering any information shows a "First Name is required" error.
  test('requires first name before continuing checkout', async () => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.continue();

    await expect(checkoutPage.errorMessage).toContainText('First Name is required');
  });

  // Verifies that filling in first name and postal code but leaving
  // last name empty still blocks the user with a validation error.
  test('requires last name before continuing checkout', async () => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.firstNameInput.fill(checkoutCustomer.firstName);
    await checkoutPage.postalCodeInput.fill(checkoutCustomer.postalCode);
    await checkoutPage.continue();

    await expect(checkoutPage.errorMessage).toContainText('Last Name is required');
  });

  // Verifies that filling in first name and last name but leaving
  // postal code empty still blocks the user with a validation error.
  test('requires postal code before continuing checkout', async () => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.firstNameInput.fill(checkoutCustomer.firstName);
    await checkoutPage.lastNameInput.fill(checkoutCustomer.lastName);
    await checkoutPage.continue();

    await expect(checkoutPage.errorMessage).toContainText('Postal Code is required');
  });

  // Verifies that clicking "Cancel" on checkout step 1 (customer info form)
  // takes the user back to the cart page with the item still present.
  test('cancels from step 1 and returns to cart', async () => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.cancel();

    await cartPage.expectLoaded();
    await cartPage.expectProducts([products.backpack]);
  });

  // Verifies that clicking "Cancel" on checkout step 2 (order overview)
  // takes the user back to the inventory page, and the cart count is preserved.
  test('cancels from step 2 and returns to inventory', async ({ page }) => {
    const selectedProducts = [products.backpack, products.bikeLight];

    for (const product of selectedProducts) {
      await inventoryPage.addProductToCart(product);
    }

    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillCustomerInformation(checkoutCustomer);
    await checkoutPage.continue();

    await checkoutPage.cancel();

    await expect(page).toHaveURL(/\/inventory\.html$/);
    await inventoryPage.expectCartCount(selectedProducts.length);
  });
});
