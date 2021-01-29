const express = require("express");
const app = express();
// exports.app = app;

// const cookieParser = require("cookie-parser"); //dont need this with cookieSesion?
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const db = require("./db");
// const bc = require("./bc");
let cookie_sec;
if (process.env.secretCookie) {
    cookie_sec = process.env.secretCookie;
} else {
    cookie_sec = require("./secrets.json").secretCookie;
}

const hb = require("express-handlebars");
const {
    requireLoggedInUser,
    requireLoggedOutUser,
    requireNoSignature,
    requireSignature,
    dealWithCookieVulnerabilities,
} = require("./middleware");

const profileRouter = require("./profile_routes").router;
const authRouter = require("./auth-routes").router;

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
// app.use(cookieParser()); //dont need this with cookieSesion?
app.use(express.static("./public"));
app.use(
    cookieSession({
        secret: cookie_sec,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);
app.use(express.urlencoded({ extended: false }));
app.use(csurf());

// app.use((req, res, next) => {
//     if (
//         !req.session.signatureId
//         && req.url !== "/register" &&
//         req.url !== "/login"
//     ) {
//         //before was: !req.cookies["petition-signed"]
//         return res.redirect("/register");
//     }
//     next();
// });

// app.use((req, res, next) => {
//     if (!req.session.userId && req.url !== "/register") {
//         return res.redirect("/register");
//     }
//     next();
// });
app.use(dealWithCookieVulnerabilities);
app.use(requireLoggedInUser);
app.use(authRouter);
app.use(profileRouter);

app.get("/", (req, res) => res.redirect("/register"));

//////////////////////////
//////// PETITION: ////////
//////////////////////////

app.get("/petition", requireNoSignature, (req, res) => {
    if (req.session.userId) {
        console.log("staying on petition:");
        res.render("petition", {
            layout: "main",
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/petition", requireNoSignature, (req, res) => {
    const signature = req.body.signature;
    const userId = req.session.userId;
    if (signature) {
        db.formEnter(signature, userId)
            .then((results) => {
                req.session.signatureId = results.rows[0].id;
                // res.cookie("petition-signed", "signed");
                res.redirect("/petition/thanks");
            })
            .catch((err) => {
                // console.log("ERROR in POST: ", err);
                console.log("no signature!");
                res.redirect("/petition");
            });
    } else {
        req.session.signatureId = null;
        res.redirect("/petition/thanks");
    }
});

//////////////////////////
////// PETITION/THANKS: //////
//////////////////////////

app.get("/petition/thanks", requireSignature, (req, res) => {
    db.getSignatures()
        .then((results) => {
            db.findSignature(req.session.userId)
                .then((resultSigner) => {
                    let x = results["rowCount"];
                    res.render("thanks", {
                        layout: "main",
                        totalSignatures: x,
                        userSign: resultSigner.rows[0].Signature,
                    });
                })
                .catch((err) => {
                    // console.log("ERROR in findSig: ", err);
                    console.log("errr, going from thanks to petition:");
                    res.redirect("/petition");
                });
        })
        .catch((err) => {
            console.log("ERR in GET: ", err);
        });
});

app.post("/petition/thanks", (req, res) => {
    const userId = req.session.userId;
    db.deleteSignature(userId)
        .then(() => {
            req.session.signatureId = null;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("ERROR in deleteSig: ", err);
        });
});

//////////////////////////
////// PETITION/SIGNERS: //////
//////////////////////////

app.get("/petition/signers", requireSignature, (req, res) => {
    db.getSignersInfos()
        .then((results) => {
            let signatures = results["rows"];
            res.render("signers", {
                layout: "main",
                signatures,
            });
        })
        .catch((err) => {
            console.log("ERR in GET: ", err);
        });
});

//////////////////////////
///// PETITION/SIGNERS/CITY: //////
//////////////////////////

app.get("/petition/signers/:city", requireSignature, (req, res) => {
    const city = req.params.city;

    db.getSignersByCity(city)
        .then((results) => {
            let usersForCity = results["rows"];
            res.render("usersForCity", {
                layout: "main",
                city: city,
                usersForCity,
            });
        })
        .catch((err) => {
            console.log("ERR in GET: ", err);
        });
});

//////////////////////////
////// LOGOUT: //////
//////////////////////////
app.get("/logout", requireLoggedInUser, (req, res) => {
    req.session = null;
    res.redirect("/");
});

//////////////////////////
////// DELETE: //////
//////////////////////////
app.get("/delete", requireLoggedInUser, (req, res) => {
    //i need a new fn from db to delete all where id match
    req.session = null;
    res.redirect("/");
});

//////////////////////////
////// ERR 404: //////
//////////////////////////
app.get("*", (req, res) => {
    // res.send("what???", 404);
    res.render("404", {
        layout: "main",
    });
});

app.listen(process.env.PORT || 8080, () =>
    console.log("...Server is listening...")
);

// BUGS:

/*
0- users per cittá buggato
0- link intorno a nomi se cé url
0- testing + middleware

2- delete profile non funziona
3- log out non funziona

*/

/* DOMANDE:
-posso navigare nel sito senza signature? se si, cosa mostro in thanks? (petition- post req)
-getsignatures for city ha un numero di risultati sbagliato? (db.js)
-gestico correttamente i miei anti hack per gli url? (169)

*/
