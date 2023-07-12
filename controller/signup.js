const path = require('path');

const bcrypt = require('bcrypt');

const User = require('../models/user');

exports.signupPage = (req, res, next) => {
    res.sendFile(path.resolve('index.html'));
}

exports.userSignup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const encryptPass = await bcrypt.hash(password, 10);
        if(encryptPass){
            const createUser = new User({
                username: name,
                email: email,
                password: encryptPass,
                isPremium: false
            })
            const userCreated = await createUser.save();
            if(userCreated){
                res.status(201).json(userCreated);
            }
            else{
                throw new Error('Something not right');
            }
        }else{
            throw new Error('Something not right');
        }
    } catch (error) {
        res.status(405).json({
            "message": "Failed to create user",
            'error': error
        })
    }
}