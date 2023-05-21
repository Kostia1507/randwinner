const registerView = (req, res) => {
    res.render("register", {isLogged: false} );
}
const loginView = (req, res) => {
    res.render("login", {isLogged: false} );
}

module.exports =  {
    registerView,
    loginView
};