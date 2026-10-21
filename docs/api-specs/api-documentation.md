# NYSC Connect: API Documentation

*Version 1.0 (MVP)*

*Based on the Frontend and Mobile API Specification v1 as corrected by Backend and sent by PM, plus Backend's written confirmations. Matches the Final MVP (three roles).*

## Overview

| Item                 | Value                                                                                                                                                                                                                                                                        |
| :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Staging base URL     | [https//nysc-connect.onrender.com/api/v1](https://nysc-connect.onrender.com/api/v1)                                                                                                                                                                                          |
| Local base URL       | [http//localhost:5000/api/v1](http://localhost:5000/api/v1)                                                                                                                                                                                                                  |
| Content type         | application/json (unless an endpoint says multipart/form-data)                                                                                                                                                                                                               |
| Authorization header | Authorization: Bearer token                                                                                                                                                                                                                                                  |
| Roles                | corpsmember, landlord, agent, admin (the PRD treats landlord and agent as one MVP role, Landlord/Agent, with two paths)                                                                                                                                                      |
| Health check         | GET /health returns a healthy status. Full URL: [https//nysc-connect.onrender.com/api/v1/health](https://nysc-connect.onrender.com/api/v1/health). Routes in this document are written relative to the base URL, which already ends in /api/v1, so do not add /api/v1 again. |

## Response Formats

The API uses two response patterns. Clients should read the message field and treat any HTTP 4xx or 5xx status as an error, even when the status field is missing.

**1 Standard envelope (accommodations, saved items, reports, admin, verification)**

Success: { "status": "success", "message": "...", "data": { ... } }  
Error:   { "status": "error", "message": "..." }  
Unknown URL (404): { "status": "fail", "message": "Endpoint ... not found on this server" }

**2 Auth envelope (/auth/register, /auth/login, /auth/me, /users/me)**

Success (register or login): { "message": "...", "token": "...", "user": { ... } }  
Success (GET me):  { "user": { ... } }  
Error: { "message": "..." }   (no status field)

GET and POST /users/me/verification use the standard envelope, not the auth envelope.

## Authentication

| Rule                       | Value                                                                                                          |
| :------------------------- | :------------------------------------------------------------------------------------------------------------- |
| Where the token comes from | The token field in the 201 response from register and the 200 response from login                              |
| How to send it             | Authorization: Bearer token                                                                                    |
| Token payload              | { id: userId }                                                                                                 |
| Lifetime                   | Set by JWTEXPIRESIN, or 7 days by default                                                                      |
| Public routes              | register, login, GET /accommodations (feed), locations, health                                                 |
| Protected routes           | users/me, reports, saved, local-info, admin, accommodations (create, update, delete, get by ID), media uploads |

## Workflow: Landlord/Agent Verification and Listing Submission

There are two separate admin gates. Account verification does not publish a property.

| Step | Who               | Call                                                                   | Result                                                                                   |
| :--- | :---------------- | :--------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| 1    | Landlord or agent | POST /auth/register with role landlord or agent                        | Account created. verificationstatus is notsubmitted.                                     |
| 2    | Landlord or agent | POST /media/verification-documents (once per document)                 | Returns a url and publicId for each image.                                               |
| 3    | Landlord or agent | POST /users/me/verification                                            | Packet saved. accountverification.status is pending.                                     |
| 4    | Admin             | GET /admin/account-verifications                                       | Queue of landlords and agents. Defaults to pending.                                      |
| 5    | Admin             | PATCH /admin/account-verifications/:userId                             | verified unlocks posting. rejected needs a rejectionreason.                              |
| 6    | Landlord or agent | POST /media/accommodation-images (optional), then POST /accommodations | Listing saved with status active and verificationstatus pending. Not on the public feed. |
| 7    | Admin             | GET /admin/accommodations                                              | Queue of listings. Defaults to pending.                                                  |
| 8    | Admin             | PATCH /admin/accommodations/:id/verification                           | verified publishes the listing. rejected keeps it hidden.                                |

Rules: an unverified, pending, or rejected landlord or agent gets 403 on POST /accommodations. A rejected account can submit a new packet with POST /users/me/verification, which sets it back to pending and clears rejectionreason. A verified account cannot submit again. Editing a published listing with PUT /accommodations/:id sends it back to pending and removes it from the public feed. Deleting a listing archives it. A rejected listing stays rejected and hidden when it is edited, and there is no separate resubmit endpoint for it. All reviews are manual: there is no OCR, no automatic document reading, no government database check, and no automatic approval.

## Who can call what

| Who | Routes |
| :---- | :---- |
| Anyone | POST /auth/register, POST /auth/login, GET /locations/states, GET /locations/lgas, GET /accommodations, GET /health |
| Any signed-in user | GET /auth/me, GET and PATCH /users/me, GET /accommodations/:id, GET /local-info, GET /local-info/categories, GET /local-info/:id, GET /saved, POST /saved, DELETE /saved/:id, POST /reports |
| Landlord or agent | GET and POST /users/me/verification, POST /media/verification-documents, GET /accommodations/mine, POST /accommodations |
| Landlord, agent, or admin | POST /media/accommodation-images, PUT and DELETE /accommodations/:id |
| Admin | GET and PATCH /admin/reports, GET /admin/accommodations, PATCH /admin/accommodations/:id/verification, GET /admin/account-verifications, PATCH /admin/account-verifications/:userId, POST /local-info |

### 1 Authentication and Users

**POST /auth/register**

Creates a corps member, landlord, or agent account. Admin self-registration is not allowed. Access: Public.

**Request fields**

| Field         | Type   | Required | Notes                                                     |
| :------------ | :----- | :------- | :-------------------------------------------------------- |
| name          | string | Yes      |                                                           |
| phone         | string | Yes      | Unique. At least 10 characters.                           |
| email         | string | Yes      | Required for every role. Unique.                          |
| password      | string | Yes      |                                                           |
| state         | string | Yes      | Lagos or Oyo (pilot)                                      |
| lga           | string | Yes      | For example Ikeja, Kosofe, Ibadan North                   |
| ppa / ppaname | string | No       | Optional PPA. Either field name is accepted.              |
| role          | string | No       | corpsmember, landlord, or agent. Defaults to corpsmember. |

**Example request (corps member)**

{  
  "name": "Chinedu Okafor",  
  "phone": "08012345678",  
  "email": "chinedu.okafor@email.com",  
  "password": "Password123",  
  "state": "Lagos",  
  "lga": "Ikeja",  
  "ppa": "State High School",  
  "ppaname": "State High School",  
  "role": "corpsmember"  
}

**Example request (landlord or agent)**

{  
  "name": "Ada Okonkwo",  
  "phone": "08098765432",  
  "email": "ada.okonkwo@email.com",  
  "password": "Password123",  
  "state": "Lagos",  
  "lga": "Ikeja",  
  "role": "landlord"  
}

**Response (201 Created, landlord)**

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
    "ppaname": null,  
    "ppaproximity": null,  
    "role": "landlord",  
    "verificationstatus": "notsubmitted"  
  }  
}

verificationstatus is returned only for landlord and agent accounts (notsubmitted, pending, verified, rejected). A new landlord or agent cannot post a listing until an admin sets it to verified. Corps member profiles do not include this field.

**Errors**

* 403: { "message": "Self-registration as an administrator is not permitted" }
* 400: { "message": "Invalid role. Must be corpsmember, landlord, or agent" }

**POST /auth/login**

Logs in with phone number and password. Email is not used to log in. Access: Public.

{  
  "phone": "08012345678",  
  "password": "Password123"  
}

**Response (200 OK)**

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
    "ppaname": "State High School",  
    "ppaproximity": null,  
    "role": "corpsmember"  
  }  
}

