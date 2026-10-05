# Write-up

Bullet points are fine. We are not marking your English.

---
For Task 2 — Unit and integration tests
## 1. Strategy

I first identified the areas where a bug would have the highest business impact, and then focused my Vitest tests on those areas instead of trying to test the entire application.
Identify high-risk business logic
Test the expected/normal behaviour
Test invalid inputs
Test important boundary conditions


## 2. The riskiest part of this product

## The Riskiest Part of This Product

The riskiest parts of the product are the areas containing critical business logic:

Price and discount calculation - incorrect calculations can result in incorrect customer-facing prices and potential financial impact.
Spreadsheet import and validation - an incorrect mapping or validation issue could introduce incorrect data across multiple records at once.
Catalogue lifecycle - incorrect Draft, Published, or Expired status could make catalogues unavailable when they should be active, or available when they should not be.
Enquiry validation - invalid or incomplete enquiry data could enter the system and affect the quality of customer information.

Because these areas can affect pricing, data integrity, catalogue availability, and customer enquiries, they were given the highest testing priority.

If you had one week and could only protect one area, which would it be? What
goes wrong if nobody tests it?

If I had only one week and could protect one area, I would focus on price and discount calculation.
This is because an incorrect price or discount can directly affect what customers see and what they are charged.

If nobody tests it, the following could happen:

Customers may see incorrect prices.
Discounts may be calculated incorrectly.
A product could be sold for less or more than the intended price.
Incorrect pricing could affect revenue and customer trust.
Boundary cases such as 0% or 100% discounts could produce unexpected results.

## 3. What I left out, and why

UI styling and layout these are visual concerns and are better tested through UI or visual testing.
Every UI component and page testing every component would increase effort without providing the same level of risk coverage.
Third-party library internals I focused on how our application uses these libraries rather than testing the libraries themselves.
Full end-to-end workflows these are slower and more expensive to maintain, so I focused on unit and integration tests for critical business logic.
Exhaustive edge-case combinations I covered important boundaries and invalid inputs instead of trying to test every possible combination.

I left these areas out intentionally so that the available testing effort could be focused on the business logic where a defect would have the greatest impact.

## 4. AI tool usage

## AI Tool Usage

I used **ChatGPT** as an AI assistant during the testing task.

I used it for:

Understanding how Vitest works and how to install and run it.
Planning a risk-based testing strategy instead of trying to test the entire application.
Identifying important test scenarios for:

  Price and discount calculation
  Spreadsheet import mapping and validation
  Draft / Published / Expired catalogue lifecycle
  Enquiry validation
Creating initial test-case structures and Vitest examples.
Helping structure the `WRITEUP.md` sections, including what to cover and what to deliberately leave uncovered.

I did not use the AI-generated test examples blindly. I reviewed and adapted the suggestions to match the application's actual requirements and business logic.

I also changed the initial suggestions by focusing the test effort on high-risk business behaviour, adding negative and boundary scenarios, and deliberately excluding low-value areas such as UI styling, third-party library internals, and exhaustive end-to-end coverage.

The AI was used as a support tool for planning, learning, and generating starting points; the final test scope and implementation decisions were reviewed and made based on the project requirements.


## 5. One thing this codebase gets wrong

## One Thing This Codebase Gets Wrong

From a quality point of view, the catalogue expiry logic needs stronger validation around date handling.

A catalogue with a future **Valid Until** date should remain active until that date is reached. Incorrect date comparison or boundary handling could cause a valid catalogue to be marked as expired too early.

### What I Would Change

I would:

Centralise the catalogue status/expiry calculation in one business-logic function.
Add unit tests for past, current, and future expiry dates.
Add boundary tests around the exact expiry date.
Make the date comparison behaviour explicit and consistent.
Ensure the UI uses the same business-logic result instead of implementing separate expiry calculations.

This would reduce the risk of inconsistent catalogue statuses and make the expiry behaviour easier to maintain and verify.


---
### Task 4  — The write-up

# Buyer journey E2E test: stability write-up

