# NYSC Connect — Frontend & Mobile API Specification (v1 Verified)

* **Base URL:** `http://localhost:5000/api/v1` (Local) / `[https://nysc-connect.onrender.com/api/v1](https://nysc-connect.onrender.com/api/v1)` (Staging)
* **Default Content-Type:** `application/json` (except image upload which requires `multipart/form-data`)


* **Authorization Header:** `Authorization: Bearer <token>` (Strict: requires exact space after `Bearer`)

---

## Response Envelope & Error Patterns

1. **Standard Module Envelope (Accommodations, Local Info, Saved, Reports, Admin):**
* Success: `{ "status": "success", "message": "...", "data": { ... } }`
* Error: `{ "status": "error", "message": "..." }`
* Unknown Route (404): `{ "status": "fail", "message": "Endpoint ... not found on this server" }`


2. **Auth Envelope (`/auth/register`, `/auth/login`, `/auth/me`, `/users/me`):**
* **No `status` field** and **no outer `data` wrapper**.
* Success register/login: `{ "message": "...", "token": "...", "user": { ... } }`
* Success GET me: `{ "user": { ... } }` (No `message`, no `status`).
* Auth Errors: Direct `{ "message": "..." }` without `status`.
* `GET` and `POST /users/me/verification` use the **standard module envelope**, not this auth envelope.



---

## 1. Authentication & User Profile

### `POST /auth/register`

Creates a corps member, landlord, or agent account. Admin accounts cannot be created here.

* **Access:** Public
* **Request Body (corps member):**

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
*(`email` is required for corps members, landlords, and agents. It must be unique. `name`, `phone`, `password`, `state`, and `lga` are also required. `ppa` / `ppa_name` is optional.)*

* **Request Body (landlord or agent):**

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

*(`role` may also be `"agent"`. If `role` is omitted, the account is created as `corps_member`. Accepted values: `corps_member`, `landlord`, `agent`. `email`, `name`, `phone`, `password`, `state`, and `lga` are required for every role. `email` and `phone` must be unique. `phone` must be at least 10 characters. `ppa` / `ppa_name` and `ppa_proximity` are optional.)*

* **Response (`201 Created`):**

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

*(`verification_status` is returned only for `landlord` and `agent`. Values are `not_submitted`, `pending`, `verified`, or `rejected`. A new landlord or agent cannot post a listing until an admin sets this to `verified`. Corps member profiles omit this field.)*

* **Error (`403 Forbidden` if registering as admin):**

```json
{
  "message": "Self-registration as an administrator is not permitted"
}

```

* **Error (`400 Bad Request` if role is not allowed):**

```json
{
  "message": "Invalid role. Must be corps_member, landlord, or agent"
}

```

---

### `POST /auth/login`

Authenticates user using phone and password.

* **Access:** Public
* **Request Body:**

```json
{
  "phone": "08012345678",
  "password": "Password123!"
}

```

* **Validation / Error Responses:**
* Missing fields (`400 Bad Request`): `{ "message": "Please provide phone number and password" }`
* Invalid credentials (`401 Unauthorized`): `{ "message": "Invalid credentials" }`


* **Response (`200 OK`):**

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

---

### `GET /auth/me` (or `GET /users/me`)

Retrieves the profile of the authenticated user.

* **Access:** Authenticated (`Authorization: Bearer <token>`)


* **Response (`200 OK`):**

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

---

### `PATCH /users/me`

Updates location and PPA assignment fields.

* **Access:** Authenticated (`Authorization: Bearer <token>`)


* **Request Body:**

```json
{
  "state": "Lagos",
  "lga": "Kosofe",
  "ppa": "Kosofe Local Government Secretariat",
  "ppa_name": "Kosofe Local Government Secretariat"
}

```

* **Response (`200 OK`):**

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

---

### `GET /users/me/verification`

Returns the signed-in landlord or agent's account verification packet, including document URLs.

* **Access:** Authenticated (`role` must be `landlord` or `agent`)
* **Response (`200 OK`):**

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

---

### `POST /users/me/verification`

Submits identity, proof of authority, and the no-upfront-fee agreement. Upload both images first with `POST /media/verification-documents`, then send the returned URLs here. A verified account cannot submit again. A rejected account can submit a new packet, which returns the status to `pending`.

