var bcrypt = require('bcrypt');

var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const User = require('../models/user.model');

module.exports.login = function(req, res) {
    res.render('auth/login');
};

module.exports.postLogin = async function(req, res) {

    try {
        var email = req.body.email;
        var password = req.body.password; // kiem tra no co ton tai trong db ko


        var user = await User.findOne({ email });

        var msg = {
            to: 'trungvu1706@gmail.com',
            from: 'vtrung1795@gmail.com', // Use the email address or domain you verified above
            subject: 'Warning Login',
            text: 'Your acccount has entered wrong password 4 times!',
            html: '<strong>Your acccount has entered wrong password 4 times!</strong>',
        };

        if (!user) {
            return res.render('auth/login', {
                errors: [
                    'Email does not exist!'
                ],
                values: req.body
            });
        }

        if (user.passWrong > 4) {
            return res.render('auth/login', {
                errors: [
                    'Your account have Your account is temporarily locked '
                ]

            })
        }

        var matchPassword = await bcrypt.compare(password, user.password);
        console.log(matchPassword);

        if (!matchPassword) {
            await User.updateOne({ _id: user.id }, { passWrong: user.passWrong + 1 });

            if (user.passWrong + 1 > 4) {
                await sgMail.send(msg);
                return res.redirect('login');
            }

            return res.render('auth/login', {
                errors: [
                    'Password Wrong!'
                ],
                values: req.body
            });
        }

        await User.update({ _id: user.id }, { passWrong: 0 });

        res.cookie('userId', user.id, {
            signed: true
        });
        res.redirect('/home');
    } catch (error) {
        console.log(error);
    }


}