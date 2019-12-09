const express = require('express');
const router = express.Router();
const passport = require('passport');
const category = require('../models/category.js');
const product = require('../models/product.js');
const accessCheck = require('../modules/passport');

router.get('/', passport.authenticate('jwt', { session: false }), function(req, res) {
    let limit = 10;
    let offset = 0;
    let searchword = '';
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.offset) offset = parseInt(req.query.offset);
    if (req.query.searchword) searchword = req.query.searchword;
    Promise.all([
        category.getAll(limit, offset, searchword),
        category.count(searchword)
    ])
        .then(([categories, count]) => res.status(200).json({ user: req.user, data: { categories: categories, count: count } }))
        .catch(err => res.status(500).json({err: err}));
});
router.get('/:id', passport.authenticate('jwt', { session: false }), function(req, res) {
    category.getById(req.params.id)
        .then(data => {
            if (data) 
            {
                res.status(200).json({user: req.user, data: data});
            }
            else res.status(404).json({err: 'Error 404: Not Found'});
        })
        .catch(err => res.status(500).json({ err: err}));
});
router.post('/', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, function(req, res) {
    let newcat = {
        name: req.body.name
    }
    if (!newcat.name) res.status(400).json({err: 'name is required'});
    else category.create(newcat)
        .then(data => res.status(201).json({user: req.user, data: data}))
        .catch(err => res.status(500).json({err: err}));
});
router.put('/:id', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, function(req, res) {
    if (!req.body.name) res.status(400).json({err: 'name is required'});
    else category.update({_id: req.params.id, modification: req.body})
        .then(data => {
            if (data) 
            {
                return Promise.resolve(data);
            }
            else return Promise.reject('Error 404: Not Found');
        })
        .then(data => res.status(200).json({user: req.user, data: data}))
        .catch(err => {
            if (err == 'Error 404: Not Found') res.status(404).json({err: err});
            else res.status(500).json({err: err});
        });
});
router.delete('/:id', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, function(req, res) {
    category.getById(req.params.id)
        .then(data => {
            if (data) 
            {
                return Promise.all([
                    data,
                    product.getAll(null, null, null, req.params.id)
                ]);
            }
            else return Promise.reject('Error 404: Not Found');
        })
        .then(([data, products]) => {
            let promises = [];
            for (let p of products)
            {
                promises.push(product.delete(p._id));    
            }
            return Promise.all(promises);
        })
        .then(() => category.delete(req.params.id))
        .then((data) => res.status(200).json({user: req.user, data: data}))
        .catch(err => {
            if (err == 'Error 404: Not Found') res.status(404).json({err: err});
            else res.status(500).json({err: err});
        });
});
module.exports = router;