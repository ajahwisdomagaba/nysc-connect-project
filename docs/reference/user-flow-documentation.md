# NYSC Connect: User Flow Documentation

*Version 1.0 (MVP)*

## Overview

The MVP has three roles: Corps Member, Landlord/Agent, and Admin. This document describes the main flow for each role, step by step, with the API call behind each step so Design, Frontend, Mobile, and Backend can check they agree.

| Role | Main flow |
| :---- | :---- |
| Corps Member | Register or log in, State, LGA, optional PPA, Home, Accommodation or Local Guide, Details, Save or Report |
| Landlord/Agent | Register, send documents, account verified, submit listing, admin review, published only if approved |
| Admin | Review account verifications, review listings, review reports |

Two rules apply everywhere. Account verification and listing approval are separate checks. Nothing a landlord or agent does can publish a listing without admin approval.

## Flow 1: Corps Member onboarding and location setup

**Welcome, Register or Login, Select State, Select LGA, Optional PPA, Location-based Home**

| Step | What the user does | What the system does |
| :---- | :---- | :---- |
| 1 | Opens the app and chooses Register or Login | Register: POST /auth/register. Login: POST /auth/login with phone and password. Both return a token. |
| 2 | Selects a State | GET /locations/states returns the pilot states (Lagos, Oyo). |
| 3 | Selects an LGA | GET /locations/lgas?state=... returns the LGAs for that State. |
| 4 | Enters a PPA, or skips | PPA is optional. The registration request needs State and LGA. The location can be updated later with PATCH /users/me. |
| 5 | Lands on Home | Home content is filtered by the saved State and LGA. GET /auth/me returns the saved location. |

Registration must never be blocked because the user does not know their PPA.

## Flow 2: Accommodation discovery

**Home, Accommodation, Search or Filter, Listing, Details, Save OR Report, Confirmation**

| Step | What the user does | What the system does |
| :---- | :---- | :---- |
| 1 | Opens Accommodation from Home | GET /accommodations with the user's state and lga. Only active and approved listings are returned. |
| 2 | Sets a price range or sort order | Same call with minPrice, maxPrice, and sort (newest, price\_asc, price\_desc). |
| 3 | Opens a listing | GET /accommodations/:id (login required). |
| 4 | Reads the details | Shows property type, annual rent, caution fee, agency fee, address, PPA proximity text, photos, property information, source, and last updated. A "may be outdated" label appears when the last update is older than 30 days. No verified badge is shown. |
| 5a | Saves the listing | POST /saved with item\_type accommodation and the listing id. The response returns a saved item id. |
| 5b | Reports the listing | POST /reports. See Flow 4\. |
| 6 | Sees a confirmation | A success message is shown. |

Empty state: if no listings match, show "No accommodation listings found for this location yet". Do not show a blank screen.

## Flow 3: Local Guide

**Home, Local Guide, Select Category, Location-filtered Information, Details, Save OR Report**

| Step | What the user does | What the system does |
| :---- | :---- | :---- |
| 1 | Opens the Local Guide | Login is required for all Local Guide calls. |
| 2 | Chooses a category | Categories: Transport, PPA Information, Health, Security and Safety, Food, Essential Services. GET /local-info/categories returns the exact values. |
| 3 | Sees entries for their location | GET /local-info with state, lga, and category. |
| 4 | Opens an entry | GET /local-info/:id. |
| 5 | Saves or reports the entry | POST /saved with item\_type local\_info, or POST /reports with target\_type local\_info. |

Empty state: if nothing has been added for the LGA, show that information is not available yet.

## Flow 4: Reporting

**Open item, Report, Select reason, Optional details, Submit, Confirmation, Admin review queue**

| Step | What the user does | What the system does |
| :---- | :---- | :---- |
| 1 | Opens a listing or Local Guide entry and chooses Report | The report is available on every listing and Local Guide entry. |
| 2 | Picks a reason | Outdated, Incorrect, Misleading, or Suspicious. The API also accepts scam, and stores it as scam. Only a stored scam report can trigger an automatic takedown. |
| 3 | Adds optional details and submits | POST /reports with target\_type (accommodation or local\_info), target\_id, reason, and details. The report is saved with status pending. |
| 4 | Sees a confirmation | A success message is shown. The report is never silently dropped. |
| 5 | (Admin) reviews it | See Flow 7\. |

## Flow 5: Saved items

| Step | What the user does | What the system does |
| :---- | :---- | :---- |
| 1 | Opens Saved | GET /saved returns the user's saved items. Saved items persist after logging in again. |
| 2 | Removes an item | DELETE /saved/:id. The id is the saved item's own id, not the listing's id. |

## Flow 6: Landlord/Agent verification and listing submission

**Register, Send documents, Pending Verification, Admin review, Verified, Submit listing, Pending Admin Review, Admin review, Approved and Published**

