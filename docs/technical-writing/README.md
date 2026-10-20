# NYSC Connect

**Corps Member Settlement & Support Platform** Cohort 8 Capstone Project, Group 5

*Version 1.0 (MVP)*

## About

NYSC Connect is a location-based settlement and information platform that helps newly deployed Corps Members find organized, location-specific information when posted to an unfamiliar state or LGA. Accommodation is the strongest, best-evidenced need and is the anchor use case, but NYSC Connect is not a housing marketplace.

The MVP has exactly three roles: **Corps Member** (primary user), **Landlord/Agent** (secondary user, a landlord or a housing agent), and **Admin**.

## Problem We're Solving

Newly deployed Corps Members often arrive with little local knowledge and no reliable way to find accommodation or local information. They rely on fragmented, unverified sources such as informal agents, WhatsApp groups, and word of mouth. This exposes them to scams, outdated information, and wasted time during a critical settlement window.

Early validation involved 11 participants (7 survey responses and 4 interviews) across Lagos, Ogun, Ondo, and the FCT. The sample is small, so findings are treated as early signals, not as a picture of all Corps Members.

## Current Status

MVP scope is locked. The project is in the alignment and integration stage: Design, Backend, Frontend, Mobile, and Technical Writing are being brought together around one product definition and one API contract. Frontend reports the web app as code-complete and mock-tested.

## MVP Features

**Corps Member**

- Registration and login with phone number and password  
- Location setup: State and LGA (required), PPA (optional, can be skipped)  
- Location-based home that reflects the user's saved State and LGA  
- Accommodation discovery with property type, annual rent, caution fee, agency fee, address, photos, property information, source, and last-updated date, plus search, filter, and sort  
- PPA proximity shown as stored text (for example, "approximately 7 minutes by bus"), not a calculated distance  
- Local Guide in six categories: Transport, PPA Information, Health, Security and Safety, Food, Essential Services  
- Save / Favourite for listings and Local Guide entries  
- Report / Flag with four reasons: Outdated, Incorrect, Misleading, Suspicious

**Landlord/Agent (verification first)**

- Register as a landlord or agent  
- Send verification documents (identity and proof of authority) for account verification  
- Once Verified, submit listings with up to three photos and track their status  
- Every listing stays Pending until an admin approves it

**Admin**

- Verify landlord and agent accounts (manual review)  
- Approve, reject, or hide listings  
- Review reports and manage content

**All roles**

- Loading, empty, error, and network states

**Key rule:** account verification and listing approval are two separate checks. Verification never publishes a property.

## Later (MMP)

Returned-for-correction listing status with edit and resubmit, contributor self-update, improved PPA directory and geospatial features, ratings and reviews, push notifications, moderated LGA or state Q\&A, and direct contact or booking improvements.

## Not in This Release

Full community platform or social network, chat or direct messaging, property marketplace, booking engine, payment or escrow, tenant applications, inspection scheduling, in-app negotiation, advertising and featured listings, commission management, verified-landlord badge, any extra KYC beyond the confirmed documents, and automated verification (OCR or government database lookup). All verification and listing reviews are manual.

## Pilot Locations

- Ikeja LGA, Lagos State  
- Kosofe LGA, Lagos State  
- Ibadan North LGA, Oyo State

Ibadan North tests the product outside Lagos. Oyo was not in the research sample, so results there are treated as new evidence.

## Tech Stack

- **Backend:** Node.js, Express, JWT authentication  
- **Database:** MongoDB (API record IDs are MongoDB ObjectIds)  
- **Image storage:** Cloudinary  
- **Web frontend:** HTML, CSS, JavaScript with Tailwind CSS  
- **Mobile:** React Native (Expo)  
- **Staging API:** [https\://nysc-connect.onrender.com/api/v1](https://nysc-connect.onrender.com/api/v1)  
- **Local API:** [http\://localhost:5000/api/v1](http://localhost:5000/api/v1)  
- **Health API:** [https\://nysc-connect.onrender.com/api/v1/health](https://nysc-connect.onrender.com/api/v1/health)  
- **Location API:** [https\://nysc-connect.onrender.com/api/v1/locations/states](https://nysc-connect.onrender.com/api/v1/locations/states)&nbsp;  
- **Accommodation API:** [https\://nysc-connect.onrender.com/api/v1/accommodations](https://nysc-connect.onrender.com/api/v1/accommodations)

## Documentation

**For users**

- [Guide for Corps Members](https://docs.google.com/document/d/1b9KO5I6-mJlbr_IpxP2CZfW72qRUqWIX/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)  
- [Guide for Landlords and Agents](https://docs.google.com/document/d/1WyT2IL5yFYWDYYFYHDeb_dQZCwRwZDlE/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)  
- [How Accommodation Is Verified](https://docs.google.com/document/d/1fhE5iYlZkb9Pw77I0YBf6NGq944oaB-U/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)  
- [Troubleshooting and Error Guide](https://docs.google.com/document/d/1HZDEovP-LCq9s5V01Nl6eXvfXYsFAaYs/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)  
- [FAQ](https://docs.google.com/document/d/1Te_ktMcNEd-BqoQ2sBl-vc50Ex4pwYRD/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)

**For the project team**

- [API Documentation](https://docs.google.com/document/d/1WDMiOd9Q7ZFdb8gh9hEkgy8-r5talCkq3q-Eo_5XCsE/edit?usp=drive_link)  
- [User Flow Documentation](https://docs.google.com/document/d/1ySzYmFdpZvULkmTr_NxKgeP6fpxEEp8A/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)  
- [Glossary](https://docs.google.com/document/d/14GB_uaAW_NN2q5Z147A0_aY0Ut0Xm-tH/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)  
- [Release Notes](https://docs.google.com/document/d/19VCm4v1fTWzgpA--hM6K4QGRTCPTLNIb/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)  
- [Design and MVP Alignment Items](https://docs.google.com/document/d/1tThsS0pMTeKR0sxy7l8nOFHBKjab5--h/edit?usp=sharing&ouid=101701094143422501319&rtpof=true&sd=true)

## Project Team

| Unit | Coordinator |
| :---- | :---- |
| Product Management | Ojo Ooreofeoluwanifemi (lead), Michael Olayinka Ajayi (assistant) |
| Product Design (UI/UX) | Ufomadu Sylvana |
| Backend Engineering | Wisdom Ajah Agaba |
| Frontend Engineering | Durojaiye Khalid |
| Mobile Development | Felix Ani |
| Technical Writing | Edith Umunnakwe |

&nbsp;

**Technical Writing team:** Jeje Precious Anuoluwapo, Edith Umunnakwe, Elizabeth Adu, Parakoyi Olawale Abdullahi

## Contributing

This is an internal Cohort 8 capstone project. Documentation changes go through the Technical Writing coordinator. Any change to MVP scope must be raised through the PM coordination structure.