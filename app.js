const express = require('express');
const path = require('path');
const app = express();
const WebSocket = require('ws');
const fs = require('fs');
const {v4: uuid} = require('uuid');

let userMap = new Map();    //userMap stores username => uuid, ws

//host server using express.js
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.get('/config.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'config.js'));
});

const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});

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

                //user list log
                let userlist = Array.from(userMap.keys());
                logUserList(userlist);

                //send a updated list of all current users to every user
                userMap.forEach((userData, user) =>{
                    userData.ws.send(JSON.stringify({type: "userlist", userlist: userlist}));
                });
                
               /*
                wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({type: 'userlist', userlist: userlist}));
                    }
                });
                */

            }
        }

    });


    ws.on('message', (message) => {
        let jsonObj = JSON.parse(message);
        switch(jsonObj.type){
            case 'message':
                console.log(`Received message from client ${userid}: ${jsonObj.messageText}, broadcasting`);
                userMap.forEach((userData, user) =>{
                    userData.ws.send(JSON.stringify({type: "message", sender: jsonObj.sender, messageText: jsonObj.messageText}));
                });
                break;

            case 'offer':
                sendToOneUser(jsonObj.target, jsonObj);
                break;

            case 'answer':
                sendToOneUser(jsonObj.target, jsonObj);
                break;

            case 'iceCandidate':
                sendToOneUser(jsonObj.target, jsonObj);
                break;
        }    
    });

    ws.on('close', () => {
        userMap.delete(username);

        //user list log
        let userlist = Array.from(userMap.keys());
        logUserList(userlist);

        //send a updated list of all current users to every user
        userMap.forEach((userData, user) =>{
            userData.ws.send(JSON.stringify({type: "userlist", userlist: userlist}));
        });

        console.log("A client has disconnected");
    });

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

function logUserList(userlist){
    let userlistLog = "userlist: [";
    for(let i=0; i<userlist.length; i++){
        userlistLog += userlist[i];
        if(i != userlist.length-1){
            userlistLog += ",";
        }
    }
    userlistLog += "]";
    console.log(userlistLog);
}

console.log('WebSocket server running on ws://localhost:8080');
console.log("Click this link to access html: http://localhost:8000/");