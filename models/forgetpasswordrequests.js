const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forgotPassSchema = new Schema({
  id: {
    type: String
  },
  isActive: {
    type: Boolean
  },
  userId: {
    type: Schema.Types.ObjectId
  }
})

module.exports = mongoose.model('forgotpasswordrequests',forgotPassSchema);





// const Sequelize = require('sequelize');

// const sequelize = require('../utils/database');

// const forgotpasswordrequests = sequelize.define("forgotpasswordrequests", { 
//     id: {
//         primaryKey: true,
//       type: Sequelize.DataTypes.STRING,
//       allowNull: false
//     },
//     isActive: {
//         type: Sequelize.DataTypes.BOOLEAN
//     }
//  });

//  module.exports = forgotpasswordrequests;