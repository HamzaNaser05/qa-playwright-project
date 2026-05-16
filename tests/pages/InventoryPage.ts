import { expect, type Locator, type Page } from '@playwright/test';

// Page Object Model for the Inventory page (/inventory.html).
// This is the main products listing page shown after a successful login.
// It handles product browsing, sorting, cart interactions, and navigation.
export class InventoryPage {
  readonly page: Page;
  readonly title: Locator; // The "Products" heading at the top of the page
  readonly cartBadge: Locator; // The red number badge on the cart icon showing item count
  readonly cartLink: Locator; // The shopping cart icon (click to open the cart)
  readonly sortSelect: Locator; // The sort dropdown (A-Z, Z-A, price low-high, price high-low)
  readonly inventoryItems: Locator; // All product cards on the page
  readonly menuButton: Locator; // The hamburger menu button (top-left)
  readonly logoutLink: Locator; // The logout link inside the hamburger menu

  // The constructor finds each element once and stores it as a Locator.
  // Locators are lazy — they don't search the DOM until an action is called on them.
  constructor(page: Page) {
    this.page = page;
    this.title = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.sortSelect = page.locator('[data-test="product-sort-container"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.menuButton = page.getByRole("button", { name: "Open Menu" });
    this.logoutLink = page.locator('[data-test="logout-sidebar-link"]');
  }

  // Navigates to the inventory page and waits until the "Products" title is visible.
  // This confirms the page loaded successfully and the user is authenticated.
  async goto() {
    await this.page.goto("/inventory.html");
    await expect(this.title).toHaveText("Products");
  }

  // Returns a locator scoped to a single product card that contains the given name.
  // Used as a starting point for actions like clicking "Add to cart" or "Remove".
  itemByName(name: string) {
    return this.inventoryItems.filter({ hasText: name });
  }

  // Clicks the "Add to cart" button inside the product card with the given name.
  async addProductToCart(name: string) {
    await this.itemByName(name)
      .getByRole("button", { name: "Add to cart" })
      .click();
  }

  // Clicks the "Remove" button inside the product card with the given name.
  // This removes the item from the cart directly from the inventory page.
  async removeProductFromCart(name: string) {
    await this.itemByName(name).getByRole("button", { name: "Remove" }).click();
  }

  // Clicks the product name link to open its detail page.
  async openProduct(name: string) {
    await this.itemByName(name)
      .locator('[data-test="inventory-item-name"]')
      .click();
  }

  // Clicks the cart icon to navigate to the cart page.
  async openCart() {
    await this.cartLink.click();
  }

  // Opens the hamburger menu and clicks the logout link.
  async logout() {
    await this.menuButton.click();
    await this.logoutLink.click();
  }

  // Asserts that the cart badge shows the expected item count.
  // If count is 0, the badge element should not exist at all (it disappears when cart is empty).
  async expectCartCount(count: number) {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
      return;
    }
    await expect(this.cartBadge).toHaveText(String(count));
  }

  // Returns an array of all product names currently visible on the page.
  // Used in sort tests to compare the displayed order against the expected order.
  async productNames() {
    return this.page
      .locator('[data-test="inventory-item-name"]')
      .allTextContents();
  }

  // Returns an array of all product prices as numbers (e.g. [29.99, 9.99, ...]).
  // The "$" sign is stripped and each value is converted from string to number.
  async productPrices() {
    const prices = await this.page
      .locator('[data-test="inventory-item-price"]')
      .allTextContents();
    return prices.map((price) => Number(price.replace("$", "")));
  }
  
  // This method retrieves the current number shown in the cart badge.
  async getCartCount() {
    const cartBadge = await this.cartBadge.allTextContents();
    return cartBadge.length > 0 ? Number(cartBadge[0]) : 0;
  }
}
