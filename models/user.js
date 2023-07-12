const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    isPremium:{
        type: Boolean
    },
    total_cost:{
        type: Number
    }
})

module.exports = mongoose.model('user',userSchema);






// const Sequelize = require('sequelize');

// const sequelize = require('../utils/database');

// const user = sequelize.define("expenses", {
//     username: {
//       type: Sequelize.DataTypes.STRING,
//       allowNull: false
//     },
//     email: {
//         type: Sequelize.DataTypes.STRING,
//         allowNull: false,
//         unique: true
//     },
//     password: {
//         type: Sequelize.DataTypes.STRING,
//         allowNull: false
//     },
//     isPremium: {
//         type: Sequelize.DataTypes.BOOLEAN
//     },
//     total_cost: {
//         type: Sequelize.DataTypes.INTEGER
//     }
//  });

//  module.exports = user;