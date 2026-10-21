# NYSC Connect: Design and MVP Alignment Items

*Version 1.0 (MVP)*

## Purpose

Technical Writing compared the [Figma](https://www.figma.com/design/znTvb3n9SoGdXsqzwQ4xPD/NYSC-CONNECT--APP-?node-id=150-19&t=Dt14Nb3FRDX29Ist-1) exports ([web screens](https://cheery-horse-6f8f3b.netliify.app) and [app screens](https://1ofhnwc-anonymous-8085.exp.direct)) with the [Final MVP](https://drive.google.com/file/d/1r9TvOoZ5GWAIck98UJZCLqB1orQylKRL/view?usp=drive_link) and the [API v1 Request Reference](https://drive.google.com/file/d/1vyyE-rDlp66KQ5fsE4LMoqkYx1HSeB5g/view?usp=drivesdk). This list shows where they differ. Our documents follow the MVP and the API, so they never promise something the product cannot do. For each item, PM and Design decide whether the design or the MVP changes.

Where: W means the [web screens PDF](https://drive.google.com/file/d/1KS7MCiQuSBu1U4S8kZ4f0ESDX4jsCvo1/view?usp=drivesdk) and A means the [app screens PDF](https://drive.google.com/file/d/1eYTZl1ZkwUzez6DFCheQYJD3rFn50Q6t/view?usp=drivesdk), followed by the page number.

| No. | Where | The design shows | The MVP or API says |
| :---- | :---- | :---- | :---- |
| 1 | W16 | Landlord sign-up asks for "NIN or CAC Number" and says the details "will be verified with NIMC or CAC database". | Verification is manual. There is no database check. NIN is one accepted ID type in the verification documents. CAC is not in the API. |
| 2 | W16 | The sign-up page shows "Escrow Payment" and "Verified Batch". | No payment or escrow in the MVP. No verified badge. |
| 3 | W2, W17 | Landlord copy says "earn by listing", "manage your properties and bookings", and "track bookings and earnings". | NYSC Connect is not a marketplace. No booking, payment, or earnings. |
| 4 | A11 | Landlord login says "manage your listings and tenants". | No tenant features in the MVP. |
| 5 | W18 | Landlord dashboard shows Total Views, views per listing, and a "9% increase". Status tabs include Returned. | The API has no view statistics. There is no Returned status. |
| 6 | W13 | Admin review tabs: Pending, Approved, Rejected, Returned. Actions: Review, Return, Reject. | The API verifies or rejects a listing only. There is no returned status. Return is an MMP item. |
| 7 | W14, A23, A24 | Admin actions include Edit, Remove, Hide, and Dismiss. Remove "permanently" deletes a listing and cannot be undone. | Deleting a listing archives it (soft delete). Hidden follows a confirmed scam report. There is no permanent removal. |
| 8 | W12 | Admin login uses Staff ID, an @nyscconnect.ng email, and multi-factor authentication. The dashboard shows counts and "99.98% uptime". | Admin accounts are not created by registration. The API has no staff ID, multi-factor step, or dashboard statistics. |
| 9 | W3, A2, A3 | The State list has nine states. The LGA list includes Eti-Osa, Lagos Island, Surulere, and Alimosho. | Pilot states: Lagos and Oyo. Pilot LGAs: Ikeja, Kosofe, and Ibadan North. |
| 10 | W7 to W11, A14 to A19 | Sample content uses Owerri North (Imo State), Eti-Osa, and some Lagos locations. | Imo State and Eti-Osa are not pilot locations. |
| 11 | W3, W7, A14 | Filter "PPA Proximity": Within 3, 5, or 10 km. Results show "2.1 km" and "about 18 min walk". A button says "Use my current location". | PPA proximity is stored text. There is no distance calculation, distance filter, or use of the current location in the MVP. |
| 12 | W6 to W9, W11, A13, A16 | "Verified Homes", a "Verified" tag, "Bookmark verified homes", the source "Community Verified", and "Verified by local contributors". | The MVP has no verified badge. Listings show their source and last-updated date. |
| 13 | W7, A14 | Sort option "Recommended". | API sort values: newest, price\_asc, price\_desc. |
| 14 | W7, A11 to A16 | Cards show "1 Bed", "1 Bath", and "Shared". | There are no bedroom or bathroom fields. Listings have a property type. |
| 15 | W7, W8, A14 | Property types: Self-Contained, Room and Parlour, Shared Apartment, Hostel. | API types: single-room, self-contain, room-and-parlour, one-bedroom, two-bedroom, shared-apartment. There is no Hostel type. |
| 16 | W5, A12 | Login by "Email or Phone Number", with "Remember me" and "Forgot Password?". | The API login uses phone number and password only. There is no password reset. |
| 17 | A9 | Corps Member setup asks for NYSC Status and PPA Address. | The API registers a user with name, phone, email, password, State, LGA, and an optional PPA name. It has no NYSC status or PPA address field. |
| 18 | A13 | Home shows a "Community update" and "Handover tips". | No community content or handover feature in the MVP. |
| 19 | W10 | The Local Guide shows a "Move-in checklist". | The six Local Guide categories do not include a checklist. |
| 20 | W15, A20 | Report reasons are labelled Outdated, Incorrect, Misleading, and "Suspicious information". The button says "Update Report" on the web and "Submit Report" on mobile. | The user-facing reasons are Outdated, Incorrect, Misleading, and Suspicious. Button wording to be confirmed. |
| 21 | A25 | Messages: "Nothing saved yet", "No result found", "Something went wrong. We couldn't load this information." with Retry, and "Loading...". | Our guides now use these messages. Mobile suggested "No accommodation listings found for this location yet". Frontend to confirm the final text. |

## Next step

PM and Design review each item and mark it as: change the design, change the MVP, or leave as is. Technical Writing will update the guides once each item is decided.