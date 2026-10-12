# NYSC Connect: Backend

The backend API for **NYSC Connect**, a platform that helps National Youth Service Corps (NYSC) members find trusted housing and local information when they relocate to an unfamiliar state.

> **Status:** MVP in active development by the Backend Engineering unit. Sections marked *(planned)* describe agreed design that may not be merged into `dev` yet.

---

## Table of contents

1. [The problem](#the-problem)
2. [MVP scope](#mvp-scope)
3. [Tech stack](#tech-stack)
4. [Team and module ownership](#team-and-module-ownership)
5. [Project structure](#project-structure)
6. [Getting started](#getting-started)
7. [Environment variables](#environment-variables)
8. [Running the server](#running-the-server)
9. [API conventions](#api-conventions)
10. [Roles and permissions](#roles-and-permissions)
11. [Data contract: Accommodation](#data-contract-accommodation)
12. [Endpoints by module](#endpoints-by-module)
13. [Seeding data](#seeding-data)
14. [Git workflow](#git-workflow)
15. [Contributing checklist](#contributing-checklist)
16. [Testing](#testing)
17. [Deployment](#deployment)
18. [Roadmap](#roadmap)
19. [Troubleshooting](#troubleshooting)

---

## The problem

Every service year, hundreds of thousands of corps members move from orientation camp to their place of primary assignment (PPA) in a state they often don't know. In the critical first 72 hours they are exposed to accommodation scams, phantom agents, unverified WhatsApp information, and inflated rent.

NYSC Connect replaces those fragmented, unverified channels with **vetted lodge listings, clear landlord contacts, and scam-reporting mechanisms**.

## MVP scope

Trusted housing is the foundation of this MVP. The backend provides:

- A secure REST API for registration, login, housing search, and reporting
- Role-based access control (Corps Member, Landlord, Admin)
- A normalized, indexed MongoDB schema designed for nationwide scale (36 states, 774 LGAs) and fast search and filtering
- Media storage for verified property photos, with strict upload limits
- Scam and listing reporting, with an admin moderation queue
- Local information guides (transport, health, security, ppa, food, essential_services) and saved/favorite items
- Seed scripts so the platform launches with realistic data for frontend testing

## Tech stack

| Area | Choice |
|---|---|
| Runtime | Node.js (ES modules, `"type": "module"`) |
| Framework | Express 5 |
| Database | MongoDB with Mongoose 9 |
| Auth | JWT (`jsonwebtoken`) with `bcryptjs` password hashing |
| Security | `helmet`, `cors` |
| Config | `dotenv` |
| Media | Cloudinary or S3, via Multer *(planned)* |
| API docs | Postman collection and OpenAPI spec |
| Hosting | Render (staging) |
| Dev tooling | `nodemon` |

> **ES modules reminder:** use `import`/`export` everywhere, and include the `.js` extension in relative imports (`import Lga from '../models/Lga.js'`). `require` and `module.exports` will not work.

## Team and module ownership

| Member | Module | Branch |
|---|---|---|
| Wisdom (Coordinator) | Repo scaffolding, Express config, DB connection and migrations, PR reviews, Render staging, Postman docs handoff | `dev` (owner) |
| Victory Jenom Silas | Auth and session guard: user schema, register, login, `GET /users/me`, JWT, bcrypt, `authMiddleware` | `feat/auth-users` |
| Ojo Babajide F | Housing data intake: Accommodation schema, single listing view, create, update, archive | `feat/housing-intake` |
| Abu Marvellous | Housing search and feed: `GET /accommodations`, state/LGA scoping, price filtering, pagination, indexing | `feat/housing-search-feed` |
| Ahiamadu Allen | Media and storage: Cloudinary/S3 with Multer, multi-image upload (3-image cap), compression, secure URLs | `feat/media-upload` |
| Ojo Babjide F | Local information guide: schema and endpoints (transport, health, security) | `feat/local-info` |
| Oghenetega Erisuena | Saved/favorite items: schema, save, list, remove | `feat/saved-items` |
| Wisdom (Coordinator) | Safety and admin queue: reports schema, submit report, admin moderation | `feat/reports-admin` |
| Wisdom (Coordinator) | State/LGA reference data, `seed.js`, Postman collection and OpenAPI handoff | `feat/locations-seed-docs` |

## Project structure

*Expected layout. Update this section to match the repo once the scaffolding is finalized.*

```
NYSC-CONNECT/
├── index.js                 # Entry point: loads env, connects DB, starts server
├── package.json
├── .env.example             # Copy to .env and fill in
├── .gitignore
├── config/                  # DB connection, cloud storage config
├── models/                  # Mongoose schemas (User, Accommodation, State, Lga, ...)
├── controllers/             # Request handlers / business logic
├── routes/                  # Express routers, one per module
├── middleware/              # auth (protect, authorize), upload, error handling
├── seeds/ or seed.js        # Database seeding
├── openapi/                 # OpenAPI specs
└── README.md
```

## Getting started

### Prerequisites

- **Node.js** (LTS) and **npm**. Check with `node -v` and `npm -v`.
- **Git** and a GitHub account with access to the repo
- A **MongoDB** database: a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (recommended) or a local MongoDB Community Server
- **VS Code** (recommended) and **Postman** for testing endpoints

### 1. Get access

Accept the GitHub collaboration invite sent to your email. Without it you cannot push. If you haven't received one, share your GitHub username or email with Wisdom.

### 2. Clone and switch to `dev`

```bash
git clone https://github.com/ajahwisdomagaba/NYSC-CONNECT.git
cd NYSC-CONNECT
git checkout dev
git pull origin dev
```

### 3. Install dependencies and configure the environment

```bash
npm install
cp .env.example .env
```

Then add your MongoDB connection string to `.env` (see [Environment variables](#environment-variables)).

### 4. Create your feature branch

Use the branch assigned to your module (see the [team table](#team-and-module-ownership)):

```bash
git checkout -b feat/<your-module>
```

### Setting up MongoDB Atlas

1. Create an account and a free **M0** cluster.
2. **Database Access:** create a database user (username and password). Avoid special characters in the password, or URL-encode them.
3. **Network Access:** add your current IP address. Re-add it if your network changes.
4. Click **Connect**, choose **Drivers**, select **Node.js**, and copy the connection string.
5. Replace `<username>` and `<password>`, and add a database name before the `?`:

   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/nysc-connect?retryWrites=true&w=majority
   ```

**Each developer should use their own database while developing** so test data doesn't collide. Only the staging deployment uses a shared database.

## Environment variables

Copy `.env.example` to `.env`. **Never commit `.env`.** It is listed in `.gitignore`.

The exact variable names live in `.env.example`, which is the source of truth. Expect these:

| Variable | Purpose |
|---|---|
| `PORT` | Port the server listens on |
| `MONGO_URI` | MongoDB connection string (check `.env.example` for the exact name) |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | Token lifetime |
| `CLOUDINARY_*` or `AWS_*` | Media storage credentials *(planned)* |

If you add a new variable, add it to `.env.example` in the same PR (with a placeholder value, never a real secret).

## Running the server

Until `start` and `dev` scripts are added to `package.json`, run:

```bash
npx nodemon index.js     # auto-restarts on save
# or
node index.js
```

Recommended scripts (to be added by the coordinator to avoid merge conflicts):

```json
"scripts": {
  "start": "node index.js",
  "dev": "nodemon index.js"
}
```

Once running you should see a server-started message and a MongoDB-connected message. Stop the server with `Ctrl + C`.

## API conventions

- **Base path:** `/api/v1`
- **Format:** JSON requests and responses
- **Auth:** Bearer token in the header: `Authorization: Bearer <token>`
- **Success response:**

  ```json
  { "status": "success", "data": { } }
  ```

- **Error response:**

  ```json
  { "status": "error", "message": "Description of what went wrong" }
  ```

- **Status codes:** `200` OK, `201` Created, `400` validation error, `401` not authenticated, `403` forbidden, `404` not found, `500` server error
- **Validation:** whitelist the fields you accept from `req.body`; never pass the raw body to a model
- **IDs:** MongoDB ObjectIds; return `404` for malformed or unknown IDs on lookups

## Roles and permissions

| Role | Can do |
|---|---|
| **Corps Member** | Register/login, search and view verified listings, save items, read local info, submit reports |
| **Landlord** | Everything a corps member can, plus create listings (only when vetted), and edit or archive **their own** listings |
| **Admin** | Everything, plus create listings directly, set `status` and `verificationStatus`, and moderate reports |

Listing intake (`POST /accommodations`) is restricted to Admins and vetted Landlords for this MVP.

## Data contract: Accommodation

The Accommodation schema is shared by the search, media, saved-items, reports, and seed modules. **Do not change these field names or allowed values without telling the team.**

| Field | Type / allowed values |
|---|---|
| `title`, `description` | string |
| `accommodationType` | `single-room` \| `self-contain` \| `room-and-parlour` \| `one-bedroom` \| `two-bedroom` \| `shared-apartment` |
| `state`, `lga` | ObjectId refs (the LGA must belong to the state) |
| `address`, `landmark` | string |
| `annualRent`, `cautionFee`, `agencyFee` | number (`annualRent` > 0) |
| `amenities` | array of `borehole` \| `electricity` \| `prepaid-meter` \| `security` \| `fenced` \| `tiled` \| `water-supply` \| `parking` |
| `landlord` | ObjectId ref to User |
| `contactPhone` | string |
| `images` | array of `{ url, publicId }`, **max 3** |
| `status` | `active` \| `inactive` \| `archived` (is it live?) |
| `verificationStatus` | `pending` \| `verified` \| `rejected` \| `flagged` (is it approved?) |
| `verifiedBy`, `verifiedAt` | set when an admin verifies |
| `createdBy` | ObjectId ref to User |

### Visibility rule

A listing appears in search and to normal users **only when**:

```
status === "active"  AND  verificationStatus === "verified"
```

### Lifecycle

- New landlord listings are saved as `active` + `pending` and stay hidden until an admin verifies them.
- A landlord editing a verified listing resets it to `pending` for re-review.
- Deleting archives (`status: "archived"`); records are never hard-deleted, so saved items and reports never point at a missing listing.
- Reports that flag a listing should set `verificationStatus: "flagged"`, which removes it from search until an admin clears it (`verified`) or confirms a scam (`rejected`).

## Endpoints by module

All routes are under `/api/v1`. Status shows what has been agreed; check `dev` for what is merged.

### Auth (Victory)

| Method | Route | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/users/me` | Authenticated |

### Accommodations, intake (Babajide)

| Method | Route | Access |
|---|---|---|
| POST | `/accommodations` | Admin, vetted Landlord |
| GET | `/accommodations/:id` | Authenticated (visibility rule applies) |
| PUT | `/accommodations/:id` | Admin, owning Landlord |
| DELETE | `/accommodations/:id` | Admin, owning Landlord (archives) |

### Accommodations, search and feed (Abu)

| Method | Route | Access |
|---|---|---|
| GET | `/accommodations` | Authenticated. Filters: state/LGA, price, type, amenities; paginated |

Base filter for the feed: `{ status: "active", verificationStatus: "verified" }`.

### Media (Allen)

Image upload and secure URL generation for listings: up to 3 images per listing, compressed. Route paths to be confirmed.

### Local info (Chidera)

| Method | Route | Access |
|---|---|---|
| GET | `/local-info` | Authenticated. Categorized: transport, health, security, ppa, food, essential_services |
| GET | `/local-info/:id` | Authenticated |
| POST | `/local-info` | Admin |

### Saved items (Patrick)

| Method | Route | Access |
|---|---|---|
| POST | `/saved` | Authenticated (save a lodge or guide item) |
| GET | `/saved` | Authenticated (current user's favorites) |
| DELETE | `/saved/:id` | Authenticated (owner) |

### Reports and admin queue (Erisuena)

| Method | Route | Access |
|---|---|---|
| POST | `/reports` | Authenticated (flag reasons include outdated listing, scam) |
| GET | `/admin/reports` | Admin |
| PATCH | `/admin/reports/:id` | Admin (moderation) |

### Locations (Ibeawuchi)

State and LGA lookup endpoints for the frontend. Route paths to be confirmed.

Full request and response shapes live in the OpenAPI spec (`openapi/`) and the shared Postman collection.

## Seeding data

The seed script (`seed.js`, owned by Ibeawuchi) loads the states and LGAs plus pilot lodge listings so the frontend has realistic data to test against.

```bash
node seed.js
```

Seeded listings must use `status: "active"` and `verificationStatus: "verified"`, or they won't appear in search. Including a few `pending` and `archived` listings is useful for testing filters.

**Warning:** run the seed script only against your own development database. Check what it clears before running it on a shared one.

## Git workflow

- **`main`:** stable; do not push or open PRs against it for feature work
- **`dev`:** integration branch; all feature PRs target this
- **`feat/<module>`:** one branch per module, created from an up-to-date `dev`

```bash
git checkout dev && git pull origin dev
git checkout feat/<your-module>
git merge dev                 # bring in teammates' merged work
# ...make changes...
git add .
git commit -m "feat(housing): accommodation model and CRUD endpoints"
git push -u origin feat/<your-module>
```

### Commit messages

Use a short prefix: `feat(scope):`, `fix(scope):`, `docs:`, `refactor(scope):`, `test(scope):`, `chore:`.

### Pull requests

1. Push your branch and open a PR into **`dev`**.
2. Give it a clear title and a description covering what's included, any schema or contract changes, dependencies on other modules, and what you have and haven't tested.
3. Request review from Wisdom (coordinator). Address feedback with new commits on the same branch.
4. Don't merge your own PR unless the coordinator says so.

## Contributing checklist

Before opening a PR:

- [ ] Branched from an up-to-date `dev`
- [ ] Uses ES module syntax with `.js` extensions on relative imports
- [ ] No secrets, `.env`, or `node_modules` committed
- [ ] New env variables added to `.env.example`
- [ ] Inputs validated, and only whitelisted fields read from `req.body`
- [ ] Errors follow `{ "status": "error", "message": "..." }`
- [ ] Routes protected with the correct role checks
- [ ] Shared field names and values (see the data contract) unchanged, or changes announced to the team
- [ ] Endpoints added or changed are reflected in the OpenAPI spec or Postman collection
- [ ] Server starts locally and your endpoints were tested in Postman

## Testing

*(planned)* Automated tests with Jest and Supertest, covering role permissions, validation, and the main listing flows. Until then, test manually in Postman and record what you verified in your PR description.

## Deployment

The staging environment is deployed on Render by the coordinator, for live frontend and mobile testing. Environment variables are set in the Render dashboard, never in the repo. Staging uses its own shared MongoDB database.

## Roadmap

| Days | Focus |
|---|---|
| 1-2 | Foundation: repo setup, `.env` rules, database schema, API contract draft shared with frontend and mobile |
| 3-5 | Core logic: JWT auth and RBAC, housing CRUD with filtering (LGA, price, amenities), media upload, seed script |
| 6-8 | Safety and admin: scam/listing flag endpoints with triage logic, admin verification APIs, staging deployment |
| 9-10 | Final prep: performance optimization and payload compression, end-to-end integration support, bug fixes, final API docs |

### Dependencies from other units

- **Product Management:** final lodge field checklist, 2-3 pilot LGAs, role permissions rulebook
- **Product Design:** form and screen specs, filter types (ranges vs brackets, multi-select amenities)
- **Frontend and Mobile:** API contract sign-off and confirmation of Bearer token handling

### Open decisions

- Final route prefix and naming (`/accommodations` is used across modules; confirm `/api/v1` prefix)
- Number of pilot listings per LGA for the seed script
- Exact triage rules for reports (when a listing is auto-flagged)
- How landlord "vetting" is set (the `isVetted` flag on users)

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| `Missing script: dev` | Scripts aren't added yet. Use `npx nodemon index.js` |
| `ERR_MODULE_NOT_FOUND` | A relative import is missing its `.js` extension, or the path is wrong |
| `require is not defined in ES module scope` | Use `import`/`export`, not `require`/`module.exports` |
| `Cannot find module ...` | Run `npm install`, or check the import path |
| `EADDRINUSE` | The port is in use. Stop the other process or change `PORT` |
| MongoDB "authentication failed" | Wrong database username or password, or the user is on another cluster |
| MongoDB timeout or "could not connect" | Your IP isn't in Atlas Network Access. Re-add it |
| Password with `@`, `#`, `/` breaks the connection | URL-encode it (`@` becomes `%40`) or use a simpler password |
| Env variable is `undefined` | Name mismatch with `.env.example`, or `dotenv` isn't loaded before use |
| Search returns nothing | Listings must be `active` and `verified`; check the seed data |

---

*Maintained by the NYSC Connect Backend Engineering unit. README.md by Babajide*