**Test:** `e2e/buyer-journey.spec.ts` (Playwright + TypeScript)
**Flow:** open published catalogue → open product enquiry box → Contact Us → fill and send enquiry → confirm the lead appears in the admin inbox.

## How I kept it stable

### Waiting
- **No fixed sleeps.** The script contains no `waitForTimeout`. Every wait is on a condition Playwright can check: an element becoming visible, a dialog opening, or a URL change.
- **Web-first assertions.** `expect(locator).toBeVisible()` retries automatically until the element is there, so the test adapts to slow renders instead of guessing a delay.
- **Explicit timeouts where the app is slow.** The first catalogue load gets 30 s, because the dev server compiles pages on first request. Everything else uses short, specific timeouts (5-15 s) so failures show up quickly.
- **Waiting for either outcome.** After clicking the product name, the test races "dialog visible" against "navigated to a product page", so it doesn't depend on one UI behaviour.
- **Polling for eventual consistency.** The admin inbox may not show a new lead instantly, so the check reloads the page and retries (`expect(...).toPass`) for up to 20 s instead of asserting once.
- **Failing loudly.** After admin login, the test asserts the URL actually left `/login`. An earlier version only checked it wasn't a guessed URL and passed falsely when login had failed.

### Selectors
- Prefer stable hooks: the real field ids (`#contact-name`, `#contact-phone`), roles (`heading`, `button`, `dialog`) and visible text ("Contact Us", "Send enquiry"), not CSS classes (these are long Tailwind strings that change often).
- **Scoped to the enquiry form.** The footer has a newsletter form with an email field and a hidden honeypot "Company" field. Scoping prevents the test from filling the wrong form.
- Relative URLs (`/catalogue/bagpacks`) resolve through `baseURL`, so the port is configured in one place.

### Test data
- **Unique per run.** Name, phone and referral are generated from `Date.now()` (for example `QA Buyer 1791052609714`). The admin check finds exactly this lead, so old leads or parallel runs can't cause a false pass.
- **Isolated sessions.** The admin check uses a separate browser context so its login can't leak into the buyer's session.
- **No secrets in code.** Admin credentials come from `ADMIN_EMAIL` / `ADMIN_PASSWORD` environment variables. The catalogue is selectable with `CATALOGUE_SLUG`.
- **Tolerant of formatting.** The phone check allows spaces or dashes, and it plus the referral check are soft assertions: a display-format difference is reported without hiding the main result.
- **Diagnostics.** The test is split into labelled steps and logs useful context (what opened, which buttons were visible, what the admin page contained). Playwright config already captures traces on first retry and screenshots on failure.

## Known weaknesses (what is not solved yet)
- **No cleanup.** Every run leaves a real lead in the database.
- **Depends on existing data.** It needs a published catalogue (`bagpacks`) with at least one product and a working admin account. If that data changes, the test fails for reasons unrelated to the feature.
- **One long test.** A failure in an early step hides the later steps.
- **Runs against `next dev`.** Dev mode is slower and less predictable than a production build.
- **Some selectors are still text-based** (button labels, the success message), so copy changes can break it.
- **Leftover `console.log` debugging** should be removed once the test is settled.

## What I would change to run on every pull request

1. **Test against a production build.** Run `next build && next start` in CI, not `next dev`, for speed and consistency.
2. **Controlled data.** Use a dedicated test database, created and seeded per run (Prisma migrate + a seed script) with a known published catalogue, product and admin user. Tests would no longer depend on whatever is in a shared environment.
3. **Clean up after each run.** Delete the created lead in `afterEach`/`afterAll` (through an API or Prisma helper), or throw the whole database away at the end of the job.
4. **Log in once.** Create the admin session in a Playwright `setup` project and reuse it via `storageState`, instead of logging in through the UI every time. Keep one dedicated test that checks the login screen itself.
5. **Add `data-testid` attributes** to the key elements (Contact Us button, enquiry form, submit button, success message, lead rows) so tests don't rely on wording or layout.
6. **Split the journey.** Small, independent tests (catalogue loads, enquiry validation, admin lists leads) plus one end-to-end smoke test, so a failure points directly at the broken area.
7. **Keep the PR run fast.** Chromium only on PRs, with the full browser matrix nightly. Cache the Playwright browsers, run in parallel or shard if the suite grows, and keep a strict time budget.
8. **Handle flakiness deliberately.** Keep one retry in CI (already configured) with traces and screenshots uploaded as artifacts. Track tests that only pass on retry and fix them rather than adding more retries.
9. **Stub external side effects.** Disable or mock real emails, WhatsApp messages and analytics during tests so a PR run never contacts real customers.
10. **Make it a required check.** Secrets (admin login) are stored in CI secrets, and a failing run blocks the merge.



