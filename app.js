const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser');
const path = require('path')
const nodemailer = require('nodemailer');
const {getActualContests, getWinnersOfContestById, getMembersOfContestById, addWinnerOfContest} = require("./DBRequests");

app.use('/assets', express.static(path.join(__dirname, "assets")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'Bifur',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
//Routes
app.use('/', require('./routes/login'));
app.use('/', require('./routes/home'));
app.use('/', require('./routes/contest'));
app.listen(3000, () => {
    console.log('Сервер запущено на порту 3000');
});

const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
        user: "kostiahnit@gmail.com",
        pass: "mnsvhdlzcxkclyvj"
    },
    secure: true
});


setInterval(() => {
    getActualContests().then((contests) => {
        const date = new Date()
        for(let contest of contests){
            if(Math.abs(contest.finished.getTime() - date.getTime()) <= 60000)
            getWinnersOfContestById(contest.id).then((winners) => {
                if(winners.length === 0){
                    getMembersOfContestById(contest.id).then((members)=>{
                        const loop = members.slice()
                        let winnersArr = []
                        for(let i = 0; i < contest.winnersCount; i++){
                            const randomIndex = Math.floor(Math.random() * loop.length);
                            const user = loop.splice(randomIndex, 1)[0]
                            winnersArr.push(user.id);
                            let mailOptions = {
                                from: 'kostiahnit@gmail.com',
                                to: 'hnitetskyi.kostyantyn@student.uzhnu.edu.ua',
                                // для тесту, в реалізації це треба змінити
                                subject: 'Перемога в конкурсі на RandWinner',
                                text: 'Ви перемогли в конкурсі, будь ласка відвідайте наш сайт RandWinner'
                            };
                            transporter.sendMail(mailOptions, function(error, info){
                                if (error) {
                                    console.log(error);
                                } else {
                                    console.log('Лист було надіслано: ' + info.response);
                                }
                            });
                        }
                        addWinnerOfContest(winnersArr, contest.id).then(
                            r => console.log('choose winners for ' + contest.id + ' ' + r))
                    })
                }
            })
        }
    })
}, 60000);

