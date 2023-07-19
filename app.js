const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const signUpRouter = require('./routes/signup');
const loginRouter = require('./routes/login');
const expenseUserRouter = require('./routes/userexpense');
const premiumRouter = require('./routes/premium');
const forgotPasswordRouter = require('./routes/forgotPassword');

const app = express();

app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        "img-src": ["'self'", "https: data:"],
        "script-src": ["'self'","'unsafe-inline'","https://cdnjs.cloudflare.com/ajax/libs/axios/1.3.5/axios.min.js",
        "https://checkout.razorpay.com/v1/checkout.js",
        "https://ajax.googleapis.com/ajax/libs/jquery/3.6.4/jquery.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.9.4/Chart.js"],
        "frame-src": ["https://api.razorpay.com/"]
      }
    })
  )

app.use(cors());

app.use(bodyParser.json());

app.use(express.static(path.join('public')));

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'),{
  flags: 'a'
})

app.use(morgan("combined",{stream: accessLogStream}));

// Forgotpasswordrequests.belongsTo(User);
// User.hasMany(Forgotpasswordrequests);

// Expense.belongsTo(User);
// User.hasMany(Expense);

// User.hasMany(Order);
// Order.belongsTo(User);

app.use(forgotPasswordRouter);

app.use(premiumRouter);

app.use(expenseUserRouter);

app.use(loginRouter);

app.use(signUpRouter);

mongoose.connect(process.env.MONGODB_URL)
.then(() => {
  app.listen(3500);
})
.catch((err) => {
  console.log(err);
})


// sequelize.sync()
// .then(() =>{
//     app.listen(3500);
// })
// .catch((err) => {
//     console.log(err);
// })
