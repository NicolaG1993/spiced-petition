const express = require("express");
const app = express();

// const cookieParser = require("cookie-parser"); //dont need this with cookieSesion?
const cookieSession = require("cookie-session");
// const csurf = require("csurf"); //csurf?

const db = require("./db");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// app.use(cookieParser()); //dont need this with cookieSesion?
app.use(express.urlencoded({ extended: false }));
// app.use(csurf()); //csurf?

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        // maxAge: 1000 * 60 * 60 * 24 * 14,
        maxAge: 1000 * 20,
    })
);

app.use((req, res, next) => {
    if (!req.session.signatureId && req.url !== "/petition") {
        //before was: !req.cookies["petition-signed"]
        return res.redirect("/petition");
    }
    next();
});

app.use((req, res, next) => {
    res.setHeader("x-frame-options", "deny");
    next();
});

// app.use((req, res, next) => { //csurf?
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });

app.get("/", (req, res) => res.redirect("/petition"));

app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        //req.cookies["petition-signed"]
        res.redirect("/thanks");
    } else {
        res.render("petition", {
            layout: "main",
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
        .then((dbFeedback) => {
            // console.log("♦♦♦ results from POST: ", results);
            console.log("♦♦♦ POST adding data to db: ");
            req.session.signatureId = dbFeedback.rows[0].id;
            console.log("signer id: ", req.session.signatureId);
            // res.cookie("petition-signed", "signed");
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
    db.getSignatures()
        .then((results) => {
            db.findSignature(req.session.signatureId).then(() => {
                console.log("signer id: ", req.session.signatureId);
                console.log("TEST: ", results.rows);
                // console.log("results from getSignatures: ", results);
                let x = results["rowCount"];
                let id = req.session.signatureId - 1; //il mio id parte da 2 , why?
                res.render("thanks", {
                    layout: "main",
                    totalSignatures: x,
                    userSign: results.rows[id]["Signature"],
                });
            });
        })

        .catch((err) => {
            console.log("ERROR in GET: ", err);
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

/*
PUNTI NON CHIARI:
/thanks route -> perché il mio id non funziona normalmente? -1
csurf -> non funziona (ERR: misconfigured csrf)
*/
