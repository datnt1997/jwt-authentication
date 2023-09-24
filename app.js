const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 8000;
const secretKey = "your-secret-key"; // Replace with a strong secret key

app.use(bodyParser.json());

// Sample user data (you would typically have a database)
const users = [
  { id: 1, username: "user1", password: "password1" },
  { id: 2, username: "user2", password: "password2" },
];

// Middleware to verify the JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // Remove the "Bearer " prefix from the token if it exists
  const tokenWithoutBearer = token.replace(/^Bearer\s/, "");

  jwt.verify(tokenWithoutBearer, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

// Authentication route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Replace this with a database query to check user credentials
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, secretKey, {
    expiresIn: "1h",
  });

  res.json({
    user: {
      id: user.id,
      username: user.username,
    },
    token,
  });
});

// Protected route
app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Protected route accessed", user: req.user });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
