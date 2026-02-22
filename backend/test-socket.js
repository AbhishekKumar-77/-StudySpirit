const { io } = require("socket.io-client");

const socket1 = io("http://localhost:3000", { withCredentials: true });
const socket2 = io("http://localhost:3000", { withCredentials: true });

socket1.on("connect", () => {
    console.log("Socket 1 connected");
    socket1.emit("user:online", "654321"); // Fake ID
});

socket2.on("connect", () => {
    console.log("Socket 2 connected");
    socket2.emit("user:online", "987654"); // Fake ID
});

socket1.on("users:online", (users) => {
    console.log("Socket 1 users:", users);
});

socket2.on("users:online", (users) => {
    console.log("Socket 2 users:", users);
});
