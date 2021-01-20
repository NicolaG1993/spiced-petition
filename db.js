const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/actors");

module.exports.getActors = () => {
    const myQuery = `SELECT * FORM actors`;
    return db.query(myQuery);
};
