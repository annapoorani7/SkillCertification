// src/controllers/user.controller.js
const UserService = require('../services/user.service');

class UserController {
    constructor() {
        this.userService = new UserService();
        this.createUser = this.createUser.bind(this);
        this.getUsers = this.getUsers.bind(this);
    }

    async createUser(req, res) {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json({ user });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    }

    async getUsers(req, res) {
        try {
            const users = await this.userService.getAllUsers();
            res.json({ users });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = UserController;