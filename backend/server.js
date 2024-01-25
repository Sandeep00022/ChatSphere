const express = require("express");
const chats = require("./data/data");
const env = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const {errorHandler,notFound} = require("./middleware/errorMidleware")
env.config();
const app = express();
app.use(express.json());
connectDB();
app.get("/", (req, res) => {
  res.send("API is Running");
});

app.use("/api/user", userRoutes);

app.use(notFound);
app.use(errorHandler)

const port = process.env.PORT || 5000;

app.listen(8080, () => {
  console.log(`your port is running at ${port}`);
});
