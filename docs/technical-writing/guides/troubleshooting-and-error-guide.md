# NYSC Connect: Troubleshooting and Error Guide

*Version 1.0 (MVP)*

## How to use this guide

Find the message or problem you see, read the possible cause, and follow the steps. The most common problems come first. Part A is for Corps Members, Part B for landlords and agents, Part C for admins, and Part D for the project teams.

*Support channel: pending confirmation from the general project team. Until it is confirmed, report problems to your coordinator.*

### Part A: For Corps Members

| Problem or message | Possible cause | What to do |
| :---- | :---- | :---- |
| Invalid credentials | Your phone number or password is wrong. The app shows the same message for both. | Check both and try again. Your email address is not used to log in. |
| Please provide phone number and password | One of the two fields is empty. | Fill in both fields. |
| You are logged out, or you see "Invalid or expired token." or "Authentication token missing. Please log in." | Your login time ran out, or you are not logged in on this device. | Log in again with your phone number and password. On the web app, you are taken back to the onboarding screen automatically. |
| User account no longer exists. | Your account was removed after you logged in. | Register again, or report it to your coordinator. |
| You cannot register | A required field is empty, your phone number has fewer than 10 characters, or the phone number or email is already registered. | Fill in name, phone, email, password, State, and LGA. Use a different phone number or email, or log in if you already have an account. |
| No result found, or "No accommodation listings found for this location yet" | There are no approved listings for your search or LGA, or your filters are too narrow. | Clear the filters or widen the price range. Check that your State and LGA are right. Check again later. |
| Nothing saved yet | You have not saved anything. | Save a listing or a Local Guide entry and it will appear in Saved. |
| Something went wrong. We couldn't load this information. | The app could not load the screen. | Choose Retry. If it keeps happening, check your connection. See Part E. |
| Information for your LGA is not available yet (Local Guide) | Nothing has been added for your LGA or for that category. | Try another category and check again later. This is expected and is not an error. |
| A listing will not open, or says it was not found | The listing is not public (pending, rejected, or hidden), or it was removed. | Go back to the results and refresh. Choose another listing. |
| Forbidden. You lack permission for this action. | Your account type is not allowed to do this action. For example, a Corps Member cannot post listings. | Do not try again. Use the right account type for that action. On the web app, you are sent back to Home. |
| You are not allowed to delete this saved item | The saved item belongs to another account. | Refresh your Saved list and remove only your own items. |
| Your report did not go through | You are logged out, no reason was chosen, or the network failed. | Log in, choose a reason (Outdated, Incorrect, Misleading, or Suspicious), and submit once. Wait for the confirmation before you try again. |
| A network error, or the app will not load | No internet, a weak connection, or the server cannot be reached. | Check your connection. On the web app, an offline banner appears and screens show a Retry button. The app also tries again by itself when your connection returns. See Part E. |

### Part B: For Landlords and Agents

| Problem or message | Possible cause | What to do |
| :---- | :---- | :---- |
| Submit identity and authority documents before posting a listing | You have not sent your verification documents. | Complete account verification first. See the Guide for Landlords and Agents, Step 2\. |
| Your account verification is still pending admin review | An admin has not finished checking your documents. | Wait for the result. Do not submit again. The review time is pending confirmation. |
| Your account verification was rejected. Update your documents and submit again | An admin did not accept your documents. | Read the reason in your verification details, correct the documents, and submit a new set. Your status goes back to pending. |
| Your verification will not submit (error 400\) | A document link is missing or invalid, the proof type is wrong for your role, the meter number is missing for a utility bill, the no inspection or mobilization fee agreement is not accepted, or your account is already verified. | Upload both documents first. Landlords send a utility bill (with the prepaid meter number) or proof of ownership. Agents send an authorization letter or agency registration. Accept the fee agreement. A verified account cannot submit again. |
| Please upload at least one image | You started an upload without choosing a file. | Choose an image and try again. |
| An upload is slow or fails | The file is too large or the network is slow. Documents are limited to one image of 5 MB each. Listings are limited to 3 photos. | Reduce the file size and wait up to a minute. If it times out, try once more. |
| My listing is not on the public pages | It is pending admin review, rejected, or hidden. | Check its status under your listings. If it is pending, wait for the admin. |
| My listing was rejected | An admin did not approve it. Admins approve or reject listings, so a rejected listing is not sent back for editing. | Read the admin's reason, correct the details, and submit a new listing. There is no appeal process in this release. |
| My approved listing disappeared after I edited it | Editing an approved listing sends it back to pending. | Wait for the admin to approve it again. |
| Forbidden. You lack permission for this action. | Your role is not allowed to do this action. | Use the right account type for the action. |

