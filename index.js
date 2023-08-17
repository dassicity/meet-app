const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);

require('dotenv').config();

const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const url = require('url');
const { Socket } = require('socket.io');
const peerServer = ExpressPeerServer(server, {
    debug: true         // to receive all the errors
});

//middlewares
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);

app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

//api to get the url - new url
app.get("/join", (req, res, next) => {
    console.log("In Join");
    res.redirect(
        url.format({
            pathname: `/join/${uuidv4()}`,
            query: req.query
        })
    )
})

//api to go to the url if uuid already exists
app.get("/joinold/:meeting_id", (req, res, next) => {
    console.log("In JoinOld");
    res.redirect(
        url.format({
            pathname: req.params.meeting_id,
            query: req.query
        })
    );
});

// api for joining a room
app.get("/join/:rooms", (req, res, next) => {
    console.log("In Join Room");
    res.render("room", {
        roomid: req.params.rooms,
        myname: req.query.name
    });
});

io.on("connection", (socket) => {

    socket.on("join-room", (roomid, id, myname) => {
        console.log("In Join Room socket");
        socket.join(roomid);
        socket.to(roomid).emit("user-connected", id, myname);

        socket.on("tellname", (myname) => {
            console.log("In Tell name");
            socket.to(roomid).emit("addname", myname);
        });

        socket.on("disconnect", () => {
            console.log("In disconnect");
            socket.to(roomid).emit("user-disconnected", id);
        });
    });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`Hosted on PORT = ${PORT}`);
});

