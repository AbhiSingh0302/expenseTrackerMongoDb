const path = require('path');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const User = require('../models/user');
const { error } = require('console');

function generateWebTokens(id) {
    return jwt.sign({ userId: id }, process.env.jwt_key);
}

exports.loginPage = (req, res, next) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'login.html'));
}

exports.userLogin = async (req, res, next) => {
    try {
        console.log(req.body);
        const loginEmail = req.body.email;
        const loginPass = req.body.password;
        const user = await User.findOne(
            {
                email: loginEmail
            }
        )
        if (!user) {
            throw new Error('user not found')
        } else {
            const bcryptToken = await bcrypt.compare(loginPass, user.password)
            if (bcryptToken) {
                res.status(200).json({
                    "message": "User successfully logged in",
                    "token": generateWebTokens(user.id)
                })
            } else {
                throw new Error('user not found');
            }
        }
    } catch (error) {
        res.status(404).json({
            "message": "User not found",
            'error': error
        })
    }
}