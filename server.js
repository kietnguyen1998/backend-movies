const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router(require("./db.js")());
const middlewares = jsonServer.defaults();
const fs = require("fs");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 3000;

const userdb = JSON.parse(fs.readFileSync("./user.json", "UTF-8"));

server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(jsonServer.defaults());

const SECRET_KEY = "123456789";

const expiresIn = "1h";

// Create a token from a payload
function createToken(payload) {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
}

// Verify the token
function verifyToken(token) {
  return jwt.verify(token, SECRET_KEY, (err, decode) =>
    decode !== undefined ? decode : err
  );
}

// Check if the user exists in database
function isExist({ email }) {
  return userdb.users.findIndex((user) => user.email === email) !== -1;
}
function isAuthenticated({ email, password }) {
  return (
    userdb.users.findIndex(
      (user) => user.email === email && user.password === password
    ) !== -1
  );
}
// Register New User
server.post("/auth/register", (req, res) => {
  console.log("register endpoint called; request body:");
  console.log(req.body);
  const { email, password, phone, fullName, role } = req.body;

  if (isExist({ email }) === true) {
    const status = 401;
    const message = "Email already exist";
    res.status(status).json({ status, message });
    return;
  }

  fs.readFile("./user.json", (err, data) => {
    if (err) {
      const status = 401;
      const message = err;
      res.status(status).json({ status, message });
      return;
    }

    // Get current users data
    var data = JSON.parse(data.toString());

    // Get the id of last user
    var last_item_id = data.users[data.users.length - 1].id;

    //Add new user
    data.users.push({
      id: last_item_id + 1,
      email: email,
      password: password,
      fullName: fullName,
      phone: phone,
      role: role,
    }); //add some data
    var writeData = fs.writeFile(
      "./user.json",
      JSON.stringify(data),
      (err, result) => {
        // WRITE
        if (err) {
          const status = 401;
          const message = err;
          res.status(status).json({ status, message });
          return;
        }
      }
    );
  });

  // Create token for new user
  const accessToken = createToken({ email, password });
  console.log("Access Token:" + accessToken);
  res.status(200).json({ accessToken });
});

// Login to one of the users from ./users.json
server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (isAuthenticated({ email, password }) === false) {
    const status = 401;
    const message = "Incorrect email or password";
    res.status(status).json({ status, message });
    return;
  }
  const accessToken = createToken({ email, password });
  console.log("Access Token:" + accessToken);
  res.status(200).json({ accessToken });
});

server.post("/auth/getInfo", (req, res) => {
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    const status = 401;
    const message = "Error in authorization format";
    res.status(status).json({ status, message });
    return;
  }

  try {
    const decoded = jwt.verify(
      req.headers.authorization.split(" ")[1],
      SECRET_KEY
    );
    res.status(200).send(decoded);
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
});

server.use("/userList", (req, res, next) => {
  if (
    req.headers.authorization === undefined ||
    req.headers.authorization.split(" ")[0] !== "Bearer"
  ) {
    const status = 401;
    const message = "Error in authorization format";
    res.status(status).json({ status, message });
    return;
  }
  try {
    let verifyTokenResult;
    verifyTokenResult = verifyToken(req.headers.authorization.split(" ")[1]);

    if (verifyTokenResult instanceof Error) {
      const status = 401;
      const message = "Access token not provided";
      res.status(status).json({ status, message });
      return;
    }
    next();
  } catch (err) {
    const status = 401;
    const message = "Error Access Token is revoked";
    res.status(status).json({ status, message });
  }
});

server.use(router);

server.listen(port);
