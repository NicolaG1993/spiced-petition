const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//PETITION
module.exports.getSignatures = () => {
    const myQuery = `SELECT * FROM petition`;
    return db.query(myQuery);
};

module.exports.formEnter = (firstName, lastName, signature) => {
    const myQuery = `INSERT INTO petition ("First Name", "Last Name", "Signature") VALUES ($1, $2, $3) RETURNING id`;
    const keys = [firstName, lastName, signature];
    return db.query(myQuery, keys);
};

module.exports.findSignature = (signature) => {
    const myQuery = `SELECT "Signature" FROM petition WHERE id = ($1)`;
    const key = [signature];
    return db.query(myQuery, key);
};

// USER REGISTRATION & LOGIN
module.exports.userRegistration = () => {};

module.exports.userLogIn = () => {};
