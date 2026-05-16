import { expect, test as setup } from '@playwright/test';
import { users } from './data/users';
import { InventoryPage } from './pages/InventoryPage';
import { LoginPage } from './pages/LoginPage';

const authFile = 'playwright/.auth/standard-user.json';

setup('authenticate as standard user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const inventoryPage = new InventoryPage(page);

  await loginPage.goto();
  await loginPage.login(users.standard.username, users.standard.password);

  await expect(page).toHaveURL(/\/inventory\.html$/);
  await expect(inventoryPage.title).toHaveText('Products');
  await page.context().storageState({ path: authFile });
});
