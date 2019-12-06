const express = require('express');
const passport = require('passport');
const router = express.Router();
const userRoutes = require('./users');
const productRoutes = require('./products');
const categoryRoutes = require('./categories');
const authRoutes = require('./auth');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);

router.get('/', (req, res) => {
    res.json({});
});
router.get('/me', passport.authenticate('jwt', { session: false }),
function (req, res) {
    res.json({ user: req.user });
});
module.exports = router;