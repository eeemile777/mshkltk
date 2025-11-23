import { Page, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

/**
 * Test Helper Functions
 * Reusable functions for common testing operations
 * UPDATED: Using English language and data-testid for reliability
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CREDENTIALS_FILE = path.join(__dirname, 'test-credentials.json');

// Save test credentials to file
export function saveTestCredentials(username: string, password: string, email: string) {
  const credentials = { username, password, email };
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(credentials, null, 2));
  console.log('💾 Saved test credentials:', username);
}

// Load test credentials from file
export function loadTestCredentials() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
    const credentials = JSON.parse(data);
    if (credentials.username) {
      console.log('📂 Loaded test credentials:', credentials.username);
      return credentials;
    }
  }
  return null;
}

// Generate unique test data
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);

  return {
    username: `testuser_${timestamp}_${random}`,
    firstName: `Test${random}`,
    lastName: `User${random}`,
    email: `test_${timestamp}_${random}@example.com`,
    password: 'TestPassword123!',
    municipality: 'Amman' // Using English
  };
}

// Wait for app to be ready
export async function waitForAppReady(page: Page) {
  // Wait for network to be idle (useful for initial loads)
  await page.waitForLoadState('networkidle').catch(() => { });

  // Wait for React to hydrate by checking for a root element or common container
  await page.waitForSelector('#root, #app, body', { state: 'attached' });

  // Wait for any loading spinners to disappear
  await page.locator('.loading-spinner, .spinner, [data-testid="loading"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => { });

  await page.waitForTimeout(500); // Small buffer for animations
}

// Set language to English for reliable testing
export async function setLanguageToEnglish(page: Page) {
  // Wait for page to be ready
  await page.waitForTimeout(1000);

  // Find the globe icon button for language switcher
  const langButton = page.locator('button[aria-label="Toggle language"]');
  const isVisible = await langButton.isVisible({ timeout: 5000 }).catch(() => false);

  if (isVisible) {
    // Check current language by looking at page content
    // We check for Arabic text indicating we are in Arabic mode
    const hasArabic = await page.locator('text=/تسجيل الدخول|البلاغات|الرئيسية/').first().isVisible().catch(() => false);

    // If page is in Arabic, click the globe to switch to English
    if (hasArabic) {
      await langButton.click();
      await page.waitForTimeout(1000); // Wait for language switch to complete
      console.log('🌐 Switched language to English');
    } else {
      console.log('🌐 Already in English mode');
    }
  } else {
    console.log('⚠️  Language switcher button not found');
  }
}

// Skip tutorial if it appears
export async function skipTutorialIfPresent(page: Page) {
  await page.waitForTimeout(1500);

  // Check if tutorial dialog is visible
  const tutorialDialog = page.locator('dialog, [role="dialog"], [data-testid="tutorial-modal"]');
  const dialogVisible = await tutorialDialog.isVisible().catch(() => false);

  if (dialogVisible) {
    // Look for Skip button (case-insensitive, flexible)
    const skipButton = page.locator('button').filter({ hasText: /skip|تخطي/i });
    const skipExists = await skipButton.isVisible().catch(() => false);

    if (skipExists) {
      console.log('🎯 Skipping tutorial...');
      await skipButton.click();
      await page.waitForTimeout(1000);
      return;
    }

    // Otherwise click through all steps
    console.log('🎯 Clicking through tutorial steps...');
    for (let i = 0; i < 8; i++) {
      const nextButton = page.locator('button').filter({ hasText: /next|start|التالي|البدء/i });
      const exists = await nextButton.isVisible().catch(() => false);
      if (exists) {
        await nextButton.click();
        await page.waitForTimeout(800);
      } else {
        break;
      }
    }
  }
}

// Continue as Guest (faster way for testing)
export async function loginAsGuest(page: Page) {
  await page.goto('/');
  await waitForAppReady(page);

  // Check if already logged in
  const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
  if (isLoggedIn) return;

  // Click the Mshkltk logo to go to login page
  const logoButton = page.locator('button[aria-label="Enter Mshkltk"]');
  const isLandingPage = await logoButton.isVisible().catch(() => false);

  if (isLandingPage) {
    // Wait for button to be enabled (animation might have it disabled initially)
    await page.waitForTimeout(2000);
    await logoButton.click({ timeout: 10000 });
    await page.waitForURL(/\/#\/login/, { timeout: 10000 });
  } else {
    await page.goto('/#/login');
  }

  await waitForAppReady(page);

  // Wait 2 seconds before clicking globe icon (as per user instructions)
  await page.waitForTimeout(2000);

  // Set language to English
  await setLanguageToEnglish(page);

  // Click "Continue as Guest" button (at the top of the page)
  const guestButton = page.locator('button:has-text("Continue as Guest"), button:has-text("متابعة كضيف")');
  await guestButton.waitFor({ state: 'visible', timeout: 5000 });
  await guestButton.click();

  // Wait for navigation to home page
  await page.waitForURL(/\/#\/home/, { timeout: 10000 });
  await waitForAppReady(page);

  // Skip tutorial if it appears
  await skipTutorialIfPresent(page);
}

// Citizen App Login
export async function loginAsCitizen(page: Page, username: string, password: string) {
  await page.goto('/');
  await waitForAppReady(page);

  // Check if already logged in
  const isLoggedIn = await page.locator('[data-testid="user-menu"]').isVisible().catch(() => false);
  if (isLoggedIn) return;

  // Click the Mshkltk logo to go to login page
  const logoButton = page.locator('button[aria-label="Enter Mshkltk"]');
  const isLandingPage = await logoButton.isVisible().catch(() => false);

  if (isLandingPage) {
    // Wait for button to be enabled (animation might have it disabled initially)
    await page.waitForTimeout(2000);
    await logoButton.click({ timeout: 10000 });
    await page.waitForURL(/\/#\/login/, { timeout: 10000 });
  } else {
    await page.goto('/#/login');
  }

  await waitForAppReady(page);

  // Wait 2 seconds before clicking globe icon (as per user instructions)
  await page.waitForTimeout(2000);

  // NOW set language to English after we're on the login page
  await setLanguageToEnglish(page);

  // STAGE 1: Click "Sign In or Create Account" button to reveal the form
  const signInButton = page.locator('button:has-text("Sign In or Create Account"), button:has-text("تسجيل الدخول")');
  await signInButton.waitFor({ state: 'visible', timeout: 5000 });
  await signInButton.click();
  await page.waitForTimeout(500); // Wait for form animation

  // STAGE 2: Now the form is visible with Username and Password inputs
  // Inputs don't have name/id attributes, so we select by type and position

  // Find all text inputs (first one should be username)
  const textInputs = page.locator('input[type="text"]');
  await textInputs.first().waitFor({ state: 'visible', timeout: 5000 });
  await textInputs.first().fill(username);

  // Find password input
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.first().waitFor({ state: 'visible', timeout: 5000 });
  await passwordInput.first().fill(password);

  // Click "Log In" button
  const loginButton = page.locator('button:has-text("Log In"), button:has-text("تسجيل الدخول")').last();
  await loginButton.click();

  // Wait for navigation with longer timeout for form submission
  await page.waitForURL(/\/#\/home/, { timeout: 10000 });
  await waitForAppReady(page);

  // Skip tutorial if it appears
  await skipTutorialIfPresent(page);
}

// Register new user
export async function registerUser(page: Page, userData: ReturnType<typeof generateTestData>) {
  // Start from landing page
  await page.goto('/');
  await waitForAppReady(page);

  // Click the Mshkltk logo to go to login page
  const logoButton = page.locator('button[aria-label="Enter Mshkltk"]');
  // Wait for button to be enabled (animation might have it disabled initially)
  await page.waitForTimeout(2000);
  await logoButton.click({ timeout: 10000 });
  await page.waitForURL(/\/#\/login/, { timeout: 10000 });
  await waitForAppReady(page);

  // Wait 2 seconds before clicking globe icon (as per user instructions)
  await page.waitForTimeout(2000);

  // NOW set language to English after we're on the login page
  await setLanguageToEnglish(page);

  // STAGE 1: Click "Sign In or Create Account" button to reveal the form
  const signInButton = page.locator('button:has-text("Sign In or Create Account"), button:has-text("تسجيل الدخول")');
  await signInButton.waitFor({ state: 'visible', timeout: 5000 });
  await signInButton.click();
  await page.waitForTimeout(500); // Wait for form animation

  // STAGE 2: Click "Create New Account" link (visible at bottom after form appears)
  const signupLink = page.locator('a:has-text("Create New Account"), a:has-text("إنشاء حساب جديد")');
  await signupLink.waitFor({ state: 'visible', timeout: 5000 });
  await signupLink.click();

  await page.waitForURL(/\/#\/signup/, { timeout: 5000 });
  await waitForAppReady(page);

  // Fill registration form
  // Form has: First Name, Last Name (side by side), Username, Password, Confirm Password
  // All inputs are type="text" or type="password" without name attributes
  // They're in order: firstName (0), lastName (1), username (2), password (0), confirmPassword (1)

  const textInputs = page.locator('input[type="text"]');
  const passwordInputs = page.locator('input[type="password"]');

  // Wait for form to be visible
  await textInputs.first().waitFor({ state: 'visible', timeout: 5000 });

  // Fill text fields by position
  await textInputs.nth(0).fill(userData.firstName); // First Name
  await textInputs.nth(1).fill(userData.lastName); // Last Name
  await textInputs.nth(2).fill(userData.username); // Username

  // Fill password fields
  await passwordInputs.nth(0).fill(userData.password); // Password
  await passwordInputs.nth(1).fill(userData.password); // Confirm Password

  // Click "Create" button
  const createButton = page.locator('button:has-text("Create"), button:has-text("إنشاء")');
  await createButton.click();

  // Wait for redirect to home page
  await page.waitForURL(/\/#\/home/, { timeout: 10000 });
  await waitForAppReady(page);

  // Skip tutorial if it appears
  await skipTutorialIfPresent(page);

  // Should now be on home page
  await page.waitForURL(/\/#\/home/, { timeout: 5000 }).catch(() => { });

  // Save credentials for future tests
  saveTestCredentials(userData.username, userData.password, userData.email);
  await waitForAppReady(page);

  return userData;
}

// Super Admin Login
export async function loginAsSuperAdmin(page: Page) {
  await page.goto('/#/superadmin/login');
  await waitForAppReady(page);

  // Set language to English
  await setLanguageToEnglish(page);

  // Fill credentials
  await page.fill('input[type="text"], input[name="username"]', 'miloadmin');
  await page.fill('input[type="password"], input[name="password"]', 'admin123');

  // Submit
  await page.click('button[type="submit"]');

  // Wait for dashboard (hash router)
  await page.waitForURL(/\/#\/superadmin\/dashboard/, { timeout: 10000 });
  await waitForAppReady(page);
}

// Portal Login (requires portal user to be created first)
export async function loginAsPortal(page: Page, username: string, password: string) {
  await page.goto('/#/portal/login');
  await waitForAppReady(page);

  // Set language to English
  await setLanguageToEnglish(page);

  // Fill credentials
  await page.fill('input[type="text"], input[name="username"]', username);
  await page.fill('input[type="password"], input[name="password"]', password);

  // Submit
  await page.click('button[type="submit"]');

  // Wait for dashboard (hash router)
  await page.waitForURL(/\/#\/portal\/dashboard/, { timeout: 10000 });
  await waitForAppReady(page);
}

// Create a portal user via super admin
export async function createPortalUser(page: Page, municipality: string = 'Amman') {
  const userData = generateTestData();
  const portalUsername = `portal_${userData.username}`;

  await loginAsSuperAdmin(page);

  // Navigate to users page (hash router)
  await page.goto('/#/superadmin/users');
  await waitForAppReady(page);

  // Click create user button - flexible selector
  await page.click('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), button:has-text("إضافة")');
  await page.waitForTimeout(1000);

  // Fill form - flexible selectors
  await page.fill('input[name="username"], input[placeholder*="username" i]', portalUsername);
  await page.fill('input[type="email"], input[name="email"]', userData.email);
  await page.fill('input[name="password"], input[placeholder*="password" i]', userData.password);

  // Select municipality - try English first, fallback to Arabic
  const municipalitySelect = page.locator('select[name="municipality"], select');
  const hasSelect = await municipalitySelect.isVisible().catch(() => false);
  if (hasSelect) {
    try {
      await municipalitySelect.selectOption({ label: municipality });
    } catch {
      await municipalitySelect.selectOption({ label: 'عمان' });
    }
  }

  // Set role to portal
  const roleSelect = page.locator('select[name="role"]');
  const hasRoleSelect = await roleSelect.isVisible().catch(() => false);
  if (hasRoleSelect) {
    await roleSelect.selectOption({ value: 'portal' });
  }

  // Set access level to read_write
  const accessSelect = page.locator('select[name="portal_access_level"], select[name="accessLevel"]');
  const hasAccessSelect = await accessSelect.isVisible().catch(() => false);
  if (hasAccessSelect) {
    await accessSelect.selectOption({ value: 'read_write' });
  }

  // Submit - flexible selector
  await page.click('button[type="submit"]:has-text("Create"), button[type="submit"]:has-text("Add"), button[type="submit"]');

  // Wait for success
  await page.waitForTimeout(2000);

  return { username: portalUsername, password: userData.password, municipality };
}

// Submit a report
export async function submitReport(page: Page, reportData: {
  title: string;
  description: string;
  category: string;
  location?: { lat: number; lng: number };
}) {
  // First, go to home page and click the + button to start creating a report
  await page.goto('/#/home');
  await waitForAppReady(page);

  // Click the floating + button (teal circular button at bottom from BottomNav)
  // The button has aria-label="New Report" or "بلّغ" and contains FaPlus icon
  const addButton = page.locator('button[aria-label*="Report" i], button[aria-label*="بلّغ"], a[href*="/report/new"] button');
  await addButton.waitFor({ state: 'visible', timeout: 10000 });
  await addButton.click();

  // Wait for navigation to report form
  await page.waitForURL(/\/#\/report\/new/, { timeout: 10000 });
  await waitForAppReady(page);

  // WIZARD FLOW FOR "WITHOUT MEDIA": Type → Location → Details (NO category step!)

  // Step 1: Choose report type - Click "Without Media" button
  const withoutMediaButton = page.locator('button:has-text("Without Media"), button:has-text("بدون وسائط")');
  await withoutMediaButton.waitFor({ state: 'visible', timeout: 10000 });
  await withoutMediaButton.click();
  await page.waitForTimeout(1500);

  // Step 2: Location - Just click Next to use default location
  const locationNextButton = page.locator('button:has-text("Next"), button:has-text("التالي")').first();
  await locationNextButton.waitFor({ state: 'visible', timeout: 10000 });

  // If custom location provided, click on map first
  if (reportData.location) {
    const mapElement = page.locator('.leaflet-container');
    await mapElement.click({ position: { x: 200, y: 200 } });
    await page.waitForTimeout(500);
  }

  await locationNextButton.click();
  console.log('✅ Clicked Next on Location step');
  await page.waitForTimeout(2000);

  // Step 3: Details - Wait for the Details page to be visible
  // Check for "Details" heading or "Title" text
  await page.waitForSelector('text="Details", text="Title", text="Description"', { timeout: 10000 }).catch(() => { });
  console.log('✅ On Details step');
  await page.waitForTimeout(1000);

  // Find the title input - it's a regular input field
  const titleInput = page.getByRole('textbox').first();
  await titleInput.waitFor({ state: 'visible', timeout: 10000 });
  console.log('✅ Found title input');
  await titleInput.fill(reportData.title);
  await page.waitForTimeout(500);

  // Description textarea is below "Description" label
  const descTextarea = page.locator('textarea').first(); // First textarea on the page
  await descTextarea.waitFor({ state: 'visible', timeout: 5000 });
  await descTextarea.fill(reportData.description);
  await page.waitForTimeout(500);

  // Click "Select Category" button to open category modal
  const selectCategoryButton = page.locator('button:has-text("Select"), div:has-text("Select Category")').first();
  await selectCategoryButton.waitFor({ state: 'visible', timeout: 5000 });
  await selectCategoryButton.click();
  await page.waitForTimeout(1000);

  // Select the category from the modal
  const categoryOption = page.locator(`button:has-text("${reportData.category}"), div:has-text("${reportData.category}")`).first();
  await categoryOption.waitFor({ state: 'visible', timeout: 5000 });
  await categoryOption.click();
  await page.waitForTimeout(1000);

  // Final Step: Submit the report
  const submitButton = page.locator('button:has-text("Submit"), button:has-text("إرسال"), button:has-text("Send")').first();
  await submitButton.waitFor({ state: 'visible', timeout: 10000 });
  await submitButton.click();

  // Wait for success - should redirect to home or show success message
  await page.waitForTimeout(3000); // Give time for submission
  await waitForAppReady(page);
}

// Logout
export async function logout(page: Page) {
  // Click user menu
  await page.click('[data-testid="user-menu"]');
  await page.waitForTimeout(500);

  // Click logout - flexible selector
  await page.click('text=/Logout|Sign out|تسجيل الخروج/i, button:has-text("Logout"), a:has-text("Logout")');

  // Should redirect back to landing page or login
  await page.waitForTimeout(2000);
  await waitForAppReady(page);
}

// Check if element contains text (case-insensitive, Arabic-friendly)
export async function expectTextContains(page: Page, selector: string, text: string) {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  const content = await element.textContent();
  expect(content?.toLowerCase()).toContain(text.toLowerCase());
}

// Wait for API response
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp, timeout = 5000) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      const matches = typeof urlPattern === 'string'
        ? url.includes(urlPattern)
        : urlPattern.test(url);
      return matches && response.status() === 200;
    },
    { timeout }
  );
}

// Clear database (use with caution!)
export async function clearTestData(page: Page) {
  // This would require a backend endpoint for testing
  // For now, we'll handle cleanup manually or use transaction rollback
  console.log('Test data cleanup - implement if needed');
}
