const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const Route = require("./routes/index");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 6000;

app.use(express.json())

app.use("/auth", Route)

app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
