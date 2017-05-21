const express = require('express');
const http = require('http');
const WebSocket = require('uws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, 'build')));

wss.on('connection', (ws) => {
  const welcomeMessages = [
    'Welcome to the chat!',
    'Greetings from your host, a Node.js WebSocket server'
  ];

  welcomeMessages.forEach(message => {
    ws.send(JSON.stringify({ sender: 'Server', message }));
  });

  ws.on('message', (message) => {
    const parsed = JSON.parse(message);

    wss.clients
      .forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
  });
});

server.listen(8001);
