# NYSC Connect: Glossary of Terms

*Version 1.0 (MVP)*

This glossary defines the terms used across product, design, engineering, and documentation for NYSC Connect. Use these terms consistently in every screen, guide, and message.

## Core Product Terms

| Term | Definition |
| :---- | :---- |
| State | One of Nigeria's states. The top-level location filter for all content. Pilot states: Lagos and Oyo. |
| LGA (Local Government Area) | A sub-division of a State. The main location used to filter accommodation and local information. Pilot LGAs: Ikeja and Kosofe (Lagos), Ibadan North (Oyo). |
| PPA (Place of Primary Assignment) | The Corps Member's assigned workplace. Entering it is optional and can be skipped, then added later. |
| PPA Proximity | How far a listing is from the user's PPA. In the MVP this is stored text supplied with the listing (for example, "approximately 7 minutes by bus"). It is not a calculated GPS distance and must not be presented as one. |
| Accommodation Listing | A single property entry with property type, annual rent, caution fee, agency fee, address, PPA proximity, photos (up to 3), property information, source, and last-updated date. |
| Accommodation Type | The kind of property: single-room, self-contained, room-and-parlour, one-bedroom, two-bedroom, or shared-apartment. The default is self-contained. There is no separate bedroom or room count. |
| Annual Rent | The yearly rent. It is the price field on a listing and is required. |
| Caution Fee / Agency Fee | Optional fees on a listing. Both default to 0 when left out. |
| Local Guide | Organized, location-filtered information outside accommodation, grouped into six categories (see below). |
| Save / Favourite | Lets a logged-in user bookmark an accommodation listing or a Local Guide entry. Saved items are still there after logging in again. |

## Local Guide Categories

Transport, PPA Information, Health, Security and Safety, Food, and Essential Services. No other categories should be added without PM approval.

API values: transport, ppa, health, security, food, and essential\_services. Backend confirmed essential\_services is the stored value. The older spelling essential\_service is rejected.

## Trust, Freshness and Moderation Terms

| Term | Definition |
| :---- | :---- |
| Source | Where a listing or guide entry came from (for example, Alumni Referral or Admin Entry). Shown so users can judge reliability. |
| Last Updated | The date a listing or guide entry was last edited. |
| Freshness Indicator | A simple, date-based label based on Last Updated. Items not updated within 30 days show "may be outdated". It tells users how recent the information is. It does not mean the information was checked. |
| Verification Documents | The documents a landlord or agent sends for account verification: an identity document and proof of authority. Agents send their verification document, such as a landlord approval letter or an agency registration document. Landlords send a utility bill or proof of ownership. They are stored securely and never shown publicly. |
| Account Verification (landlord or agent) | A manual admin review of a landlord's or agent's verification documents. Statuses: Not submitted (also called Unverified), Pending Verification, Verified, Verification Rejected. A landlord or agent must be Verified before they can submit a listing. Verification does not publish or approve any property. |
| Listing Approval | A separate manual admin review of each listing a landlord or agent submits. Only an Approved listing is published and visible to Corps Members. |
| Approved | Use this word in screens and guides for a listing an admin has accepted for publication. In the API this is the value verification\_status \= verified. It is a content check, not a guarantee that every detail is accurate or that ownership has been proven. |
| Manual review | All verification and listing reviews are done by an admin. There is no OCR, no automatic document reading, no government database check, and no automatic approval in this release. |
| Report / Flag | The action a user takes to mark a listing or Local Guide entry as unreliable. The user must choose a reason; extra details are optional. |
| Report Reasons | Outdated, Incorrect, Misleading, Suspicious. The API also accepts "scam" and stores it as "scam". Only a stored "scam" report can trigger an automatic takedown, when an admin sets it to reviewed or resolved. A "suspicious" report does not hide the listing. |
| Admin Review | The internal process where an admin reviews reports, listings, and landlord or agent accounts, and decides to approve, reject, resolve, or dismiss. |

## Roles

The MVP has exactly three roles.

| Term | Definition |
| :---- | :---- |
| Corps Member | The primary user. Can browse accommodation and the Local Guide, save items, and submit reports. |
| Landlord/Agent | A secondary user. One role with two paths: Landlord and Housing Agent. Can register, send verification documents, and (once Verified) submit listings and track their status. The API roles are landlord and agent. |
| Admin | Internal role that verifies landlord and agent accounts, approves, rejects, or hides listings, reviews reports, and manages content. Admin accounts cannot be created through public registration. |
| Controlled Listing Submission | The MVP supply flow: register, send documents, account Verified, submit listing, Pending Admin Review, admin decision, Published only if Approved. It is not a marketplace. |

## Listing Statuses

| Term | Definition |
| :---- | :---- |
| Draft | A listing being prepared by the landlord or agent, not yet submitted. |
| Pending Admin Review | Submitted and waiting for an admin review. Not visible to Corps Members. (API: verification\_status \= pending.) |
| Approved / Published | Accepted by an admin and visible on the public feed. (API: verification\_status \= verified and status \= active.) |
| Rejected | Not approved for publication. It stays hidden. The reason is recorded and shown to the submitter, who can correct the details and submit a new listing. (API: verification\_status \= rejected.) |
| Hidden | An already-approved listing removed from public view by an admin, for example after a confirmed scam report. (API: status \= hidden.) |

## Not in This Release

These are outside the current MVP. Do not describe them as available features.

| Term | Definition |
| :---- | :---- |
| Returned status | Not part of the MVP, by PM decision. Admins approve or reject listings. A listing is not sent back for editing and resubmitting. Returned-for-correction is an MMP / Later item. |
| MMP / Later | Returned-for-correction status with edit and resubmit, contributor self-update, improved PPA directory and geospatial features, ratings and reviews, push notifications, moderated LGA or state Q\&A, and direct contact or booking improvements. |
| Won't Have (this release) | Full community platform or social network, chat or direct messaging, property marketplace, booking engine, payment or escrow, tenant applications, inspection scheduling, in-app negotiation, advertising and paid or featured listings, commission management, agent subscriptions, gamification and advanced reputation, any additional KYC beyond the confirmed verification documents, and automated verification (OCR or government database lookup). |
| Verified-landlord badge | Not part of the MVP. Do not show a verified badge on landlord or agent profiles to Corps Members. |

