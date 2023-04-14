const express = require('express');

const bodyParser = require('body-parser');

const path = require('path');

const cors = require('cors');

const signUpRouter = require('./routes/signup');

const loginRouter = require('./routes/login');

const expenseUserRouter = require('./routes/userexpense');

const premiumRouter = require('./routes/premium');

const User = require('./models/user');

const Expense = require('./models/expense');

const Order = require('./models/order');

const sequelize = require('./utils/database');

const app = express();

app.use(cors());

app.use(bodyParser.json());

app.use(express.static(path.join('public')));


Expense.belongsTo(User);
User.hasMany(Expense);

User.hasMany(Order);
Order.belongsTo(User);

app.use(premiumRouter);

app.use(expenseUserRouter);

app.use(loginRouter);

app.use(signUpRouter);

sequelize.sync()
.then(() =>{
    app.listen(3500);
})
.catch((err) => {
    console.log(err);
})