# QA Assessment Write-up

## 1. My strategy

I focused first on the areas where incorrect behaviour could affect catalogue publishing, customer enquiries, and access control.

My main coverage was:

- Spreadsheet import and mapping validation.
- Catalogue lifecycle:
  - Draft
  - Published
  - Expired
- Price and discount calculation.
- Enquiry validation.
- Admin and staff access control.
- API access for signed-out and unauthorized users.
- One end-to-end buyer journey using Playwright:
  - Open published catalogue
  - Browse products
  - Add products to an enquiry
  - Submit the enquiry
  - Verify the enquiry in the admin leads inbox.

I prioritized these areas because they are part of the main business flow. A failure in catalogue publishing, enquiry submission, pricing, or authorization could affect customers or internal users.

---

## 2. The riskiest part of this product

The riskiest area is the complete catalogue-to-enquiry flow.

A buyer needs to see the correct published catalogue and products, add products to an enquiry, and successfully submit the enquiry. The resulting enquiry also needs to appear correctly for the admin user.

If this area is not tested properly:

- Buyers may be unable to submit enquiries.
- The wrong products or quantities could be submitted.
- Enquiries could be missing from the admin leads inbox.
- Incorrect pricing or catalogue information could reach the customer.
- A published or expired catalogue could be exposed incorrectly.

If I had one week and could protect only one area, I would focus on this end-to-end business flow, together with the authorization checks around it.

---

## 3. What I left out

I deliberately did not try to automate every possible combination.

Examples of areas left out or kept at lower priority:

- Large numbers of browser/device combinations.
- Extensive visual/UI testing.
- Every possible invalid input combination.
- Performance and load testing.
- Full mobile automation.
- Every possible catalogue/product combination.
- Rare edge cases that are not part of the main business flow.

The reason was to keep the test suite focused and reliable rather than creating many tests that are difficult to maintain or become flaky.

For the Playwright task, I focused on one complete buyer journey because the requirement specifically asks for one reliable end-to-end test.

---

## 4. My AI usage

I used AI assistance during the assessment for test design, debugging, and writing test code.

Specifically:

- I used ChatGPT to help understand the assignment requirements and break the work into smaller testing tasks.
- I used ChatGPT to draft and refine Vitest test cases for catalogue, enquiry, pricing, and access-control scenarios.
- I used ChatGPT to help draft the Playwright buyer journey.
- I used AI to help troubleshoot Playwright/test-runner configuration and selector issues.
- I reviewed the generated code and adapted it to the actual project structure instead of blindly using generated code.
- I used AI to help structure this write-up and bug reports.

I treated AI-generated code as a starting point and verified the behaviour against the application.

---

## 5. One thing this codebase gets wrong

One quality issue I noticed is that some UI actions are not consistently accessible or clickable through clear user-facing controls.

For example, I found issues where controls such as the product-page three-dot menu and Settings icon were not clickable for the expected users.

This makes the application harder to use and also makes automated testing more difficult because tests need reliable, accessible controls.

I would improve this by:

- Using semantic buttons/links for interactive controls.
- Providing accessible names for buttons and icons.
- Adding stable `data-testid` attributes where appropriate for important test targets.
- Ensuring disabled/unauthorized states are clearly represented.
- Adding automated tests for important navigation and authorization behaviour.

This would improve both usability and testability without coupling tests to fragile CSS selectors or page layout.


