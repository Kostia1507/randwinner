const express = require('express');
const {registerView, loginView } = require('../controllers/loginController');
const router = express.Router();

router.get('/', (req, res) => {
    res.redirect('/login')
})

router.get('/register', registerView);
router.get('/login', loginView);
module.exports = router;