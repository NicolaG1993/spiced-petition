const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");

const db = require("./db");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.static("./public"));

app.get("/", (req, res) => res.redirect("/petition"));

// app.get("./actors", (req, res) => {
//     db.getActors()
//         .then((results) => {
//             console.log("results from getActors: ", results);
//         })
//         .catch((err) => {
//             console.log("ERROR in GET: ", err);
//         });
// });

app.get("/petition", (req, res) => {
    if (req.cookies["petition-signed"]) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
            // cohort: "Adobo",
            // title: "HB Portfolio",
            // myData,

            // adding a local helper
            // helpers: {
            //     stressImportance(text) {
            //         return text.toUpperCase() + "!!!!!" + 👻;
            //     },
        });
    }
});

app.post("/petition", (req, res) => {
    res.cookie("petition-signed", "signed");
});

app.post("/thanks", (req, res) => {
    if (!req.cookies["petition-signed"]) {
        res.redirect("/petition");
    } else {
        res.render("thanks", {
            layout: "main",
        });
    }
});

app.get("/signers", (req, res) => {
    if (!req.cookies["petition-signed"]) {
        res.redirect("/petition");
    } else {
    }
});

app.listen(8080, () => console.log("...Server is listening..."));
