# NYSC Connect: API Documentation

*Version 1.0 (MVP)*

## Overview

| Item | Value |
| :-- | :-- |
| Staging base URL | `https://nysc-connect.onrender.com/api/v1` |
| Local base URL | `http://localhost:5000/api/v1` |
| Content type | `application/json`, except the two image uploads, which use `multipart/form-data` |
| Authorization header | `Authorization: Bearer <token>` with one space after `Bearer` |
| Roles | `corps_member`, `landlord`, `agent`, `admin` |

## Response formats

The API uses two response patterns. Read `message` on every response. Treat HTTP 4xx and 5xx as errors.

**Standard envelope** (accommodations, local info, saved items, reports, admin):

```json
{ "status": "success", "message": "...", "data": {} }
```

```json
{ "status": "error", "message": "..." }
```

Unknown URL (`404`):

```json
{ "status": "fail", "message": "Endpoint ... not found on this server" }
```

`GET /local-info` returns `status` and puts pagination next to `data`. That response has no `message` field. The shape is in the Local Information section.

**Auth envelope** (`/auth/register`, `/auth/login`, `/auth/me`, `/users/me`):

These responses have no `status` field and no outer `data` wrapper.

Register or login:

```json
{ "message": "...", "token": "...", "user": {} }
```

`GET /auth/me` and `GET /users/me`:

```json
{ "user": {} }
```

Auth errors:

```json
{ "message": "..." }
```

`GET` and `POST /users/me/verification` use the standard envelope.

## Authentication

| Rule | Value |
| :-- | :-- |
| Where the token comes from | The `token` field on register (`201`) and login (`200`) |
| How to send it | `Authorization: Bearer <token>` |
| Public routes | `POST /auth/register`, `POST /auth/login`, `GET /accommodations`, `GET /locations/states`, `GET /locations/lgas` |
| Protected routes | Every other route in this document |

## Workflow: account verification and listing submission

Account verification and listing verification are separate. Verifying an account does not publish a property. Verifying a listing does not change the account.

| Step | Who | Call | Result |
| :-- | :-- | :-- | :-- |
| 1 | Landlord or agent | `POST /auth/register` with `role` `landlord` or `agent` | Account created. `verification_status` is `not_submitted`. |
| 2 | Landlord or agent | `POST /media/verification-documents` once per document | Returns a `url` and `publicId` for that image. |
| 3 | Landlord or agent | `POST /users/me/verification` | Packet saved. `account_verification.status` is `pending`. |
| 4 | Admin | `GET /admin/account-verifications` | Queue of landlords and agents. Defaults to `pending`. |
| 5 | Admin | `PATCH /admin/account-verifications/:userId` | `verified` unlocks `POST /accommodations`. Rejection requires `rejection_reason`. |
| 6 | Landlord or agent | `POST /media/accommodation-images` (optional), then `POST /accommodations` | Listing saved with `status` `active` and `verification_status` `pending`. It stays off the public feed. |
| 7 | Admin | `GET /admin/accommodations` | Listing queue. Defaults to `pending`. |
| 8 | Admin | `PATCH /admin/accommodations/:id/verification` | `verified` publishes the listing. `rejected` keeps it hidden. |

A landlord or agent whose account is `not_submitted`, `pending`, or `rejected` receives `403` on `POST /accommodations`. A rejected account can submit a new packet with `POST /users/me/verification`, which sets the status back to `pending`. A verified account cannot submit that packet again. Editing a verified listing with `PUT /accommodations/:id` sets that listing back to `pending` and removes it from the public feed until an admin verifies it again.

## Who can call what

| Who | Routes |
| :-- | :-- |
| Anyone | `POST /auth/register`, `POST /auth/login`, `GET /locations/states`, `GET /locations/lgas`, `GET /accommodations` |
| Any signed-in user | `GET /auth/me`, `GET /users/me`, `PATCH /users/me`, `GET /accommodations/:id`, `GET /local-info`, `GET /saved`, `POST /saved`, `DELETE /saved/:savedItemId`, `POST /reports` |
| Landlord or agent | `GET /users/me/verification`, `POST /users/me/verification`, `POST /media/verification-documents` |
| Admin, landlord, or agent | `GET /accommodations/mine`, `POST /accommodations`, `POST /media/accommodation-images` |
| Admin | `GET /admin/reports`, `PATCH /admin/reports/:id`, `GET /admin/accommodations`, `PATCH /admin/accommodations/:id/verification`, `GET /admin/account-verifications`, `PATCH /admin/account-verifications/:userId` |

