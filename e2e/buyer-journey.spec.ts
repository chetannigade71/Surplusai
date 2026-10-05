import { test, expect, type Locator } from '@playwright/test';

/**
 * Buyer journey:
 * open published catalogue -> browse products -> add items to an enquiry
 * -> submit -> confirm it appears correctly in the admin leads inbox.
 *
 * Run (Windows cmd):
 *   set ADMIN_EMAIL=admin@example.com
 *   set ADMIN_PASSWORD=your-password
 *   npx playwright test buyer-journey --headed
 *
 * Optional env vars: CATALOGUE_SLUG (default "bagpacks"), CATALOGUE_TITLE.
 */

// ---- Adjust these to match your app ---------------------------------------
const SLUG = process.env.CATALOGUE_SLUG ?? 'bagpacks';

const CONFIG = {
  // Confirmed from page source: catalogues live at /catalogue/<slug>
  catalogueUrl: `/catalogue/${SLUG}`,
  catalogueTitle: new RegExp(process.env.CATALOGUE_TITLE ?? SLUG, 'i'), // <h1> text

  // Confirmed from page source: each product is an <article> with an <h3> name.
  productCard: 'article',

  // This catalogue only has 1 product. Raise it for catalogues with more.
  itemsToAdd: 1,

  // Button inside the enquiry box that is clicked after the product name.
  contactButtonName: /contact us/i,

  // Submit button of the enquiry form: <button type="submit">Send enquiry</button>
  submitButtonName: /send enquiry/i,

  // Enquiry form fields, by their real ids.
  fields: {
    name: '#contact-name',
    phone: '#contact-phone',
    // Referral person: replace with the exact id once you have it, e.g. '#referral-person'.
    // Until then this matches any input whose id/name contains "referral".
    referral: '[id*="referral" i], [name*="referral" i]',
  },

  // Minimum order quantity shown on the card (25 units for the bagpack).
  quantity: 25,

  // Login is /login (confirmed). The leads URL is a GUESS; the test tries to click a
  // "Leads"/"Enquiries" link after login first, and only falls back to this URL.
  adminLoginUrl: '/login',
  adminLeadsUrl: '/admin/leads',
};

const ADMIN = {
  email: process.env.ADMIN_EMAIL ?? '',
  password: process.env.ADMIN_PASSWORD ?? '',
};
// ---------------------------------------------------------------------------