**Errors**

* 400: { "message": "Please provide phone number and password" } (a field is missing)
* 401: { "message": "Invalid credentials" } (unknown phone or wrong password; same message for both)

**GET /auth/me  (also GET /users/me)**

Returns the signed-in user's profile. Access: Authenticated.

{  
  "user": {  
    "id": "66f7f1234a1b2c3d4e5f6789",  
    "name": "Chinedu Okafor",  
    "phone": "08012345678",  
    "email": "chinedu.okafor@email.com",  
    "state": "Lagos",  
    "lga": "Ikeja",  
    "ppa": "State High School",  
    "ppaname": "State High School",  
    "ppaproximity": null,  
    "role": "corpsmember"  
  }  
}

**PATCH /users/me**

Updates the signed-in user's State, LGA, workplace (PPA), and the travel time to the workplace (ppaproximity). Send either ppa or ppaname. Both write the same stored field. Access: Authenticated.

{  
  "state": "Lagos",  
  "lga": "Kosofe",  
  "ppa": "Kosofe Local Government Secretariat",  
  "ppaproximity": "Approximately 10 minutes to the secretariat"  
}

Response (200 OK): { "message": "Profile updated successfully", "user": { ... } } with the updated user object.

**GET /users/me/verification**

Returns the landlord or agent's account verification record. Access: Authenticated, role landlord or agent. Uses the standard envelope.

{  
  "status": "success",  
  "message": "Account verification fetched successfully",  
  "data": {  
    "accountverification": {  
      "status": "notsubmitted",  
      "idtype": null,  
      "iddocumenturl": null,  
      "authoritytype": null,  
      "authoritydocumenturl": null,  
      "prepaidmeternumber": null,  
      "zeroupfrontfeeagreed": false,  
      "rejectionreason": null,  
      "submittedat": null,  
      "reviewedat": null  
    }  
  }  
}

**POST /users/me/verification**

Submits identity, proof of authority, and the no upfront fee agreement. Upload both document images first with POST /media/verification-documents, then send the returned URLs here. A verified account cannot submit again. A rejected account can submit a new packet, which resets the status to pending. Access: Authenticated, role landlord or agent.

| Field                | Rule                                                                                         |
| :------------------- | :------------------------------------------------------------------------------------------- |
| idtype               | nin, pvc, driverslicense, or passport                                                        |
| iddocumenturl        | URL returned by the document upload                                                          |
| authoritytype        | Landlord: utilitybill or proofofownership. Agent: authorizationletter or agencyregistration. |
| authoritydocumenturl | URL returned by the document upload                                                          |
| prepaidmeternumber   | Required only when authoritytype is utilitybill                                              |
| zeroupfrontfeeagreed | Must be true                                                                                 |

**Example request (landlord)**

{  
  "idtype": "nin",  
  "iddocumenturl": "https//res.cloudinary.com/.../nin.jpg",  
  "authoritytype": "utilitybill",  
  "authoritydocumenturl": "https//res.cloudinary.com/.../bill.jpg",  
  "prepaidmeternumber": "04123456789",  
  "zeroupfrontfeeagreed": true  
}

**Example request (agent)**

{  
  "idtype": "driverslicense",  
  "iddocumenturl": "https//res.cloudinary.com/.../license.jpg",  
  "authoritytype": "authorizationletter",  
  "authoritydocumenturl": "https//res.cloudinary.com/.../mandate.jpg",  
  "zeroupfrontfeeagreed": true  
}

**Response (200 OK)**

{  
  "status": "success",  
  "message": "Verification submitted and is pending admin review",  
  "data": {  
    "accountverification": {  
      "status": "pending",  
      "idtype": "nin",  
      "iddocumenturl": "https//res.cloudinary.com/.../nin.jpg",  
      "authoritytype": "utilitybill",  
      "authoritydocumenturl": "https//res.cloudinary.com/.../bill.jpg",  
      "prepaidmeternumber": "04123456789",  
      "zeroupfrontfeeagreed": true,  
      "rejectionreason": null,  
      "submittedat": "2026-10-07T14:20:00.000Z",  
      "reviewedat": null  
    }  
  }  
}

