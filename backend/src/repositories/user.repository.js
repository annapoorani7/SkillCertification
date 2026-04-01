// src/repositories/user.repository.js
// const db = require('../../db');

// class UserRepository {
//     async create(user) {
//         const result = await db.query(
//             `INSERT INTO users (id, email, first_name, last_name, role) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
//             [user.id, user.email, user.first_name, user.last_name, user.role]
//         );
//         return result.rows[0];
//     }

//     async findAll() {
//         const result = await db.query('SELECT * FROM users');
//         return result.rows;
//     }
// }

// module.exports = UserRepository;