| Step | What the user does | What the system does |
| :---- | :---- | :---- |
| 1 | Registers as a landlord or an agent | POST /auth/register with role landlord or agent. verification\_status is not\_submitted. The user cannot post yet. |
| 2 | Uploads the verification documents: an identity document and a proof-of-authority document | POST /media/verification-documents, once per document, one image each (up to 5 MB). Each call returns a url. |
| 3 | Submits the documents together | POST /users/me/verification with id\_type, id\_document\_url, authority\_type, authority\_document\_url, meter number (utility bill only), and zero\_upfront\_fee\_agreed set to true. Status becomes pending. |
| 4 | Waits for review | An admin reviews by hand. GET /users/me/verification shows the packet and status. |
| 5a | Is verified | Status becomes verified. The user can now post. |
| 5b | Is rejected | Status becomes rejected, with a reason. The user submits a new packet, which sets the status back to pending. A verified account cannot submit again. |
| 6 | Uploads photos (optional, up to 3\) and submits a listing | POST /media/accommodation-images, then POST /accommodations. The listing is saved with status active and verification\_status pending. It is not on the public feed. |
| 7 | Tracks the listing | GET /accommodations/mine shows the user's own listings, including pending and rejected ones. Rejected listings: GET /accommodations/mine?verificationStatus=rejected. |
| 8 | Edits a published listing | PUT /accommodations/:id sends it back to pending and removes it from the public feed until approved again. |
| 9 | Corrects a rejected listing | There is no Returned status. The user submits a new listing with POST /accommodations. |

**Block:** If the account is not verified, POST /accommodations returns 403\. The message depends on the status: documents not submitted, verification pending, or verification rejected.

**Returned listings:** Not in this release, by PM decision. The API accepts only verified or rejected listing reviews. Returned-for-correction with edit and resubmit is an MMP item. Backend confirmed that PUT /accommodations/:id sends a listing back to pending only when its current status is verified. A rejected listing stays rejected and hidden when it is edited, and there is no separate resubmit endpoint, so the user submits a new listing.

**Documents with each listing:** Confirmed by Backend and PM: identity and proof of authority sit on the account (account\_verification), not on each listing. POST /accommodations has no document field. A listing stores up to three photo URLs.

## Flow 7: Admin

**Admin login, Dashboard, Account verification queue, Listing queue, Report queue**

### A. Verify landlord and agent accounts

| Step | What the user does | What the system does |
| :---- | :---- | :---- |
| 1 | Opens the account verification queue | GET /admin/account-verifications. Landlords and agents appear together. The default is pending. |
| 2 | Opens the documents | The admin opens the two document URLs in the packet. There is no separate download endpoint. |
| 3 | Approves or rejects | PATCH /admin/account-verifications/:userId with status verified, or rejected with a rejection\_reason. Only pending accounts can be reviewed. Approving only unlocks posting. |

### B. Review listings

| Step | What the user does | What the system does |
| :---- | :---- | :---- |
| 1 | Opens the listing queue | GET /admin/accommodations. The default is pending. |
| 2 | Approves or rejects | PATCH /admin/accommodations/:id/verification with verified or rejected. Verified makes the listing active and public. Rejected keeps it hidden. There is no Return option in the MVP. |
| 3 | Hides a published listing | A confirmed scam report sets the listing status to hidden. Other hide actions: pending confirmation. |

### C. Review reports

| Step | What the user does | What the system does |
| :---- | :---- | :---- |
| 1 | Opens the report queue | GET /admin/reports. The default is pending. |
| 2 | Takes a decision | PATCH /admin/reports/:id with status (reviewed, resolved, or dismissed), admin\_action, and admin\_notes. |

## Status reference

| Object | Statuses |
| :---- | :---- |
| Landlord/Agent account | Not submitted (Unverified), Pending Verification, Verified, Verification Rejected |
| Listing | Draft, Pending Admin Review, Approved (Published), Rejected, Hidden |
| Report | Pending, Reviewed, Resolved, Dismissed |

## States every screen must handle

| State | What the user should see |
| :---- | :---- |
| Loading | A clear loading indicator ("Loading..." in the designs). |
| Empty (no listings) | "No accommodation listings found for this location yet". Frontend to confirm the final text. |
| Empty (nothing saved) | "Nothing saved yet. Save accommodation and useful information to find them easily later." |
| Empty (no Local Guide content) | A message that information for the LGA is not available yet. |
| Validation error | A message that says which field needs fixing. |
| Network failure | A message that the app cannot reach the server, with a way to retry. Web app: an offline banner appears when the browser is offline. Every data-driven screen shows an error state with a Retry button, and the app retries by itself when the browser comes back online. The navigation bar stays visible, so there is no blank screen. Mobile: pending confirmation. |
| Logged out or expired login | A prompt to log in again. Web app: any 401 response clears the saved session and redirects to the onboarding screen, with no retry loop. A 403 response redirects to Home. Mobile: pending confirmation. |
| Success | A confirmation after saving, reporting, or submitting. |