`PUT /accommodations/:id` accepts the same optional fields as create. The contract does not give that route a separate access rule. Editing a verified listing sets `verification_status` back to `pending`.

## 1. Authentication and users

### POST /auth/register

Creates a corps member, landlord, or agent account. Admin accounts cannot be created here. Access: public.

| Field | Required | Notes |
| :-- | :-- | :-- |
| `name` | Yes | |
| `phone` | Yes | Unique. At least 10 characters. |
| `email` | Yes | Required for every role. Unique. |
| `password` | Yes | |
| `state` | Yes | |
| `lga` | Yes | |
| `ppa` / `ppa_name` | No | Optional workplace name. |
| `ppa_proximity` | No | |
| `role` | No | `corps_member`, `landlord`, or `agent`. Defaults to `corps_member`. |

Corps member:

```json
{
  "name": "Chinedu Okafor",
  "phone": "08012345678",
  "email": "chinedu.okafor@email.com",
  "password": "Password123!",
  "state": "Lagos",
  "lga": "Ikeja",
  "ppa": "State High School",
  "ppa_name": "State High School",
  "role": "corps_member"
}
```

Landlord or agent (`role` may be `agent`):

```json
{
  "name": "Ada Okonkwo",
  "phone": "08098765432",
  "email": "ada.okonkwo@email.com",
  "password": "Password123!",
  "state": "Lagos",
  "lga": "Ikeja",
  "role": "landlord"
}
```

Response (`201 Created`) for a landlord:

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66f7f1234a1b2c3d4e5f6789",
    "name": "Ada Okonkwo",
    "phone": "08098765432",
    "email": "ada.okonkwo@email.com",
    "state": "Lagos",
    "lga": "Ikeja",
    "ppa": null,
    "ppa_name": null,
    "ppa_proximity": null,
    "role": "landlord",
    "verification_status": "not_submitted"
  }
}
```

`verification_status` is returned only for `landlord` and `agent`. Values are `not_submitted`, `pending`, `verified`, and `rejected`. A new landlord or agent cannot post a listing until an admin sets this to `verified`. Corps member profiles omit this field.

Errors:

* `403`: `{ "message": "Self-registration as an administrator is not permitted" }`
* `400`: `{ "message": "Invalid role. Must be corps_member, landlord, or agent" }`

### POST /auth/login

Logs in with phone and password. Access: public.

```json
{
  "phone": "08012345678",
  "password": "Password123!"
}
```

Response (`200 OK`):

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66f7f1234a1b2c3d4e5f6789",
    "name": "Chinedu Okafor",
    "phone": "08012345678",
    "email": "chinedu.okafor@email.com",
    "state": "Lagos",
    "lga": "Ikeja",
    "ppa": "State High School",
    "ppa_name": "State High School",
    "ppa_proximity": null,
    "role": "corps_member"
  }
}
```

Errors:

* `400`: `{ "message": "Please provide phone number and password" }`
* `401`: `{ "message": "Invalid credentials" }`

### GET /auth/me and GET /users/me

Returns the signed-in user's profile. Access: authenticated.

```json
{
  "user": {
    "id": "66f7f1234a1b2c3d4e5f6789",
    "name": "Chinedu Okafor",
    "phone": "08012345678",
    "email": "chinedu.okafor@email.com",
    "state": "Lagos",
    "lga": "Ikeja",
    "ppa": "State High School",
    "ppa_name": "State High School",
    "ppa_proximity": null,
    "role": "corps_member"
  }
}
```

### PATCH /users/me

Updates location and PPA fields. Access: authenticated.

```json
{
  "state": "Lagos",
  "lga": "Kosofe",
  "ppa": "Kosofe Local Government Secretariat",
  "ppa_name": "Kosofe Local Government Secretariat"
}
```

Response (`200 OK`):

```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "66f7f1234a1b2c3d4e5f6789",
    "name": "Chinedu Okafor",
    "phone": "08012345678",
    "email": "chinedu.okafor@email.com",
    "state": "Lagos",
    "lga": "Kosofe",
    "ppa": "Kosofe Local Government Secretariat",
    "ppa_name": "Kosofe Local Government Secretariat",
    "ppa_proximity": null,
    "role": "corps_member"
  }
}
```

### GET /users/me/verification

Returns the signed-in landlord or agent's account verification packet, including document URLs. Access: authenticated, role `landlord` or `agent`. Uses the standard envelope.

