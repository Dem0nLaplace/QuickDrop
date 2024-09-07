// server side code

/*
    Unresolved BUG

    #1: a user disconnected, but his username is not dropped, which prevents
        the user from conneccting again

    #2: seems like the user list is not updated for all users when a new 
        user connects
*/

const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const {v4: uuid} = require('uuid');

let peerConnection = null;
let userMap = new Map();    //userMap stores username => uuid, ws

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

                userMap.set(username, {userid: userid, ws: ws});    //userMap stores username => uuid, ws
                console.log(`Connection Approved, username: ${username}, userid: ${userid}`);

                //also send a updated list of all current users to every user
                
                let userArray = Array.from(userMap.keys());
                for(let user of userArray){
                    console.log("user = " + user);
                }
                console.log("END OF USER LIST");
                ws.send(JSON.stringify({type: 'userlist', userlist: userArray}));

            }
        }

    });


    ws.on('message', (message) => {
        let jsonObj = JSON.parse(message);
        switch(jsonObj.type){
            case 'message':
                console.log(`Received message from client ${userid}: ${jsonObj.text}`);
                break;

            case 'offer':
                sendToOneUser(jsonObj.target, jsonObj);

                break;

            case 'answer':
                sendToOneUser(jsonObj.target, jsonObj);

            case 'iceCandidate':
                sendToOneUser(jsonObj.target, jsonObj);
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

function sendToOneUser(targetUsername, obj){
    if(userMap.has(targetUsername)){
        let target = userMap.get(targetUsername);
        target.ws.send(JSON.stringify(obj));
        console.log(`Send message to ${targetUsername}`);
    }else{
        console.log(`User ${targetUsername} not found!`);
    }
}

console.log('WebSocket server running on ws://localhost:8080');
console.log("Click this link to access html: http://localhost:8000/");