Errors (400): missing or invalid document URL, wrong authoritytype for the role, missing meter number on a utility bill, fee policy not accepted, or the account is already verified.

### 2 Locations (Pilot Reference Data)

**GET /locations/states**

Returns the supported pilot states. Access: Public.

{  
  "status": "success",  
  "message": "State retrieved successfully",  
  "data": { "states": "Lagos", "Oyo" }  
}

**GET /locations/lgas?state=Lagos**

Returns the LGAs for a pilot state. Access: Public. Query parameter: state (required). Lagos returns Ikeja and Kosofe. Oyo returns to Ibadan North.

{  
  "status": "success",  
  "message": "LGAs retrieved successfully",  
  "data": { "state": "Lagos", "lgas": "Ikeja", "Kosofe" }  
}

### 3 Accommodations

**GET /accommodations**

Searches the public feed. Only listings with status active and verificationstatus verified are returned. Pending and rejected listings stay hidden. Access: Public.

| Query parameter     | Type   | Notes                                                                                      |
| :------------------ | :----- | :----------------------------------------------------------------------------------------- |
| state               | string | Lagos or Oyo                                                                               |
| lga                 | string | Ikeja, Kosofe, or Ibadan North                                                             |
| accommodationType   | string | single-room, self-contain, room-and-parlour, one-bedroom, two-bedroom, or shared-apartment |
| amenities           | string | Optional filter                                                                            |
| sort                | string | newest, priceasc, or pricedesc                                                             |
| minPrice / maxPrice | number | Annual rent range                                                                          |
| page                | number | Default 1                                                                                  |
| limit               | number | Default 10, maximum 50                                                                     |

**Response (200 OK)**

{  
  "status": "success",  
  "message": "Accommodations fetched successfully",  
  "data": {  
    "page": 1,  
    "limit": 10,  
    "total": 4,  
    "totalPages": 1,  
    "results":   
      {  
        "id": "66f7f9876a1b2c3d4e5f0001",  
        "title": "Self-contain lodge near Ikeja Secretariat",  
        "description": "Clean self-contain apartment with tiled floor, running borehole water, and prepaid meter.",  
        "accommodationType": "self-contain",  
        "price": 320000,  
        "cautionfee": 30000,  
        "agencyfee": 0,  
        "address": "14 Allen Avenue, Ikeja, Lagos",  
        "state": "Lagos",  
        "lga": "Ikeja",  
        "ppaproximity": "Approximately 7 mins bus ride to State Secretariat / NYSC Camp",  
        "photos": "https//images.unsplash.com/photo-1522708323590-d24dbb6b0267",  
        "propertyinfo": "boreholewater", "prepaidmeter", "fencedgate",  
        "contactphone": "+2348011223344",  
        "contactwhatsapp": "+2348011223344",  
        "source": "Alumni Referral",  
        "status": "active",  
        "verificationstatus": "verified",  
        "createdat": "2026-09-30T10:00:00.000Z",  
        "lastupdated": "2026-09-30T10:00:00.000Z"  
      }  
      
  }  
}

Display rules: price is the annual rent. ppaproximity is supplied text, not a calculated distance. Show source and lastupdated on every listing. lastupdated has the same value as the stored lastupdatedat field. Freshness (for example, may be outdated after 30 days) is worked out from lastupdated.

**GET /accommodations/mine**

Lists the signed-in landlord, agent, or admin's own listings, including pending and rejected ones. Access: Authenticated, role landlord, agent, or admin. Query parameters: verificationStatus (pending, verified, rejected, flagged, all), page (default 1), limit (default 10, maximum 50). The response uses the same pagination envelope as GET /accommodations, with the message "Your accommodations fetched successfully". There is no returned status: a listing that needs a correction is set to rejected, so the owner finds it with verificationStatus=rejected.

**GET /accommodations/:id**

Returns one listing. Access: Authenticated. A listing that is not both active and verified is returned only to an admin or the listing owner. Everyone else receives 404

{  
  "status": "success",  
  "message": "Accommodation fetched successfully",  
  "data": {  
    "id": "66f7f9876a1b2c3d4e5f0001",  
    "title": "Self-contain lodge near Ikeja Secretariat",  
    "description": "Clean self-contain apartment with borehole water and prepaid meter.",  
    "accommodationType": "self-contain",  
    "price": 320000,  
    "cautionfee": 30000,  
    "agencyfee": 0,  
    "address": "14 Allen Avenue, Ikeja, Lagos",  
    "state": "Lagos",  
    "lga": "Ikeja",  
    "ppaproximity": "Approximately 7 mins bus ride to State Secretariat",  
    "photos": "https//images.unsplash.com/photo-1522708323590-d24dbb6b0267",  
    "propertyinfo": "boreholewater", "prepaidmeter",  
    "contactphone": "08011223344",  
    "contactwhatsapp": "08011223344",  
    "source": "Alumni Referral",  
    "status": "active",  
    "lastupdated": "2026-09-30T10:00:00.000Z"  
  }  
}

**POST /accommodations**

Creates a listing from raw JSON or multipart/form-data. Upload images first with POST /media/accommodation-images and pass the returned URLs in photos (maximum 3, optional). Access: Authenticated, role admin, landlord, or agent.

