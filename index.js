// server.js (or another appropriate file)
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`Received message from client: ${message}`);
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    ws.on('close', () => {
        console.log("A client has disconnected");
    });

    ws.send('Connection established!');
    ws.send('Hello World!');
    ws.send('Can anyone hear me');

});



console.log('WebSocket server running on ws://localhost:8080');
