const spicedPg = require("spiced-pg");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

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

module.exports.findSignature = (userId) => {
    const myQuery = `SELECT "Signature" FROM signatures WHERE user_id = ($1)`;
    const key = [userId];
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

// USER PROFILE
module.exports.enterProfileInfos = (age, city, url, userId) => {
    const myQuery = `INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id`;
    const keys = [age, city, url, userId];
    return db.query(myQuery, keys);
};

module.exports.profileInfos = (userId) => {
    const myQuery = `SELECT user_id, "First Name", "Last Name", email, age, city, url
        FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        WHERE user_profiles.user_id = ($1);`;
    const key = [userId];
    return db.query(myQuery, key);
};

// SIGNERS INFOS
module.exports.getSignersInfos = () => {
    const myQuery = `SELECT "First Name", "Last Name", age, city, url
        FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        JOIN signatures
        ON users.id = signatures.user_id`;
    return db.query(myQuery);
};

module.exports.getSignersByCity = (city) => {
    const myQuery = `SELECT "First Name", "Last Name", age
        FROM users
        JOIN user_profiles
        ON ($1) = user_profiles.city
        WHERE LOWER(city) = LOWER($1);`;
    const key = [city];
    return db.query(myQuery, key);
};
// da finire?
