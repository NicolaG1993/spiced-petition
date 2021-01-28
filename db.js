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
    const myQuery = `SELECT * FROM signatures WHERE user_id = ($1)`;
    const key = [userId];
    return db.query(myQuery, key);
};

module.exports.deleteSignature = (userId) => {
    const myQuery = `DELETE FROM signatures WHERE user_id = ($1)`;
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
    const myQuery = `SELECT user_profiles.user_id, "First Name", "Last Name", email, age, city, url, signatures.id
        FROM users
        JOIN user_profiles
        ON users.id = user_profiles.user_id
        LEFT JOIN signatures
        ON users.id = signatures.user_id
        WHERE user_profiles.user_id = ($1);`;
    const key = [userId];
    return db.query(myQuery, key);
};

module.exports.updateUser = (firstName, lastName, email, userId) => {
    const myQuery = `UPDATE users
    SET "First Name" = $1, "Last Name" = $2, email = $3 
    WHERE id = ($4);`;

    const keys = [firstName, lastName, email, userId];
    return db.query(myQuery, keys);
}; //posso scrivere set in una riga?

module.exports.updateUserAndPsw = (
    firstName,
    lastName,
    email,
    hashedPw,
    userId
) => {
    const myQuery = `UPDATE users
    SET "First Name" = $1, "Last Name" = $2, email = $3, password = $4
    WHERE id = ($5);`;

    const keys = [firstName, lastName, email, hashedPw, userId];
    return db.query(myQuery, keys);
};

module.exports.updateUserProfile = (age, city, url, userId) => {
    const myQuery = `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $1, city = $2, url = $3`;
    const keys = [age, city, url, userId];
    return db.query(myQuery, keys);
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
        ON users.id = user_profiles.user_id
        JOIN signatures
        ON users.id = signatures.user_id
        WHERE LOWER(city) = LOWER($1);`;
    const key = [city];
    return db.query(myQuery, key);
};
// da finire?
