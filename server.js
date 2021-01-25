const express = require("express");
const app = express();

// const cookieParser = require("cookie-parser"); //dont need this with cookieSesion?
const cookieSession = require("cookie-session");
const csurf = require("csurf");

const db = require("./db");
const bc = require("./bc");
const secrets = require("./secrets");

const hb = require("express-handlebars");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

// app.use(cookieParser()); //dont need this with cookieSesion?

app.use(express.static("./public"));

app.use(
    cookieSession({
        secret: secrets.secretCookie,
        // maxAge: 1000 * 60 * 60 * 24 * 14,
        maxAge: 1000 * 20,
    })
);

app.use(express.urlencoded({ extended: false }));
app.use(csurf()); //csurf?

app.use((req, res, next) => {
    if (
        !req.session.signatureId &&
        req.url !== "/register" &&
        req.url !== "/login"
    ) {
        //before was: !req.cookies["petition-signed"]
        return res.redirect("/register");
    }
    next();
});

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

app.get("/", (req, res) => res.redirect("/register"));

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

    // const firstName = req.body.fname;
    // const lastName = req.body.lname;
    const signature = req.body.signature;

    db.formEnter(signature)
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

app.get("/thanks", (req, res) => {
    db.getSignatures()
        .then((results) => {
            db.findSignature(req.session.signatureId).then(() => {
                console.log("signer id: ", req.session.signatureId);
                console.log("all signers: ", results.rows);
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

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;
    const password = req.body.password;
    // hash the password that the user typed and THEN
    // insert a row in the USERS table (new table) -> see 3. for table structure

    db.userRegistration(firstName, lastName, email, password)
        .then()
        .catch((err) => {
            console.log("ERROR in POST: ", err);
            res.redirect("/register");
        });

    hash(password)
        .then((hashedPw) => {
            console.log("hashedPw in /register:", hashedPw);
            // we'll be wanting to add all user information plus the hashed PW into our db
            // if this worked successfully we want to redirect the user
            // if sth went wrong we want to render an error msg to our user
        })
        .catch((err) => console.log("err in hash:", err));
});

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    db.userRegistration(email, password)
        .then()
        .catch((err) => {
            console.log("ERROR in POST: ", err);
            res.redirect("/login");
        });

    // now we want to compare values
    // you will want to go to you db, check if the email the user provided exists, and if yes retrieve the stored hash and pass that to compare are the second argument

    // DO NOT DO THIS IN YOUR ACTUAL APPLICATION
    const hashFromDB = "someHash"; // you will get an actually hashed pw from you db ;)
    compare("whatEverTheUserClaimsToBeThePw", hashFromDB)
        .then((match) => {
            console.log("match value from compare:", match);
            // if pw matches, we want to set a NEW cookie with the userId
            // if not we want to send back an error msg, meaning rerender the login template but pass to it an error
        })
        .catch((err) => console.log("err in compare:", err));
    res.sendStatus(200);
});

app.listen(8080, () => console.log("...Server is listening..."));

/*
PUNTI NON CHIARI:
/thanks route -> perché il mio id non funziona normalmente? -1

should i store signatures imgs somewhere else?
secret.json ?
returning possible errors
*/
