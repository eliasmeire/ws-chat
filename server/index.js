const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('uws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  const welcomeMessage = {
    sender: "Server",
    message: "Welcome to the chat! Greetings from your host, a Node.js WebSocket server"
  };

  ws.send(JSON.stringify(welcomeMessage));
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

server.listen(8081, function() {
  console.log(`Listening on http://localhost:${server.address().port}`);
});