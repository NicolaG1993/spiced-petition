const express = require("express");
const app = express();

// const cookieParser = require("cookie-parser"); //dont need this with cookieSesion?
const cookieSession = require("cookie-session");
const csurf = require("csurf");

const db = require("./db");
const bc = require("./bc");

let cookie_sec;
if (process.env.secretCookie) {
    cookie_sec = process.env.secretCookie;
} else {
    cookie_sec = require("./secrets.json").secretCookie;
}

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// app.use(cookieParser()); //dont need this with cookieSesion?

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: cookie_sec,
        // maxAge: 1000 * 60 * 60 * 24 * 14,
        maxAge: 1000 * 60,
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

app.use((req, res, next) => {
    //Clickjacking?
    res.setHeader("x-frame-options", "deny");
    next();
});

app.use((req, res, next) => {
    //csurf?
    res.locals.csrfToken = req.csrfToken();
    next();
});

//////////////////////////
////// CREATE USER: //////
//////////////////////////

app.get("/", (req, res) => res.redirect("/register"));

app.get("/register", (req, res) => {
    if (req.session.userId) {
        res.redirect("/petition");
    }
    res.render("registration", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;

    bc.hash(password)
        .then((hashedPw) => {
            console.log("hashedPw in /register:", hashedPw);

            db.userRegistration(firstName, lastName, email, hashedPw)
                .then((results) => {
                    console.log("♦♦♦ POST adding data to db: ");
                    // console.log("results: ", results);
                    req.session.userId = results.rows[0].id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("ERR in user registration: ", err);
                    res.redirect("/register");
                });
        })
        .catch((err) => console.log("ERR in hash:", err));
});

//////////////////////////
////// USER LOGIN: ///////
//////////////////////////

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.userLogIn(email)
        .then((results) => {
            const hashFromDB = results.rows[0].password;
            console.log("results: ", results.rows[0]);

            bc.compare(password, hashFromDB)
                .then((match) => {
                    // console.log("match value from compare:", match);

                    if (match) {
                        req.session.userId = results.rows[0].id;
                        res.redirect("/thanks");
                    } else {
                        res.redirect("/login"); // deve render ERR
                    }
                })
                .catch((err) => console.log("err in compare:", err));
        })
        .catch((err) => {
            console.log("ERROR in POST: ", err);
            res.redirect("/login");
        });
});

//////////////////////////
//////// PETITION: ////////
//////////////////////////

app.get("/petition", (req, res) => {
    console.log("PETITION req: ", req.session);
    if (req.session.signatureId) {
        //req.cookies["petition-signed"]
        res.redirect("/thanks");
    } else if (req.session.userId) {
        res.render("petition", {
            layout: "main",
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/petition", (req, res) => {
    console.log("♦ POST req was made!");
    console.log("♦♦ POST req body: ", req.body);

    const signature = req.body.signature;
    const userId = req.session.userId;

    db.formEnter(signature, userId)
        .then((results) => {
            // console.log("♦♦♦ results from POST: ", results);
            console.log("♦♦♦ POST adding data to db: ");
            req.session.signatureId = results.rows[0].id;
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

//////////////////////////
///////// THANKS: ////////
//////////////////////////

app.get("/thanks", (req, res) => {
    console.log("signature id: ", req.session.signatureId);

    if (req.session.userId) {
        db.getSignatures()
            .then((results) => {
                db.findSignature(req.session.userId)
                    .then((resultSigner) => {
                        console.log("signer id: ", req.session.userId);
                        console.log("all signers: ", results.rows);
                        console.log("resultSigner: ", resultSigner);
                        // console.log("results from getSignatures: ", results);
                        let x = results["rowCount"];
                        res.render("thanks", {
                            layout: "main",
                            totalSignatures: x,
                            userSign: resultSigner.rows[0]["Signature"],
                        });
                    })
                    .catch((err) => {
                        console.log("ERROR in findSig: ", err);
                        res.redirect("/petition");
                    });
            })

            .catch((err) => {
                console.log("ERR in GET: ", err);
            });
    } else {
        res.redirect("/login");
    }
});

//////////////////////////
//////// SIGNERS: ////////
//////////////////////////

app.get("/signers", (req, res) => {
    if (req.session.signatureId) {
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
                console.log("ERR in GET: ", err);
            });
    } else {
        res.redirect("/petition");
    }
});

//////////////////////////
//////// PROFILE: ////////
//////////////////////////
app.get("/profile", (req, res) => {
    if (req.session.userId) {
        res.render("profile", {
            layout: "main",
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/profile", (req, res) => {
    const age = req.body.age;
    const city = req.session.city;
    const url = req.session.url;
    const userId = req.session.userId;

    db.enterProfileInfos(age, city, url, userId)
        .then(() => {
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("ERR in POST: ", err);
        });
});

app.listen(process.env.PORT || 8080, () =>
    console.log("...Server is listening...")
);

/*
PUNTI NON CHIARI:

should i store signatures imgs somewhere else?
secret.json ?
returning possible errors
non mi é possibile checckare un doppio url nel middleware senza entrare in loop su almeno uno
*/
