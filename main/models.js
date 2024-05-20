const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);

async function getUserByEmail(email) {
    return await User.findOne({ email });
}

async function getUserById(id) {
    return await User.findById(id);
}

async function addUser(user) {
    const newUser = new User(user);
    return await newUser.save();
}

module.exports = { getUserByEmail, getUserById, addUser };
