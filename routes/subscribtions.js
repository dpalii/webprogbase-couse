const express = require('express');
const router = express.Router();
const passport = require('passport');
const subscribtion = require('../models/subscribtion.js');

router.post('/', passport.authenticate('jwt', { session: false }), function (req, res) {
    let newsub = {
        chatId: req.user.chatId,
        productId: req.body.productId,
    }
    if (newsub.chatId == null) res.status(400).json({ err: 'no chatId' });
    else subscribtion.get(req.user.chatId, req.body.productId)
        .then(data => {
            if (data) res.status(409).json({ err: 'already subscribed' });
            else subscribtion.create(newsub)
                .then(data => res.status(201).json({ user: req.user, data: data }))
        })
        .catch(err => res.status(500).json({ err: err }));
});
router.get('/:id', passport.authenticate('jwt', { session: false }), function (req, res) {
    subscribtion.get(req.user.chatId, req.params.id)
        .then(data => res.status(201).json({ user: req.user, data: data }))
        .catch(err => res.status(500).json({ err: err }));
});
router.delete('/:id', passport.authenticate('jwt', { session: false }), function (req, res) {
    subscribtion.delete(req.user.chatId, req.params.id)
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