test('buyer submits an enquiry and it appears in the admin leads inbox', async ({
  page,
  browser,
}) => {
  test.setTimeout(120_000);

  // Unique data so we can find exactly this enquiry in the admin inbox.
  const stamp = Date.now();
  const buyer = {
    name: `QA Buyer ${stamp}`,
    phone: `9${String(stamp).slice(-9)}`, // unique 10-digit number
    referral: `QA Referral ${stamp}`,
  };
  const selectedProducts: string[] = [];
  let enquiryBox: Locator | undefined; // the dialog opened from the product name

  // 1. Open the published catalogue -------------------------------------------
  await test.step('Open the published catalogue', async () => {
    await page.goto(CONFIG.catalogueUrl);
    await expect(
      page.getByRole('heading', { level: 1, name: CONFIG.catalogueTitle }),
    ).toBeVisible({ timeout: 30_000 }); // first dev-mode compile can be slow
    await expect(page.locator(CONFIG.productCard).first()).toBeVisible();
  });

  // 2. Browse products --------------------------------------------------------
  await test.step('Browse products', async () => {
    const cards = page.locator(CONFIG.productCard);
    expect(
      await cards.count(),
      `Catalogue "${SLUG}" needs at least ${CONFIG.itemsToAdd} product(s)`,
    ).toBeGreaterThanOrEqual(CONFIG.itemsToAdd);

    for (let i = 0; i < CONFIG.itemsToAdd; i++) {
      const card = cards.nth(i);
      await expect(card.getByRole('heading', { level: 3 })).toBeVisible();
      await expect(card.getByText(/Minimum Order Quantity/i)).toBeVisible();
    }
  });

  // 3. Add items to an enquiry -----------------------------------------------
  await test.step('Open the enquiry box from the product name', async () => {
    const cards = page.locator(CONFIG.productCard);

    // Clicking the product name (<h3>) opens the enquiry box.
    const card = cards.first();
    const heading = card.getByRole('heading', { level: 3 });
    const name = (await heading.innerText()).trim();
    selectedProducts.push(name);
    await heading.click();

    // The box should be a dialog/drawer. If the app navigates to the product
    // page instead, fall back to the whole page as the scope.
    const dialog = page.getByRole('dialog').first();
    await Promise.race([
      dialog.waitFor({ state: 'visible', timeout: 10_000 }),
      page.waitForURL(/\/product\//, { timeout: 10_000 }),
    ]).catch(() => {});

    if (await dialog.isVisible().catch(() => false)) {
      enquiryBox = dialog;
    }
    console.log('Enquiry box is a dialog:', Boolean(enquiryBox), '| URL:', page.url());

    // Soft check: don't stop here if the box doesn't repeat the product name.
    await expect
      .soft((enquiryBox ?? page).getByText(name).first())
      .toBeVisible({ timeout: 5_000 });

    // Find "Contact Us" anywhere (box or card), visible buttons only.
    // CSS-based on purpose: unlike getByRole, it still works if a modal marks
    // the rest of the page aria-hidden.
    const contactAll = page.locator('button:visible', { hasText: CONFIG.contactButtonName });
    const contactInBox = enquiryBox
      ? enquiryBox.locator('button:visible', { hasText: CONFIG.contactButtonName })
      : contactAll;

    console.log('Visible "Contact Us" buttons on page:', await contactAll.count());
    console.log('Visible "Contact Us" buttons in box:', await contactInBox.count());
    console.log('All visible buttons:', await page.locator('button:visible').allInnerTexts());
    await page.screenshot({ path: 'test-results/before-contact-click.png', fullPage: true });

    const target = (await contactInBox.count()) > 0 ? contactInBox.first() : contactAll.first();
    await target.scrollIntoViewIfNeeded();
    await target.click();
  });

  // 4. Submit the enquiry -----------------------------------------------------
  await test.step('Fill in and submit the enquiry', async () => {
    // Scope to the enquiry box only: the footer also has a newsletter form
    // with an "Email address" field and a hidden "Company" honeypot.
    // After "Contact Us" the form shows up in the same box or a new one. Match
    // whichever dialog/form contains the submit button (the footer's newsletter
    // form only has "Subscribe", so it never matches).
    const hasSubmit = page.getByRole('button', { name: CONFIG.submitButtonName });
    const form = page
      .getByRole('dialog')
      .filter({ has: hasSubmit })
      .or(page.locator('form').filter({ has: hasSubmit }))
      .last();
    await expect(form).toBeVisible({ timeout: 15_000 });

    for (const name of selectedProducts) {
      await expect(page.getByText(name).first()).toBeVisible();
    }

    // Fill each field by its own id (ids are unique on the page).
    await page.locator(CONFIG.fields.name).fill(buyer.name);
    await page.locator(CONFIG.fields.phone).fill(buyer.phone);

    const referral = page
      .locator(CONFIG.fields.referral)
      .or(page.getByLabel(/referral/i))
      .first();
    await referral.fill(buyer.referral);

    console.log('Filled:', buyer);

    await form.getByRole('button', { name: CONFIG.submitButtonName }).click();

    await expect(
      page
        .getByText(/thank you|enquiry (has been )?(sent|submitted|received)|received your enquiry/i)
        .first(),
    ).toBeVisible({ timeout: 15_000 });
  });

  // 5. Confirm it appears in the admin leads inbox ---------------------------
  await test.step('Confirm the lead appears in the admin inbox', async () => {
    if (!ADMIN.email || !ADMIN.password) {
      throw new Error(
        'Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables to run the admin check.',
      );
    }

    // Separate browser context so the admin session is isolated from the buyer's.
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();

    try {
      await adminPage.goto(CONFIG.adminLoginUrl);
      console.log('Login page URL:', adminPage.url());

      await adminPage
        .locator('input[type="email"], input[name="email"], input[name="username"], #email, #username')
        .or(adminPage.getByLabel(/email|username/i))
        .first()
        .fill(ADMIN.email);
      await adminPage.locator('input[type="password"]').first().fill(ADMIN.password);
      await adminPage
        .locator('button[type="submit"]')
        .or(adminPage.getByRole('button', { name: /sign in|log in|login/i }))
        .first()
        .click();

      // Login only counts as successful if we actually left the login page.
      await expect(adminPage, 'Admin login failed: still on the /login page').not.toHaveURL(
        /\/login/,
        { timeout: 15_000 },
      );
      console.log('After login, URL:', adminPage.url());
      console.log(
        'Links after login:',
        await adminPage
          .locator('a:visible')
          .evaluateAll((els) => els.map((e) => `${(e.textContent ?? '').trim()} -> ${e.getAttribute('href')}`)),
      );

      // Go to the leads inbox: click a "Leads"/"Enquiries" link if there is one,
      // otherwise use the configured URL.
      const leadsLink = adminPage.getByRole('link', { name: /leads|enquir|inbox/i }).first();
      if (await leadsLink.isVisible().catch(() => false)) {
        await leadsLink.click();
        await adminPage.waitForLoadState('domcontentloaded');
      } else {
        await adminPage.goto(CONFIG.adminLeadsUrl);
      }
      console.log('Leads page:', adminPage.url(), '| title:', await adminPage.title());
      console.log('Leads page H1s:', await adminPage.locator('h1').allInnerTexts());
      console.log('Leads page links:', await adminPage.locator('a:visible').allInnerTexts());
      console.log(
        'Leads page text (first 1500 chars):\n',
        (await adminPage.locator('body').innerText()).slice(0, 1500),
      );
      await adminPage.screenshot({ path: 'test-results/admin-leads.png', fullPage: true });

      // Find the lead by its unique name anywhere on the page (not tied to a
      // table/list structure).
      const leadEntry = adminPage.getByText(buyer.name).first();

      // Reload until the new lead shows up (covers short processing delays).
      await expect(async () => {
        await adminPage.reload();
        await expect(leadEntry).toBeVisible({ timeout: 2_000 });
      }).toPass({ timeout: 20_000 });

      // Open the lead and verify the details
      await leadEntry.click();

      await expect(adminPage.getByText(buyer.name).first()).toBeVisible();

      // Phone may be formatted in the inbox (spaces, dashes, +91), so match loosely.
      const phoneLoose = new RegExp(buyer.phone.split('').join('[\\s-]?'));
      await expect.soft(adminPage.getByText(phoneLoose).first()).toBeVisible();
      await expect.soft(adminPage.getByText(buyer.referral).first()).toBeVisible();
      for (const name of selectedProducts) {
        await expect(adminPage.getByText(name).first()).toBeVisible();
      }
    } finally {
      await adminContext.close();
    }
  });
});