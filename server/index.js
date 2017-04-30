const express = require('express');
const http = require('http');
const WebSocket = require('uws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const welcomeMessages = [
    "Welcome to the chat!",
    "Greetings from your host, a Node.js WebSocket server"
  ];

  welcomeMessages.forEach(message => {
    ws.send(JSON.stringify({ sender: "Server", message }));
  });

  ws.on('message', (message) => {
    const parsed = JSON.parse(message);
    console.log(`received "${parsed.message}" from ${parsed.sender}`);

    wss.clients
      .forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
  });
});

server.listen(8081, () => {
  console.log(`Listening on http://localhost:${server.address().port}`);
});