const express = require('express');
const router = express.Router();
router.get('/', (req, res) => {
    res.sendFile('documentation.html', { root: './views' });
});
module.exports = router;