| Field                         | Required | Notes                                                                                                                                                            |
| :---------------------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| title                         | Yes      |                                                                                                                                                                  |
| description                   | Yes      |                                                                                                                                                                  |
| price                         | Yes      | Annual rent. The alias annualRent is also accepted.                                                                                                              |
| state, lga, address           | Yes      | Where the property is                                                                                                                                            |
| accommodationType             | No       | single-room, self-contain, room-and-parlour, one-bedroom, two-bedroom, or shared-apartment. Default is self-contain. There is no separate bedroom or room count. |
| cautionfee                    | No       | Alias cautionFee. Default 0                                                                                                                                      |
| agencyfee                     | No       | Alias agencyFee. Default 0                                                                                                                                       |
| ppaproximity                  | No       | Text, for example "Approximately 12 mins transit to Ikeja PPA clusters"                                                                                          |
| contactphone, contactwhatsapp | No       |                                                                                                                                                                  |
| propertyinfo                  | No       | List, for example boreholewater, prepaidmeter, fencedgate                                                                                                        |
| photos                        | No       | Image URLs, maximum 3                                                                                                                                            |

| Rule              | Detail                                                                                                                                                                                                       |
| :---------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Landlord or agent | The account must already have verificationstatus verified. The listing is saved as verificationstatus pending and stays off the public feed until an admin verifies it.                                      |
| Status fields     | Landlords and agents cannot set status or verificationstatus. An admin can set both.                                                                                                                         |
| Documents         | Identity and proof of authority are collected once, on POST /users/me/verification. This endpoint has no document field. A verified account can post many listings, and each listing is approved separately. |
| Editing           | Editing a verified listing with PUT /accommodations/:id resets it to pending and removes it from the public feed until an admin verifies it again.                                                           |

**Example request**

{  
  "title": "Room and parlor mini flat near Oregun",  
  "description": "Spacious flat with separate living room, balcony, and steady community transformer.",  
  "accommodationType": "room-and-parlour",  
  "price": 450000,  
  "cautionfee": 50000,  
  "agencyfee": 20000,  
  "address": "8 Kudirat Abiola Way, Oregun, Ikeja, Lagos",  
  "state": "Lagos",  
  "lga": "Ikeja",  
  "ppaproximity": "Approximately 12 mins transit to Ikeja PPA clusters",  
  "contactphone": "08044556677",  
  "contactwhatsapp": "08044556677",  
  "propertyinfo": "carpark", "boreholewater", "fencedgate",  
  "photos": "https//res.cloudinary.com/.../img1.jpg"  
}

**Response (201 Created, landlord or agent)**

{  
  "status": "success",  
  "message": "Accommodation submitted and is pending admin verification",  
  "data": {  
    "id": "66f7f9876a1b2c3d4e5f0002",  
    "title": "Room and parlor mini flat near Oregun",  
    "price": 450000,  
    "cautionfee": 50000,  
    "agencyfee": 20000,  
    "status": "active",  
    "verificationstatus": "pending"  
  }  
}

**Errors (403, landlord or agent account not verified)**

* Not submitted: "Submit identity and authority documents before posting a listing"
* Pending: "Your account verification is still pending admin review"
* Rejected: "Your account verification was rejected. Update your documents and submit again"

**PUT /accommodations/:id**

Edits a listing. Access: Authenticated, role landlord or agent (the owner), or admin. Accepts the same optional fields as POST. Editing a verified listing sets it back to pending and removes it from the public feed until an admin verifies it again. A rejected listing stays rejected after the owner edits it, so it does not re-enter the admin queue. By PM decision, a rejected listing is not sent back for editing: the owner submits a new listing with POST /accommodations.

**DELETE /accommodations/:id**

Archives a listing. Access: Authenticated, role landlord or agent (the owner), or admin.

**POST /media/accommodation-images**

Uploads up to 3 listing images to Cloudinary with compression. Access: Authenticated; the caller must be a verified landlord, a verified agent, or an admin. Content type: multipart/form-data. Form field: photos (up to 3 image files). If the image service times out, the upload waits up to 60 seconds and tries once more.

{  
  "status": "success",  
  "message": "Images uploaded successfully",  
  "data": {  
    "images":   
      { "url": "https//res.cloudinary.com/.../image1.jpg", "publicId": "nyscconnect/accommodations/abc123" }  
      
  }  
}

Error (400): { "status": "error", "message": "Please upload at least one image" } when no file is sent.

**POST /media/verification-documents**

Uploads one identity or authority image for account verification. Call it once per document, then pass each URL to POST /users/me/verification. Access: Authenticated, role landlord or agent. Content type: multipart/form-data. Form field: document (one image, maximum 5 MB).

{  
  "status": "success",  
  "message": "Verification document uploaded successfully",  
  "data": {  
    "document": {  
      "url": "https//res.cloudinary.com/.../nin.jpg",  
      "publicId": "nysc-connect/verification/abc123"  
    }  
  }  
}

## 4 Local Information Guide

**GET /local-info**

Returns Local Guide entries filtered by location and category. Access: Authenticated.

| Query parameter | Notes                                                        |
| :-------------- | :----------------------------------------------------------- |
| state, lga      | Location filter                                              |
| category        | transport, ppa, health, security, food, or essentialservices |
| page            | Default 1                                                    |
| limit           | Default 20, maximum 50                                       |

{  
  "status": "success",  
  "total": 1,  
  "page": 1,  
  "pages": 1,  
  "results": 1,  
  "data":   
    {  
      "id": "66f7f3334a1b2c3d4e5f1111",  
      "state": "Lagos",  
      "lga": "Ikeja",  
      "category": "transport",  
      "title": "Commuting via Ikeja Bus Terminal",  
      "description": "Take official yellow buses (Danfo) or use Cowry Card for BRT from terminal..."  
    }  
    
}

Here results is the number of items on this page and data is the list of items. If no entries exist for an LGA, the list is empty and the client should show an empty state, not an error.

Local Guide entries also expose source and lastupdated (confirmed by Backend). The example above comes from the specification and does not show these two fields.

Note on the category value: the contract text still lists essentialservice. Backend confirmed that the stored value is essentialservices and that essentialservice is rejected.

**GET /local-info/categories**

Returns the six categories: transport, ppa, health, security, food, essentialservices. Access: Authenticated. Read the values from this endpoint instead of hardcoding them.

**GET /local-info/:id**

