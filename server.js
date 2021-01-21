const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");

const db = require("./db");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static("./public"));

app.use((req, res, next) => {
    if (!req.cookies["petition-signed"] && req.url !== "/petition") {
        return res.redirect("/petition");
    }
    next();
});

app.get("/", (req, res) => res.redirect("/petition"));

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
    console.log("♦ POST req was made!");
    console.log("♦♦ POST req body: ", req.body);

    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const signature = req.body.signature;

    db.formEnter(firstName, lastName, signature)
        .then(() => {
            // console.log("♦♦♦ results from POST: ", results);
            console.log("♦♦♦ POST adding data to db: ");
            res.cookie("petition-signed", "signed");
            res.redirect("/thanks");
            // return;
        })
        .catch((err) => {
            console.log("ERROR in POST: ", err);
            res.redirect("/petition");
            // return;
        });
});

app.get("/thanks", (req, res) => {
    res.render("thanks", {
        layout: "main",
    });
});

app.get("/signers", (req, res) => {
    db.getSignatures()
        .then((results) => {
            console.log("results from getSignatures: ", results);
            let signatures = results["rows"];
            res.render("signers", {
                layout: "main",
                signatures,
            });
        })
        .catch((err) => {
            console.log("ERROR in GET: ", err);
        });
});

app.listen(8080, () => console.log("...Server is listening..."));
