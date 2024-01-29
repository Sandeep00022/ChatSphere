const express = require("express");
const chats = require("./data/data");
const env = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const path = require('path')
const { errorHandler, notFound } = require("./middleware/errorMidleware");
const cors = require("cors");

env.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

connectDB();


app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

const __dirname1 = path.resolve();

if(process.env.NODE_ENV ==="production") {
   app.use(express.static(path.join(__dirname1,"/frontend/build")));

   app.get('*', (req,res) => {
    res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"))
   })
} else{
  app.get("/", (req, res) => {
    res.send("API is Running Successfully");
  });
}

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;

const server = app.listen(8080, () => {
  console.log(`your port is running at ${port}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});



io.on("connection", (socket) => {
  console.log("conneted to socket");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
   
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
