const dotenv = require('dotenv').config();
const express = require('express');
const router = express.Router();
const product = require('../models/product.js');
const category = require('../models/category.js');
const comment = require('../models/comment.js');
const link = require('../models/link.js');
const cloudinary = require('cloudinary');
const path = require('path');
const fs = require('fs.promised');
const multer = require('multer');
const passport = require('passport');
const accessCheck = require('../modules/passport');
const bot = require('../bot/bot.js');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
const upload = multer({ 
    dest : './data/fs/', 
    limits : { fileSize : 1024 * 1024, }
});

router.get('/', passport.authenticate('jwt', { session: false }), function(req, res) {
    let limit = 10;
    let offset = 0;
    let searchword = '';
    let inDesc = 'false';
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.offset) offset = parseInt(req.query.offset);
    if (req.query.inDesc == 'true') inDesc = 'true';
    if (req.query.category) {
        let category = req.query.category;
        Promise.all([
            product.getAll(limit, offset, null, 'false', category),
            product.count(null, category)
        ])
            .then(([products, count]) => res.status(200).json({ user: req.user, data: { products: products, count: count } }))
            .catch(err => res.status(500).json({err: err}));
    }
    else {
        if (req.query.searchword) searchword = req.query.searchword;
        Promise.all([
            product.getAll(limit, offset, searchword, inDesc, null),
            product.count(searchword)
        ])
            .then(([products, count]) => res.status(200).json({ user: req.user, data: { products: products, count: count } }))
            .catch(err => res.status(500).json({err: err}));
    }
});
router.get('/:id', passport.authenticate('jwt', { session: false }), function(req, res) {
    product.getById(req.params.id)
        .then(data => {
            if (data) 
            {
                res.status(200).json({user: req.user, data: data});
            }
            else res.status(404).json({err: 'Error 404: Not Found'});
        })
        .catch(err => res.status(500).json({err: err}));
});
router.post('/', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, upload.single('prodpic'),  function(req, res) {
    let newprod = {
        prodname : req.body.prodname,
        price : req.body.price,
        uplDate : req.body.uplDate,
        category : req.body.category,
        desc: req.body.desc,
        inStock: req.body.inStock
    }
    
    if (req.file) fs.readFile(req.file.path)
        .then(fileObject => {
            const fileBuffer = fileObject;
            try
            {
            cloudinary.v2.uploader.upload_stream({ resource_type: 'raw' },
                function (error, result) { 
                    if (error) throw error;
                    if (path.extname(req.file.originalname).toLowerCase() === ".png" || path.extname(req.file.originalname).toLowerCase() === ".jpg") newprod.prodpic = result.url;
                    else newprod.prodpic = '/images/default.jpg'; 
                    product.create(newprod)
                        .then(data => res.status(201).json({user: req.user, data: data}))
                        .catch(err => { throw err });
                })
                .end(fileBuffer);
            }
            catch(err)
            {
                return Promise.reject(err);
            }
        })
        .then(data => fs.unlink(req.file.path))
        .catch(err => res.status(500).json({err: err}));
    else {
        newprod.prodpic = '/images/default.jpg'; 
        product.create(newprod)
            .then(data => res.status(201).json({user: req.user, data: data}))
            .catch(err => res.status(500).json({err: err}));
    }
});
router.put('/:id', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, upload.single('prodpic'), function(req, res) {
    let newprod = {
        _id: req.params.id,
        prodname : req.body.prodname,
        price : req.body.price,
        desc: req.body.desc,
        inStock: req.body.inStock == "true"
    }
    if (!req.file) 
    {
        product.getById(req.params.id)
        .then(data => {
            newprod.prodpic = data.prodpic; 
            product.update(newprod)
            .then(data => {
                    if (data) 
                    {
                        bot.sendToSubscribers(`<a href="` + bot.link + `/product/${data._id}">Товар</a>, на который Вы подписаны, был обновлен!`, data._id);
                        res.status(200).json({user: req.user, data: data});
                    }
                    else res.status(404).json({err: 'Error 404: Not Found'});
                })
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
                if (path.extname(req.file.originalname).toLowerCase() === ".png" || path.extname(req.file.originalname).toLowerCase() === ".jpg") newprod.prodpic = result.url;
                else newprod.prodpic = '/images/default.jpg'; 
                product.update(newprod)
                    .then(data => {
                        if (data) 
                        {
                            bot.sendToSubscribers(`<a href="` + bot.link + `/product/${data._id}">Товар</a>, на который Вы подписаны, был обновлен!`, data._id);
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
});
router.delete('/:id', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, function(req, res) {
    product.getById(req.params.id)
        .then(data => {
            if (data) 
            {
                return Promise.all([
                    data,
                    category.delete(data.category),
                    link.getAll(null, null, null, req.params.id),
                    comment.getAll(null, null, null, req.params.id)
                ]);
            }
            else return Promise.reject('Error 404: Not Found');
        })
        .then(([data, links, comments]) => { 
            let promises = [];
            for (let c of comments)
            {
                promises.push(comment.delete(c._id));    
            }
            for (let l of links)
            {
                promises.push(link.delete(l._id));    
            }
            return Promise.all(promises)
        })
        .then(() => product.delete(req.params.id))
        .then(data => res.status(200).json({user: req.user, data: data}))
        .catch(err => {
            if (err == 'Error 404: Not Found') res.status(404).json({err: err});
            else res.status(500).json({err: err});
        });
});
module.exports = router;