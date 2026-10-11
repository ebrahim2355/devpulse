# DevPulse

DevPulse is an internal tech issue and feature tracker API. Team members can report bugs, suggest features and follow the progress of every issue. It has two roles, contributor and maintainer, and each role has its own permissions.

**Live URL:** https://devpulse-psi-jet.vercel.app

## Features

- User registration and login with JWT authentication
- Passwords are hashed with bcrypt and never returned in any response
- Two roles: `contributor` and `maintainer`
- Create bug reports and feature requests
- Get all issues with sorting (`newest`, `oldest`) and filtering by `type` and `status`
- Get a single issue with its reporter details
- Contributors can update their own issues while the status is `open`
- Maintainers can update any issue, change its status and delete it
- Request validation with clear error messages
- Same success and error response format in every endpoint

## Tech Stack

- Node.js 24
- TypeScript
- Express.js
- PostgreSQL with the native `pg` driver (raw SQL, no ORM, no query builder, no JOIN)
- bcrypt
- jsonwebtoken
- cors, dotenv, http-status-codes

## Project Structure

```text
src
├── config
│   ├── db.ts
│   └── index.ts
├── middleware
│   ├── auth.ts
│   ├── globalErrorHandler.ts
│   ├── notFound.ts
│   └── validateRequest.ts
├── modules
│   ├── auth
│   │   ├── auth.controller.ts
│   │   ├── auth.interface.ts
│   │   ├── auth.routes.ts
│   │   ├── auth.service.ts
│   │   └── auth.validation.ts
│   └── issue
│       ├── issue.controller.ts
│       ├── issue.interface.ts
│       ├── issue.routes.ts
│       ├── issue.service.ts
│       └── issue.validation.ts
├── utils
│   ├── AppError.ts
│   ├── catchAsync.ts
│   ├── parseId.ts
│   ├── sendResponse.ts
│   ├── sqlClause.ts
│   └── validators.ts
├── app.ts
└── server.ts
```

## Setup

1. Clone the repository

```bash
git clone https://github.com/ebrahim2355/devpulse.git
cd devpulse
```

2. Install the dependencies

```bash
npm install
```

3. Create a `.env` file in the root folder

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
```

4. Run the project

```bash
npm run dev
```

The `users` and `issues` tables are created automatically when the server starts.

Other scripts:

```bash
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and get a JWT token |
| POST | `/api/issues` | Contributor, Maintainer | Create a new issue |
| GET | `/api/issues` | Public | Get all issues |
| GET | `/api/issues/:id` | Public | Get a single issue |
| PATCH | `/api/issues/:id` | Maintainer, Contributor (own open issue) | Update an issue |
| DELETE | `/api/issues/:id` | Maintainer | Delete an issue |

Protected endpoints need the token in the `Authorization` header.

```text
Authorization: <JWT_TOKEN>
```

### Signup

`POST /api/auth/signup`

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

`role` is optional. If it is not given, the user becomes a `contributor`.

### Login

`POST /api/auth/login`

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

The response has the `token` and the `user` data.

### Create Issue

`POST /api/issues`

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

### Get All Issues

`GET /api/issues?sort=newest&type=bug&status=open`

| Query | Values | Default |
| --- | --- | --- |
| `sort` | `newest`, `oldest` | `newest` |
| `type` | `bug`, `feature_request` | none |
| `status` | `open`, `in_progress`, `resolved` | none |

Every issue comes with a `reporter` object that has the `id`, `name` and `role` of the user who created it.

### Update Issue

`PATCH /api/issues/:id`

```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug"
}
```

- A contributor can update only their own issue, and only while its status is `open`.
- A maintainer can update any issue and can also send `status` to change the workflow status.

### Delete Issue

`DELETE /api/issues/:id`

Only a maintainer can delete an issue.

## Response Format

Success response

```json
{
  "success": true,
  "message": "Operation description",
  "data": {}
}
```

Error response

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Error details"
}
```

| Code | Used for |
| --- | --- |
| 200 | Successful GET, PATCH and DELETE |
| 201 | Successful POST |
| 400 | Validation error, invalid input, duplicate email |
| 401 | Missing, invalid or expired token, wrong email or password |
| 403 | Valid token but no permission |
| 404 | Issue or route not found |
| 409 | Contributor trying to update an issue that is not open |
| 500 | Unexpected server or database error |

## Database Schema

### users

| Field | Type | Details |
| --- | --- | --- |
| id | SERIAL | Primary key |
| name | VARCHAR(100) | Required |
| email | VARCHAR(150) | Required, unique |
| password | TEXT | Required, stored as a bcrypt hash |
| role | VARCHAR(20) | `contributor` or `maintainer`, default `contributor` |
| created_at | TIMESTAMPTZ | Set automatically on insert |
| updated_at | TIMESTAMPTZ | Set on insert, refreshed on update |

### issues

| Field | Type | Details |
| --- | --- | --- |
| id | SERIAL | Primary key |
| title | VARCHAR(150) | Required, maximum 150 characters |
| description | TEXT | Required, minimum 20 characters |
| type | VARCHAR(20) | `bug` or `feature_request` |
| status | VARCHAR(20) | `open`, `in_progress` or `resolved`, default `open` |
| reporter_id | INT | Id of the user who created the issue, checked in the application code |
| created_at | TIMESTAMPTZ | Set automatically on insert |
| updated_at | TIMESTAMPTZ | Set on insert, refreshed on update |

There is no foreign key and no JOIN. The reporter details are loaded with a second query using the reporter ids of the issues.