```json
{
  "status": "success",
  "message": "Account verification fetched successfully",
  "data": {
    "account_verification": {
      "status": "not_submitted",
      "id_type": null,
      "id_document_url": null,
      "authority_type": null,
      "authority_document_url": null,
      "prepaid_meter_number": null,
      "zero_upfront_fee_agreed": false,
      "rejection_reason": null,
      "submitted_at": null,
      "reviewed_at": null
    }
  }
}
```

### POST /users/me/verification

Submits identity, proof of authority, and the no-upfront-fee agreement. Upload both images first with `POST /media/verification-documents`, then send the returned URLs here. A verified account cannot submit again. A rejected account can submit a new packet, which sets the status back to `pending`. Access: authenticated, role `landlord` or `agent`.

| Field | Rule |
| :-- | :-- |
| `id_type` | `nin`, `pvc`, `drivers_license`, or `passport` |
| `id_document_url` | URL returned by the document upload |
| `authority_type` | Landlord: `utility_bill` or `proof_of_ownership`. Agent: `authorization_letter` or `agency_registration`. |
| `authority_document_url` | URL returned by the document upload |
| `prepaid_meter_number` | Required only when `authority_type` is `utility_bill` |
| `zero_upfront_fee_agreed` | Must be `true` |

Landlord:

```json
{
  "id_type": "nin",
  "id_document_url": "https://res.cloudinary.com/.../nin.jpg",
  "authority_type": "utility_bill",
  "authority_document_url": "https://res.cloudinary.com/.../bill.jpg",
  "prepaid_meter_number": "04123456789",
  "zero_upfront_fee_agreed": true
}
```

Agent:

```json
{
  "id_type": "drivers_license",
  "id_document_url": "https://res.cloudinary.com/.../license.jpg",
  "authority_type": "authorization_letter",
  "authority_document_url": "https://res.cloudinary.com/.../mandate.jpg",
  "zero_upfront_fee_agreed": true
}
```

Response (`200 OK`):

```json
{
  "status": "success",
  "message": "Verification submitted and is pending admin review",
  "data": {
    "account_verification": {
      "status": "pending",
      "id_type": "nin",
      "id_document_url": "https://res.cloudinary.com/.../nin.jpg",
      "authority_type": "utility_bill",
      "authority_document_url": "https://res.cloudinary.com/.../bill.jpg",
      "prepaid_meter_number": "04123456789",
      "zero_upfront_fee_agreed": true,
      "rejection_reason": null,
      "submitted_at": "2026-10-07T14:20:00.000Z",
      "reviewed_at": null
    }
  }
}
```

`400` covers a missing or invalid document URL, an `authority_type` that does not match the role, a missing meter number on a utility bill, a fee policy that was not accepted, or an account that is already verified.

## 2. Locations

### GET /locations/states

Returns the supported pilot states. Access: public.

```json
{
  "status": "success",
  "message": "State retrieved successfully",
  "data": {
    "states": ["Lagos", "Oyo"]
  }
}
```

### GET /locations/lgas?state=Lagos

Returns the LGAs for a pilot state. Access: public. Query parameter `state` is required (`Lagos` or `Oyo`). `state=Oyo` returns `["Ibadan North"]`.

```json
{
  "status": "success",
  "message": "LGAs retrieved successfully",
  "data": {
    "state": "Lagos",
    "lgas": ["Ikeja", "Kosofe"]
  }
}
```

## 3. Accommodations

### GET /accommodations

Searches the public feed. Only listings with `status` `active` and `verification_status` `verified` are returned. Pending and rejected listings stay hidden. Access: public.

| Query parameter | Notes |
| :-- | :-- |
| `state`, `lga` | Location filters |
| `minPrice`, `maxPrice` | Price range |
| `accommodationType` | `single-room`, `self-contain`, `room-and-parlour`, `one-bedroom`, `two-bedroom`, or `shared-apartment` |
| `amenities` | Optional filter |
| `sort` | `newest`, `price_asc`, or `price_desc` |
| `page` | Default `1` |
| `limit` | Default `10`, maximum `50` |

`price` is the annual rent. `ppa_proximity` is supplied text.

