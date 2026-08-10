import { test, expect, type Page } from '@playwright/test';

/**
 * End-to-end role redirect tests.
 *
 * Credentials come from environment variables so no secrets live in the repo:
 *   E2E_SUPER_ADMIN_EMAIL / E2E_SUPER_ADMIN_PASSWORD
 *   E2E_ADMIN_EMAIL       / E2E_ADMIN_PASSWORD
 *   E2E_MEMBER_EMAIL      / E2E_MEMBER_PASSWORD
 *
 * Run with:  npx playwright test
 */

type RoleCase = {
  role: 'super_admin' | 'admin' | 'member';
  emailVar: string;
  passwordVar: string;
  expectedPath: string;
  marker: RegExp;
};

const cases: RoleCase[] = [
  {
    role: 'super_admin',
    emailVar: 'E2E_SUPER_ADMIN_EMAIL',
    passwordVar: 'E2E_SUPER_ADMIN_PASSWORD',
    expectedPath: '/dashboard/super-admin',
    marker: /Gyms|Platform|Payments/i,
  },
  {
    role: 'admin',
    emailVar: 'E2E_ADMIN_EMAIL',
    passwordVar: 'E2E_ADMIN_PASSWORD',
    expectedPath: '/dashboard/admin',
    marker: /Members|Attendance|Dashboard/i,
  },
  {
    role: 'member',
    emailVar: 'E2E_MEMBER_EMAIL',
    passwordVar: 'E2E_MEMBER_PASSWORD',
    expectedPath: '/dashboard/m',
    marker: /Attendance|Payments|Profile/i,
  },
];

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: /sign in/i }).click();
}

async function expectNoErrorPage(page: Page) {
  const body = (await page.locator('body').innerText()).toLowerCase();
  expect(body).not.toContain("this page didn't load");
  expect(body).not.toContain('something went wrong');
  expect(body.trim().length).toBeGreaterThan(20);
}

for (const c of cases) {
  test(`${c.role} lands on ${c.expectedPath} without an error page`, async ({ page }) => {
    const email = process.env[c.emailVar];
    const password = process.env[c.passwordVar];
    test.skip(!email || !password, `${c.emailVar}/${c.passwordVar} not set`);

    const serverErrors: string[] = [];
    page.on('response', (r) => {
      if (r.status() >= 500) serverErrors.push(`${r.status()} ${r.url()}`);
    });

    await signIn(page, email!, password!);

    await page.waitForURL(new RegExp(`${c.expectedPath}`), { timeout: 30_000 });
    await page.waitForLoadState('networkidle');

    expect(page.url()).toContain(c.expectedPath);
    await expectNoErrorPage(page);
    await expect(page.getByText(c.marker).first()).toBeVisible();
    expect(serverErrors, `server errors: ${serverErrors.join(', ')}`).toHaveLength(0);

    // Refresh must keep the user on their dashboard (no redirect loop).
    await page.reload({ waitUntil: 'networkidle' });
    expect(page.url()).toContain(c.expectedPath);
    await expectNoErrorPage(page);

    // Visiting /dashboard routes to the role home.
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    expect(page.url()).toContain(c.expectedPath);
  });
}
