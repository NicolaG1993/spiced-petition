const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    const myQuery = `SELECT * FORM petition`;
    return db.query(myQuery);
};

module.exports.formEnter = (firstName, lastName) => {
    const myQuery = `INSERT INTO petition ("First Name", "Last Name") VALUES (${firstName}, ${lastName})`;
    return db.query(myQuery);
};
