const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//PETITION
module.exports.getSignatures = () => {
    const myQuery = `SELECT * FROM signatures`;
    return db.query(myQuery);
};

module.exports.formEnter = (signature, userId) => {
    const myQuery = `INSERT INTO signatures ("Signature", user_id) VALUES ($1, $2) RETURNING id`;
    const key = [signature, userId];
    return db.query(myQuery, key);
};

module.exports.findSignature = (signature) => {
    const myQuery = `SELECT "Signature" FROM signatures WHERE id = ($1)`;
    const key = [signature];
    return db.query(myQuery, key);
};

// USER REGISTRATION & LOGIN
module.exports.userRegistration = (firstName, lastName, email, hashedPw) => {
    const myQuery = `INSERT INTO users ("First Name", "Last Name", email, password) VALUES ($1, $2, $3, $4) RETURNING id`;
    const keys = [firstName, lastName, email, hashedPw];
    return db.query(myQuery, keys);
};

module.exports.userLogIn = (email) => {
    const myQuery = `SELECT * FROM users WHERE email = ($1)`;
    const key = [email];
    return db.query(myQuery, key);
};
