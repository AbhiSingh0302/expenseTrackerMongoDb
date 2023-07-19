const mongoose = require('mongoose');
const path = require('path');
const AWS = require('aws-sdk');
const Expense = require('../models/expense');
const User = require('../models/user');
require('dotenv').config();

const uploadToS3 = async (data, filename) => {
    try {
        const BUCKET_NAME = process.env.BUCKET_NAME;
        const IAM_USER_KEY = process.env.IAM_USER_KEY;
        const IAM_USER_SECRET = process.env.IAM_USER_SECRET;
        let s3bucket = new AWS.S3({
            accessKeyId: IAM_USER_KEY,
            secretAccessKey: IAM_USER_SECRET,
        })
        var params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: data,
            ACL: 'public-read'
        }
        return new Promise((resolve, reject) => {
            s3bucket.upload(params, (err, s3response) => {
                if (err) {
                    // console.log('Something went wrong', err);
                    reject(err);
                } else {
                    // console.log('success ', s3response);
                    resolve(s3response);
                }
            })
        })

    } catch (error) {
        // console.log(error);
        return error;
    }
}

exports.download = async (req, res) => {
    try {
        const expns = await User.findAll();
        if (expns) {
            const expnstostring = JSON.stringify(expns);
            const filename = 'Expense.txt';
            const fileURL = await uploadToS3(expnstostring, filename);
            res.json(fileURL);
        }
    } catch (error) {
        res.status(500).json(error);
    }
}

exports.expensePage = (req, res, next) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'expense.html'));
}

exports.expenseAll = async (req, res, next) => {
    // console.log(req.headers.expenseid);
    try {
        const expenses = await Expense.find();
        const i = req.headers.expenseid;
        const userId = new mongoose.Types.ObjectId(i);
        const user = await User.findOne({ _id: userId })
        const {isPremium} = user;
        res.status(200).json({expenses,isPremium});
    } catch (error) {
        res.status(404).json(error);
    }
}

exports.expenseCreate = async (req, res, next) => {
    try {
        const { amount, description, category } = req.body;
        const i = req.headers.expenseid;
        const userId = new mongoose.Types.ObjectId(i);
        const userExpense = new Expense({
            amount, description, category, userId
        })
        await userExpense.save();
        const user = await User.findOne({ _id: userId })
        let total_cost = user.total_cost ? user.total_cost : 0;
        total_cost = total_cost + +amount;
        await User.updateOne({ _id: userId },{total_cost});
        res.status(201).json({ success: true })
    } catch (error) {
        console.log(error);
        res.status(404).json({
            "message": 'Not added, sorry for inconvenience'
        });
    }
}

exports.expenseDelete = async (req, res, next) => {
    try {
        console.log(req.params);
        const i = req.params.id;
        const userI = req.headers.expenseid;
        console.log(userI);
        const userId = new mongoose.Types.ObjectId(userI);
        const user = await User.findById(userId);
        const expenseId = new mongoose.Types.ObjectId(i);
        const expense = await Expense.findByIdAndRemove(expenseId);
        const total_cost = user.total_cost - +expense.amount;
        await User.findByIdAndUpdate(userId,{total_cost: total_cost});
        res.json({success: true,id: expenseId});
    } catch (error) {
        console.log(error);
        res.status(401).json(error);
    }
}

exports.pagination = async (req, res) => {
    try {
        const page = +req.params.page;
        const rows = +req.query.rows;
        console.log('rows: ',rows);
        console.log('page: ',page);
        console.log('req headers: ',req.headers);
        const i = req.headers.expenseid;
        const userId = new mongoose.Types.ObjectId(i);
        const expensePagination = await Expense.find({userId})
        .limit(rows)
        .skip((page-1)*rows)
        .exec();
        const count = await Expense.find({userId}).count();
        res.json({
            expensePagination,
            totalPages: Math.ceil(count / rows),
            currentPage: page
          }); 

    } catch (error) {
        res.status(401).json({
            error,
            'success': false
        })
    }
}