```json
{
  "status": "success",
  "message": "Accommodations fetched successfully",
  "data": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1,
    "results": [
      {
        "_id": "66f7f9876a1b2c3d4e5f0001",
        "title": "Self-contain lodge near Ikeja Secretariat",
        "description": "Clean self-contain apartment with borehole water and prepaid meter.",
        "accommodationType": "self-contain",
        "price": 320000,
        "caution_fee": 30000,
        "agency_fee": 0,
        "address": "14 Allen Avenue, Ikeja, Lagos",
        "state": "Lagos",
        "lga": "Ikeja",
        "ppa_proximity": "Approximately 7 mins bus ride to State Secretariat",
        "photos": [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
        ],
        "amenities": [],
        "property_info": [
          "borehole_water",
          "prepaid_meter",
          "fenced_gate"
        ],
        "contact_phone": "08011223344",
        "contact_whatsapp": "08011223344",
        "source": "Alumni Referral",
        "status": "active",
        "verification_status": "verified",
        "created_at": "2026-09-30T10:00:00.000Z",
        "last_updated": "2026-09-30T10:00:00.000Z"
      }
    ]
  }
}
```

### GET /accommodations/mine

Lists accommodations owned by the signed-in landlord, agent, or admin, including pending and rejected listings. Access: authenticated, role `landlord`, `agent`, or `admin`.

Query parameters: `verificationStatus` (`pending`, `verified`, `rejected`, `flagged`, or `all`), `page` (default `1`), `limit` (default `10`, maximum `50`).

The response uses the same pagination envelope as `GET /accommodations`, with the message `Your accommodations fetched successfully`.

### GET /accommodations/:id

Returns one listing. Access: authenticated. A listing that is not both `active` and `verified` is returned only to an admin or the listing owner. Everyone else receives `404`.

```json
{
  "status": "success",
  "message": "Accommodation fetched successfully",
  "data": {
    "_id": "66f7f9876a1b2c3d4e5f0001",
    "title": "Self-contain lodge near Ikeja Secretariat",
    "description": "Clean self-contain apartment with borehole water and prepaid meter.",
    "accommodationType": "self-contain",
    "price": 320000,
    "caution_fee": 30000,
    "agency_fee": 0,
    "address": "14 Allen Avenue, Ikeja, Lagos",
    "state": "Lagos",
    "lga": "Ikeja",
    "ppa_proximity": "Approximately 7 mins bus ride to State Secretariat",
    "photos": [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
    ],
    "property_info": [
      "borehole_water",
      "prepaid_meter"
    ],
    "contact_phone": "08011223344",
    "contact_whatsapp": "08011223344",
    "source": "Alumni Referral",
    "status": "active",
    "last_updated": "2026-09-30T10:00:00.000Z"
  }
}
```

### POST /accommodations

Creates a listing from JSON. Upload images first with `POST /media/accommodation-images` and pass the returned URLs in `photos`. Access: authenticated, role `admin`, `landlord`, or `agent`.

A landlord or agent must already have `verification_status` `verified` on their account. Their listing is saved as `verification_status` `pending` and stays off the public feed until an admin verifies that listing. Landlords and agents cannot set `status` or `verification_status`. An admin may set both.

| Field | Required | Notes |
| :-- | :-- | :-- |
| `title` | Yes | |
| `description` | Yes | |
| `price` | Yes | Annual rent. The alias `annualRent` is also accepted. |
| `state`, `lga`, `address` | Yes | Where the property is |
| `accommodationType` | No | `single-room`, `self-contain`, `room-and-parlour`, `one-bedroom`, `two-bedroom`, or `shared-apartment`. Default `self-contain`. Room size is this value. There is no separate bedroom or room-count field. |
| `caution_fee` | No | Alias `cautionFee`. Default `0`. |
| `agency_fee` | No | Alias `agencyFee`. Default `0`. |
| `ppa_proximity` | No | Text, for example `Approximately 12 mins transit to Ikeja PPA clusters` |
| `contact_phone`, `contact_whatsapp` | No | |
| `property_info` | No | List of strings, for example `car_park`, `borehole_water`, `prepaid_meter`, `fenced_gate` |
| `photos` | No | Image URLs, maximum 3 |

The same optional fields are accepted on `PUT /accommodations/:id`.

```json
{
  "title": "Room and parlor mini flat near Oregun",
  "description": "Spacious flat with separate living room, balcony, and steady water.",
  "accommodationType": "room-and-parlour",
  "price": 450000,
  "caution_fee": 50000,
  "agency_fee": 20000,
  "address": "8 Kudirat Abiola Way, Oregun, Ikeja, Lagos",
  "state": "Lagos",
  "lga": "Ikeja",
  "ppa_proximity": "Approximately 12 mins transit to Ikeja PPA clusters",
  "contact_phone": "08044556677",
  "contact_whatsapp": "08044556677",
  "property_info": ["car_park", "borehole_water"],
  "photos": ["https://res.cloudinary.com/.../img1.jpg"]
}
```

Response (`201 Created`) for a landlord or agent:

```json
{
  "status": "success",
  "message": "Accommodation submitted and is pending admin verification",
  "data": {
    "_id": "66f7f9876a1b2c3d4e5f0002",
    "title": "Room and parlor mini flat near Oregun",
    "accommodationType": "room-and-parlour",
    "price": 450000,
    "caution_fee": 50000,
    "agency_fee": 20000,
    "status": "active",
    "verification_status": "pending"
  }
}
```

`403` when the landlord or agent account is not verified:

* Not submitted: `{ "status": "error", "message": "Submit identity and authority documents before posting a listing" }`
* Pending: `{ "status": "error", "message": "Your account verification is still pending admin review" }`
* Rejected: `{ "status": "error", "message": "Your account verification was rejected. Update your documents and submit again" }`

### PUT /accommodations/:id

Accepts the same optional fields as `POST /accommodations`. Editing a verified listing sets `verification_status` back to `pending` and removes the listing from the public feed until an admin verifies it again.

### POST /media/accommodation-images

Uploads up to 3 listing images to Cloudinary with compression. Access: authenticated, role `admin`, `landlord`, or `agent`. Content type: `multipart/form-data`. Form field: `photos` (up to 3 image files).

```json
{
  "status": "success",
  "message": "Images uploaded successfully",
  "data": {
    "images": [
      {
        "url": "https://res.cloudinary.com/.../image1.jpg",
        "publicId": "nysc_connect/accommodations/abc123"
      },
      {
        "url": "https://res.cloudinary.com/.../image2.jpg",
        "publicId": "nysc_connect/accommodations/def456"
      }
    ]
  }
}
```

When no file is sent (`400`):

```json
{
  "status": "error",
  "message": "Please upload a document image"
}
```

### POST /media/verification-documents

Uploads one identity or authority image for account verification. Call it once per document, then pass each `url` to `POST /users/me/verification`. Access: authenticated, role `landlord` or `agent`. Content type: `multipart/form-data`. Form field: `document` (one image, maximum 5 MB).

```json
{
  "status": "success",
  "message": "Verification document uploaded successfully",
  "data": {
    "document": {
      "url": "https://res.cloudinary.com/.../nin.jpg",
      "publicId": "nysc-connect/verification/abc123"
    }
  }
}
```

When no file is sent (`400`):

```json
{
  "status": "error",
  "message": "Please upload a document image"
}
```

## 4. Local Information Guide

### GET /local-info

Returns Local Guide entries for a location. Access: authenticated.

| Query parameter | Notes |
| :-- | :-- |
| `state`, `lga` | Location filter |
| `category` | `transport`, `ppa`, `health`, `security`, `food`, or `essential_services` |
| `page` | Default `1` |
| `limit` | Default `20`, maximum `50` |

`results` is the number of items on this page. `data` is the list.

```json
{
  "status": "success",
  "total": 1,
  "page": 1,
  "pages": 1,
  "results": 1,
  "data": [
    {
      "_id": "66f7f3334a1b2c3d4e5f1111",
      "state": "Lagos",
      "lga": "Ikeja",
      "category": "transport",
      "title": "Commuting via Ikeja Bus Terminal",
      "description": "Take official yellow buses (Danfo) or use Cowry Card for BRT from terminal..."
    }
  ]
}
```

## 5. Saved items

### GET /saved

Returns the signed-in user's saved items. Items are unpopulated references. Access: authenticated.

```json
{
  "status": "success",
  "message": "Saved items retrieved successfully",
  "data": [
    {
      "_id": "66f7f5554a1b2c3d4e5f2222",
      "user_id": "66f7f1234a1b2c3d4e5f6789",
      "item_type": "accommodation",
      "item_id": "66f7f9876a1b2c3d4e5f0001",
      "created_at": "2026-09-30T12:00:00.000Z"
    }
  ]
}
```

### POST /saved

Saves an item. `item_type` accepts `accommodation` or `local_info`. Access: authenticated.

```json
{
  "item_type": "accommodation",
  "item_id": "66f7f9876a1b2c3d4e5f0001"
}
```

Response (`201 Created`):

```json
{
  "status": "success",
  "message": "Item saved successfully",
  "data": {
    "_id": "66f7f5554a1b2c3d4e5f2222",
    "user_id": "66f7f1234a1b2c3d4e5f6789",
    "item_type": "accommodation",
    "item_id": "66f7f9876a1b2c3d4e5f0001"
  }
}
```

Keep the returned `_id`. `DELETE` uses that saved-item id.

### DELETE /saved/:savedItemId