* **Access:** Authenticated (`role` must be `landlord` or `agent`)
* **Request Body (landlord):**

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

* **Request Body (agent):**

```json
{
  "id_type": "drivers_license",
  "id_document_url": "https://res.cloudinary.com/.../license.jpg",
  "authority_type": "authorization_letter",
  "authority_document_url": "https://res.cloudinary.com/.../mandate.jpg",
  "zero_upfront_fee_agreed": true
}

```

*(`id_type`: `nin`, `pvc`, `drivers_license`, or `passport`. Landlord `authority_type`: `utility_bill` or `proof_of_ownership`. `prepaid_meter_number` is required only for `utility_bill`. Agent `authority_type`: `authorization_letter` or `agency_registration`. `zero_upfront_fee_agreed` must be `true`.)*

* **Response (`200 OK`):**

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

* **Errors (`400 Bad Request`):** missing or invalid document URL, wrong `authority_type` for the role, missing meter number on a utility bill, fee policy not accepted, or the account is already verified.

---

## 2. Locations (Pilot Reference Data)

### `GET /locations/states`

* **Access:** Public
* **Response (`200 OK`):**

```json
{
  "status": "success",
  "message": "State retrieved successfully",
  "data": {
    "states": [
      "Lagos",
      "Oyo"
    ]
  }
}

```

---

### `GET /locations/lgas?state=Lagos`

* **Access:** Public
* **Query Parameters:** `state` (required: `Lagos`, `Oyo`)


* **Response (`200 OK`):**

```json
{
  "status": "success",
  "message": "LGAs retrieved successfully",
  "data": {
    "state": "Lagos",
    "lgas": [
      "Ikeja",
      "Kosofe"
    ]
  }
}

```

*(Querying `state=Oyo` returns `["Ibadan North"]`.)*

---

## 3. Accommodations (Housing Module)

### `GET /accommodations`

Searches and filters the public feed. Only listings with `status: "active"` and `verification_status: "verified"` are returned. Pending and rejected listings stay hidden.

* **Access:** Public
* **Query Parameters:**
* `state`, `lga`, `minPrice`, `maxPrice`
* `accommodationType`, `amenities`, `sort`
* `page` (default: `1`), `limit` (default: `10`, max: `50`)


* **Response (`200 OK`):**

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
        "price": 320000,
        "caution_fee": 30000,
        "address": "14 Allen Avenue, Ikeja, Lagos",
        "state": "Lagos",
        "lga": "Ikeja",
        "ppa_proximity": "Approximately 7 mins bus ride to State Secretariat",
        "photos": [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
        ],
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
        "last_updated": "2026-09-30T10:00:00.000Z"
      }
    ]
  }
}

