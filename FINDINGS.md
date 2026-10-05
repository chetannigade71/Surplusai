# Findings

One section per bug. Add or remove sections as needed — the headings are only a
starting point, not a form you have to fill in exactly.

---

## 1. Incorrect enquiry text displayed for 30-day and 7-day filters.  

**What happens**
Enquiry text remains static when switching between 30-day and 7-day filters.


**Steps to reproduce**

1.Log in to the application using valid Admin credentials.
2.Click the Last 30 Days button.
3.Observe the enquiry text displayed.
4.Click the Last 7 Days button.
5.Observe the enquiry text again.


**What should happen instead**
The enquiry text must be updating based on the selected date range.

**Impact — how bad is this, and why?**

Who is affected: Admin users viewing the Enquiries section.
Condition: Occurs when the admin selects Last 30 Days or Last 7 Days.
Business impact: The incorrect/static text can mislead admins about the selected enquiry date range and may cause confusion when reviewing enquiry data.
Data/security impact: No customer data, pricing information, or sensitive data is exposed or leaked.
Financial impact: No direct monetary loss is expected.
Severity: Medium, as the issue affects the accuracy and clarity of information displayed to admin users, but does not prevent them from using the application.

**Failing test**

`<path/to/your.test.ts>` — `<test name>`

---

## 2. **Unable to Logout from Product Pages – 3-Dot Menu Not Clickable for Admin and Staff Users**

**What happens**
Admin and staff users are unable to logout from product pages and 3-dot menu is not clickable.


**Steps to reproduce**

1.Log in to the application using valid Admin/Staff credentials.
2.Click on the Products page form left hand sidebar.
3.Observe that products page is opened.
4.Move the cursor down towards the 3-dot menu.
5.Observe that 3 dot menu is not clickable.


**What should happen instead**
The 3-dot menu should be clickable for both Admin and Staff users, and the **Logout** option should be visible and clickable so users can successfully log out.
 

**Impact — how bad is this, and why?**
Who is affected: Admin and Staff users accessing the Product pages.
Condition: Occurs when users attempt to open the 3-dot menu to access the Logout option.
Business impact: Users are unable to access the Logout option, which prevents them from properly ending their session and may cause confusion or inconvenience.
Data/security impact: No customer data, pricing information, or sensitive data is exposed or leaked.
Financial impact: No direct monetary loss is expected.
Severity: Medium, as the issue affects session management for Admin and Staff users, but does not prevent them from using the Product pages.

**Failing test**

`<path/to/your.test.ts>` — `<test name>`

## 3. **Unable to click on Setting icon from Product Pagesfor Admin and Staff Users**

**What happens**
Admin and staff users are unable to click on setting icon from product pages.


**Steps to reproduce**

1.Log in to the application using valid Admin/Staff credentials.
2.Click ont the Products page form left hand sidebar.
3.Observe that products page is opened.
4.Move the cursor down towards the settings icon.
5.Observe that settings icon is not clickable.


**What should happen instead**
The settings icon should be clickable for both Admin and Staff users, and the Settings page must be open.
 

**Impact — how bad is this, and why?**
Who is affected: Admin and Staff users accessing the Product pages.
Condition: Occurs when Admin or Staff users attempt to click the Settings icon.
Business impact: Users are unable to access the Settings page, which prevents them from viewing or managing available settings and may disrupt normal application workflows.
Data/security impact: No customer data, pricing information, or sensitive data is exposed or leaked.
Financial impact: No direct monetary loss is expected.
Severity: Medium, as the issue prevents Admin and Staff users from accessing the Settings page, but does not affect data integrity or cause data loss.

**Failing test**

`<path/to/your.test.ts>` — `<test name>`

## 4. **"1 enquiries" (no singular)**

**What happens**
The "New leads" card footer reads "1 enquiries in the last 30 days


**Steps to reproduce**

1.Log in to the application using valid Admin/Staff credentials.
2.Observe that Dashboard page is opened.
3.Read the footer of the "New leads" card (needs exactly 1 enquiry in the last 30 days, as today).


**What should happen instead**
1 enquiry in the last 30 days
 
**Impact — how bad is this, and why?**
Untidy. It makes the first screen look unfinished and costs nothing else.

