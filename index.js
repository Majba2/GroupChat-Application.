const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const appServer = createServer(app);
const io = new Server(appServer);

const usernames = {};

// Serve static files from the "public" directory
app.use(express.static(__dirname + "/public"));

// Serve the main HTML file
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Handle Socket.IO connections
io.on('connection', (socket) => {
    console.log('User Connected...');

    // Handle incoming messages
    socket.on('message', (msg) => {
        socket.to(socket.group).emit('message', msg);
    });

    // Add user to a room
    socket.on('adduser', (username, groupname) => {
        socket.join(groupname);
        socket.group = groupname;
        socket.username = username;

        // Store usernames
        usernames[`${username}_${groupname}`] = username;
        io.sockets.in(socket.group).emit('updateusers', usernames);
        socket.emit('greeting', username);
    });

    // Handle image uploads
    socket.on('uploadImage', (data, username) => {
        socket.to(socket.group).emit('publishImage', data, username);
    });

    // Handle file uploads
    socket.on('uploadFile', (data, username, fileName) => {
        socket.to(socket.group).emit('publishFile', data, username, fileName);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log("User Disconnected");
        delete usernames[`${socket.username}_${socket.group}`];
        socket.leave(socket.group);
        socket.to(socket.group).emit('updateusers', usernames);
    });
});

// Start the server
appServer.listen(8000, () => {
    console.log("Server is running at http://localhost:8000");
});
