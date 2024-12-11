const cookieParser = require("cookie-parser");
const express = require("express");
const path = require("path");
const userModel = require("./models/user.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { rawListeners } = require("process");
const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());


// Home page
app.get("/", (req, res) => {
    res.render("index");
});

// Create the new user
app.post("/create", async (req, res) => {
    const { username, email, password, age } = req.body;

    // Generate the salt and hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const createUser = await userModel.create({
        username,
        email,
        password: hash,
        age
    });

    const token = jwt.sign({email }, "secret");
    res.cookie("token", token);
    return res.send(createUser)
});


app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) return res.send("Something Went Wrong.");
    bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (result) {
            const token = jwt.sign({email:user.email},"secret");
            res.cookie("token",token);
            res.send("Yes! You can login.")
        } else {
            res.send("Sorry! You can't login");
        }
    });
});

app.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.send("You Logout from the site.");
});

app.listen(PORT, () => {
    console.log(`Server is running on the PORt ${PORT}`);
});