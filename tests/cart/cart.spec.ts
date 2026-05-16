import { expect, test } from '@playwright/test';
import { products } from '../data/products';
import { CartPage } from '../pages/CartPage';
import { InventoryPage } from '../pages/InventoryPage';

// This test suite covers the Add to Cart feature.
// It verifies that users can add one or multiple products to the cart,
// and that the cart reflects the correct items and count.
test.describe('Add to cart feature', () => {
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;

  // Before each test: navigate to the inventory page.
  // The user is already logged in via the saved session (auth.setup.ts).
  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    cartPage = new CartPage(page);
    await inventoryPage.goto();
  });

  // Verifies that adding a single product updates the cart badge to 1,
  // and that the correct product appears inside the cart page.
  test('adds one item and verifies it in the cart', async () => {
    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.expectCartCount(1);

    await inventoryPage.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectProducts([products.backpack]);
  });

  // Verifies that adding three products updates the cart badge to 3,
  // and that all three products appear correctly inside the cart page.
  test('adds multiple items and verifies all selected items in the cart', async () => {
    const selectedProducts = [products.backpack, products.bikeLight, products.boltTShirt];

    for (const product of selectedProducts) {
      await inventoryPage.addProductToCart(product);
    }

    await inventoryPage.expectCartCount(selectedProducts.length);
    await inventoryPage.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectProducts(selectedProducts);
  });

  // Verifies that once a product is added to the cart,
  // the "Add to cart" button changes to a "Remove" button on the inventory page.
  test('changes add button to remove after a product is added', async () => {
    const product = products.fleeceJacket;

    await inventoryPage.addProductToCart(product);

    await expect(inventoryPage.itemByName(product).getByRole('button', { name: 'Remove' })).toBeVisible();
    await inventoryPage.expectCartCount(1);
  });
});
