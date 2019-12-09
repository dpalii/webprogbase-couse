const express = require('express');
const router = express.Router();
const passport = require('passport');
const comment = require('../models/comment.js');
const accessCheck = require('../modules/passport');

router.get('/', passport.authenticate('jwt', { session: false }), function(req, res) {
    let limit = 10;
    let offset = 0;
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.offset) offset = parseInt(req.query.offset);
    if (!req.query.id) res.status(500).json({err: 'id not specified'});
    else Promise.all([
        comment.getAll(limit, offset, null, req.query.id),
        comment.count(req.query.id)
    ])
        .then(([comments, count]) => res.status(200).json({ user: req.user, data: { comments: comments, count: count } }))
        .catch(err => res.status(500).json({err: err}));
});
router.post('/', passport.authenticate('jwt', { session: false }), function(req, res) {
    let newcom = {
        author: req.user._id,
        product: req.body.product,
        content: req.body.content,
    }
    if (!req.body.product || !req.body.content) res.status(500).json({err: 'missing products or content'});
    else comment.create(newcom)
        .then(data => res.status(201).json({user: req.user, data: data}))
        .catch(err => res.status(500).json({err: err}));
});
router.delete('/:id', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, function(req, res) {
    comment.delete(req.params.id)
        .then(data => {
            if (data) 
            {
                return Promise.resolve(data);
            }
            else return Promise.reject('Error 404: Not Found');
        })
        .then((data) => res.status(200).json({user: req.user, data: data}))
        .catch(err => {
            if (err == 'Error 404: Not Found') res.status(404).json({err: err});
            else res.status(500).json({err: err});
        });
});
module.exports = router;