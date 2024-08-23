// server.js (or another appropriate file)
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');

//create http server
http.createServer((request, response) => {
    if(request.url === '/'){
        response.writeHead(200, {'Content-Type': 'text/html'});
        try{
            const html = fs.readFileSync('index.html');
            response.write(html);
            response.end();
        }catch(e){
            response.statusCode = 404;
            response.write("Bad Request");
            console.log(e);
            response.end();
        }
    }else if(request.url === '/main.css'){
        response.writeHead(200, {'Content-Type': 'text/css'});
        try{
            const css = fs.readFileSync('main.css');
            response.write(css);
            response.end();
        }catch(e){
            response.statusCode = 404;
            response.write("Bad Request");
            console.log(e);
            response.end();
        }
    }


}).listen(8000);



//create web socket server
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


function log(text) {
    var time = new Date();

    console.log("[" + time.toLocaleTimeString() + "] " + text);
}


console.log('WebSocket server running on ws://localhost:8080');