Removes a saved item. `:savedItemId` is the saved item's own `_id`, from `POST /saved` or `GET /saved`. Access: authenticated.

```json
{
  "status": "success",
  "message": "Saved item deleted successfully"
}
```

Deleting another user's saved item returns `403`:

```json
{
  "status": "error",
  "message": "You are not allowed to delete this saved item"
}
```

## 6. Reports

### POST /reports

Flags an accommodation listing or a local guide entry. Access: authenticated.

| Field | Rule |
| :-- | :-- |
| `target_type` | Kind of item being reported. The example value is `accommodation`. |
| `target_id` | The id of the item being reported |
| `reason` | `scam`, `outdated`, `incorrect`, `misleading`, or `suspicious`. The value is stored exactly as sent. |
| `details` | Optional free text |

```json
{
  "target_type": "accommodation",
  "target_id": "66f7f9876a1b2c3d4e5f0001",
  "reason": "scam",
  "details": "The contact asked for an inspection fee before viewing."
}
```

Response (`201 Created`):

```json
{
  "status": "success",
  "message": "Report submitted successfully",
  "data": {
    "_id": "66f7f8884a1b2c3d4e5f9999",
    "reporter_id": "66f7f1234a1b2c3d4e5f6789",
    "target_type": "accommodation",
    "target_id": "66f7f9876a1b2c3d4e5f0001",
    "reason": "scam",
    "details": "The contact asked for an inspection fee before viewing.",
    "status": "pending"
  }
}
```

Automatic takedown runs when the stored `reason` is `scam` and an admin sets the report to `reviewed` or `resolved`. Report moderation is separate from listing approval.

## 7. Admin

Admin routes require a token for a user whose `role` is exactly `admin`.

### GET /admin/reports

Lists reports. Query parameters: `status` (default `pending`; also `reviewed`, `resolved`, `dismissed`, `all`), `page` (default `1`), `limit` (default `20`). The reporter's name and phone are included.

```json
{
  "status": "success",
  "message": "Reports retrieved successfully",
  "data": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "reports": [
      {
        "_id": "66f7f8884a1b2c3d4e5f9999",
        "reporter_id": {
          "_id": "66f7f1234a1b2c3d4e5f6789",
          "name": "Chinedu Okafor",
          "phone": "08012345678"
        },
        "target_type": "accommodation",
        "target_id": "66f7f9876a1b2c3d4e5f0001",
        "reason": "scam",
        "details": "The contact asked for an inspection fee before viewing.",
        "status": "pending",
        "created_at": "2026-09-29T20:45:00.000Z"
      }
    ]
  }
}
```

### PATCH /admin/reports/:id

Moderates a report. Automatic accommodation takedown runs when `reason` is `scam` and `status` or the admin action is set to `resolved` or `reviewed`.

```json
{
  "status": "resolved",
  "admin_action": "resolved",
  "admin_notes": "Confirmed scam attempt. Contact blacklisted."
}
```

Response (`200 OK`):

```json
{
  "status": "success",
  "message": "Report moderated successfully",
  "data": {
    "_id": "66f7f8884a1b2c3d4e5f9999",
    "status": "resolved",
    "admin_action": "resolved",
    "admin_notes": "Confirmed scam attempt. Contact blacklisted."
  }
}
```

### GET /admin/accommodations

Listing review queue. Defaults to listings waiting for admin verification. Query parameters: `verificationStatus` (default `pending`; also `verified`, `rejected`, `flagged`, `all`), `page` (default `1`), `limit` (default `20`, maximum `50`).

The response uses the same pagination envelope as `GET /accommodations`, with the message `Accommodations fetched successfully`.

### PATCH /admin/accommodations/:id/verification

Approves or rejects a listing. `verified` sets `status` to `active` and publishes it. `rejected` keeps it hidden. The body field may be `verificationStatus` or `verification_status`. Allowed values: `verified`, `rejected`.

```json
{ "verificationStatus": "verified" }
```

Response (`200 OK`):

```json
{
  "status": "success",
  "message": "Listing verified and is now public",
  "data": {
    "_id": "66f7f9876a1b2c3d4e5f0002",
    "status": "active",
    "verification_status": "verified"
  }
}
```

Rejection message: `Listing rejected and will stay hidden from the public`.

### GET /admin/account-verifications

Landlord and agent account-verification queue. Each item includes `role`. Query parameters: `status` (default `pending`; also `not_submitted`, `verified`, `rejected`, `all`), `page` (default `1`), `limit` (default `20`, maximum `50`). Document URLs are in the packet.

