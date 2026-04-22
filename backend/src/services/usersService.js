const bcrypt = require("bcrypt");
const pool = require("../db/pool");
const { User, Profile, Score, fn, col, where } = require("../models");

const SALT_ROUNDS = 10;

async function createUser({ firstName, lastName, email, password }) {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const query = `
    INSERT INTO users (first_name, last_name, email, password)
    VALUES ($1, $2, $3, $4)
    RETURNING id, first_name, last_name, email, created_at
  `;

  const values = [firstName, lastName, email.toLowerCase(), hashedPassword];
  const { rows } = await pool.query(query, values);
  return rows[0];
}

async function getAllUsers() {
  const query = `
    SELECT id, first_name, last_name, email, created_at
    FROM users
    ORDER BY id ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

async function getUserById(id) {
  const query = `
    SELECT id, first_name, last_name, email, created_at
    FROM users
    WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

async function updateUser(id, { firstName, lastName, email, password }) {
  const updates = [];
  const values = [];
  let index = 1;

  if (firstName !== undefined) {
    updates.push(`first_name = $${index++}`);
    values.push(firstName);
  }

  if (lastName !== undefined) {
    updates.push(`last_name = $${index++}`);
    values.push(lastName);
  }

  if (email !== undefined) {
    updates.push(`email = $${index++}`);
    values.push(email.toLowerCase());
  }

  if (password !== undefined) {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    updates.push(`password = $${index++}`);
    values.push(hashedPassword);
  }

  if (updates.length === 0) {
    return null;
  }

  values.push(id);
  const query = `
    UPDATE users
    SET ${updates.join(", ")}
    WHERE id = $${index}
    RETURNING id, first_name, last_name, email, created_at
  `;

  const { rows } = await pool.query(query, values);
  return rows[0] || null;
}

async function deleteUser(id) {
  const query = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id, first_name, last_name, email, created_at
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0] || null;
}

async function getUsersWithFiveScores() {
  const usersWithFiveScores = await User.findAll({
    attributes: ["id"],
    include: [
      {
        model: Score,
        as: "scores",
        attributes: [],
        required: true
      }
    ],
    group: ["User.id"],
    having: where(fn("COUNT", col("scores.id")), 5),
    raw: true
  });

  const userIds = usersWithFiveScores.map((item) => item.id);
  if (userIds.length === 0) {
    return [];
  }

  return User.findAll({
    attributes: ["id", "first_name", "last_name", "email", "created_at"],
    where: { id: userIds },
    include: [
      {
        model: Profile,
        as: "profile",
        required: false
      },
      {
        model: Score,
        as: "scores",
        required: true,
        separate: true,
        order: [["id", "ASC"]]
      }
    ],
    order: [["id", "ASC"]]
  });
}

async function getMaxScoreWithUser() {
  const query = `
    WITH max_score AS (
      SELECT MAX(score) AS value FROM scores
    ),
    max_score_users AS (
      SELECT DISTINCT s.user_id
      FROM scores s
      CROSS JOIN max_score m
      WHERE s.score = m.value
    )
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.created_at,
      p.id AS profile_id,
      p.bio AS profile_bio,
      p.avatar_url AS profile_avatar_url,
      m.value AS max_score,
      COALESCE(
        json_agg(
          json_build_object(
            'id', sc.id,
            'score', sc.score,
            'created_at', sc.created_at
          )
          ORDER BY sc.id
        ) FILTER (WHERE sc.id IS NOT NULL),
        '[]'::json
      ) AS scores
    FROM max_score_users msu
    JOIN users u ON u.id = msu.user_id
    CROSS JOIN max_score m
    LEFT JOIN profiles p ON p.user_id = u.id
    LEFT JOIN scores sc ON sc.user_id = u.id
    GROUP BY u.id, p.id, m.value
    ORDER BY u.id ASC
  `;

  const { rows } = await pool.query(query);
  return rows.map((row) => ({
    user: {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      created_at: row.created_at
    },
    profile: row.profile_id
      ? {
          id: row.profile_id,
          bio: row.profile_bio,
          avatar_url: row.profile_avatar_url
        }
      : null,
    max_score: row.max_score,
    scores: row.scores
  }));
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUsersWithFiveScores,
  getMaxScoreWithUser
};
