const { Client } = require("pg")
const UserModel = require("./models/UserModel");
const ContestModel = require("./models/ContestModel");
const clientSettings = {
    user: "postgres",
    host: "localhost",
    database: "randwinner",
    password: "admin",
    port: 5432
}

async function getUserById(id){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT * FROM users WHERE id = $1', [id])
        await client.end()
        return new UserModel(res.rows[0]['id'],res.rows[0]['email'],res.rows[0]['description'])
    } catch (error) {
        console.log(error)
    }
}

async function getUserByEmail(email){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT * FROM users WHERE email = $1', [email])
        await client.end()
        return new UserModel(res.rows[0]['id'],res.rows[0]['email'],res.rows[0]['password'],res.rows[0]['description'])
    } catch (error) {
        console.log(error)
    }
}

async function getUserPasswordByEmail(email, password){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT password FROM users WHERE email = $1', [email])
        await client.end()
        return res.rows[0]['password'] === password
    } catch (error) {
        console.log(error)
    }
}

async function getContestById(id){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT * FROM contests WHERE id = $1', [id])
        await client.end()
        return new ContestModel(res.rows[0]['id'], res.rows[0]['description'],
            res.rows[0]['created'], res.rows[0]['finished'], res.rows[0]['owner'],
            res.rows[0]['password'], res.rows[0]['winners_count'])
    } catch (error) {
        console.log(error)
    }
}

async function getContestsByOwnerId(id){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT * FROM contests WHERE owner = $1', [id])
        await client.end()
        const ret = []
        res.rows.forEach((item) => ret.push(new ContestModel(item['id'], item['description'],
            item['created'], item['finished'], item['owner'], item['password'], item['winners_count'])))
        return ret
    } catch (error) {
        console.log(error)
    }
}

async function getMembersOfContestById(id){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT * FROM users JOIN members ON members.user_id = users.id WHERE members.contest_id = $1', [id])
        await client.end()
        const ret = []
        res.rows.forEach((item) => ret.push(new UserModel(item['id'],item['email'],item['password'],item['description'])))
        return ret
    } catch (error) {
        console.log(error)
    }
}

async function getWinnersOfContestById(id){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT * FROM users JOIN winners ON winners.user_id = users.id WHERE winners.contest_id = $1', [id])
        await client.end()
        const ret = []
        res.rows.forEach((item) => ret.push(new UserModel(item['id'],item['email'],item['password'],item['description'])))
        return ret
    } catch (error) {
        console.log(error)
    }
}

async function getContestsOfUserById(id){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT contests.* FROM contests JOIN members ON members.contest_id = contests.id WHERE members.user_id = $1', [id])
        await client.end()
        const ret = []
        res.rows.forEach((item) => ret.push(new ContestModel(item['id'], item['description'],
            item['created'], item['finished'], item['owner'], item['password'], item['winners_count'])))
        return ret
    } catch (error) {
        console.log(error)
    }
}

async function insertNewUser(email, password, description){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT id,email FROM users WHERE email = $1', [email])
        if(res.rows.length === 0) {
            await client.query('INSERT INTO public.users(email, password, description) VALUES ($1, $2, $3);',
                [email, password, description])
            await client.end()
            return true
        }else{
            await client.end()
            return false
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

async function insertNewContest(description, created, finished, owner, password, winnersCount){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        await client.query('INSERT INTO public.contests(description, created, finished, owner, password, winners_count) VALUES ($1, $2, $3, $4, $5, $6);',
            [description, created, finished, owner, password, winnersCount])
        await client.end()
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

async function getMembersIdOfContest(id){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const res = await client.query('SELECT user_id FROM members WHERE contest_id = $1', [id])
        await client.end()
        const ret = []
        res.rows.forEach((item) => ret.push(item["user_id"]))
        return ret
    } catch (error) {
        console.log(error)
    }
}
async function joinToContest(userId, contestId){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        const members = await getMembersIdOfContest(contestId)
        if(members.includes(userId)){
            console.log(userId + " вже і так приймає участь")
            return false
        }
        await client.query('INSERT INTO public.members(user_id, contest_id) VALUES ($1, $2);',
            [userId, contestId])
        await client.end()
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

async function addWinnerOfContest(usersId, contestId){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        let res = await client.query('SELECT * FROM winners WHERE contest_id = $1', [contestId])
        if(res.rows.length>0){
            console.log('Вже є переможці в ' + contestId)
            return true
        }
        for (const user of usersId) {
            await client.query('INSERT INTO public.winners(user_id, contest_id) VALUES ($1, $2);',
                [user, contestId])
        }
        await client.end()
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

async function getActualContests(){
    const client = new Client(clientSettings)
    try {
        await client.connect()
        let res = await client.query('SELECT * FROM contests WHERE finished > NOW()')
        const ret = []
        res.rows.forEach((item) => ret.push(new ContestModel(item['id'], item['description'],
            item['created'], item['finished'], item['owner'], item['password'], item['winners_count'])))
        await client.end()
        return ret
    } catch (error) {
        console.log(error)
        return false
    }

}

module.exports =  {
    getUserById,
    getUserByEmail,
    getUserPasswordByEmail,
    getContestById,
    getContestsByOwnerId,
    getMembersOfContestById,
    getWinnersOfContestById,
    getContestsOfUserById,
    insertNewUser,
    insertNewContest,
    joinToContest,
    addWinnerOfContest,
    getActualContests
};