```json
{
  "status": "success",
  "message": "Account verifications fetched successfully",
  "data": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1,
    "results": [
      {
        "id": "66f7f1234a1b2c3d4e5f6789",
        "name": "Ada Okonkwo",
        "phone": "08098765432",
        "role": "landlord",
        "state": "Lagos",
        "lga": "Ikeja",
        "account_verification": {
          "status": "pending",
          "id_type": "nin",
          "id_document_url": "https://res.cloudinary.com/.../nin.jpg",
          "authority_type": "utility_bill",
          "authority_document_url": "https://res.cloudinary.com/.../bill.jpg",
          "prepaid_meter_number": "04123456789",
          "zero_upfront_fee_agreed": true,
          "rejection_reason": null,
          "submitted_at": "2026-10-07T14:20:00.000Z",
          "reviewed_at": null
        }
      }
    ]
  }
}
```

### PATCH /admin/account-verifications/:userId

Approves or rejects a landlord or agent account that is currently `pending`. `:userId` is the `id` from the queue. Approval unlocks `POST /accommodations`. It does not publish any listing. Rejection requires `rejection_reason`.

Approve:

```json
{ "status": "verified" }
```

Response (`200 OK`):

```json
{
  "status": "success",
  "message": "Account verified. This landlord or agent can now post listings",
  "data": {
    "account": {
      "id": "66f7f1234a1b2c3d4e5f6789",
      "name": "Ada Okonkwo",
      "phone": "08098765432",
      "role": "landlord",
      "state": "Lagos",
      "lga": "Ikeja",
      "account_verification": {
        "status": "verified",
        "reviewed_at": "2026-10-07T15:00:00.000Z"
      }
    }
  }
}
```

Reject:

```json
{
  "status": "rejected",
  "rejection_reason": "Utility bill does not match the stated address."
}
```

## 8. Status values

| Object | Field | Values |
| :-- | :-- | :-- |
| User | `role` | `corps_member`, `landlord`, `agent`, `admin` |
| Landlord or agent account | `verification_status` and `account_verification.status` | `not_submitted`, `pending`, `verified`, `rejected` |
| Listing | `verification_status` | `pending`, `verified`, `rejected`. The review queue filter also accepts `flagged` and `all`. |
| Listing | `status` | A published listing has `status` `active` together with `verification_status` `verified`. |
| Report | `status` | `pending`, `reviewed`, `resolved`, `dismissed` |
| Report | `reason` | `scam`, `outdated`, `incorrect`, `misleading`, `suspicious` |
| Saved item | `item_type` | `accommodation`, `local_info` |
| Local Guide | `category` | `transport`, `ppa`, `health`, `security`, `food`, `essential_services` |

## 9. Errors

| Status | When | Body |
| :-- | :-- | :-- |
| 400 | Login is missing phone or password | `{ "message": "Please provide phone number and password" }` |
| 400 | Role is not allowed | `{ "message": "Invalid role. Must be corps_member, landlord, or agent" }` |
| 400 | Verification packet is invalid, or the account is already verified | `{ "status": "error", "message": "..." }` |
| 400 | Image upload has no file | `{ "status": "error", "message": "Please upload a document image" }` |
| 401 | No Bearer header | `{ "status": "error", "message": "Authentication token missing. Please log in." }` |
| 401 | Bad or expired token | `{ "status": "error", "message": "Invalid or expired token." }` |
| 401 | Account deleted after the token was issued | `{ "status": "error", "message": "User account no longer exists." }` |
| 401 | Wrong phone or password | `{ "message": "Invalid credentials" }` |
| 403 | Valid token, role not allowed | `{ "status": "error", "message": "Forbidden. You lack permission for this action." }` |
| 403 | Deleting another user's saved item | `{ "status": "error", "message": "You are not allowed to delete this saved item" }` |
| 403 | Admin self-registration | `{ "message": "Self-registration as an administrator is not permitted" }` |
| 403 | Landlord or agent posts before account verification | `{ "status": "error", "message": "Submit identity and authority documents before posting a listing" }` |
| 403 | Account verification still pending | `{ "status": "error", "message": "Your account verification is still pending admin review" }` |
| 403 | Account verification rejected | `{ "status": "error", "message": "Your account verification was rejected. Update your documents and submit again" }` |
| 404 | Unknown URL | `{ "status": "fail", "message": "Endpoint ... not found on this server" }` |
| 404 | Listing is not public, and the caller is not an admin or the owner | `404` |

## 10. Pagination

