const express = require('express');
const {homeView} = require('../controllers/homeController');
const {postContest, addMember} = require("../controllers/HomeController");
const router = express.Router();
router.post('/home', homeView);
router.post('/post-contest', postContest);
router.post('/add-member', addMember);
module.exports = router;