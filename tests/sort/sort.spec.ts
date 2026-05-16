import { expect, test } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';

// This test suite covers the Sort feature on the inventory page.
// It verifies that selecting each sort option correctly reorders the products
// by name (A-Z, Z-A) or by price (low to high, high to low).
test.describe('Sort feature', () => {
  let inventoryPage: InventoryPage;

  // Before each test: navigate to the inventory page.
  // The user is already logged in via the saved session (auth.setup.ts).
  test.beforeEach(async ({ page }) => {
    inventoryPage = new InventoryPage(page);
    await inventoryPage.goto();
  });

  // Selects the "A to Z" sort option, then reads all product names from the page.
  // Sorts that list alphabetically and compares it to what the page is actually showing.
  // They must match — meaning the page sorted correctly.
  test('sorts products alphabetically from A to Z', async () => {
    await inventoryPage.sortSelect.selectOption("az");
    //actualNames is the list of product names as they appear on the page after selecting the sort option.
    const actualNames = await inventoryPage.productNames();
    //expectedNames is the list of product names sorted alphabetically from A to Z.
    const expectedNames = [...actualNames].sort((a, b) => a.localeCompare(b));

    expect(actualNames).toEqual(expectedNames);
  });

  // Selects the "Z to A" sort option, then reads all product names from the page.
  // Sorts that list in reverse alphabetical order and compares it to the page.
  // They must match — meaning the page sorted correctly.
  test('sorts products alphabetically from Z to A', async () => {
    await inventoryPage.sortSelect.selectOption('za');
    
    const actualNames = await inventoryPage.productNames();
    // expectedNames is the list of product names sorted in reverse alphabetical order (Z to A).
    const expectedNames = [...actualNames].sort((a, b) => b.localeCompare(a));

    expect(actualNames).toEqual(expectedNames);
  });

  // Selects the "Price (low to high)" sort option, then reads all product prices.
  // Sorts those prices from smallest to largest and compares to what the page shows.
  // They must match — meaning the page sorted correctly.
  test('sorts products by price from low to high', async () => {
    await inventoryPage.sortSelect.selectOption('lohi');

    const actualPrices = await inventoryPage.productPrices();
    // expectedPrices is the list of product prices sorted from lowest to highest.
    const expectedPrices = [...actualPrices].sort((a, b) => a - b);

    expect(actualPrices).toEqual(expectedPrices);
  });

  // Selects the "Price (high to low)" sort option, then reads all product prices.
  // Sorts those prices from largest to smallest and compares to what the page shows.
  // They must match — meaning the page sorted correctly.
  test('sorts products by price from high to low', async () => {
    await inventoryPage.sortSelect.selectOption('hilo');

    const actualPrices = await inventoryPage.productPrices();
    // expectedPrices is the list of product prices sorted from highest to lowest.
    const expectedPrices = [...actualPrices].sort((a, b) => b - a);

    expect(actualPrices).toEqual(expectedPrices);
  });
});