Returns one Local Guide entry. Access: Authenticated.

**POST /local-info**

Creates a Local Guide entry. Access: Admin only. If source is not sent, the entry is saved with source "NYSC Connect".

{  
  "state": "Lagos",  
  "lga": "Ikeja",  
  "category": "transport",  
  "title": "Commuting via Ikeja Bus Terminal",  
  "description": "Take official yellow buses or use a Cowry card for BRT from the terminal.",  
  "source": "NYSC Connect",  
  "status": "active"  
}

### 5 Saved Items (Favourites)

**GET /saved**

Lists the signed-in user's saved items. Items return unpopulated references. Access: Authenticated.

{  
  "status": "success",  
  "message": "Saved items retrieved successfully",  
  "data":   
    {  
      "id": "66f7f5554a1b2c3d4e5f2222",  
      "userid": "66f7f1234a1b2c3d4e5f6789",  
      "itemtype": "accommodation",  
      "itemid": "66f7f9876a1b2c3d4e5f0001",  
      "createdat": "2026-09-30T12:00:00.000Z"  
    }  
    
}

**POST /saved**

Saves an item. itemtype accepts accommodation or localinfo. Access: Authenticated.

{  
  "itemtype": "accommodation",  
  "itemid": "66f7f9876a1b2c3d4e5f0001"  
}

Response (201 Created): { "status": "success", "message": "Item saved successfully", "data": { "id": "...", "userid": "...", "itemtype": "...", "itemid": "..." } }. Keep the returned id; you need it to delete the saved item.

**DELETE /saved/:id**

Removes a saved item. :id is the saved item's own id (from POST /saved or GET /saved), not the listing's itemid. Access: Authenticated.

200: { "status": "success", "message": "Saved item deleted successfully" }

* 404: the saved item does not exist
* 403: { "status": "error", "message": "You are not allowed to delete this saved item" } (it belongs to another user)

### 6 Reports (Flagging)

**POST /reports**

Flags a listing or Local Guide entry. Access: Authenticated.

| Field      | Rule                                                                                                                                                                                                                                                                  |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| targettype | accommodation or localinfo                                                                                                                                                                                                                                            |
| targetid   | The id of the item being reported                                                                                                                                                                                                                                     |
| reason     | outdated, incorrect, misleading, suspicious, or scam. The value is stored exactly as sent: scam is stored as scam, and suspicious as suspicious. The user-facing choices are Outdated, Incorrect, Misleading, and Suspicious. Clients should not invent other values. |
| details    | Optional free text                                                                                                                                                                                                                                                    |

{  
  "targettype": "accommodation",  
  "targetid": "66f7f9876a1b2c3d4e5f0001",  
  "reason": "scam",  
  "details": "The landlord contact asked for inspection money before allowing physical entry."  
}

**Response (201 Created)**

{  
  "status": "success",  
  "message": "Report submitted successfully",  
  "data": {  
    "id": "66f7f8884a1b2c3d4e5f9999",  
    "reporterid": "66f7f1234a1b2c3d4e5f6789",  
    "targettype": "accommodation",  
    "targetid": "66f7f9876a1b2c3d4e5f0001",  
    "reason": "scam",  
    "details": "The landlord contact asked for inspection money...",  
    "status": "pending"  
  }  
}

Automatic takedown runs only when the stored reason is scam and an admin sets the report to reviewed or resolved. A suspicious report does not hide the listing. Report moderation is separate from listing approval.

### 7 Admin

All admin endpoints require a valid token for a user whose role is exactly admin (lowercase).

**GET /admin/reports**

Lists user reports. Query parameters: status (default pending; reviewed, resolved, dismissed, all), page (default 1), limit (default 20). Returns reporter name and phone.

{  
  "status": "success",  
  "message": "Reports retrieved successfully",  
  "data": {  
    "total": 1,  
    "page": 1,  
    "limit": 20,  
    "reports":   
      {  
        "id": "66f7f8884a1b2c3d4e5f9999",  
        "reporterid": { "id": "66f7f1234a1b2c3d4e5f6789", "name": "Chinedu Okafor", "phone": "+2348012345678" },  
        "targettype": "accommodation",  
        "targetid": "66f7f9876a1b2c3d4e5f0001",  
        "reason": "suspicious",  
        "details": "The landlord contact asked for inspection money...",  
        "status": "pending",  
        "createdat": "2026-09-29T20:45:00.000Z"  
      }  
      
  }  
}

**PATCH /admin/reports/:id**

Moderates a report. Automatic takedown runs only when the stored reason is scam and an admin sets the report to reviewed or resolved. A suspicious report does not hide the listing.

{  
  "status": "resolved",  
  "adminaction": "resolved",  
  "adminnotes": "Confirmed scam attempt. Contact blacklisted."  
}

Response (200 OK): { "status": "success", "message": "Report moderated successfully", "data": { "id": "...", "status": "resolved", "adminaction": "resolved", "adminnotes": "..." } }

**GET /admin/accommodations**

Listing review queue. Defaults to listings waiting for admin verification. Query parameters: verificationStatus (default pending; verified, rejected, flagged, all), page (default 1), limit (default 20, maximum 50). Same pagination envelope as GET /accommodations.

**PATCH /admin/accommodations/:id/verification**

Approves or rejects a listing. verified sets status to active and publishes it. rejected keeps it hidden. Also accepts verificationstatus.

{ "verificationStatus": "verified" }

Response (200 OK): { "status": "success", "message": "Listing verified and is now public", "data": { "id": "...", "status": "active", "verificationstatus": "verified" } }. Rejection message: "Listing rejected and will stay hidden from the public".

**GET /admin/account-verifications**

Landlord and agent account verification queue. Landlords and agents appear together; each item has a role field. Query parameters: status (default pending; notsubmitted, verified, rejected, all), page (default 1), limit (default 20, maximum 50). There is no separate document download endpoint: the admin opens the document URLs in the packet.

