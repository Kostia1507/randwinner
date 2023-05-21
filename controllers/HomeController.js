const DBHandler = require('../DBRequests')
const {insertNewContest, getContestById, joinToContest} = require("../DBRequests");

const homeView = (req, res) => {
    if(req.body.log === 'Вхід'){
        const {email, pass} = req.body
        let func = DBHandler.getUserPasswordByEmail(email, pass)
        func.then(function (result){
            if(result){
                func = DBHandler.getUserByEmail(email, pass)
                func.then(function (user) {
                    req.session.user = user;
                    func = DBHandler.getContestsOfUserById(user.id)
                    console.log(JSON.stringify(user) + ' logged in')
                    func.then(function (contests){
                        res.render("home", {user, contests});
                    })
                })
            }else{
                res.render("login", {isLogged: true} );
            }
        })
    }else{
        const {email, pass, bio} = req.body
        let func = DBHandler.insertNewUser(email, pass, bio)
        func.then(function (result){
            if(result){
                func = DBHandler.getUserByEmail(email, pass)
                func.then(function (user) {
                    req.session.user = user;
                    const contests = []
                    res.render("home", {user, contests});
                })
            }else{
                res.render("register", {isLogged: false} );
            }
        })
    }
}

const postContest = (req, res) => {
    const user = req.session.user
    if(user === undefined)
        res.render("login", {isLogged: false});
    else {
        const {description, password, finished, winnersCount} = req.body
        const now = new Date();
        let func = insertNewContest(description, now, finished, user.id, password, winnersCount)
        func.then(function (result) {
            func = DBHandler.getContestsOfUserById(user.id)
            func.then(function (contests) {
                res.render("home", {user, contests});
            })
        })
    }
}

const addMember = (req, res) => {
    const {contest, password} = req.body
    const user = req.session.user
    let func = getContestById(contest)
    func.then(function (result){
        if(result.password === password){
            func = joinToContest(user.id, result.id)
            func.then(function (result) {
                func = DBHandler.getContestsOfUserById(user.id)
                func.then(function (contests) {
                    res.render("home", {user, contests});
                })
            })
        }
    })
}

module.exports =  {
    homeView,
    postContest,
    addMember
};