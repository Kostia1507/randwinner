const express = require('express');
const {contestView, contestNew, userContests, joinContest, finishContest, reportContest} = require("../controllers/ContestController");
const router = express.Router();
router.get('/contest/:id', contestView);
router.get('/newcontest', contestNew);
router.get('/mycontests', userContests);
router.get('/join-contest', joinContest);
router.get('/finish-contest/:id', finishContest)
router.get('/report/:id', reportContest)
module.exports = router;