{  
  "status": "success",  
  "message": "Account verifications fetched successfully",  
  "data": {  
    "page": 1,  
    "limit": 20,  
    "total": 1,  
    "totalPages": 1,  
    "results":   
      {  
        "id": "66f7f1234a1b2c3d4e5f6789",  
        "name": "Tunde Adeyemi",  
        "phone": "08098765432",  
        "role": "agent",  
        "state": "Lagos",  
        "lga": "Ikeja",  
        "accountverification": {  
          "status": "pending",  
          "idtype": "driverslicense",  
          "iddocumenturl": "https//res.cloudinary.com/.../license.webp",  
          "authoritytype": "authorizationletter",  
          "authoritydocumenturl": "https//res.cloudinary.com/.../mandate.webp",  
          "prepaidmeternumber": null,  
          "zeroupfrontfeeagreed": true,  
          "rejectionreason": null,  
          "submittedat": "2026-10-08T14:20:00.000Z",  
          "reviewedat": null  
        }  
      }  
      
  }  
}

**PATCH /admin/account-verifications/:userId**

:userId is the id from the queue. Only an account currently in pending can be reviewed. A corps member id returns 404 Approval unlocks POST /accommodations but does not publish any listing. Rejection requires rejectionreason.

**Approve**

{ "status": "verified" }

Response (200 OK): "Account verified. This landlord or agent can now post listings". status becomes verified, reviewedat is set, and rejectionreason is cleared. The response returns the full verification packet.

**Reject**

{  
  "status": "rejected",  
  "rejectionreason": "Authorization letter does not name this agent."  
}

Response (200 OK): "Account verification rejected". The account still cannot post: POST /accommodations returns 403 with "Your account verification was rejected. Update your documents and submit again". The user sees the decision as verificationstatus on GET /users/me and the full packet, including rejectionreason, on GET /users/me/verification.

### 8 Status Values

| Object                    | Field                                           | Values                                                                                                                    |
| :------------------------ | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
| Listing                   | verificationstatus                              | pending, verified, rejected, flagged. There is no returned status: a listing sent back for correction is set to rejected. |
| Listing                   | status                                          | active (public only when also verified), hidden (after a confirmed scam report), archived (after delete)                  |
| Landlord or agent account | verificationstatus / accountverification.status | notsubmitted, pending, verified, rejected                                                                                 |
| Report                    | status                                          | pending, reviewed, resolved, dismissed                                                                                    |
| User                      | role                                            | corpsmember, landlord, agent, admin                                                                                       |

### 9 Errors

| Status | When | Body |
| :---- | :---- | :---- |
| 400 | Missing or invalid input | Auth: { "message": "..." }. Other modules: { "status": "error", "message": "..." } |
| 401 | No Bearer header | { "status": "error", "message": "Authentication token missing. Please log in." } |
| 401 | Bad or expired token | { "status": "error", "message": "Invalid or expired token." } |
| 401 | Account deleted after the token was issued | { "status": "error", "message": "User account no longer exists." } |
| 401 | Wrong phone or password | { "message": "Invalid credentials" } |
| 403 | Valid token, role not allowed | { "status": "error", "message": "Forbidden. You lack permission for this action." } |
| 403 | Deleting another user's saved item | { "status": "error", "message": "You are not allowed to delete this saved item" } |
| 403 | Admin self-registration | { "message": "Self-registration as an administrator is not permitted" } |
| 404 | Unknown URL | { "status": "fail", "message": "Endpoint ... not found on this server" } |
| 500 | Server error | { "status": "error", "message": "..." } |

The 403 role guard applies to admin routes, listing create, update and delete, media upload, and local-info create. Invalid JSON in a request body returns a parse error message (with a stack trace in development only). Backend confirmed that error responses use the standard error shape with status codes 400, 401, 403, 404, or 500 Loading and network-failure states are not part of the backend. The apps handle them (see the Troubleshooting and Error Guide).

### 10 Pagination

Pagination is not identical on every list. Treat GET /accommodations as the feed contract.

