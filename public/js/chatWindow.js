// Event listener for 'Enter' key in the chat box
chatBoxInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevents default action (like submitting a form)
        sendMessage();
    }
});

//added on 11/4/2024
function sendMessage(){
    var messageText = document.getElementById('chatBoxInput').value;

    if(messageText === ""){
        console.log("Let's not send empty messages, shall we?");
        return;
    }

    let newJsonObj = {
        type: 'message',
        sender: username,
        messageText: messageText
    }
    socket.send(JSON.stringify(newJsonObj));
    console.log("message sent");    //DEBUG
    document.getElementById('chatBoxInput').value = "";
}


/*
    Process incoming messages
    by displaying them in the chatbox
*/
function receiveMessage(sender, messageText){
    const messageElement = document.createElement("div");
    if(sender === "server"){
        messageElement.innerHTML = `${messageText}`;
    }else{
        messageElement.innerHTML = `<b>${sender}</b>: ${messageText}`;
    }
    
    document.getElementById("chatMessages").appendChild(messageElement);
    document.getElementById("chatMessages").scrollTop = document.getElementById("chatMessages").scrollHeight;//auto scroll bottom
}