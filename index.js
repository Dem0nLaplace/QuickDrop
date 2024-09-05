// server side code
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const {v4: uuid} = require('uuid');

let peerConnection = null;
let userArray = [];
let userMap = new Map();

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
    var username = null;
    var userid = null;

    //if username is unique 
    //  assign uuid to user on connection,
    //else end connection, return invalid username
    ws.once('message', (message) => {
        console.log("Detected incoming new connection");
        let jsonObj = JSON.parse(message);
        if(jsonObj.type == 'username'){
            if(userMap.has(jsonObj.username)){
                ws.send(JSON.stringify({type: 'reject', text: "duplicate username, try a different username"}));
                ws.close();
            }else{
                username = jsonObj.username;
                userid = uuid();
                const jsonMessage = {
                    text: "assigning userid",
                    uuid: userid,
                    type: 'uuid'
                };
                ws.send(JSON.stringify(jsonMessage));

                userMap.set(username, userid);
                console.log(`Connection Approved, username: ${username}, userid: ${userid}`);

                //also send a list of all current users
            }
        }

    });


    ws.on('message', (message) => {
        let jsonObj = JSON.parse(message);
        switch(jsonObj.type){
            case 'message':
                console.log(`Received message from client ${userid}: ${jsonObj.text}`);
                break;
        }    
        //console.log(`Received message from client: ${message}`);
        
        // Broadcast the message to all connected clients
        /*
        wss.clients.forEach((client) => {
            client.send(JSON.stringify(jsonMessage));
        });
        */

        /*
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(jsonMessage);
            }
        });
        */

    });

    ws.on('close', () => {
        console.log("A client has disconnected");
    });

    
    //ws.send('Hello World From Server!');

});


function log(text) {
    var time = new Date();

    console.log("[" + time.toLocaleTimeString() + "] " + text);
}


console.log('WebSocket server running on ws://localhost:8080');
console.log("Click this link to access html: http://localhost:8000/");

