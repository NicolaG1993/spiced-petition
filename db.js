const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

module.exports.getSignatures = () => {
    const myQuery = `SELECT * FORM petition`;
    return db.query(myQuery);
};

// module.exports.getActors = () => {
//     const myQuery = `SELECT * FORM actors`;
//     return db.query(myQuery);
// };
