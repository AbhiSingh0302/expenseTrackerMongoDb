const mongoose = require('mongoose');
const path = require('path');
const AWS = require('aws-sdk');
const Expense = require('../models/expense');
const User = require('../models/user');
const sequelize = require('../utils/database');
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
        // Expense.findAll({
        //     where: {
        //         'expenseId': req.headers.expenseid
        //     }
        // })
        //     .then(exp => {
        //         let sum = 0;
        //         exp.forEach(element => {
        //             sum += element.amount
        //         });
        //         User.findOne({
        //             where: {
        //                 id: req.headers.expenseid
        //             }
        //         })
        //             .then((user) => {
        //                 user.update({
        //                     total_cost: sum
        //                 })
        //                 if (user.isPremium) {
        //                     res.status(201).json({
        //                         'isPremium': true,
        //                         'result': exp
        //                     })
        //                 } else {
        //                     res.status(201).json({
        //                         'isPremium': false,
        //                         'result': exp
        //                     })
        //                 }
        //             })
        //             .catch(err => {
        //                 throw new Error('Something is not right', err);
        //             })
        //     })
        //     .catch((error) => {
        //         console.error('Failed to create a new record : ', error);
        //         throw new Error('Something is not right');
        //     });
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
    // try {
    //     const t = await sequelize.transaction();
    //     const userWithExpense = await Promise.all([
    //         expense.create({
    //             'amount': req.body.amount,
    //             'description': req.body.description,
    //             'category': req.body.category,
    //             'expenseId': req.headers.expenseid
    //         },
    //             {
    //                 transaction: t
    //             }),
    //         user.findOne({
    //             where: {
    //                 id: req.headers.expenseid
    //             },
    //             transaction: t
    //         })
    //     ])
    //     await t.commit();
    //     const addUserExp = userWithExpense[0].amount;
    //     const previousTotalExp = userWithExpense[1].total_cost;
    //     await userWithExpense[1].update({
    //         total_cost: previousTotalExp + +addUserExp
    //     })
    //     res.status(201).json(userWithExpense[0])
    // } catch (error) {
    //     await t.rollback();
    //     res.status(404).json({
    //         "message": 'Not added, sorry for inconvenience'
    //     });
    // }
}

exports.expenseDelete = async (req, res, next) => {
    try {
        const t = await sequelize.transaction();
        const id = req.params.id;
        const exp = await Expense.findByPk(id, { transaction: t });
        const UserExp = await User.findByPk(exp.expenseId, { transaction: t });
        await t.commit();
        const deleteUserExp = UserExp.total_cost - exp.amount;
        await UserExp.update({
            total_cost: deleteUserExp
        })
        if (exp) {
            await exp.destroy();
            res.status(201).json(req.params)
        } else {
            throw new Error('Something went wrong');
        }
    } catch (error) {
        await t.rollback();
        res.json(error);
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
        // const countAll = await Expense.find({
        //         'userId': req.headers.expenseid
        // })
        // const totalProduct = countAll.length;
        // // console.log(totalProduct);
        // const perPage = await Expense.findAll({
        //     where: {
        //         'expenseId': req.headers.expenseid
        //     },
        //     offset: page * rows,
        //     limit: rows
        // })
        // res.json({
        //     perPage,
        //     'success': true,
        //     'totalItems': totalProduct,
        //     'page': page
        // });

    } catch (error) {
        res.status(401).json({
            error,
            'success': false
        })
    }
}