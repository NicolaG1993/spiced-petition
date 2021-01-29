const express = require("express");
const router = express.Router();

const { requireLoggedOutUser } = require("./middleware");
// const { app } = require("./server");

const db = require("./db");
const bc = require("./bc");

//////////////////////////
////// CREATE USER: //////
//////////////////////////

router.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("registration", {
        layout: "main",
    });
});

router.post("/register", requireLoggedOutUser, (req, res) => {
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

router.get("/login", requireLoggedOutUser, (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

router.post("/login", requireLoggedOutUser, (req, res) => {
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

exports.router = router;
