const path = require('path');
const uuids = require('uuid');
const bcrypt = require('bcrypt');

const Sib = require('sib-api-v3-sdk');
require('dotenv').config();

const forgotpasswordrequests = require('../models/forgetpasswordrequests');

const User = require('../models/user');

exports.forgotPassword = async (req, res, next) => {
    try {
        const email = req.body;
        const user = await User.findOne(email);
        if (!user) throw "Email is not registered";
        const id = uuids.v4()
        const forgotPassReq = new forgotpasswordrequests({
            id: id,
            isActive: true,
            userId: user._id
        })
        await forgotPassReq.save();
        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey = process.env.API_KEY;
        const tranEmailApi = new Sib.TransactionalEmailsApi();
        const sender = {
            email: 'abhimanyusingh0302@gmail.com'
        }
        const receivers = [{
            email: 'abhimanyusingh0302@gmail.com'
        }]
        const sendMail = await tranEmailApi.sendTransacEmail({
            sender,
            to: receivers,
            subject: 'Regarding forgot password request',
            htmlContent: `
            <p>There was a request to change your password!
            If you did not make this request then please ignore this email.
            Otherwise, please click this link to change your password: </p>
            <a href='http://localhost:3500/password/resetpassword/${id}' style="text-align: center; border: none;
            border-radius: 4px; padding: 5px 15px; background-color: blue; margin: 0px 45%; color: white; text-decoration: none;">Click Here</a>
            <h1 style="text-align: center;">Reset Password</h1>
            `
        })
        res.json(sendMail);
    } catch (error) {
        res.status(404).json({ error });
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const { id } = req.params;
        console.log("id is :",id);
        if (!id) throw 'Invalid id';
        const forgetPassReq = await forgotpasswordrequests.findOne({
            id: id,
            isActive: true
        })
        if(!forgetPassReq) throw 'Something is not right';
        res.sendFile(path.join(__dirname, '../', 'views', 'resetpassword.html'));
    } catch (error) {
        console.log(error);
        res.send('<h1 style="text-align: center; margin-top: 4rem;">Requests Denied</h1>')
    }
}

exports.changePassword = async (req, res, next) => {
    try {
        const { password } = req.body;
        const { id } = req.headers;
        if (!id) {
            throw new Error('Invalid id')
        }
        const forgetPassId = await forgotpasswordrequests.findOneAndUpdate({id: id},
            {
                isActive: false
            })
        const userId = forgetPassId.userId;
        const encryptPass = await bcrypt.hash(password, 10);
        const user = await User.findOneAndUpdate({_id: userId},
            {
                password: encryptPass
            })
            res.json({
                success: true,
                message: 'password changed',
                data: user
            });
    } catch (error) {
        res.status(404).json({
            'error': error
        });
    }
}