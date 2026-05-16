import { expect, type Locator, type Page } from '@playwright/test';

// Page Object Model for the Cart page (/cart.html).
// This class handles all interactions and assertions on the shopping cart page,
// including verifying cart contents, removing items, and navigating to checkout.
export class CartPage {
  readonly page: Page;
  readonly title: Locator;                  // The "Your Cart" heading at the top
  readonly checkoutButton: Locator;         // The "Checkout" button to start the purchase flow
  readonly continueShoppingButton: Locator; // The "Continue Shopping" button to go back to inventory
  readonly cartItems: Locator;              // All product rows currently listed in the cart

  // The constructor finds each element on the cart page using its data-test attribute.
  constructor(page: Page) {
    this.page = page;
    this.title                  = page.locator('[data-test="title"]');
    this.checkoutButton         = page.locator('[data-test="checkout"]');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.cartItems              = page.locator('[data-test="inventory-item"]');
  }

  // Asserts that the cart page has loaded by checking the page title says "Your Cart".
  async expectLoaded() {
    await expect(this.title).toHaveText('Your Cart');
  }

  // Returns a locator to a single cart item that contains the given product name.
  // Used internally by expectProducts() and removeProduct().
  itemByName(name: string) {
    return this.cartItems.filter({ hasText: name });
  }

  // Asserts that the cart contains exactly the given list of products (by name),
  // and that the total number of items matches the list length.
  async expectProducts(names: string[]) {
    await expect(this.cartItems).toHaveCount(names.length);
    for (const name of names) {
      await expect(this.itemByName(name)).toBeVisible();
    }
  }

  // Asserts that the cart is completely empty (no items visible).
  async expectEmpty() {
    await expect(this.cartItems).toHaveCount(0);
  }

  // Clicks the "Remove" button next to the product with the given name.
  // This removes that specific item from the cart.
  async removeProductFromCart(name: string) {
    await this.itemByName(name).getByRole('button', { name: 'Remove' }).click();
  }

  // Clicks the "Checkout" button to proceed to the checkout step 1 (customer info form).
  async checkout() {
    await this.checkoutButton.click();
  }

  // Clicks the "Continue Shopping" button to go back to the inventory page.
  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}