```

---

### `GET /accommodations/mine`

Lists accommodations owned by the signed-in landlord, agent, or admin, including pending and rejected listings.

* **Access:** Authenticated (`role` must be `landlord`, `agent`, or `admin`)
* **Query Parameters:** `verificationStatus` (`pending`, `verified`, `rejected`, `flagged`, or `all`), `page` (default: `1`), `limit` (default: `10`, max: `50`)
* **Response (`200 OK`):** same pagination envelope as `GET /accommodations`, with message `"Your accommodations fetched successfully"`.

---

### `GET /accommodations/:id`

Retrieves single listing details. A listing that is not both `active` and `verified` is returned only to an admin or the listing owner. Everyone else receives `404`.

* **Access:** Authenticated (`Authorization: Bearer <token>`)
* **Response (`200 OK`):**

```json
{
  "status": "success",
  "message": "Accommodation fetched successfully",
  "data": {
    "_id": "66f7f9876a1b2c3d4e5f0001",
    "title": "Self-contain lodge near Ikeja Secretariat",
    "description": "Clean self-contain apartment with borehole water and prepaid meter.",
    "price": 320000,
    "caution_fee": 30000,
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

---

### `POST /accommodations`

Creates an accommodation entry using raw JSON. Image uploads must be executed prior using `POST /media/accommodation-images` and passed as strings in `photos`.

A landlord or agent must already have `verification_status: "verified"` on their account. Their listing is saved as `verification_status: "pending"` and does not appear on the public feed until an admin verifies that listing. They cannot set `status` or `verification_status` themselves. An admin may set both.

Required fields: `title`, `description`, `price` (or `annualRent`), `state`, `lga`, and `address`. Photos are optional and capped at 3.

* **Access:** Authenticated (`role` must be `admin`, `landlord`, or `agent`)


* **Request Body:**

```json
{
  "title": "Room and parlor mini flat near Oregun",
  "description": "Spacious flat with separate living room, balcony, and steady water.",
  "price": 450000,
  "caution_fee": 50000,
  "address": "8 Kudirat Abiola Way, Oregun, Ikeja, Lagos",
  "state": "Lagos",
  "lga": "Ikeja",
  "ppa_proximity": "Approximately 12 mins transit to Ikeja PPA clusters",
  "contact_phone": "08044556677",
  "contact_whatsapp": "08044556677",
  "property_info": [
    "car_park",
    "borehole_water"
  ],
  "photos": [
    "https://res.cloudinary.com/.../img1.jpg"
  ]
}

```

* **Response (`201 Created`, landlord or agent):**

```json
{
  "status": "success",
  "message": "Accommodation submitted and is pending admin verification",
  "data": {
    "_id": "66f7f9876a1b2c3d4e5f0002",
    "title": "Room and parlor mini flat near Oregun",
    "price": 450000,
    "status": "active",
    "verification_status": "pending"
  }
}

```

* **Error (`403 Forbidden` if the landlord or agent account is not verified):**

* Not submitted: `{ "status": "error", "message": "Submit identity and authority documents before posting a listing" }`
* Pending review: `{ "status": "error", "message": "Your account verification is still pending admin review" }`
* Rejected: `{ "status": "error", "message": "Your account verification was rejected. Update your documents and submit again" }`

Editing a verified listing with `PUT /accommodations/:id` sends it back to `pending` and removes it from the public feed until an admin verifies it again.

---

### `POST /media/accommodation-images`

Uploads up to 3 listing images to Cloudinary with compression.

* **Access:** Authenticated (`role` must be `admin`, `landlord`, or `agent`)


* **Content-Type:** `multipart/form-data`

* **Body:** Form field `photos` (Array of up to 3 image files)


* **Response (`200 OK`):**

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
if no file is sent 
* **Response (`400`):**

```json
{
  "status": "error",
  "message": "Please upload a document image"
}
---
---

### `POST /media/verification-documents`

Uploads one identity or authority image for landlord/agent account verification. Call it once per document, then pass each `url` to `POST /users/me/verification`.

* **Access:** Authenticated (`role` must be `landlord` or `agent`)
* **Content-Type:** `multipart/form-data`
* **Body:** Form field `document` (one image, max 5MB)

* **Response (`200 OK`):**

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

if no file is sent 
* **Response (`400`):**

```json
{
  "status": "error",
  "message": "Please upload a document image"
}
---

## 4. Local Information Guide

### `GET /local-info`

Fetches community safety, transport, and facility guidelines by location.

* **Access:** Authenticated (`Authorization: Bearer <token>`)
* **Query Parameters:**
* `state`, `lga`
* `category` (Allowed: `transport`, `ppa`, `health`, `security`, `food`, `essential_services`)
* `page` (default: `1`), `limit` (default: `20`, max: `50`)


* **Response (`200 OK`):**

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

---

## 5. Saved Items (Bookmarks)

### `GET /saved`

Fetches unpopulated favorited items for the authenticated user.

* **Access:** Authenticated (`Authorization: Bearer <token>`)


* **Response (`200 OK`):**

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

---

### `POST /saved`

Saves an accommodation or local info item to favorites.

* **Access:** Authenticated (`Authorization: Bearer <token>`)


* **Request Body:**

```json
{
  "item_type": "accommodation",
  "item_id": "66f7f9876a1b2c3d4e5f0001"
}

```

*(Note: `item_type` accepts `accommodation` or `local_info`.)*

* **Response (`201 Created`):**

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

---

### `DELETE /saved/:savedItemId`

Removes a saved record by its record `_id` (not the lodge target ID).

* **Access:** Authenticated (`Authorization: Bearer <token>`)


* **Response (`200 OK`):**

```json
{
  "status": "success",
  "message": "Saved item deleted successfully"
}

```

* **Error (`403 Forbidden` if deleting another user's bookmark):**

```json
{
  "status": "error",
  "message": "You are not allowed to delete this saved item"
}

```

---

## 6. Safety & Community Moderation

### `POST /reports`

Flags an accommodation listing or local guide.

* **Access:** Authenticated (`Authorization: Bearer <token>`)


* **Request Body:**

```json
{
  "target_type": "accommodation",
  "target_id": "66f7f9876a1b2c3d4e5f0001",
  "reason": "scam",
  "details": "The contact asked for an inspection fee before viewing."
}

```

*(Valid `reason` values: `scam`, `outdated`, `incorrect`, `misleading`, `suspicious`. Stored reason matches payload value exactly.)*

* **Response (`201 Created`):**

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

---

## 7. Admin Moderation Queue

### `GET /admin/reports`

Inspects flagged reports queue with populated reporter info.

* **Access:** Admin Authenticated (`role` must be lowercase `"admin"`)
* **Query Parameters:** `status` (default: `pending`; options: `reviewed`, `resolved`, `dismissed`, `all`), `page` (default: `1`), `limit` (default: `20`)


* **Response (`200 OK`):**

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

---

### `PATCH /admin/reports/:id`

Moderator action on a report. Automatic accommodation status takedown triggers if `reason === "scam"` and status/action is updated to `resolved` or `reviewed`.

* **Access:** Admin Authenticated (`role` must be lowercase `"admin"`)
* **Request Body:**

```json
{
  "status": "resolved",
  "admin_action": "resolved",
  "admin_notes": "Confirmed scam attempt. Contact blacklisted."
}

```

* **Response (`200 OK`):**

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

---

### `GET /admin/accommodations`

Listing review queue. Defaults to listings waiting for admin verification.

* **Access:** Admin Authenticated (`role` must be lowercase `"admin"`)
* **Query Parameters:** `verificationStatus` (default: `pending`; options: `verified`, `rejected`, `flagged`, `all`), `page` (default: `1`), `limit` (default: `20`, max: `50`)
* **Response (`200 OK`):** same pagination envelope as `GET /accommodations`, with message `"Accommodations fetched successfully"`.

---

### `PATCH /admin/accommodations/:id/verification`

Approves or rejects a listing. `verified` sets `status` to `active` and publishes it on the public feed. `rejected` keeps it hidden.

* **Access:** Admin Authenticated (`role` must be lowercase `"admin"`)
* **Request Body:**

```json
{
  "verificationStatus": "verified"
}

```

*(Also accepts `verification_status`. Allowed values: `verified`, `rejected`.)*

* **Response (`200 OK`):**

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

*(Rejection message: `"Listing rejected and will stay hidden from the public"`.)*

---

### `GET /admin/account-verifications`

Landlord and agent account-verification queue.

* **Access:** Admin Authenticated (`role` must be lowercase `"admin"`)
* **Query Parameters:** `status` (default: `pending`; options: `not_submitted`, `verified`, `rejected`, `all`), `page` (default: `1`), `limit` (default: `20`, max: `50`)
* **Response (`200 OK`):**

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

---

### `PATCH /admin/account-verifications/:userId`

Approves or rejects a pending landlord or agent account. Approval unlocks `POST /accommodations`. Rejection requires `rejection_reason`. Only accounts currently in `pending` can be reviewed.

* **Access:** Admin Authenticated (`role` must be lowercase `"admin"`)
* **Request Body:**

```json
{
  "status": "verified"
}

```

*(Rejection body: `{ "status": "rejected", "rejection_reason": "Utility bill does not match the stated address." }`)*

* **Response (`200 OK`):**

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

---

## 8. Common HTTP Error Statuses & Messages

### 401 Unauthorized

Triggered when accessing protected routes without a valid Bearer JWT:

* Missing or malformed header: `{ "status": "error", "message": "Authentication token missing. Please log in." }`
* Invalid or expired token: `{ "status": "error", "message": "Invalid or expired token." }`
* Deleted account: `{ "status": "error", "message": "User account no longer exists." }`

### 403 Forbidden

Triggered when role permissions or resource ownership checks fail:

* Insufficient role permissions (`restrictTo`): `{ "status": "error", "message": "Forbidden. You lack permission for this action." }`
* Unpermitted bookmark deletion: `{ "status": "error", "message": "You are not allowed to delete this saved item" }`
* Admin self-registration: `{ "message": "Self-registration as an administrator is not permitted" }`
* Unverified landlord or agent posting a listing: `{ "status": "error", "message": "Submit identity and authority documents before posting a listing" }`