const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    const myQuery = `SELECT * FROM petition`;
    return db.query(myQuery);
};

module.exports.formEnter = (firstName, lastName, signature) => {
    const myQuery = `INSERT INTO petition ("First Name", "Last Name", "Signature") VALUES ($1, $2, $3)`;
    const keys = [firstName, lastName, signature];
    return db.query(myQuery, keys);
};
