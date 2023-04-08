const Sequelize = require('sequelize');

const sequelize = require('../utils/database');

const user = sequelize.define("expenses", {
    username: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false
    },
    email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    }
 },{
    timestamps: false
 });

 module.exports = user;