### Part C: For Admins

| Problem or message | Possible cause | What to do |
| :---- | :---- | :---- |
| Admin pages return Forbidden | The account role must be exactly admin, in lowercase. | Check the role value on the account. |
| An account cannot be reviewed | Only accounts whose status is pending can be reviewed. A Corps Member id returns 404\. | Use the id from the account verification queue. |
| A rejection will not save | A rejection needs a reason. | Add a rejection reason and send it again. |
| A report was resolved but the listing is still public | Automatic takedown runs only when the stored reason is a scam and the report is set to reviewed or resolved. A suspicious report does not hide a listing. | Reject the listing in the listing review queue to keep it hidden. |

### Part D: Error Reference for Project Teams

The API uses two response formats. Read the message field and rely on the HTTP status code.

| Format | Where | Error shape |
| :---- | :---- | :---- |
| Auth envelope | /auth/register, /auth/login, /auth/me, /users/me | { "message": "..." } with no status field |
| Standard envelope | Accommodations, saved items, reports, admin, verification, media | { "status": "error", "message": "..." } |
| Unknown URL | Any path that does not exist | { "status": "fail", "message": "Endpoint ... not found on this server" } |

| Code | Message (exact) | Meaning | What the app should do |
| :---- | :---- | :---- | :---- |
| 400 | Please provide a phone number and password. Invalid role. Must be corps\_member, landlord, or agent. Please upload at least one image. | The request is missing something or has a wrong value. | Show the message next to the field. Do not resend the same request unchanged. |
| 401 | Authentication token missing. Please log in. Invalid or expired token. The user account no longer exists. Invalid credentials (login only). | Not logged in, the token is no longer valid, or the credentials are wrong. | Clear the saved token and send the user to login. After login, return them to where they were. |
| 403 | Forbidden. You lack permission for this action. You are not allowed to delete this saved item. Self-registration as an administrator is not permitted. The three landlord and agent verification messages. | Logged in, but not allowed. | Show the message. Do not retry. Hide actions the role cannot use. |
| 404 | Endpoint ... not found on this server. A listing that is not public returns 404 to anyone but the owner or an admin. A missing saved item. A Corps Member id on account review. | The thing asked for does not exist or is not visible to this user. | Show a not-found state and offer a way back. |
| 500 | { "status": "error", "message": "..." }. The message text is not documented. | The server could not complete the request. | Show a generic message and a Retry option. Never show raw server text. |

Backend lists only these five error codes: 400, 401, 403, 404, and 500\. Timeouts and network failures are handled by the apps, not by the API.

Writing rule for error messages: say what happened, then say what to do next. For example, "Your login has expired. Log in again to continue."

### Part E: Network Failures, Expired Logins, and Retrying

**What users should do**

* Check that your phone has internet access.

* Wait a few seconds and try again. The server can be slow to respond.

* Tap Save, Report, or Submit once and wait for the confirmation. Do not tap again straight away.

* If you are not sure it worked, check Saved or your listings before you try again.

**What the web app does (confirmed by Frontend)**

| Situation | What happens |
| :---- | :---- |
| The browser is offline | An offline banner appears. |
| A screen that loads data fails | An error state with a Retry button appears on every data-driven screen. |
| The connection comes back | The app tries again by itself when the browser reports it is online. |
| Something fails inside the app | The navigation bar stays visible, so there is no blank screen. |
| Any 401 response (login expired or missing) | The saved session is cleared and you go to the onboarding screen. There is no retry loop. |
| Any 403 response | You are sent back to Home. |

All recovery paths are silent except the redirect itself.

**What the backend does**

Backend does not provide loading or network-failure states. The apps handle them. Image uploads wait up to 60 seconds and try once more if the image service times out.

**Pending confirmation**

| Question | Waiting on |
| :---- | :---- |
| What does the mobile app show when the network fails or a login expires, and is a retry offered? | Mobile |
| Is the Submit button blocked while a request is sent, so that a listing, report, or verification is not sent twice? | Frontend, Mobile, and Backend |
| How are 500 errors and validation failures worded? | Backend |

### Keeping this guide accurate

Review this guide after every product update. Add the real support channel when it is confirmed, and replace each pending item above when the team answers.

Last reviewed: 13 October 2026\.