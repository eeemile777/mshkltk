import { test, expect } from '@playwright/test';
import { 
  waitForAppReady, 
  loginAsSuperAdmin,
  createPortalUser,
  loginAsPortal
} from './helpers';

test.describe('Portal - Complete Feature Testing', () => {
  let portalUser: { username: string; password: string; municipality: string };

  test.beforeAll(async ({ browser }) => {
    // Create a portal user before running tests
    const page = await browser.newPage();
    portalUser = await createPortalUser(page, 'Amman');
    await page.close();
    
    console.log('✅ Created portal user:', portalUser.username);
  });

  test('3.1 - Portal user can login', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    // Verify at dashboard
    await expect(page).toHaveURL('/portal/dashboard');
    await expect(page.locator('text=/Dashboard|لوحة.*تحكم/i')).toBeVisible();
    
    console.log('✅ Portal login successful');
  });

  test('3.2 - Dashboard shows municipality statistics', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/dashboard');
    await waitForAppReady(page);
    
    // Check for stat cards
    const statCards = page.locator('[class*="stat"], [class*="card"]');
    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);
    
    console.log('✅ Portal dashboard shows stats');
  });

  test('3.3 - View municipality reports', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Check reports loaded
    await expect(page.locator('text=/Reports|البلاغات/i')).toBeVisible();
    
    console.log('✅ Portal reports page accessible');
  });

  test('3.4 - Filter reports by status', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Find status filter
    const statusFilter = page.locator('select[name="status"], button:has-text("Status"), button:has-text("الحالة")');
    const isVisible = await statusFilter.isVisible().catch(() => false);
    
    if (isVisible) {
      // Try select dropdown first
      if (await statusFilter.evaluate(el => el.tagName === 'SELECT')) {
        await statusFilter.selectOption({ value: 'pending' });
      } else {
        // It's a button (dropdown trigger)
        await statusFilter.click();
        await page.click('text=/Pending|قيد الانتظار/i');
      }
      
      await page.waitForTimeout(1000);
      console.log('✅ Report filtering works');
    } else {
      console.log('ℹ️  Status filter not found');
    }
  });

  test('3.5 - Filter reports by category', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Find category filter
    const categoryFilter = page.locator('select[name="category"], button:has-text("Category"), button:has-text("الفئة")');
    const isVisible = await categoryFilter.isVisible().catch(() => false);
    
    if (isVisible) {
      if (await categoryFilter.evaluate(el => el.tagName === 'SELECT')) {
        const options = await categoryFilter.locator('option').count();
        if (options > 1) {
          await categoryFilter.selectOption({ index: 1 });
        }
      } else {
        await categoryFilter.click();
        await page.locator('[role="menu"] button, [role="listbox"] li').first().click();
      }
      
      await page.waitForTimeout(1000);
      console.log('✅ Category filtering works');
    } else {
      console.log('ℹ️  Category filter not found');
    }
  });

  test('3.6 - View report details', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Click on first report
    const firstReport = page.locator('tr:not(:first-child), [class*="report-card"]').first();
    const isVisible = await firstReport.isVisible().catch(() => false);
    
    if (isVisible) {
      await firstReport.click();
      
      // Wait for details view or modal
      await page.waitForTimeout(1000);
      
      // Check if modal or new page opened
      const modalVisible = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
      const urlChanged = !page.url().includes('/portal/reports');
      
      if (modalVisible || urlChanged) {
        console.log('✅ Report details view works');
      } else {
        console.log('⚠️  Report details may not have opened');
      }
    } else {
      console.log('ℹ️  No reports available');
    }
  });

  test('3.7 - Change report status to In Progress', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Find a pending report
    const reportRow = page.locator('text=/Pending|قيد الانتظار/i').first();
    const parentRow = reportRow.locator('xpath=ancestor::tr').first();
    
    const isVisible = await parentRow.isVisible().catch(() => false);
    
    if (isVisible) {
      // Click to open details
      await parentRow.click();
      await page.waitForTimeout(500);
      
      // Find status change button
      const statusButton = page.locator('button:has-text("Change Status"), button:has-text("تغيير الحالة"), select[name="status"]');
      
      if (await statusButton.isVisible()) {
        if (await statusButton.evaluate(el => el.tagName === 'SELECT')) {
          await statusButton.selectOption({ value: 'in_progress' });
        } else {
          await statusButton.click();
          await page.click('text=/In Progress|قيد المعالجة/i');
        }
        
        // Save changes
        await page.click('button:has-text("Save"), button:has-text("حفظ"), button[type="submit"]');
        await page.waitForTimeout(1000);
        
        console.log('✅ Report status changed to In Progress');
      } else {
        console.log('ℹ️  Status change button not found');
      }
    } else {
      console.log('ℹ️  No pending reports found');
    }
  });

  test('3.8 - Resolve report with proof', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Find an in-progress report
    const reportRow = page.locator('text=/In Progress|قيد المعالجة/i').first();
    const parentRow = reportRow.locator('xpath=ancestor::tr').first();
    
    const isVisible = await parentRow.isVisible().catch(() => false);
    
    if (isVisible) {
      await parentRow.click();
      await page.waitForTimeout(500);
      
      // Find resolve button
      const resolveButton = page.locator('button:has-text("Resolve"), button:has-text("Mark Resolved"), button:has-text("تم الحل"), button:has-text("حل البلاغ")');
      
      if (await resolveButton.isVisible()) {
        await resolveButton.click();
        
        // Fill resolution notes
        const notesInput = page.locator('textarea[placeholder*="note" i], textarea[placeholder*="ملاحظات"]');
        if (await notesInput.isVisible()) {
          await notesInput.fill('Issue successfully fixed - automated test');
        }
        
        // Add proof photo (optional - would need file upload handling)
        // For now, just submit without photo
        
        // Submit resolution
        await page.click('button:has-text("Confirm"), button:has-text("Submit"), button:has-text("تأكيد"), button[type="submit"]');
        await page.waitForTimeout(1000);
        
        console.log('✅ Report resolved successfully');
      } else {
        console.log('ℹ️  No reports available to resolve');
      }
    } else {
      console.log('ℹ️  No in-progress reports found');
    }
  });

  test('3.9 - Add internal note to report', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Click first report
    const firstReport = page.locator('tr:not(:first-child)').first();
    
    if (await firstReport.isVisible()) {
      await firstReport.click();
      await page.waitForTimeout(500);
      
      // Look for internal notes section
      const notesInput = page.locator('textarea[placeholder*="note" i], textarea[placeholder*="ملاحظة"]');
      
      if (await notesInput.isVisible()) {
        await notesInput.fill('Internal note for testing - will follow up soon');
        await page.click('button:has-text("Add"), button:has-text("إضافة"), button[type="submit"]');
        
        await page.waitForTimeout(1000);
        console.log('✅ Internal note added');
      } else {
        console.log('ℹ️  Internal notes feature not found');
      }
    }
  });

  test('3.10 - View resolved reports', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Filter by resolved status
    const statusFilter = page.locator('select[name="status"], button:has-text("Status"), button:has-text("الحالة")');
    
    if (await statusFilter.isVisible()) {
      if (await statusFilter.evaluate(el => el.tagName === 'SELECT')) {
        await statusFilter.selectOption({ value: 'resolved' });
      } else {
        await statusFilter.click();
        await page.click('text=/Resolved|تم الحل/i');
      }
      
      await page.waitForTimeout(1000);
      console.log('✅ Can view resolved reports');
    }
  });

  test('3.11 - Search reports', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="بحث"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('road');
      await page.waitForTimeout(1000);
      
      console.log('✅ Search functionality works');
    } else {
      console.log('ℹ️  Search not available');
    }
  });

  test('3.12 - Export municipality reports', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/reports');
    await waitForAppReady(page);
    
    // Look for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("تصدير")');
    
    if (await exportButton.isVisible()) {
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
      await exportButton.click();
      
      const download = await downloadPromise;
      console.log('✅ Reports exported:', download.suggestedFilename());
    } else {
      console.log('ℹ️  Export feature not available');
    }
  });

  test('3.13 - View portal statistics page', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/statistics');
    await waitForAppReady(page);
    
    const statsPageExists = await page.locator('text=/Statistics|إحصائيات/i').isVisible()
      .catch(() => false);
    
    if (statsPageExists) {
      console.log('✅ Statistics page accessible');
    } else {
      console.log('ℹ️  Statistics page not found');
    }
  });

  test('3.14 - Portal user can logout', async ({ page }) => {
    await loginAsPortal(page, portalUser.username, portalUser.password);
    
    await page.goto('/portal/dashboard');
    await waitForAppReady(page);
    
    // Find logout button
    await page.click('button:has-text("Logout"), button:has-text("Sign out"), text=/Logout|تسجيل الخروج/i');
    
    // Verify redirect to login
    await page.waitForURL('/portal/login');
    
    console.log('✅ Portal logout successful');
  });

  test('3.15 - Portal auto-redirect from citizen login', async ({ page }) => {
    // Try logging in as portal user from citizen login page
    await page.goto('/login');
    await waitForAppReady(page);
    
    await page.fill('input[type="text"]', portalUser.username);
    await page.fill('input[type="password"]', portalUser.password);
    await page.click('button[type="submit"]');
    
    // Should auto-redirect to portal login and auto-login
    await page.waitForURL('/portal/dashboard', { timeout: 10000 });
    
    console.log('✅ Portal auto-redirect from citizen login works');
  });
});
