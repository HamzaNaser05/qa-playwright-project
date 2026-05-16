import { expect, type Locator, type Page } from '@playwright/test';

// A type that defines the shape of the customer data needed for checkout.
// Using a type keeps the method signature clean and makes the data self-documenting.
type Customer = {
  firstName: string;
  lastName: string;
  postalCode: string;
};

// Page Object Model for the Checkout pages.
// The checkout flow has two steps:
//   Step 1 (/checkout-step-one.html)  — customer information form
//   Step 2 (/checkout-step-two.html)  — order overview / summary
//   Complete (/checkout-complete.html) — order confirmation
// This class covers all three screens.
export class CheckoutPage {
  readonly page: Page;
  readonly title: Locator;           // Page heading (changes per step:"Checkout: Overview")
  readonly firstNameInput: Locator;  // First name field on step 1
  readonly lastNameInput: Locator;   // Last name field on step 1
  readonly postalCodeInput: Locator; // Postal/ZIP code field on step 1
  readonly continueButton: Locator;  // "Continue" button on step 1 (goes to step 2)
  readonly cancelButton: Locator;    // "Cancel" button (goes back to cart on step 1, inventory on step 2)
  readonly finishButton: Locator;    // "Finish" button on step 2 (places the order)
  readonly completeHeader: Locator;  // "Thank you for your order!" message on the complete page
  readonly errorMessage: Locator;    // Red validation error shown when required fields are missing
  readonly subtotalLabel: Locator;   // "Item total: $XX.XX" label on the order overview (step 2)

  // The constructor finds each element using its data-test attribute.
  constructor(page: Page) {
    this.page = page;
    this.title           = page.locator('[data-test="title"]');
    this.firstNameInput  = page.locator('[data-test="firstName"]');
    this.lastNameInput   = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton  = page.locator('[data-test="continue"]');
    this.cancelButton    = page.locator('[data-test="cancel"]');
    this.finishButton    = page.locator('[data-test="finish"]');
    this.completeHeader  = page.locator('[data-test="complete-header"]');
    this.errorMessage    = page.locator('[data-test="error"]');
    this.subtotalLabel   = page.locator('[data-test="subtotal-label"]');
  }

  // Fills in all three fields on checkout step 1 using the provided customer data.
  // The customer object comes from data/users.ts (checkoutCustomer).
  async fillCustomerInformation(customer: Customer) {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.postalCodeInput.fill(customer.postalCode);
  }

  // Clicks the "Continue" button to move from step 1 (info form) to step 2 (overview).
  async continue() {
    await this.continueButton.click();
  }

  // Clicks the "Cancel" button.
  // On step 1 this returns to the cart; on step 2 this returns to the inventory page.
  async cancel() {
    await this.cancelButton.click();
  }

  // Clicks the "Finish" button on step 2 to place the order and go to the complete page.
  async finish() {
    await this.finishButton.click();
  }

  // Asserts that the order overview page (step 2) is showing,
  // and that each expected product name is visible in the order summary.
  async expectOverviewForProducts(names: string[]) {
    await expect(this.title).toHaveText('Checkout: Overview');
    for (const name of names) {
      await expect(this.page.locator('[data-test="inventory-item-name"]', { hasText: name })).toBeVisible();
    }
  }

  // Asserts that the subtotal label contains the expected price.
  // The subtotal is the sum of all product prices before tax.
  // Example: expectSubtotal(29.99) checks that the label contains "$29.99".
  async expectSubtotal(subtotal: number) {
    await expect(this.subtotalLabel).toContainText(`$${subtotal}`);
  }

  // Asserts that the order complete page is showing with the success message.
  // This confirms the checkout flow finished successfully.
  async expectComplete() {
    await expect(this.title).toHaveText('Checkout: Complete!');
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }
}
