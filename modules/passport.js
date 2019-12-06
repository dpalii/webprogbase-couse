require('dotenv').config();
const passport = require('passport');
const crypto = require('crypto');
const user = require('../models/user');
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(function (username, password, cb) {
        let passHash = AccessCheck.encode(password).passwordHash;
        return user.getAuth(username, passHash)
            .then(user => {
                if (!user) {
                    return cb(null, false, { message: 'Incorrect email or password.' });
                }
                return cb(null, user, { message: 'Logged In Successfully' });
            })
            .catch(err => cb(err));
}));

passport.use(new JWTStrategy({
       jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
       secretOrKey   : process.env.SECRET
   },
   function (jwtPayload, cb) {
       return user.getById(jwtPayload._id)
           .then(user => cb(null, user))
           .catch(err => cb(err));
   }
));

class AccessCheck
{
    static checkAdmin(req, res, next) {
        if (!req.user) res.status(401).json({err: 'Unauthorized'}); 
        else if (req.user.role !== 'admin') res.status(403).json({err: 'Forbidden'}); 
        else next(); 
    }
    static encode(password) {
        let salt = process.env.SECRET;
        const hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        const value = hash.digest('hex');
        return { passwordHash: value };
    }
}
module.exports = AccessCheck;