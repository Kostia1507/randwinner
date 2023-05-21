const DBHandler = require('../DBRequests')
const {getContestById, getUserById, getMembersOfContestById, getWinnersOfContestById, getContestsOfUserById,
    getContestsByOwnerId, addWinnerOfContest
} = require("../DBRequests");
const { jsPDF } = require ("jspdf");
const path = require("path");

const contestView = (req, res) => {
    const user = req.session.user
    let func = getContestById(req.params.id)
    func.then(function (contest){
        func = getUserById(contest.owner)
        func.then(function(owner){
            func = getMembersOfContestById(contest.id)
            func.then(function(members){
                const now = new Date();
                if(now < contest.finished) {
                    const winners = []
                    res.render("contest", {user, contest, owner, members, winners})
                }else{
                    func = getWinnersOfContestById(contest.id)
                    func.then(function(winners) {
                        res.render("contest", {user, contest, owner, members, winners})
                    })
                }
            })
        })
    })
}

const contestNew = (req, res) => {
    const user = req.session.user
    if(user === undefined)
        res.render("login", {isLogged: false})
    else
        res.render("newcontest", {user})
}

const userContests = (req, res) => {
    const user = req.session.user
    if (user === undefined)
        res.render("login", {isLogged: false})
    else {
        let func = getContestsByOwnerId(user.id)
        func.then(function (contests) {
            res.render("usercontests", {user, contests})
        })
    }
}

const joinContest = (req,res) => {
    const user = req.session.user
    if(user === undefined)
        res.render("login", {isLogged: false})
    else
        res.render("joincontest", {user})
}

const finishContest = (req, res) => {
    const user = req.session.user
    if(user === undefined)
        res.render("login", {isLogged: false})
    else{
        let func = getContestById(req.params.id)
        func.then(function (contest) {
            func = getMembersOfContestById(contest.id)
            func.then(function(members){
                const loop = members.slice()
                let winnersArr = []
                for(let i = 0; i < contest.winnersCount; i++){
                    const randomIndex = Math.floor(Math.random() * loop.length);
                    winnersArr.push(loop.splice(randomIndex, 1)[0].id);
                }
                func = addWinnerOfContest(winnersArr, contest.id)
                func.then(function (result) {
                    if(result){
                        func = getWinnersOfContestById(contest.id)
                        func.then(function(winners) {
                            res.render("contest", {user:user, contest, owner:user, members, winners})
                        })
                    }else{
                        res.render("contest", {user:user, contest, owner:user, members, winners:[]})
                    }
                })
            })
        })
    }
}

const reportContest = (req, res) => {
    const user = req.session.user
    if(user === undefined)
        res.render("login", {isLogged: false})
    else {
        let func = getContestById(req.params.id)
        func.then(function (contest) {
            func = getMembersOfContestById(contest.id)
            func.then(function(members){
                func = getWinnersOfContestById(contest.id)
                func.then(function (winners) {
                    let doc = new jsPDF();
                    doc.setFont("times");
                    doc.text("RandWinner REPORT", 10, 10);
                    doc.text("Contest id: " + contest.id, 10, 15);
                    doc.text("Contest password: " + contest.password, 10, 20);
                    doc.text("Members:",10, 25);
                    let y = 30
                    for(let member of members){
                        doc.text(member.email, 15, y)
                        y += 5
                    }
                    doc.text("Winners:",10, y)
                    y += 5
                    for(let member of winners){
                        doc.text(member.email, 15, y)
                        y += 5
                    }
                    doc.save(contest.id+"report.pdf")
                    const filePath = path.join(__dirname, "../"+contest.id+"report.pdf")
                    res.sendFile(filePath, (err) => {
                        if (err) {
                            console.error(err)
                            return
                        } else {
                            console.log('PDF file sent successfully!')
                        }
                    })
                })
            })
        })
    }
}

module.exports =  {
    contestView,
    contestNew,
    userContests,
    joinContest,
    finishContest,
    reportContest
}