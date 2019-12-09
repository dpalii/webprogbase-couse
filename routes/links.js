const express = require('express');
const router = express.Router();
const passport = require('passport');
const link = require('../models/link.js');
const accessCheck = require('../modules/passport');

router.get('/', passport.authenticate('jwt', { session: false }), function (req, res) {
    let limit = 10;
    let offset = 0;
    if (req.query.limit) limit = parseInt(req.query.limit);
    if (req.query.offset) offset = parseInt(req.query.offset);
    Promise.all([
        link.getAll(limit, offset, req.user._id, null),
        link.count(req.user._id)
    ])
        .then(([links, count]) => res.status(200).json({ user: req.user, data: { links: links, count: count } }))
        .catch(err => res.status(500).json({ err: err }));
});
router.post('/', passport.authenticate('jwt', { session: false }), function (req, res) {
    let newlink = {
        userId: req.user._id,
        productId: req.body.productId,
    }
    if (!req.body.productId) res.status(500).json({err: 'missing product id'});
    else link.create(newlink)
        .then(data => res.status(201).json({ user: req.user, data: data }))
        .catch(err => res.status(500).json({ err: err }));
});
router.delete('/:id', passport.authenticate('jwt', { session: false }), accessCheck.checkAdmin, function (req, res) {
    link.delete(req.params.id)
        .then(data => {
            if (data) {
                return Promise.resolve(data);
            }
            else return Promise.reject('Error 404: Not Found');
        })
        .then((data) => res.status(200).json({ user: req.user, data: data }))
        .catch(err => {
            if (err == 'Error 404: Not Found') res.status(404).json({ err: err });
            else res.status(500).json({ err: err });
        });
});
module.exports = router;