| Endpoint                                                                 | Query defaults                              | Response shape                                    |
| :----------------------------------------------------------------------- | :------------------------------------------ | :------------------------------------------------ |
| GET /accommodations, GET /accommodations/mine, GET /admin/accommodations | page 1, limit 10 (admin queues: 20), max 50 | data: { page, limit, total, totalPages, results } |
| GET /admin/account-verifications                                         | status pending, page 1, limit 20, max 50    | data: { page, limit, total, totalPages, results } |
| GET /local-info                                                          | page 1, limit 20 (max 50                    | { status, total, page, pages, results, data }     |
| GET /admin/reports                                                       | status pending, page 1, limit 20            | data: { total, page, limit, reports }             |

## Testing with Postman

The Postman collection uses these variables: baseUrl, token, userId, accommodationId, localInfoId, savedItemId, and reportId. Set baseUrl to [https//nysc-connect.onrender.com/api/v1](https://nysc-connect.onrender.com/api/v1)  for staging, or [http//localhost:5000/api/v1](http://localhost:5000/api/v1)  for local development.

The Register and Login requests read the token from the response and save it in the token variable. Protected requests then send Authorization: Bearer {{token}} automatically. Admin accounts cannot be created through registration, so an admin token must be pasted into the token variable by hand.

| Folder | Requests |
| :---- | :---- |
| Auth | Register corps member, register landlord, login, get current user, update location and PPA |
| Account Verification | Get my verification, submit landlord verification, submit agent verification |
| Locations | Get pilot states, get pilot LGAs for Lagos and for Oyo |
| Accommodations | Search, list my accommodations, get, create, update, archive |
| Media | Upload accommodation images (field photos, up to 3), upload verification document (field document, one image, 5 MB) |
| Local Guide | List entries, list categories, get an entry, create an entry (admin only) |
| Saved | List saved items, save an accommodation, save a Local Guide entry, delete a saved item |
| Reports | Report a property |
| Admin | List reports, moderate a report, list listings for review, verify or reject a listing, list account verifications, approve or reject an account |

### Suggested testing order

| Step | Request | Why |
| :---- | :---- | :---- |
| 1 | Register landlord | Creates an account and saves the token and userId. |
| 2 | Upload verification document (twice) | Gets the two document addresses needed next. |
| 3 | Submit landlord verification | Sends the account for approval. |
| 4 | Approve account (administrator token) | The landlord must be verified before creating listings. |
| 5 | Create accommodation | Saves accommodationId. The listing starts as pending. |
| 6 | Verify listing (administrator token) | Makes the listing visible in the public search. |
| 7 | Search accommodations | Confirms the listing appears. |
| 8 | Register corps member, then Save accommodation and Report a property | Tests the Corps Member features. |
| 9 | List reports and Moderate report (administrator token) | Tests moderation. |

## Open Items

* Error message wording: the exact text for 500 errors and for validation failures is not documented.
* Duplicate submissions: Backend and the apps have not described any protection against sending the same request twice.

# NYSC CONNECT API DOCUMENTATION

Corrected Technical Writing Version | Backend-confirmed contract  locked MVP alignment

# **Purpose and status**

This corrected draft consolidates the Technical Writing API document with the backend confirmations supplied for location persistence/PPA, freshness, Local Guide categories and saves, and separate account-verification and listing-verification workflows. Confirmed backend behaviours are documented below. Where the source draft does not provide an exact schema, enum or response, the document flags it for validation rather than inventing implementation details.

# **1 Base URLs**

| Environment | Base URL                                                             |
| :---------- | :------------------------------------------------------------------- |
| Staging     | https//staging-app.[onrender.com/api/v1](http://onrender.com/api/v1) |
| Local       | [http//localhost:5000/api/v1](http://localhost:5000/api/v1)          |

Replace the staging placeholder with the deployed host.

# **2 Response envelope and authentication**

Success: { status, message, data }. Error: { status, message, errors }. Protected endpoints require Authorization: Bearer token. Exact HTTP status codes, token expiry behaviour and validation-error shape must match the running API.

Authorization: Bearer token

# **3 Authentication and profile**

| Method / endpoint   | Access        | Purpose / contract                                                                                                                                   |
| :------------------ | :------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| POST /auth/register | Public        | Creates a Corps Member account. Source draft fields: name, email, phone, password, state, lga. Confirm final role-specific fields against backend.   |
| POST /auth/login    | Public        | Authenticates using phone and password; returns Bearer JWT per source draft.                                                                         |
| GET /auth/me        | Authenticated | Returns authenticated user's profile.                                                                                                                |
| PATCH /users/me     | Authenticated | Backend-confirmed: saves state, lga and PPA. Send either ppa or ppaname; both write stored ppaname. ppaproximity is saved the same way.              |
| GET /users/me       | Authenticated | Backend-confirmed profile endpoint. Register/login and this endpoint return ppa and ppaname as the same value. Confirm whether /auth/me is an alias. |

## **Registration example**

{  
  "name": "Chinedu Okafor",  
  "email": "chinedu@example.com",  
  "phone": "+2348012345678",  
  "password": "Password123",  
  "state": "Lagos",  
  "lga": "Kosofe"  
}

## **Login example**

{  
  "phone": "+2348012345678",  
  "password": "Password123"  
}

## **Illustrative location update (confirm optional fields against backend schema)**

{  
  "state": "Lagos",  
  "lga": "Ikeja",  
  "ppa": "Ikeja PPA",  
  "ppaproximity": "12 mins transit to Ikeja PPA clusters"  
}

PPA is optional in Corps Member onboarding; the frontend must allow users to skip it.

# **4 Locations**

| Method / endpoint | Access | Purpose |
| :---- | :---- | :---- |
| GET /locations/states | Public | Returns supported pilot states; source draft lists Lagos and Oyo. |
| GET /locations/lgas?state=Lagos | Public | Returns LGAs for required state query parameter. |

# **5 Accommodation listings**

| Method / endpoint | Access | Purpose / contract |
| :---- | :---- | :---- |
| GET /accommodations | Public | Search/filter using state, lga, minPrice, maxPrice, page and limit (source draft defaults page=1, limit=10). Public responses must contain only approved/published listings. |
| GET /accommodations/:id | Public | Retrieves listing detail only when its status permits public access. |
| POST /accommodations | Verified Landlord/Agent | Creates/submits listing. Source draft supports multipart/form-data for up to 3 photos or JSON. Verified account is prerequisite; listing remains pending until its own Admin review. |
| GET /accommodations/mine | Landlord/Agent | My Submissions capability discussed in project implementation. Confirm exact route/schema against deployed backend before calling it a confirmed endpoint. |

Source-draft listing fields: title, description, price, cautionfee, address, state, lga, ppaproximity, photos, propertyinfo, contactphone, contactwhatsapp, source and status.

## **Freshness — backend confirmed**

Listings store lastupdatedat and expose it as lastupdated on search and detail responses. Freshness means when information was updated; it does not prove that a property or contact has been independently verified.

## **Create listing example**

{  
  "title": "Room and parlor mini flat near Oregun",  
  "price": 450000,  
  "cautionfee": 50000,  
  "address": "8 Kudirat Abiola Way, Oregun, Ikeja, Lagos",  
  "state": "Lagos",  
  "lga": "Ikeja",  
  "ppaproximity": "12 mins transit to Ikeja PPA clusters",  
  "contactphone": "+2348044556677",  
  "contactwhatsapp": "+2348044556677",  
  "propertyinfo": "carpark", "boreholewater", "fencedgate"  
}

Confirm accepted propertyinfo values, photo limits/types, required fields and full create response from the backend schema.

# **6 Local Information Guide**

| Method / endpoint | Access | Purpose / contract |
| :---- | :---- | :---- |
| GET /local-info | Public | Returns local guide entries; supports state, lga and category filters. |
| GET /local-info/categories | Public | Backend-confirmed endpoint returning the category list. |

## **Backend-confirmed category values**

| API value         | User-facing label   |
| :---------------- | :------------------ |
| transport         | Transportation      |
| ppa               | PPA Information     |
| health            | Health              |
| security          | Security and Safety |
| food              | Food and Services   |
| essentialservices | Essential Services  |

GET /local-info?category=value filters by one of these six values. Local Guide entries return lastupdated, and GET /api/v1/local-info sorts newest first. Use these backend-confirmed enum values rather than proposed alternatives. Confirm the full entry schema and pagination behaviour against staging.

# **7 Saved items**

| Method / endpoint | Access        | Purpose / contract                                                                                   |
| :---------------- | :------------ | :--------------------------------------------------------------------------------------------------- |
| POST /saved       | Authenticated | Backend-confirmed: accepts itemtype of localinfo or accommodation, with itemid identifying the item. |
| GET /saved        | Authenticated | Returns the authenticated user's saved records across accommodation and Local Guide entries.         |
| DELETE /saved/:id | Authenticated | Removes the saved record by saved-item ID; does not delete underlying content.                       |

## **Save accommodation example**

{ "itemtype": "accommodation", "itemid": "66f7f9876a1b2c3d4e5f0001" }

## **Save Local Guide example**

{ "itemtype": "localinfo", "itemid": "66f7f9876a1b2c3d4e5f0002" }

The save stores the guide entry ID, so entries from any of the six categories can be saved. Confirm duplicate-save behaviour and exact response schema against staging.

# **8 Landlord/Agent account verification**

| Method / endpoint | Access | Purpose / contract |
| :---- | :---- | :---- |
| POST /users/me/verification | Authenticated Landlord/Agent | Backend-confirmed submission endpoint for account verification information/documents. |
| PATCH /admin/account-verifications/:userId | Admin | Backend-confirmed Admin review endpoint for a Landlord/Agent account. |

Account status is represented by accountverificationstatus. Confirm exact accepted status values, document fields, upload constraints and Admin decision payload against the backend schema. Unverified Landlord/Agent accounts must not submit listings. Account verification does not approve any listing.

# **9 Listing verification and publication**

| Method / endpoint | Access | Purpose / contract |
| :---- | :---- | :---- |
| POST /accommodations | Verified Landlord/Agent | Submits a listing; a new listing remains pending review. |
| PATCH /admin/accommodations/:id/verification | Admin | Backend-confirmed Admin review endpoint for an individual accommodation listing. |

Listing review uses verificationstatus on the listing. A listing remains out of the public feed until an Admin approves/verifies that listing. Listing approval does not change accountverificationstatus. Confirm exact listing status enum and decision payload against the backend schema. Only approved/published listings may appear in public search/detail; pending, returned, rejected or hidden listings must not be public.

# **10 Safety and reporting**

| Method / endpoint | Access | Purpose / contract |
| :---- | :---- | :---- |
| POST /reports | Authenticated | Flags an accommodation listing or Local Guide entry. |
| GET /admin/reports | Admin | Admin report queue; source draft documents status, page and limit query parameters. |
| PATCH /admin/reports/:id | Admin | Updates report moderation status and may hide the target where permitted. |

## **Report example**

{  
  "targettype": "accommodation",  
  "targetid": "66f7f9876a1b2c3d4e5f0001",  
  "reason": "suspicious",  
  "details": "The landlord contact asked for inspection money before allowing physical entry."  
}

Source-draft allowed reasons: outdated, incorrect, misleading and suspicious. The frontend may send scam, which is stored as suspicious. details is optional free text. Confirm targettype values, status transitions and exact Admin payload against staging. Report moderation is separate from listing approval.

# **11 Error handling**

Source-draft error envelope:

{  
  "status": "error",  
  "message": "Human-readable error message",  
  "errors": null  
}

Document actual HTTP codes and staging examples for validation errors, invalid credentials, missing/expired tokens, forbidden roles, missing records, invalid enums and upload failures. Do not guess codes or schemas.

# **12 Cross-cutting access and workflow rules**

• Roles in the MVP: Corps Member, Landlord/Agent and Admin. Use the exact canonical role values returned by the backend.

• Protected endpoints require a valid Bearer token; Admin routes require server-side Admin authorization.

• A Landlord/Agent must be account-verified before submitting an accommodation listing.

• Account verification and listing verification are separate workflows and separate status fields.

• Only approved/published accommodation listings are public.

• Save/Favourite supports both accommodation and Local Guide entries.

• The Local Guide has exactly the six backend-confirmed categories listed in Section 6

• PPA is optional for Corps Member onboarding.

• Freshness fields are exposed as lastupdated; freshness does not imply independent verification.

• Authorization, ownership and visibility must be enforced by the backend, not only by hiding frontend controls.

# **13 Technical Writing publication checklist**

☐ Run each request example against staging and capture actual responses.

☐ Confirm exact status enums and decision payloads for account and listing verification.

☐ Confirm document upload field names, file types and size limits.

☐ Confirm GET /accommodations/mine route and schema, or remove it if not implemented.

☐ Confirm whether /auth/me and /users/me are aliases or distinct routes.

☐ Add complete response examples for every endpoint.

☐ Add actual HTTP codes and error examples for protected workflows.

☐ Confirm pagination, filtering, sorting and duplicate-save behaviour.

☐ Keep API documentation, frontend integration notes, README, FAQ and glossary aligned with the locked MVP.

# **Document status**

Corrected draft aligned with backend confirmations supplied by the project team and the locked MVP. Before publishing as the final API reference, validate route names, request/response schemas, enums and HTTP status codes against the deployed staging API. Unconfirmed details are flagged rather than invented.

