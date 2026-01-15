require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
// const cookieParser = require("cookie-parser");
const Route = require("./routes/index");
const { default: mongoose } = require("mongoose");
const errorMiddleware = require("./middlewares/error.middleware");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 6000;

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use("/", Route);

app.use(errorMiddleware)

const bootstrap = async () => {
  try {
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => console.log("Mongodb connected"));
    app.listen(PORT, () => {
      console.log("Server is running on port", PORT);
    });
  } catch (err) {
    console.error(err);
  }
};
bootstrap()