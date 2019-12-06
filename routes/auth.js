require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require("passport");

router.post("/", function (req, res) {
   passport.authenticate('local', { session: false }, (err, user, info) => {
       if (err || !user) {
           return res.status(400).json({
               err: info?info.message:info,
               user: user
           });
       }
       req.login(user, { session: false }, (err) => {
            if (err) { return res.status(400).json({err: err}); }
            const token = jwt.sign(user.toObject(), process.env.SECRET);
            return res.status(200).json({ user: user, token: token });
       });
   })(req, res);
});

module.exports = router;