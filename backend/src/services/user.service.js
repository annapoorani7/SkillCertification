// src/services/user.service.js
const User = require('../../models/User');

class UserService {
    async createUser(data) {
        const { username, password, studentName, className, role } = data;
        const user = new User({
            username,
            password,
            studentName,
            className,
            role: role || 'student'
        });
        return await user.save();
    }

    async getAllUsers() {
        return await User.find({ role: 'student' }).select('-password');
    }
}

module.exports = UserService;