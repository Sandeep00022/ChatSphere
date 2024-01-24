const express = require("express");
const chats = require("./data/data");
const env = require("dotenv");
const connectDB = require("./config/db");
env.config();
const app = express();

connectDB()
app.get("/", (req, res) => {
  res.send("API is Running");
});

app.get("/api/chat", (req, res) => {
  res.send(chats);
});

app.get("/api/chat/:id", (req, res) => {
  const singleChat = chats.find((c) => c._id === req.params.id);
  res.send(singleChat);
  console.log(singleChat);
});

const port = process.env.PORT || 5000;

app.listen(8080, () => {
  console.log(`your port is running at ${port}`);
});
