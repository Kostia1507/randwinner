class ContestModel {
    constructor(id, description, started, finished, owner, password, winnersCount) {
        this.id = id;
        this.description = description;
        this.started = started;
        this.finished = finished;
        this.owner = owner;
        this.password = password;
        this.winnersCount = winnersCount;
    }
}
module.exports = ContestModel