import { test } from '@playwright/test';
import { products } from '../data/products';
import { CartPage } from '../pages/CartPage';
import { InventoryPage } from '../pages/InventoryPage';

// This test suite covers the Remove from Cart feature.
// It verifies that users can remove items from the cart,
// either from the cart page or from the inventory page,
// and that the cart count updates correctly after each removal.
test.describe('Remove from cart feature', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  // Before each test: navigate to the inventory page.
  // The user is already logged in via the saved session (auth.setup.ts).
  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    await inventoryPage.goto();
  });

  // Verifies the full remove flow for a single item:
  // Add the item → open the cart → confirm it's there → remove it →
  // confirm the cart is now empty and the badge is gone.
  test('removes one item and verifies the cart becomes empty', async () => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.expectCartCount(1);
    await inventoryPage.openCart();
    await cartPage.expectProducts([products.backpack]);

    await cartPage.removeProductFromCart(products.backpack);

    await cartPage.expectEmpty();
    await inventoryPage.expectCartCount(0);
  });

  // Verifies that a product can be removed directly from the inventory page
  // without needing to open the cart first.
  test('removes an item from the inventory page', async () => {
    await inventoryPage.addProductToCart(products.fleeceJacket);
    await inventoryPage.expectCartCount(1);

    await inventoryPage.removeProductFromCart(products.fleeceJacket);

    await inventoryPage.expectCartCount(0);
  });

  // Verifies that removing multiple items one at a time works correctly.
  // After each removal, the cart count and contents are checked to ensure
  // the app stays in sync: 2 items → remove 1 → 1 item → remove 1 → empty.
  test('removes multiple items one by one and verifies cart status each time', async () => {
    const selectedProducts = [products.backpack, products.bikeLight];

    for (const product of selectedProducts) {
      await inventoryPage.addProductToCart(product);
    }

    await inventoryPage.expectCartCount(2);
    await inventoryPage.openCart();
    await cartPage.expectProducts(selectedProducts);

    await cartPage.removeProductFromCart(products.backpack);
    await cartPage.expectProducts([products.bikeLight]);
    await inventoryPage.expectCartCount(1);

    await cartPage.removeProductFromCart(products.bikeLight);
    await cartPage.expectEmpty();
    await inventoryPage.expectCartCount(0);
  });
});
