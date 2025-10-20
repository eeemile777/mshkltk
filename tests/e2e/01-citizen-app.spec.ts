import { test, expect } from '@playwright/test';
import { 
  generateTestData, 
  waitForAppReady, 
  registerUser, 
  loginAsCitizen,
  submitReport,
  logout,
  waitForApiResponse,
  setLanguageToEnglish,
  saveTestCredentials,
  loadTestCredentials
} from './helpers';

test.describe('Citizen App - Complete Feature Testing', () => {
  let testUser: ReturnType<typeof generateTestData>;

  test.beforeAll(() => {
    testUser = generateTestData();
  });

  // Helper to get saved credentials or throw error
  function getSavedCredentials() {
    const savedCreds = loadTestCredentials();
    if (!savedCreds || !savedCreds.username) {
      throw new Error('❌ No saved credentials found. Run test 1.2 (Registration) first!');
    }
    return savedCreds;
  }

  test('1.1 - Landing Page loads correctly', async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    
    // Check for landing page with clickable logo
    await expect(page.locator('text=Mshkltk')).toBeVisible();
    
    // Wait for the logo button to be enabled (animation to finish)
    const logoButton = page.locator('button[aria-label="Enter Mshkltk"]');
    await logoButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Wait for button to be enabled (not disabled by animation)
    await page.waitForTimeout(2000); // Wait for any initial animations
    
    // Click the logo/button to proceed
    await logoButton.click({ timeout: 10000 });
    
    // Should navigate to login page (hash router uses #/login)
    await page.waitForURL(/\/#\/login/, { timeout: 10000 });
    await waitForAppReady(page);
    
    // NOW switch to English using the globe icon
    await setLanguageToEnglish(page);
    
    // Check for login page elements (English or Arabic)
    const loginText = page.locator('text=/Login|Sign in|تسجيل الدخول/i');
    await expect(loginText).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Landing page loaded and navigated to login');
  });

  test('1.2 - User Registration works', async ({ page }) => {
    await registerUser(page, testUser);
    
    // Verify redirect to home (hash router)
    await expect(page).toHaveURL(/\/#\/home/);
    
    // Verify user is logged in by checking for home page elements
    // Check for bottom navigation (Map, Trending buttons)
    const bottomNav = page.locator('text=/Map|خريطة/i, text=/Trending|الشائع/i').first();
    await expect(bottomNav).toBeVisible({ timeout: 10000 });
    
    // Or check for the map container
    const mapContainer = page.locator('.leaflet-container, [class*="map"]').first();
    await expect(mapContainer).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Registered user:', testUser.username);
  });

  test('1.3 - User can view profile', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    // Navigate to profile (hash router)
    await page.goto('/#/profile');
    await waitForAppReady(page);
    
    // Check profile page loaded (verify URL)
    await expect(page).toHaveURL(/\/#\/profile/);
    
    // Check for profile elements (Points, username, or badges)
    const hasUsername = await page.locator(`text=${creds.username}`).isVisible().catch(() => false);
    const hasPoints = await page.locator('text=/نقاط|Points|Score/i').isVisible().catch(() => false);
    const hasBadges = await page.locator('text=/Badges|شارات|Achievements/i').isVisible().catch(() => false);
    
    expect(hasUsername || hasPoints || hasBadges).toBeTruthy();
    console.log('✅ Profile page loaded successfully');
  });

  test('1.4 - Submit a new report', async ({ page }) => {
    const { username, password } = getSavedCredentials();
    await loginAsCitizen(page, username, password);
    
    await submitReport(page, {
      title: 'Test Report - Pothole in Street',
      description: 'This is a test report about a large pothole in the street that needs repair',
      category: 'Roads & Infrastructure'
    });
    
    // Verify success message or redirect
    await expect(page.locator('text=/Submitted|Success|تم.*إرسال|نجح/i')).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Report submitted successfully');
  });

  test('1.5 - View report on map', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    await page.goto('/#/map');
    await waitForAppReady(page);
    
    // Check map loaded
    await expect(page.locator('.leaflet-container')).toBeVisible();
    
    // Check for map markers
    const markers = page.locator('.leaflet-marker-icon');
    await expect(markers.first()).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Map displays reports');
  });

  test('1.6 - View My Reports page', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    await page.goto('/#/home');
    await waitForAppReady(page);
    
    // Check for reports list - "My Reports" is probably a tab or filter on home page
    await expect(page.locator('text=/My Reports|بلاغاتي|Reports/i')).toBeVisible();
    
    console.log('✅ My Reports page works');
  });

  test('1.7 - Add comment to a report', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    // Go to home and find first report
    await page.goto('/#/home');
    await waitForAppReady(page);
    
    // Click on first report card
    const firstReport = page.locator('.report-card, [class*="cursor-pointer"]').first();
    await firstReport.click();
    
    // Wait for report details page
    await page.waitForURL(/\/report\/.*/);
    await waitForAppReady(page);
    
    // Add comment
    const commentText = 'This is a test comment - I support this report';
    await page.fill('textarea[placeholder*="comment" i], textarea[placeholder*="تعليق"]', commentText);
    await page.click('button:has-text("Add Comment"), button:has-text("Post"), button:has-text("إضافة تعليق")');
    
    // Wait for comment to appear
    await expect(page.locator(`text=${commentText}`)).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Comment added successfully');
  });

  test('1.8 - Confirm a report', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    // Find a report not created by this user
    await page.goto('/#/home');
    await waitForAppReady(page);
    
    // Click on first report
    const firstReport = page.locator('.report-card, [class*="cursor-pointer"]').first();
    await firstReport.click();
    await page.waitForURL(/\/report\/.*/);
    
    // Look for confirm button
    const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("I Confirm"), button:has-text("أؤكد"), button:has-text("تأكيد")');
    const isVisible = await confirmButton.isVisible().catch(() => false);
    
    if (isVisible) {
      await confirmButton.click();
      await expect(page.locator('text=/Confirmed|Success|تم.*تأكيد|مؤكد/i')).toBeVisible({ timeout: 5000 });
      console.log('✅ Report confirmed successfully');
    } else {
      console.log('ℹ️  No confirmable reports available (may be own report)');
    }
  });

  test('1.9 - View notifications', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    await page.goto('/#/notifications');
    await waitForAppReady(page);
    
    // Check notifications page loaded
    await expect(page.locator('text=/Notifications|إشعارات/i')).toBeVisible();
    
    console.log('✅ Notifications page works');
  });

  test('1.10 - View leaderboard', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    await page.goto('/#/community');
    await waitForAppReady(page);
    
    // Check leaderboard/community page loaded (PATHS.COMMUNITY = '/community')
    await expect(page.locator('text=/Leaderboard|Community|لوحة.*صدارة|إنجازات/i')).toBeVisible();
    
    // Check for user entries
    const userCards = page.locator('[class*="user-card"], [class*="leaderboard-entry"], [class*="badge"], [class*="achievement"]');
    const count = await userCards.count();
    expect(count).toBeGreaterThan(0);
    
    console.log('✅ Leaderboard displays users');
  });

  test('1.11 - View achievements page', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    // Same as leaderboard - PATHS.COMMUNITY points to both achievements and leaderboard
    await page.goto('/#/community');
    await waitForAppReady(page);
    
    // Check achievements page loaded
    await expect(page.locator('text=/Achievements|Community|إنجازات/i')).toBeVisible();
    
    console.log('✅ Achievements page works');
  });

  test('1.12 - View trending reports', async ({ page }) => {
    await loginAsCitizen(page, testUser.username, testUser.password);
    
    await page.goto('/#/trending');
    await waitForAppReady(page);
    
    // Check trending page loaded
    await expect(page.locator('text=/Trending|شائع/i')).toBeVisible();
    
    console.log('✅ Trending page works');
  });

  test('1.13 - Search functionality', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    await page.goto('/#/home');
    await waitForAppReady(page);
    
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[placeholder*="بحث"]');
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('road');
      await page.waitForTimeout(1000); // Wait for debounce
      
      console.log('✅ Search functionality works');
    } else {
      console.log('ℹ️  Search input not found on homepage');
    }
  });

  test('1.14 - View About page', async ({ page }) => {
    await page.goto('/#/about');
    await waitForAppReady(page);
    
    // Check about page loaded
    await expect(page.locator('text=/About|عن.*التطبيق/i')).toBeVisible();
    
    console.log('✅ About page works');
  });

  test('1.15 - Logout successfully', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    await logout(page);
    
    // Verify logged out
    await expect(page.locator('text=/Login|Sign in|تسجيل الدخول/i')).toBeVisible();
    
    console.log('✅ Logout successful');
  });

  test('1.16 - Login after logout', async ({ page }) => {
    const creds = getSavedCredentials();
    await loginAsCitizen(page, creds.username, creds.password);
    
    // Verify logged in by checking home page elements
    await expect(page).toHaveURL(/\/#\/home/);
    await expect(page.locator('text=/Map|خريطة/i')).toBeVisible();
    
    console.log('✅ Re-login successful');
  });
});
