require("dotenv").config();
process.env.NODE_ENV = "test";
if (process.env.DB_NAME_TEST) {
  process.env.DB_NAME = process.env.DB_NAME_TEST;
}

const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../src/app");
const pool = require("../src/db/pool");
const sequelize = require("../src/db/sequelize");

const TEST_EMAIL_PREFIX = `autotest_${Date.now()}`;
let isSafeTestDb = false;
let hasUsersTable = false;

async function ensureTestSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      bio TEXT,
      avatar_url TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS scores (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function createUser(payload = {}) {
  const basePayload = {
    firstName: "Test",
    lastName: "User",
    email: `${TEST_EMAIL_PREFIX}_${Math.floor(Math.random() * 100000)}@mail.com`,
    password: "password123"
  };
  const finalPayload = { ...basePayload, ...payload };
  const response = await request(app).post("/users").send(finalPayload);
  return { response, payload: finalPayload };
}

beforeAll(async () => {
  const dbName = process.env.DB_NAME || "";
  if (!dbName.toLowerCase().includes("test")) {
    throw new Error(
      `Refusing to run tests on non-test database "${dbName}". Use DB_NAME_TEST/DB_NAME with "test" in its name.`
    );
  }
  isSafeTestDb = true;
  await ensureTestSchema();

  const tableCheck = await pool.query("SELECT to_regclass('public.users') AS users_table");
  hasUsersTable = Boolean(tableCheck.rows[0]?.users_table);
  if (!hasUsersTable) {
    throw new Error(`Table "users" was not found in "${dbName}" even after test schema init.`);
  }

  await pool.query("DELETE FROM users WHERE email LIKE $1", [`${TEST_EMAIL_PREFIX}%`]);
});

afterEach(async () => {
  if (!isSafeTestDb || !hasUsersTable) {
    return;
  }
  await pool.query("DELETE FROM users WHERE email LIKE $1", [`${TEST_EMAIL_PREFIX}%`]);
});

afterAll(async () => {
  await sequelize.close();
  await pool.end();
});

describe("API integration tests", () => {
  test("GET /health returns ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("POST /users creates user and stores hashed password", async () => {
    const { response, payload } = await createUser();

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.email).toBe(payload.email.toLowerCase());

    const dbResult = await pool.query("SELECT password FROM users WHERE id = $1", [response.body.id]);
    const storedPassword = dbResult.rows[0].password;
    expect(storedPassword).not.toBe(payload.password);
    expect(await bcrypt.compare(payload.password, storedPassword)).toBe(true);
  });

  test("POST /users validates email and password length", async () => {
    const response = await request(app).post("/users").send({
      firstName: "Bad",
      lastName: "Email",
      email: "invalid-email",
      password: "123"
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
    expect(response.body.errors).toEqual(
      expect.arrayContaining(["email format is invalid.", "password must be at least 8 characters."])
    );
  });

  test("GET /users/:id rejects SQL injection-like id", async () => {
    const response = await request(app).get("/users/1 OR 1=1");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid user id.");
  });

  test("POST /profiles sanitizes script tags in bio", async () => {
    const { response: userResponse } = await createUser();

    const response = await request(app).post("/profiles").send({
      user_id: userResponse.body.id,
      bio: "<script>alert('xss')</script>",
      avatar_url: "https://example.com/avatar.png"
    });

    expect(response.status).toBe(201);
    expect(response.body.bio).toContain("&lt;script&gt;");
    expect(response.body.bio).not.toContain("<script>");
  });

  test("POST /scores validates score range", async () => {
    const { response: userResponse } = await createUser();

    const response = await request(app).post("/scores").send({
      user_id: userResponse.body.id,
      score: 101
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toContain("score must be between 0 and 100.");
  });

  test("GET /users-with-five-scores returns only users with exactly five scores", async () => {
    const { response: userOne } = await createUser({
      email: `${TEST_EMAIL_PREFIX}_five@mail.com`
    });
    const { response: userTwo } = await createUser({
      email: `${TEST_EMAIL_PREFIX}_not-enough@mail.com`
    });

    await request(app).post("/profiles").send({ user_id: userOne.body.id, bio: "Top user" });

    for (let i = 0; i < 5; i += 1) {
      await request(app).post("/scores").send({ user_id: userOne.body.id, score: 90 + i });
    }
    for (let i = 0; i < 4; i += 1) {
      await request(app).post("/scores").send({ user_id: userTwo.body.id, score: 70 + i });
    }

    const response = await request(app).get("/users-with-five-scores");
    const userOneResult = response.body.find((item) => item.id === userOne.body.id);
    const userTwoResult = response.body.find((item) => item.id === userTwo.body.id);

    expect(response.status).toBe(200);
    expect(userOneResult).toBeDefined();
    expect(userOneResult.scores).toHaveLength(5);
    expect(userTwoResult).toBeUndefined();
  });

  test("GET /users-max-score returns all users with max score and their full scores", async () => {
    const { response: userOne } = await createUser({ email: `${TEST_EMAIL_PREFIX}_max1@mail.com` });
    const { response: userTwo } = await createUser({ email: `${TEST_EMAIL_PREFIX}_max2@mail.com` });

    await request(app).post("/profiles").send({ user_id: userOne.body.id, bio: "Has profile" });

    await request(app).post("/scores").send({ user_id: userOne.body.id, score: 99 });
    await request(app).post("/scores").send({ user_id: userOne.body.id, score: 88 });
    await request(app).post("/scores").send({ user_id: userTwo.body.id, score: 99 });
    await request(app).post("/scores").send({ user_id: userTwo.body.id, score: 77 });

    const response = await request(app).get("/users-max-score");
    const usersById = new Map(response.body.map((item) => [item.user.id, item]));

    expect(response.status).toBe(200);
    expect(usersById.get(userOne.body.id)).toBeDefined();
    expect(usersById.get(userTwo.body.id)).toBeDefined();
    expect(usersById.get(userOne.body.id).max_score).toBe(99);
    expect(usersById.get(userTwo.body.id).max_score).toBe(99);
    expect(Array.isArray(usersById.get(userOne.body.id).scores)).toBe(true);
    expect(Array.isArray(usersById.get(userTwo.body.id).scores)).toBe(true);
  });

  test("DELETE /users/:id removes user with cascade profile and scores", async () => {
    const { response: userResponse } = await createUser({
      email: `${TEST_EMAIL_PREFIX}_delete-cascade@mail.com`
    });

    await request(app).post("/profiles").send({ user_id: userResponse.body.id, bio: "to delete" });
    await request(app).post("/scores").send({ user_id: userResponse.body.id, score: 50 });

    const deleteResponse = await request(app).delete(`/users/${userResponse.body.id}`);
    expect(deleteResponse.status).toBe(200);

    const profileResult = await pool.query("SELECT * FROM profiles WHERE user_id = $1", [userResponse.body.id]);
    const scoresResult = await pool.query("SELECT * FROM scores WHERE user_id = $1", [userResponse.body.id]);
    expect(profileResult.rows).toHaveLength(0);
    expect(scoresResult.rows).toHaveLength(0);
  });
});
