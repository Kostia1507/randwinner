class UserModel {
    constructor(id, email, password, description) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.description = description;
    }
}
module.exports = UserModel