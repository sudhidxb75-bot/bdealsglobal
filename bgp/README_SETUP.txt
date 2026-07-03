Bdeals Global Properties - Real Estate Mediator Website Package V1
========================================================

This package contains a complete low-cost website and backend model for a real estate mediator platform.

Main concept
------------
The website connects property sellers and buyers through a controlled platform. Buyers and sellers do not directly contact each other. Seller phone numbers, buyer details, exact property address, documents, negotiation limits, and commission details remain protected in the backend.

Package contents
----------------
1. Public website files
   - index.html
   - buy-property.html
   - sell-property.html
   - post-requirement.html
   - builders.html
   - how-it-works.html
   - services.html
   - contact.html
   - property-details.html
   - css/style.css
   - js/config.js
   - js/main.js

2. Backend files
   - apps-script/Code.gs

3. Google Sheets reference
   - google-sheets/*.csv header files

4. Documentation
   - docs/WEBSITE_ARCHITECTURE.txt
   - docs/PRIVACY_POLICY_DRAFT.txt

First setup steps
-----------------
1. Upload the website files to GitHub Pages.
2. Create a new Google Sheet.
3. Open Extensions > Apps Script.
4. Paste the content of apps-script/Code.gs.
5. Save the Apps Script project.
6. Run setupSheets() once.
7. Authorize the script.
8. Deploy > New deployment > Web app.
9. Select:
   Execute as: Me
   Who has access: Anyone
10. Copy the Web App URL.
11. Open js/config.js.
12. Paste the Web App URL here:
    const APPS_SCRIPT_URL = "YOUR_WEB_APP_URL";
13. Replace placeholder phone/email/company details in the website files.
14. Re-upload the revised files to GitHub Pages.

How to make a property visible on the website
---------------------------------------------
In the Properties sheet:
1. Set VerificationStatus = Verified
2. Set PublicStatus = Show
3. Set Status = Listed
4. Set Featured = Yes if it should appear on the home page.
5. Fill public-safe fields only:
   PropertyCode, PropertyType, Area, Locality, SizeText, PublicPriceRange, Description, Highlights, ImageURL.

Do not put private details in public fields.

Important compliance note
-------------------------
Before public launch, consult a legal advisor regarding real estate brokerage rules, RERA requirements where applicable, privacy policy, terms of service, commission agreements, and document handling.


Backend-controlled sliding banners
----------------------------------
This version includes a home page banner slider controlled from the Google Sheets backend.

A new sheet named Banners is included with these fields:
BannerID, Title, Subtitle, Badge, ButtonText, ButtonLink, ImageURL, SortOrder, StartDate, EndDate, Status, Remarks.

How to show a banner:
1. Open the Banners sheet.
2. Add banner title, subtitle, button text, button link, and image URL.
3. Set SortOrder as 1, 2, 3 etc.
4. Set Status = Active.
5. Optional: use StartDate and EndDate to schedule banners.
6. Refresh the website.

Recommended banner image size:
1920 x 520 px for desktop.
For mobile-safe design, keep important text in the center-left area and avoid placing critical text inside the image itself.



V1.2 updates
------------
This version includes:

1. Country selection with location
   - Country dropdown is loaded from the Countries sheet.
   - Forms now include country and location fields.

2. Customer signup/login
   - Visible public page: customer-login.html
   - Customer dashboard: customer-dashboard.html
   - Customer session is stored in browser localStorage for the MVP version.
   - Backend sheet: Customers

3. Refer & Win
   - Visible public page: refer-and-win.html
   - Logged-in customers can also submit referrals from customer-dashboard.html.
   - Backend sheet: Referrals
   - Admin can update Status, RewardStatus, and RewardAmount.

4. Hidden seller login/dashboard
   - Direct seller login URL: seller-login.html
   - Direct seller dashboard URL: seller-dashboard.html
   - These are not linked in the public website menu.
   - Seller dashboard shows only the seller's own submitted property status.
   - Seller passwords are stored as SHA-256 hashes in Google Sheets for this MVP version.

5. Admin dashboard
   - Admin remains hidden from frontend.
   - Admin control is through Google Sheets and Apps Script menu only.

Important security note
-----------------------
This is a low-cost MVP login system using Google Sheets and Apps Script. For a live real estate marketplace, upgrade later to OTP login, Firebase Auth, Supabase Auth, or a proper server-side authentication system.



V1.2 deployment notes
---------------------
After pasting apps-script/Code.gs:
1. Run setupSheets() once.
2. Use the Apps Script menu "Real Estate Mediator".
3. Run Seed Sample Banners if needed.
4. Run Seed Sample Properties if needed.
5. Deploy as Web App.
6. Paste the Web App URL in js/config.js.

Hidden dashboard URLs:
- Seller login: seller-login.html
- Seller dashboard: seller-dashboard.html

These seller pages are intentionally not linked in the public menu.
Admin dashboard remains fully hidden from frontend and is managed through Google Sheets only.



V1.3 updates
------------
1. Header menu layout
   - Revised to match the attached wide desktop header style.
   - Main menu remains clean: Home, Buy Property, Sell Property, Post Requirement, Builders, How It Works, Services, Contact.
   - Customer Login / Signup is now shown as a login icon on the right side of the header.
   - Refer & Win is moved away from the header and placed as a homepage CTA and separate page.

2. Portal structure
   - Customer portal: visible through the login icon.
   - Seller portal: hidden from frontend menu, accessible only by direct URL:
     seller-login.html
     seller-dashboard.html
   - Admin portal/backend: remains hidden from frontend and is managed through Google Sheets + Apps Script.

3. Seller property upload workflow
   - Sellers can login and submit property details from seller-dashboard.html.
   - Sellers can paste property photo URLs and document URLs.
   - New seller-submitted properties are saved as:
     VerificationStatus = Pending
     PublicStatus = Hide
     Status = Pending admin approval
   - Admin must verify, edit, approve, and publish by changing:
     VerificationStatus = Verified
     PublicStatus = Show
     Status = Listed

4. Backend proposal workflow
   - New backend sheet: Proposals.
   - Admin can prepare proposals to clients from the backend.
   - Fill a row in the Proposals sheet, select that row, then use:
     Real Estate Mediator > Create Proposal Document
   - The system creates a Google Doc proposal and saves the document URL in ProposalDocURL.
   - Proposal status, sent date, follow-up date, client response, deal ID, and remarks can be tracked in the same sheet.



V1.3.1 update
-------------
- Reduced header brand font size.
- Reduced menu font size.
- Reduced menu spacing.
- Improved desktop menu alignment.
- Customer login remains as an icon on the right side.



V1.3.2 reports, print sheets, and archiving
-------------------------------------------
Admin-only backend tools added to the Apps Script menu:

1. Generate Report Dashboard
   Creates / refreshes the Report Dashboard sheet with counts for:
   - Total properties
   - Pending property verification
   - Published properties
   - Total buyers and sellers
   - New enquiries
   - Buyer requirements
   - Referrals and reward status
   - Proposals
   - Deals and commission status

2. Generate Print Sheets
   Creates print-ready working sheets:
   - Print - New Enquiries
   - Print - Property Review
   - Print - Buyer Requirements
   - Print - Site Visits
   - Print - Proposals

3. Clear Print Sheets
   Clears only the print sheets and keeps the original source data safe.

4. Archive Closed / Lost Records
   Moves closed, sold, rejected, lost, completed, or archived records from active sheets into archive sheets.
   Source records are removed only after being copied to the archive sheets.
   Archive activity is tracked in Archive Log.

Important:
- This package does not permanently delete active business data.
- Print sheets are temporary working sheets and can be regenerated any time.
- Archive sheets preserve old records for future reference.



V1.3.3 backend connection fix
-----------------------------
This version fixes the frontend backend connection logic.

Fixed:
- Restored fallback countries.
- Restored fallback banners.
- Added complete page initialization.
- Country dropdown now loads on all pages.
- Banner slider now attempts backend loading.
- Customer dashboard and seller dashboard initialization restored.
- Added hidden backend test page:
  backend-test.html

How to test backend:
1. Open js/config.js.
2. Paste your Apps Script Web App URL:
   const APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
3. Upload the website files again.
4. Open:
   yourdomain.com/backend-test.html
5. Click Run Backend Tests.

Correct Apps Script deployment:
- Deploy > New deployment > Web app
- Execute as: Me
- Who has access: Anyone
- Copy the /exec Web App URL, not the script editor URL.



V1.3.4 visible country/location selectors
-----------------------------------------
The backend country API was working, but the visible country selector was not available on the main property search area.

Added:
- Homepage Country + Location search bar.
- Buy Property page Country + Location filters.
- Country dropdowns are loaded from the backend Countries sheet.
- Properties API now returns Country and Location fields for filtering.

To test:
1. Open backend-test.html and confirm Countries test is green.
2. Open index.html and check Select Your Location section.
3. Open buy-property.html and check Country dropdown at the top of property listing.



V1.3.5 PWA / Install App update
-------------------------------
The website is now a Progressive Web App.

Added:
- manifest.webmanifest
- service-worker.js
- offline.html
- assets/icons app icons
- Install App button in the header
- Browser install prompt handling
- iPhone/iPad fallback instruction
- Offline page fallback

Important deployment notes:
1. PWA install works properly only on HTTPS or localhost.
2. GitHub Pages is HTTPS, so it is suitable.
3. Upload these new files also:
   - manifest.webmanifest
   - service-worker.js
   - offline.html
   - assets/icons/*
4. After upload, hard refresh the browser.
5. Open Chrome DevTools > Application > Manifest to verify installability.
6. On iPhone, use Safari Share > Add to Home Screen.



V1.3.6 top country selector
---------------------------
Added a compact country selector in the top header area for both desktop and mobile.

How it works:
- The top selector loads country data from the backend Countries sheet.
- Selected country is saved in browser localStorage.
- Homepage country search and Buy Property country filter are automatically synced.
- On Buy Property page, changing the top country selector filters the property list immediately.



V1.3.7 country sync verification
--------------------------------
Country selection sync has been tightened and verified.

Confirmed behavior:
1. Top country selector syncs to homepage country selector.
2. Homepage country selector syncs back to top country selector.
3. Top country selector syncs to Buy Property country filter.
4. Buy Property country filter syncs back to top country selector.
5. On Buy Property page, changing the top country selector filters properties immediately.
6. Selected country is saved in browser localStorage and reused across pages.

Technical note:
The sync is handled by:
- setSelectedCountry()
- syncSelectedCountryToSearch()
- initCountrySyncHandlers()
- handleTopCountryChange()



V1.3.8 top and bottom menu update
---------------------------------
Added:
- Top menu retained.
- New bottom menu added for quick navigation.
- Bottom menu includes Home, Buy, Sell, Requirement, and Login.
- Install App option is now always shown as a visible button.
- Customer Login / Signup is now shown as a visible button in the header.
- On smaller mobile screens, Install App and Login / Signup buttons become compact icons to save space.



V1.3.9 layout update
--------------------
Updated layout as requested:

1. Country selector moved to the top utility bar.
2. Sell Your Property button placed next to the country selector.
3. Install App remains a clear visible button in the top utility bar.
4. Company name, header menu, and Login / Signup button are kept together in the main header row.
5. Bottom menu is forced visible in normal browser mode and PWA standalone app mode.
6. Service worker cache name updated to bgp-pwa-v1-3-9 so the installed app refreshes after upload.

After uploading:
- Open the site once in browser and hard refresh.
- For already installed PWA, close and reopen the app.
- If old layout still appears, clear site data or reinstall the PWA because service workers may cache older files.



V1.4.0 header layout update
---------------------------
Updated as requested:
- Company logo and company name moved to the top row.
- Country selector, Sell Your Property, Install App, and login icon are in the top row.
- Customer login/signup is shown as icon only.
- Main menu is kept in a separate header row below the company top row.
- Bottom menu remains visible in website and PWA app mode.
- Service worker cache changed to bgp-pwa-v1-4-0 to refresh installed app layout.



V1.4.1 form submission backend fix
----------------------------------
Fixed the issue where forms showed:
"Backend returned non-JSON response..."

Reason:
- Backend GET tests were working.
- Some form submissions through POST were receiving a Google HTML page instead of JSON.

Fix:
- Added Apps Script GET submit route:
  action=submit
- Frontend form submissions now use the safer GET route.
- Existing doPost route is still kept as backup.
- backend-test.html now also tests the Submit Route.
- Service worker cache changed to bgp-pwa-v1-4-1.

After updating:
1. Replace Apps Script Code.gs with the new Code.gs.
2. Deploy > Manage deployments > Edit > New version > Deploy.
3. Copy the /exec Web App URL into js/config.js if it changed.
4. Upload all website files.
5. Open backend-test.html and run tests. Submit Route should show green.
6. Hard refresh. If installed app still shows old behavior, reinstall the PWA.



V1.4.2 backend save verification
--------------------------------
This version confirms exactly where backend data is saved.

Added:
- Every successful public form submission now returns:
  - spreadsheet name
  - spreadsheet URL
  - target sheet name
  - target row number
  - saved record ID
- Form success message now shows:
  Saved to backend: Sheet Name, row number.
- backend-test.html includes:
  - Submit Route test
  - Debug Counts test
- Debug Counts returns current data row counts for:
  Contact Enquiries, Enquiries, Buyer Requirements, Builder Enquiries, Sellers, Properties, Customers, Referrals, Activity Log.
- Apps Script now repairs blank/missing sheet headers automatically.
- Service worker cache changed to bgp-pwa-v1-4-2.

Important:
If Submit Route is green but you do not see records in your expected sheet, check the returned targetSheet and spreadsheetUrl. You may be checking a different Google Sheet, or the form may be saving to Contact Enquiries instead of Enquiries depending on the page/form used.

After updating:
1. Replace Apps Script Code.gs.
2. Deploy as a new Web App version.
3. Upload all website files.
4. Open backend-test.html.
5. Run tests.
6. Check the Submit Route response: targetSheet and targetRow.
