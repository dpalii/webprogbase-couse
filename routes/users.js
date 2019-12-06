const dotenv = require('dotenv').config();
const express = require('express');
const passport = require('passport');
const router = express.Router();
const user = require('../models/user.js');
const accessCheck = require('../modules/passport');
const cloudinary = require('cloudinary');
const path = require('path');
const fs = require('fs.promised');
const multer = require('multer');
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const upload = multer({ 
    dest : '../data/fs/', 
    limits : { fileSize : 1024 * 1024, }
});

router.get('/', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, function(req, res) {
    let limit = 10;
    let offset = 0;
    let searchword = '';
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.offset) offset = parseInt(req.query.offset);
    if (req.query.searchword) searchword = req.query.searchword;
    Promise.all([
        user.getAll(limit, offset, searchword),
        user.count(searchword)
    ])
        .then(([users, count]) => res.status(200).json({ user: req.user, data: { users: users, count: count } }))
        .catch(err => res.status(500).json({err: err}));
});
router.get('/:id', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, function(req, res) {
    user.getById(req.params.id)
        .then(data => {
            if (data) 
            {
                res.status(200).json({user: req.user, data: data});
            }
            else res.status(404).json({err: 'Error 404: Not Found'});
        })
        .catch(err => res.status(500).json({ err: err}));
});
router.post('/', function(req, res, next) {
    let username = req.body.username;
    let pass = req.body.password;
    if (!username || !pass) res.status(400).json({err: 'Неполные данные'});
    else {
        user.getByLogin(username)
            .then(data => {
                if (data) res.status(409).json({err: 'Логин занят'});
                else next();
            })
            .catch(err => res.status(500).json({err: err}));
    }
}, function(req, res) {
    let passwordHash = accessCheck.encode(req.body.password).passwordHash;
    user.create(req.body.username, passwordHash)
        .then(data => {
            res.status(201).json(data);
        })  
        .catch(err => res.status(500).json({err: err}));
});
router.put('/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    if (req.user._id == req.params.id) next();
    else if (req.user.role == 'admin') {
        user.update({_id: req.params.id, role: req.body.role})
            .then(data => {
                if (data) 
                {
                    res.status(200).json({user: req.user, data: data});
                }
                else res.status(404).json({err: 'Error 404: Not Found'});
            })
            .catch(err => res.status(500).json({err: err}));
    }
    else res.status(403).json({err: 'Forbidden'});
}, upload.single('avatar'), function(req, res) {
    let newuser = {
        _id: req.params.id,
    }
    if (req.user.role == 'admin' && req.body.role) {
        newuser.role = req.body.role;
    }
    if (req.user._id == req.params.id) {
        if (req.body.bio.length > 0) newuser.bio = req.body.bio;
        if (req.body.fullname.length > 0) newuser.fullname = req.body.fullname;
            if (!req.file) 
            {
                user.update(newuser)
                .then(data => {
                        if (data) 
                        {
                            res.status(200).json({user: req.user, data: data});
                        }
                        else res.status(404).json({err: 'Error 404: Not Found'});
                    })
                    .catch(err => res.status(500).json({err: err}));
            }
            else 
            {
                fs.readFile(req.file.path)
                    .then(fileObject => {
                        const fileBuffer = fileObject;
                        try
                        {
                            cloudinary.v2.uploader.upload_stream({ resource_type: 'raw' },
                                function (error, result) { 
                                    if (error) throw error;
                                    if (path.extname(req.file.originalname).toLowerCase() === ".png" || path.extname(req.file.originalname).toLowerCase() === ".jpg") newuser.avaUrl = result.url;
                                    user.update(newuser)
                                        .then(data => {
                                            if (data) 
                                            {
                                                res.status(200).json({user: req.user, data: data});
                                            }
                                            else res.status(404).json({err: 'Error 404: Not Found'});
                                        })
                                        .catch(err => { throw err; });
                                })
                                .end(fileBuffer);
                        }
                        catch(err)
                        {
                            return Promise.reject(err);
                        }
                    })
                    .then(() => fs.unlink(req.file.path))
                    .catch(err => res.status(500).json({err: err}));
            }
        }
});
router.delete('/:id', passport.authenticate('jwt', { session: false }), function(req, res, next) {
    if (req.user._id == req.params.id) next();
    else res.status(403).json({err: 'Forbidden'});
}, function(req, res) {
    user.delete(req.params.id)  
        .then(data => { 
            if (data) res.status(200).json({user: req.user, data: data});
            else res.status(404).json({err: 'Error 404: Not Found'});
        })
        .catch(err => res.status(500).json({err: err}));
});
module.exports = router;