const nodemailer = require('nodemailer');

exports.getFibonacci = (req, res) => {
    res.render('fibonacci');
};