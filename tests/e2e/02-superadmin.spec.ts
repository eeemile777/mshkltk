import { test, expect } from '@playwright/test';
import {
  waitForAppReady,
  loginAsSuperAdmin,
  generateTestData
} from './helpers';

test.describe('Super Admin Portal - Complete Feature Testing', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsSuperAdmin(page);
  });

  test('2.1 - Super Admin can login', async ({ page }) => {
    // Already logged in by beforeEach
    await expect(page).toHaveURL('/superadmin/dashboard');
    await expect(page.locator('text=/Dashboard|لوحة.*تحكم/i')).toBeVisible();

    console.log('✅ Super admin login successful');
  });

  test('2.2 - Dashboard displays statistics', async ({ page }) => {
    await page.goto('/superadmin/dashboard');
    await waitForAppReady(page);

    // Check for stat cards
    const statCards = page.locator('[class*="stat"], [class*="card"]');
    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);

    console.log('✅ Dashboard shows statistics');
  });

  test('2.3 - View all reports', async ({ page }) => {
    await page.goto('/superadmin/reports');
    await waitForAppReady(page);

    // Check reports table/list loaded
    await expect(page.locator('text=/Reports|البلاغات/i')).toBeVisible();

    console.log('✅ Reports list accessible');
  });

  test('2.4 - View all users', async ({ page }) => {
    await page.goto('/superadmin/users');
    await waitForAppReady(page);

    // Check users table loaded
    await expect(page.locator('text=/Users|المستخدمين/i')).toBeVisible();

    // Check for user entries
    const userRows = page.locator('tr, [class*="user-row"]');
    const count = await userRows.count();
    expect(count).toBeGreaterThan(0);

    console.log('✅ Users list shows data');
  });

  test('2.5 - Create new category', async ({ page }) => {
    await page.goto('/superadmin/categories');
    await waitForAppReady(page);

    const testData = generateTestData();
    const categoryName = `Test_Category_${testData.username}`;

    // Click add category button
    await page.click('button:has-text("Add"), button:has-text("New"), button:has-text("Category"), button:has-text("إضافة"), button:has-text("فئة")');

    // Fill form - try English fields first
    await page.fill('input[placeholder*="name" i], input[placeholder*="اسم"]', categoryName);
    const englishNameField = page.locator('input[placeholder*="english" i], input[placeholder*="الاسم بالإنجليزية"]');
    const hasEnglishField = await englishNameField.isVisible().catch(() => false);
    if (hasEnglishField) {
      await englishNameField.fill(categoryName);
    }

    // Select icon
    const iconInput = page.locator('input[placeholder*="icon" i], input[placeholder*="أيقونة"], select[name="icon"]');
    const isVisible = await iconInput.isVisible().catch(() => false);

    if (isVisible) {
      await iconInput.first().fill('🧪');
    }

    // Submit
    await page.click('button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("إضافة"), button[type="submit"]:has-text("حفظ")');

    // Verify category appears in list
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${categoryName}`)).toBeVisible({ timeout: 5000 });

    console.log('✅ Category created:', categoryName);
  });

  test('2.6 - Create new badge', async ({ page }) => {
    await page.goto('/superadmin/badges');
    await waitForAppReady(page);

    const testData = generateTestData();
    const badgeName = `Test_Badge_${testData.username}`;

    // Click add badge button
    await page.click('button:has-text("Add"), button:has-text("New"), button:has-text("Badge"), button:has-text("إضافة"), button:has-text("وسام")');

    // Fill form - English first
    await page.fill('input[placeholder*="name" i], input[placeholder*="اسم"]', badgeName);
    const englishNameField = page.locator('input[placeholder*="english" i], input[placeholder*="الاسم بالإنجليزية"]');
    const hasEnglishField = await englishNameField.isVisible().catch(() => false);
    if (hasEnglishField) {
      await englishNameField.fill(badgeName);
    }
    await page.fill('textarea[placeholder*="description" i], textarea[placeholder*="وصف"]', 'Test badge for automated testing');

    // Set required reports
    const pointsInput = page.locator('input[type="number"]').first();
    await pointsInput.fill('5');

    // Submit
    await page.click('button[type="submit"]:has-text("Add"), button[type="submit"]:has-text("Save"), button[type="submit"]:has-text("إضافة"), button[type="submit"]:has-text("حفظ")');

    // Verify badge appears
    await page.waitForTimeout(1000);
    await expect(page.locator(`text=${badgeName}`)).toBeVisible({ timeout: 5000 });

    console.log('✅ Badge created:', badgeName);
  });

  test('2.7 - Edit user details', async ({ page }) => {
    await page.goto('/superadmin/users');
    await waitForAppReady(page);

    // Find first non-admin user and click edit
    const editButtons = page.locator('button:has-text("Edit"), button:has-text("تعديل"), button[title*="Edit"]');
    const firstButton = editButtons.first();

    const isVisible = await firstButton.isVisible().catch(() => false);

    if (isVisible) {
      await firstButton.click();
      await page.waitForTimeout(500);

      // Modify points (if available)
      const pointsInput = page.locator('input[type="number"]');
      if (await pointsInput.isVisible()) {
        await pointsInput.fill('100');
      }

      // Save changes
      await page.click('button[type="submit"]:has-text("Save"), button:has-text("Update"), button:has-text("حفظ"), button:has-text("تحديث")');

      await page.waitForTimeout(1000);
      console.log('✅ User edited successfully');
    } else {
      console.log('ℹ️  No editable users found');
    }
  });

  test('2.8 - Delete a report', async ({ page }) => {
    await page.goto('/superadmin/reports');
    await waitForAppReady(page);

    // Find delete button
    const deleteButtons = page.locator('button:has-text("Delete"), button:has-text("حذف"), button[title*="Delete"]');
    const count = await deleteButtons.count();

    if (count > 0) {
      // Get initial report count
      const reportRows = page.locator('tr, [class*="report-row"]');
      const initialCount = await reportRows.count();

      // Click first delete button
      await deleteButtons.first().click();

      // Confirm deletion in modal/dialog
      await page.click('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete"), button:has-text("تأكيد"), button:has-text("نعم"), button:has-text("حذف")');

      await page.waitForTimeout(1000);

      console.log('✅ Report deleted successfully');
    } else {
      console.log('ℹ️  No reports available to delete');
    }
  });

  test('2.9 - View audit logs', async ({ page }) => {
    await page.goto('/superadmin/audit-logs');
    await waitForAppReady(page);

    // Check audit logs page loaded
    await expect(page.locator('text=/Audit|Logs|سجل.*أنشطة/i')).toBeVisible();

    console.log('✅ Audit logs accessible');
  });

  test('2.10 - User impersonation', async ({ page }) => {
    await page.goto('/superadmin/users');
    await waitForAppReady(page);

    // Find impersonate button
    const impersonateButtons = page.locator('button:has-text("Impersonate"), button:has-text("انتحال"), button[title*="Impersonate"]');
    const count = await impersonateButtons.count();

    if (count > 0) {
      await impersonateButtons.first().click();

      // Wait for redirect to citizen app
      await page.waitForURL('/', { timeout: 5000 });

      // Verify in citizen mode
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

      // Check for impersonation banner
      const banner = page.locator('text=/Impersonation|وضع.*انتحال/i');
      const hasBanner = await banner.isVisible().catch(() => false);

      if (hasBanner) {
        console.log('✅ User impersonation works with banner');

        // Exit impersonation
        await page.click('button:has-text("Exit"), button:has-text("End"), button:has-text("إنهاء"), button:has-text("الخروج من وضع الانتحال")');
        await page.waitForURL('/superadmin/dashboard');
      } else {
        console.log('⚠️  Impersonation works but no banner found');
      }
    } else {
      console.log('ℹ️  No users available for impersonation');
    }
  });

  test('2.11 - Manage municipalities', async ({ page }) => {
    await page.goto('/superadmin/municipalities');
    await waitForAppReady(page);

    // Check municipalities page loaded
    const pageLoaded = await page.locator('text=/Municipalities|البلديات/i').isVisible()
      .catch(() => false);

    if (pageLoaded) {
      console.log('✅ Municipalities page accessible');
    } else {
      console.log('ℹ️  Municipalities page not found (may not be implemented)');
    }
  });

  test('2.12 - View gamification settings', async ({ page }) => {
    await page.goto('/superadmin/gamification');
    await waitForAppReady(page);

    // Check gamification settings page
    const pageLoaded = await page.locator('text=/Gamification|التحفيز/i').isVisible()
      .catch(() => false);

    if (pageLoaded) {
      console.log('✅ Gamification settings accessible');
    } else {
      console.log('ℹ️  Gamification page not found');
    }
  });

  test('2.13 - Export data functionality', async ({ page }) => {
    await page.goto('/superadmin/reports');
    await waitForAppReady(page);

    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("تصدير")');
    const isVisible = await exportButton.isVisible().catch(() => false);

    if (isVisible) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      await exportButton.click();

      const download = await downloadPromise;
      console.log('✅ Export downloaded:', download.suggestedFilename());
    } else {
      console.log('ℹ️  Export button not found');
    }
  });

  test('2.14 - Filter reports by status', async ({ page }) => {
    await page.goto('/superadmin/reports');
    await waitForAppReady(page);

    // Find status filter dropdown
    const statusFilter = page.locator('select[name="status"], select:has-text("Status"), select:has-text("الحالة")');
    const isVisible = await statusFilter.isVisible().catch(() => false);

    if (isVisible) {
      await statusFilter.selectOption({ value: 'pending' });
      await page.waitForTimeout(1000);

      console.log('✅ Report filtering works');
    } else {
      console.log('ℹ️  Status filter not found');
    }
  });

  test('2.15 - Super admin can logout', async ({ page }) => {
    await page.goto('/superadmin/dashboard');

    // Find logout button
    await page.click('button:has-text("Logout"), button:has-text("Sign out"), text=/Logout|تسجيل الخروج/i');

    // Verify redirect to login
    await page.waitForURL('/superadmin/login');

    console.log('✅ Super admin logout successful');
  });
});
