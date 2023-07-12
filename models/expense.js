const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    }
})

module.exports = mongoose.model('userexpense', expenseSchema);


// const Sequelize = require('sequelize');

// const sequelize = require('../utils/database');

// const expense = sequelize.define("userexpenses", { 
//     amount: {
//       type: Sequelize.DataTypes.INTEGER,
//       allowNull: false
//     },
//     description: {
//         type: Sequelize.DataTypes.STRING,
//         allowNull: false,
//     },
//     category: {
//         type: Sequelize.DataTypes.STRING,
//         allowNull: false
//     }
//  });

//  module.exports = expense;