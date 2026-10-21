# NYSC Connect: Release Notes

*Version 1.0 (MVP) · Release date: \[to be confirmed\] · Platforms: \[to be confirmed\]*

## Summary

NYSC Connect helps newly deployed Corps Members find accommodation and local information for the State and LGA they are posted to. Landlords and agents submit listings through a controlled process: their accounts are verified first, and an admin reviews every listing before it is published.

## What is included

### For Corps Members

* Register and log in with a phone number and password.

* Choose your State and LGA, and add your PPA or skip it.

* See a Home screen based on your saved location.

* Browse accommodation listings with property type, annual rent, caution fee, agency fee, address, photos, property information, source, and last-updated date. Filter by price and sort by newest or price.

* Explore the Local Guide in six categories: Transport, PPA Information, Health, Security and Safety, Food, and Essential Services.

* Save listings and Local Guide entries. Saved items remain after you log in again.

* Report a listing or entry as Outdated, Incorrect, Misleading, or Suspicious.

* See clear messages when content is loading, unavailable, or your connection fails. On the web app, an offline banner appears and screens show a Retry button.

### For landlords and agents

* Register as a landlord or an agent.

* Submit your verification documents. Agents send the required verification document. Landlords send a utility bill or proof of ownership.

* Correct and resubmit your documents if verification is rejected.

* After you are verified, submit listings with up to three photos, then track their status.

* Expect every listing to stay pending until an admin approves it.

* Correct the details and submit a new listing if an admin rejects yours.

Your verification documents are stored securely and are never shown publicly.

### For admins

* Verify or reject landlord and agent accounts.

* Approve or reject listings.

* Review reports and take action. A confirmed scam report hides the listing.

## Pilot coverage

Ikeja and Kosofe (Lagos State), and Ibadan North (Oyo State). Content is added location by location, so an LGA without content shows an empty message.

## Important decisions in this release

| Decision | What it means |
| :---- | :---- |
| Verification comes first | Landlords and agents must be verified before they can submit a listing. Verification never publishes a property. |
| Two separate approvals | Account verification and listing approval are different checks. An admin completes both by hand. |
| PPA distance is text | Distance to the PPA is a short description supplied with the listing. It is not calculated by GPS. |
| Freshness, not proof | A listing not updated for 30 days shows "may be outdated". This reflects how recent the information is, not whether the property is genuine. |
| Rejected listings are not sent back | Admins approve or reject a listing. To fix a rejected listing, submit a new one. |
| No verified badge | Listings show their source and last-updated date. The app does not show a verified badge for landlords or agents. |

## Known limitations

* Admins verify accounts and review listings by hand. There is no OCR, automatic document reading, or government database check.

* Listings can include up to three photos. \[Size and format limits to be confirmed\]

* Support and bug-reporting channels: \[to be confirmed before release\]

* Network and expired-login behaviour is confirmed for the web app. Mobile behaviour: \[to be confirmed\]

## Not in this release

Booking, payment or escrow, chat or direct messaging, a property marketplace, tenant applications, inspection scheduling, ratings and reviews, push notifications, advertising and featured listings, a community platform, and automated verification. Some of these may be considered later.

## Documentation

* [README](https://drive.google.com/file/d/1q8stPH1ZmjFlUSOYH3nh6bb0VpEHV8jM/view?usp=sharing)

* [API Documentation](https://docs.google.com/document/d/1WDMiOd9Q7ZFdb8gh9hEkgy8-r5talCkq3q-Eo_5XCsE/edit?usp=drive_link)

* [Troubleshooting and Error Guide](https://docs.google.com/document/d/1HZDEovP-LCq9s5V01Nl6eXvfXYsFAaYs/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)

* [Guide for Corps Members](https://docs.google.com/document/d/1b9KO5I6-mJlbr_IpxP2CZfW72qRUqWIX/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)

* [Guide for Landlords and Agents](https://docs.google.com/document/d/1WyT2IL5yFYWDYYFYHDeb_dQZCwRwZDlE/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)

* [How Accommodation Is Verified](https://docs.google.com/document/d/1fhE5iYlZkb9Pw77I0YBf6NGq944oaB-U/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)

* [User Flow Documentation](https://docs.google.com/document/d/1ySzYmFdpZvULkmTr_NxKgeP6fpxEEp8A/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)

* [FAQ](https://docs.google.com/document/d/1Te_ktMcNEd-BqoQ2sBl-vc50Ex4pwYRD/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true) and [Glossary](https://docs.google.com/document/d/14GB_uaAW_NN2q5Z147A0_aY0Ut0Xm-tH/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)

* [Design Mvp Alignment Items](https://docs.google.com/document/d/1tThsS0pMTeKR0sxy7l8nOFHBKjab5--h/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)