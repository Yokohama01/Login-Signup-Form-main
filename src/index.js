const express = require("express");
const path = require("path");
const app = express();
const LogInCollection = require("./mongo");
const mongoose = require("mongoose");
const multer = require("multer");

const port = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const templatePath = path.join(__dirname, "../templates");
const publicPath = path.join(__dirname, "../public");

app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.static(publicPath));

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/", (req, res) => {
  res.render("login");
});

app.post("/signup", async (req, res) => {
  const data = {
    name: req.body.name,
    password: req.body.password,
  };

  const checking = await LogInCollection.findOne({ name: req.body.name });

  try {
    if (checking && checking.password === req.body.password) {
      res.send("User details already exist");
    } else {
      await LogInCollection.create(data);
      res.status(201).render("home", { naming: req.body.name });
    }
  } catch {
    res.send("Wrong inputs");
  }
});

app.post("/upload", upload.single("profileImg"), (req, res) => {
  console.log(req.body);
  console.log(req.file);

  return res.redirect("/");
});

app.post("/login", async (req, res) => {
  try {
    const check = await LogInCollection.findOne({ name: req.body.name });

    if (check && check.password === req.body.password) {
      res
        .status(201)
        .render("home", { naming: `${req.body.password}+${req.body.name}` });
    } else {
      res.send("Incorrect password");
    }
  } catch (e) {
    res.send("Wrong details");
  }
});

app.listen(port, () => {
  console.log("Port connected");
});

mongoose
  .connect(
    "mongodb+srv://rawatbhavesh508:258080@cluster0.b86nr91.mongodb.net/LogSign"
  )
  .then(() => {
    console.log("Mongoose connected");
  })
  .catch((e) => {
    console.log("Failed to connect:", e.message);
  });
