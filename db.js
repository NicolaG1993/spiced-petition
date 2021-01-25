const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//PETITION
module.exports.getSignatures = () => {
    const myQuery = `SELECT * FROM petition`;
    return db.query(myQuery);
};

module.exports.formEnter = (signature, user_id) => {
    const myQuery = `INSERT INTO petition ("Signature", user_id) VALUES ($1, $2) RETURNING id`;
    const key = [signature, user_id];
    return db.query(myQuery, key);
};

module.exports.findSignature = (signature) => {
    const myQuery = `SELECT "Signature" FROM petition WHERE id = ($1)`;
    const key = [signature];
    return db.query(myQuery, key);
};

// USER REGISTRATION & LOGIN
module.exports.userRegistration = (firstName, lastName, email, hashedPw) => {
    const myQuery = `INSERT INTO users ("First Name", "Last Name", email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    const keys = [firstName, lastName, email, hashedPw];
    return db.query(myQuery, keys);
};

module.exports.userLogIn = () => {};
