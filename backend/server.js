const express = require("express");
const chats = require("./data/data");
const env = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { errorHandler, notFound } = require("./middleware/errorMidleware");

env.config();
const app = express();
app.use(express.json());
connectDB();
app.get("/", (req, res) => {
  res.send("API is Running");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

const server = app.listen(8080, () => {
  console.log(`your port is running at ${port}`);
});

const io = require('socket.io')(server,{
  pingTimeout: 60000,
  cors:{
    origin:"http://localhost:3000",
  },
});

io.on("connection", ()=>{
  console.log('connected to socket.io');

  Socket.on('setup', (userData)=> {
    Socket.join(userData._id);
    Socket.emit('connected')
  })
});