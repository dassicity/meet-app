const express = require('express');
const path = require('path');
const app = express();
const server = require('http').Server(app);

require('dotenv').config();

const { v4: uuidv4 } = require('uuid');
const io = require('socket.io')(server);
const { ExpressPeerServer } = require('peer');
const url = require('url');
const peerServer = ExpressPeerServer(server, {
    debug: true
});

//middlewares
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "static")));
app.use("/peerjs", peerServer);

app.get("/", (req, res, next) => {
    res.sendFile(path.join(__dirname, "static", "index.html"));
});

//api to get the url
app.get("/join", (req, res, next) => {
    res.redirect(
        url.format({
            pathname: `/join/${uuidv4}`
        })
    )
})

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log(`Hosted on PORT = ${PORT}`);
});

