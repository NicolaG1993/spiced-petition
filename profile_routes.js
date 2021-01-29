const express = require("express");
const router = express.Router();
const db = require("./db");
const bc = require("./bc");

const { requireLoggedInUser } = require("./middleware");
//////////////////////////
//////// PROFILE: ////////
//////////////////////////
router.get("/profile", requireLoggedInUser, (req, res) => {
    res.render("profile", {
        layout: "main",
        page: "Profile",
    });
});

router.post("/profile", (req, res) => {
    const age = +req.body.age;
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
            page: "Profile",
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
router.get("/profile/edit", requireLoggedInUser, (req, res) => {
    db.profileInfos(req.session.userId)
        .then((results) => {
            const userInfos = results["rows"][0];
            res.render("editProfile", {
                layout: "main",
                page: "Edit Profile",
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
});

router.post("/profile/edit", (req, res) => {
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
                            page: "Edit Profile",
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
                    page: "Edit Profile",
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

exports.router = router;
