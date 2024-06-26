import db from "./../../config/connection.js";
import moment from "moment";
import Answer from "./Answer.js";
import User from "./User.js";
import Room from "./Room.js";
import Question from "./Question.js";

export default class Quiz {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.room_code = data.room_code || null;
    this.title = data.title || null;
    this.description = data.description || null;
    this.difficulty = data.difficulty || null;
    this.time = data.time || null;
    this.max_attempt = data.max_attempt || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  static async all() {
    const query = `SELECT * FROM quizzes`;

    try {
      const [results, fields] = await db.query(query);

      let quizzes = results.map((result) => {
        return new Quiz(result);
      });

      return quizzes;
    } catch (error) {
      throw error;
    }
  }

  static async find(id) {
    let query = `SELECT * FROM quizzes WHERE id = ${id}`;

    try {
      const [results, fields] = await db.query(query);

      if (results[0]) {
        return new Quiz(results[0]);
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  static async findOrFail(id) {
    let query = `SELECT * FROM quizzes WHERE id = ${id}`;

    try {
      const [results, fields] = await db.query(query);

      if (results[0]) {
        return new Quiz(results[0]);
      }

      throw new Error(`tidak dapat menemukan kuis dengan id ${id}`);
    } catch (error) {
      throw error;
    }
  }

  static async whereAll(criteria) {
    const conditions = Object.entries(criteria).map(([column, value]) => {
      if (value === "null") {
        return `${column} IS NULL`;
      } else if (value === "notnull") {
        return `${column} IS NOT NULL`;
      } else {
        return `${column} = '${value}'`;
      }
    });

    const query = `SELECT * FROM quizzes WHERE ${conditions.join(" AND ")}`;

    try {
      const [results, fields] = await db.query(query);

      let quizzes = results.map((result) => {
        return new Quiz(result);
      });

      return quizzes;
    } catch (error) {
      throw error;
    }
  }

  static async whereFirst(criteria) {
    const conditions = Object.entries(criteria).map(([column, value]) => {
      if (value === "null") {
        return `${column} IS NULL`;
      } else if (value === "notnull") {
        return `${column} IS NOT NULL`;
      } else {
        return `${column} = '${value}'`;
      }
    });

    const query = `SELECT * FROM quizzes WHERE ${conditions.join(" AND ")}`;

    try {
      const [results, fields] = await db.query(query);

      let quizzes = results.map((result) => {
        return new Quiz(result);
      });

      return quizzes[0];
    } catch (error) {
      throw error;
    }
  }

  static async create(data) {
    let query = `INSERT INTO quizzes SET ?`;

    let payload = {
      ...data,
      updated_at: moment().utc().format("YYYY-MM-DD HH:mm:ss"),
    };

    try {
      let [result, fields] = await db.query(query, payload);

      return await Quiz.find(result.insertId);
    } catch (error) {
      throw error;
    }
  }

  async update(data) {
    let payload = [
      data.room_code || this.room_code,
      data.title || this.title,
      data.description || this.description,
      data.difficulty || this.difficulty,
      data.time || this.time,
      data.max_attempt || this.max_attempt,
      moment().utc().format("YYYY-MM-DD HH:mm:ss"),
    ];

    let query = `
        UPDATE quizzes SET room_code = ?, title = ?, description = ?, difficulty = ?, time = ?, max_attempt = ?, updated_at = ? WHERE id = ${this.id}
        `;

    try {
      let [results, fields] = await db.query(query, payload);

      return await Quiz.find(this.id);
    } catch (error) {
      throw error;
    }
  }

  async delete() {
    let query = `DELETE FROM quizzes WHERE id = ${this.id}`;
    try {
      let [results, fields] = await db.query(query);

      return results;
    } catch (error) {
      throw error;
    }
  }

  async creator() {
    // let query = `
    //     SELECT users.id, users.fullname, users.username, users.email, users.created_at, users.updated_at
    //     FROM users
    //     JOIN quizzes
    //     ON quizzes.user_id = users.id
    //     WHERE quizzes.id = ${this.id}
    //     `;

    try {
      // let [results, fields] = await db.query(query);

      let _creator = await User.find(this.user_id);

      this._creator = _creator;
      return _creator;
    } catch (error) {
      throw error;
    }
  }

  async room() {
    // let query = `
    //     SELECT rooms.code, rooms.room_master, rooms.name, rooms.created_at, rooms.updated_at
    //     FROM rooms
    //     JOIN quizzes
    //     ON quizzes.room_code = rooms.code
    //     WHERE quizzes.id = ${this.id}
    //     `;

    try {
      // let [results, fields] = await db.query(query);

      let _room = await Room.find(this.room_code);

      this._room = _room;

      return _room;
    } catch (error) {
      throw error;
    }
  }

  async questions() {
    try {
      let _questions = await Question.whereAll({
        quiz_id: this.id,
        deleted_at: "null",
      });

      for (const question of _questions) {
        await question.answers();
      }

      this._questions = _questions;

      return _questions;
    } catch (error) {
      throw error;
    }
  }

  async attempts() {
    let query = `
    SELECT attempts.id, attempts.quiz_id, attempts.user_id, users.fullname, users.username, users.email, attempts.score, attempts.time_remaining, attempts.created_at, attempts.updated_at, attempts.finished_at
    FROM attempts
    JOIN quizzes
    ON quizzes.id = attempts.quiz_id
    JOIN users
    ON users.id = attempts.user_id
    WHERE attempts.quiz_id = ${this.id}
        `;

    try {
      let [results, fields] = await db.query(query);

      this._attempts = results;

      return results;
    } catch (error) {
      throw error;
    }
  }

  async leaderboards() {
    let query = `
    SELECT attempts.*
    FROM attempts
    JOIN (
      SELECT user_id, quiz_id, MAX(score) AS highest_score
      FROM attempts
      GROUP BY user_id, quiz_id
    ) AS highest_scores ON attempts.user_id = highest_scores.user_id
      AND attempts.quiz_id = highest_scores.quiz_id
      AND attempts.score = highest_scores.highest_score
    ORDER BY attempts.quiz_id, attempts.score DESC;
    `;

    try {
      let [results, fields] = await db.query(query);

      this._attempts = results;

      return results;
    } catch (error) {
      throw error;
    }
  }
}
