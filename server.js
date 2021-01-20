const express = require("express");
const app = express();
const db = require("./db");

app.get("./actors", (req, res) => {
    db.getActors().then((results) => {
        console.log("results from getAcrtors: ", results);
    });
});

app.listen(8080, () => console.log("listening"));