| Endpoint | Query defaults | Response shape |
| :-- | :-- | :-- |
| `GET /accommodations` | `page` 1, `limit` 10, max 50 | `data`: `{ page, limit, total, totalPages, results }` |
| `GET /accommodations/mine` | `page` 1, `limit` 10, max 50 | Same envelope. Message: `Your accommodations fetched successfully` |
| `GET /admin/accommodations` | `verificationStatus` `pending`, `page` 1, `limit` 20, max 50 | Same envelope. Message: `Accommodations fetched successfully` |
| `GET /admin/account-verifications` | `status` `pending`, `page` 1, `limit` 20, max 50 | `data`: `{ page, limit, total, totalPages, results }` |
| `GET /local-info` | `page` 1, `limit` 20, max 50 | `{ status, total, page, pages, results, data }` |
| `GET /admin/reports` | `status` `pending`, `page` 1, `limit` 20 | `data`: `{ total, page, limit, reports }` |
| `GET /saved` | | `data` is an array of saved items |

## Suggested testing order

| Step | Request | Why |
| :-- | :-- | :-- |
| 1 | `POST /auth/register` as a landlord | Creates an account and returns `token`. `verification_status` is `not_submitted`. |
| 2 | `POST /media/verification-documents` twice | Returns the two document URLs. |
| 3 | `POST /users/me/verification` | Sets the account to `pending`. |
| 4 | `PATCH /admin/account-verifications/:userId` with an admin token | The landlord must be `verified` before creating a listing. |
| 5 | `POST /media/accommodation-images`, then `POST /accommodations` | The listing starts as `verification_status` `pending`. |
| 6 | `PATCH /admin/accommodations/:id/verification` | Makes the listing visible in public search. |
| 7 | `GET /accommodations` | Confirms the listing appears. |
| 8 | Register a corps member, then `POST /saved` and `POST /reports` | Exercises save and report. |
| 9 | `GET /admin/reports` and `PATCH /admin/reports/:id` | Exercises moderation. |

## 11. Cross-cutting access and workflow rules

* Canonical role values returned by the API are `corps_member`, `landlord`, `agent`, and `admin`. Product language may group landlord and agent as one Landlord/Agent role. Clients must send and read the separate role strings.
* Protected endpoints require a valid Bearer token. Admin routes require `role` `admin` on the server.
* A landlord or agent must be account-verified before `POST /accommodations`.
* Account verification and listing verification are separate workflows and separate status fields: `account_verification.status` on the user, and `verification_status` on the listing.
* A listing is on the public feed only when `status` is `active` and `verification_status` is `verified`.
* Save supports both accommodation and Local Guide entries. `item_type` is `accommodation` or `local_info`.
* The Local Guide has the six categories in the Local Information section: `transport`, `ppa`, `health`, `security`, `food`, and `essential_services`.
* `ppa` / `ppa_name` is optional for corps member registration.
* Listings expose `last_updated`. That value is when the listing information was updated. It does not mean the property or the contact was independently verified.
* The backend enforces authorization, ownership, and visibility.

## 12. Technical Writing publication checklist

Items checked below are already stated in `backend/docs/API_CONTRACT_V1.md` and in this document.

- [x] Confirm exact status enums and decision payloads for account and listing verification.
- [x] Confirm `GET /accommodations/mine`: the route is in the contract, with the same pagination envelope as `GET /accommodations` and the message `Your accommodations fetched successfully`.
- [x] Confirm `GET /auth/me` and `GET /users/me`: both return the same profile shape.
- [x] Add HTTP codes and error examples for protected workflows. Section 9 lists the messages in the contract. The contract does not give a separate sentence for every verification `400`.
- [x] Confirm pagination, filtering, and sorting for the list endpoints in section 10.
- [ ] Run each request example against staging and capture the live responses.
- [ ] Confirm document upload file types. The contract names the form fields `photos` (up to 3 images) and `document` (one image, maximum 5 MB). It does not list allowed extensions.
- [ ] Add a full response body for every endpoint. `GET /accommodations/mine`, `PUT /accommodations/:id`, and `GET /admin/accommodations` currently refer to the search envelope.
- [ ] Confirm duplicate-save behaviour. The contract does not describe sending the same save twice.
- [ ] Keep this API document, the frontend integration notes, the README, the FAQ, and the glossary aligned with the locked MVP.

## Document status

Corrected draft aligned with backend confirmations supplied by the project team and the locked MVP. Before publishing as the final API reference, validate route names, request/response schemas, enums and HTTP status codes against the deployed staging API. Unconfirmed details are flagged rather than invented.