## 5. Lead IDs look positional, not real database IDs (suspected)

**What happens**
 In the data behind the dashboard table, the **newest** lead (`ENQ-8253718`, created today) has `id: 1`, and the oldest has `id: 20`. IDs run backwards against creation time, which looks like array positions rather than database keys.

**Steps to reproduce**
 1.Log in to the application using valid Admin credentials.
 2.Right click on the page.
 3.View the page source and find the leads data (`"id":1,"reference":"ENQ-8253718"`)
 4.Compare ids with `createdAt`.

**Expected:** 
IDs are stable and unique, and a new enquiry never changes any other lead's ID.

**Impact — how bad is this, and why?**
Possible money impact.
If the row menu (status change, drawer) sends this `id` to the server, then when a new enquiry arrives the same ID points at a different lead. 
Staff could mark the wrong buyer as "contacted" or "qualified".

## 6. New Catalogue created Shows as Expired Despite Future Expiry Date in Catalogues.

**What happens**
When new catalogue item is created with future date but it still shows as expired in catalogues list.

**Steps to reproduce**

1.Log in to the application using valid Admin/Staff credentials.
2.Observe that Dashboard page is opened.
3.Click on Catalogues tab -> Catalogues page is open.
4.Click on + New Catalogue -> Fill all the required cataluge information & set Valid until fields as tommorrow date.
5.Click on proceed button -> Choose Products -> Click on Create Catalogue button.
6.Observe that catalogue is created -> Enable the Draft Toggle.
7.Observe that despite the future expiry date "Expired" status is getting display.

**Expected:** 
After creating the catalogue with Valid Until set to tomorrow's date, the catalogue should be displayed with an Active/Valid status and should not show "Expired" until the configured expiry date has passed.

**Impact — how bad is this, and why?**
Who is affected: Admin and Staff users managing Catalogues.
Condition: Occurs when a new Catalogue is created with a future Valid Until date, such as tomorrow's date.
Business impact: The incorrect "Expired" status may mislead users about the Catalogue's validity and can cause confusion when managing or publishing Catalogues.
Data/security impact: No customer data, pricing information, or sensitive data is exposed or leaked.
Financial impact: No direct monetary loss is expected, although incorrect catalogue status could potentially affect catalogue availability if the system treats it as expired.
Severity: Medium, as the issue displays incorrect catalogue status and may affect catalogue management, but does not cause data loss or security issues.

## 7. Two different enquiry reference formats.

 **What happens**
  The real submission is `ENQ-8253718` (7 digits) and all seed leads are `ENQ-24071` (5 digits).

  **Steps to reproduce**
  1.Log in to the application using valid Admin/Staff credentials. -> Dashboard page is open.
  2.Scroll down & read the Reference column.

  **Expected:** 
  One format, with unique references. These numbers are quoted to buyers and used to find enquiries.

  **Impact — how bad is this, and why?**
  Impact:Medium. 
  Two generators mean two collision-checking strategies. If a 5-digit generator collides with an existing reference, a buyer could be shown or matched to someone else's enquiry. Today it only looks inconsistent.

## 8. Staff User Can Access Admin Settings Page

**What happens**
Staff user can't access the admin settings page even the url is not changing when staff user is getting logged in.

**Steps to reproduce**
1.Log in to the application using valid Staff credentials.
2.Navigate directly to /admin/settings using the URL.
3.Observe that the Admin Settings page is accessible to the Staff user.

  **Expected:** 
  Staff users should not be able to access /admin/settings. They should be denied access or redirected to an appropriate page.

  **Impact — how bad is this, and why?**
Who is affected: Staff users and the application's admin-only settings.
Condition: Occurs when a Staff user directly navigates to /admin/settings using the URL.
Business impact: Staff users may gain access to admin-only settings that should be restricted to Admin users, potentially allowing unauthorized actions or configuration changes.
Data/security impact: This is an access-control/security issue because a Staff user can access an Admin-only page. The actual impact depends on what actions and data are available on the Settings page.
Financial impact: No direct monetary loss is expected, unless unauthorized settings changes affect business operations.
Severity: High, as an unauthorized Staff user can access an Admin-only area, indicating that role-based access control may not be properly enforced.


