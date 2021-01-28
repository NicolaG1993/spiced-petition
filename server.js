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
    } else {
        res.render("registration", {
            layout: "main",
        });
    }
});

app.post("/register", (req, res) => {
    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;

    bc.hash(password)
        .then((hashedPw) => {
            db.userRegistration(firstName, lastName, email, hashedPw)
                .then((results) => {
                    req.session.userId = results.rows[0].id;
                    res.redirect("/profile");
                })
                .catch((err) => {
                    res.render("registration", {
                        layout: "main",
                        err,
                    });
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
            bc.compare(password, hashFromDB)
                .then((match) => {
                    if (match) {
                        req.session.userId = results.rows[0].id;

                        db.profileInfos(req.session.userId)
                            .then((signIdResult) => {
                                req.session.signatureId =
                                    signIdResult.rows[0].id;

                                res.redirect("/petition");
                            })
                            .catch((err) => {
                                console.log("err", err);
                                res.redirect("/petition");
                            });
                    } else {
                        throw Error;
                    }
                })
                .catch((err) => {
                    res.render("login", {
                        layout: "main",
                        err,
                    });
                });
        })
        .catch((err) => {
            // res.redirect("/login");
            res.render("login", {
                layout: "main",
                err,
            });
        });
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
    const age = req.body.age || 0;
    const city = req.body.city;
    let url = req.body.url;
    const userId = req.session.userId;

    if (url.startsWith("http://" || "https://") || url == "") {
        db.enterProfileInfos(age, city, url, userId)
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("ERR in POST: ", err);
            });
    } else if (url.startsWith("<") || typeof url !== "string") {
        url = `http://${url}`;
        // console.log("invalid str");
        let attack = true;
        res.render("profile", {
            layout: "main",
            attack,
        });
    } else {
        url = `http://${url}`;
        db.enterProfileInfos(age, city, url, userId)
            .then(() => {
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("ERR in POST: ", err);
            });
    }
});

//////////////////////////
////// PROFILE/EDIT: //////
//////////////////////////
app.get("/profile/edit", (req, res) => {
    if (req.session.userId) {
        db.profileInfos(req.session.userId)
            .then((results) => {
                const userInfos = results["rows"][0];
                res.render("editProfile", {
                    layout: "main",
                    fname: userInfos["First Name"],
                    lname: userInfos["Last Name"],
                    email: userInfos["email"],
                    age: userInfos["age"],
                    city: userInfos["city"],
                    url: userInfos["url"],
                });
            })

            .catch((err) => {
                console.log("ERR in GET: ", err);
            });
    } else {
        res.redirect("/login");
    }
});

app.post("/profile/edit", (req, res) => {
    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;
    const age = req.body.age;
    const city = req.body.city;
    let url = req.body.url;
    const userId = req.session.userId;

    const checkLink = (str) => {
        if (str.startsWith("http://" || "https://") || str == "") {
            console.log("valid str");
        } else if (str.startsWith("<") || typeof str !== "string") {
            url = `http://${str}`;
            // console.log("invalid str");
            throw Error;
        } else {
            url = `http://${str}`;
        }
    };

    if (password !== "") {
        bc.hash(password)
            .then((hashedPw) => {
                db.updateUserAndPsw(
                    firstName,
                    lastName,
                    email,
                    hashedPw,
                    userId
                )
                    .then(() => {
                        checkLink(url);

                        db.updateUserProfile(age, city, url, userId)
                            .then(() => {
                                res.redirect("/petition");
                            })
                            .catch((err) => {
                                console.log("ERR in POST2: ", err);
                            });
                    })
                    .catch((err) => {
                        console.log("ERR in POST: ", err);
                        let attack = true;
                        res.render("editProfile", {
                            layout: "main",
                            attack,
                            fname: firstName,
                            lname: lastName,
                            email: email,
                            age: age,
                            city: city,
                        });
                    });
            })
            .catch((err) => {
                console.log("ERR in POST: ", err);
            });
    } else {
        db.updateUser(firstName, lastName, email, userId)
            .then(() => {
                checkLink(url);

                db.updateUserProfile(age, city, url, userId)
                    .then(() => {
                        res.redirect("/petition");
                    })
                    .catch((err) => {
                        console.log("ERR in POST2: ", err);
                    });
            })
            .catch((err) => {
                console.log("ERR in POST: ", err);
                let attack = true;
                res.render("editProfile", {
                    layout: "main",
                    attack,
                    fname: firstName,
                    lname: lastName,
                    email: email,
                    age: age,
                    city: city,
                });
            });
    }
});

//////////////////////////
//////// PETITION: ////////
//////////////////////////

app.get("/petition", (req, res) => {
    if (req.session.signatureId) {
        //req.cookies["petition-signed"]
        console.log("going to thanks from petition:");
        res.redirect("/petition/thanks");
    } else if (req.session.userId) {
        console.log("staying on petition:");
        res.render("petition", {
            layout: "main",
        });
    } else {
        res.redirect("/login");
    }
});

app.post("/petition", (req, res) => {
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

app.get("/petition/thanks", (req, res) => {
    if (req.session.userId) {
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
    } else {
        res.redirect("/login");
    }
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

app.get("/petition/signers", (req, res) => {
    if (req.session.signatureId) {
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
    } else {
        res.redirect("/petition");
    }
});

//////////////////////////
///// PETITION/SIGNERS/CITY: //////
//////////////////////////

app.get("/petition/signers/:city", (req, res) => {
    const city = req.params.city;
    if (req.session.userId) {
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
    } else {
        res.redirect("/login");
    }
});

//////////////////////////
////// LOGOUT: //////
//////////////////////////
app.get("/logout", function (req, res) {
    req.session = null;
    res.redirect("/");
});

//////////////////////////
////// DELETE: //////
//////////////////////////
app.get("/delete", function (req, res) {
    //i need a new fn from db to delete all where id match
    req.session = null;
    res.redirect("/");
});

//////////////////////////
////// ERR 404: //////
//////////////////////////
app.get("*", function (req, res) {
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
