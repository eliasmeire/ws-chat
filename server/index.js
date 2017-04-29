const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('uws');

const app = express();

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
        console.log('sending data', data);
      client.send(data);
    }
  });
};

wss.on('connection', (ws) => {
    ws.send(JSON.stringify({ s: "Server", m: "Welcome!"}));
  ws.on('message', (message) => {
    console.log('received: ', message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });
});

server.listen(8081, function() {
  console.log(`Listening on port ${server.address().port}`);
});