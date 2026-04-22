# Registration Backend (Node.js + Express + PostgreSQL)

Production-ready backend API for user registration with CRUD operations, validation, and password hashing.
Also includes ORM-based CRUD for profiles and scores.

## Tech Stack

- Node.js
- Express
- PostgreSQL (`pg`)
- Sequelize ORM (for `profiles` and `scores`)
- `bcrypt` for password hashing
- `dotenv` for environment variables

## Project Structure

```
src/
  app.js
  controllers/
    usersController.js
    profilesController.js
    scoresController.js
  routes/
    usersRoutes.js
    profilesRoutes.js
    scoresRoutes.js
  services/
    usersService.js
    profilesService.js
    scoresService.js
  db/
    pool.js
    sequelize.js
    schema.sql
  models/
    profile.js
    score.js
```

## 1) Install Dependencies

```bash
npm install
```

## 2) Configure Environment

1. Copy `.env.example` to `.env`
2. Update values for your local PostgreSQL setup

Example:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=registration_app
```

## 3) Create Database and Schema

Create the database in PostgreSQL:

```sql
CREATE DATABASE registration_app;
```

Then run `src/db/schema.sql` in that database:

```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## 4) Run Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server URL:

`http://localhost:3000`

## 5) Run Tests (Jest + Supertest)

Tests are integration-style API tests in `tests/api.test.js`.

1. Create a separate test database:

```sql
CREATE DATABASE registration_app_test;
```

2. Apply schema to test DB:

```bash
psql "postgresql://postgres:postgres@localhost:5432/registration_app_test" -f src/db/schema.sql
```

3. Set environment variables for tests (example):

```bash
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=registration_app_test
set DB_USER=postgres
set DB_PASSWORD=postgres
set NODE_ENV=test
```

4. Run tests:

```bash
npm test
```

## API Endpoints

### Users (`pg` SQL layer)

### Create user

- `POST /users`
- Body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "secret123"
}
```

### Get all users

- `GET /users`

### Get one user

- `GET /users/:id`

### Update user

- `PUT /users/:id`
- Body can include one or more fields:

```json
{
  "firstName": "Jane",
  "email": "jane@example.com",
  "password": "newpassword123"
}
```

### Delete user

- `DELETE /users/:id`

### Profiles (`Sequelize ORM`)

- `POST /profiles`
- `GET /profiles`
- `GET /profiles/:id`
- `PUT /profiles/:id`
- `DELETE /profiles/:id`

Create profile body example:

```json
{
  "user_id": 1,
  "bio": "Backend engineer",
  "avatar_url": "https://example.com/avatar.png"
}
```

### Scores (`Sequelize ORM`)

- `POST /scores`
- `GET /scores`
- `GET /scores/:id`
- `PUT /scores/:id`
- `DELETE /scores/:id`

Create score body example:

```json
{
  "user_id": 1,
  "score": 95
}
```

## Validation Rules

- `firstName`, `lastName`, `email`, `password` required for `POST /users`
- Email must match valid format
- Password must be at least 8 characters
- `PUT /users/:id` requires at least one updatable field
- `profiles`: `user_id` is required for create and must be integer
- `scores`: `user_id` and `score` are required for create; score range `0..100`

## Notes

- Passwords are hashed using bcrypt before storing in database
- API does not return hashed password in responses
- Duplicate unique values return `409 Conflict`
- Route parameters use strict numeric validation (`/^\d+$/`) to prevent injection-like input
- Input text fields are sanitized before saving to reduce stored-XSS risk
