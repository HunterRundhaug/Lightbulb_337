const ip = "localhost";

function getUserFromServer(){
    const userNameInput = document.getElementById("inputForm").value;
    let userNameElement = document.getElementById("userNameP");
    let displayNameElement = document.getElementById("displayNameP");
    let bioElement = document.getElementById("bioP");
    let statusElement = document.getElementById("statusP");

    let responseHolder;

    var httpRequest = new XMLHttpRequest();
    if(!httpRequest){
        alert('an error has occured...');
        return false;
    }

    httpRequest.onreadystatechange = () => {
        
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200) { // THIS is where the data is recieved.
                responseHolder = JSON.parse(httpRequest.responseText);
                console.log("200 response!!");
                userNameElement.textContent = responseHolder.userName;
                displayNameElement.textContent = responseHolder.dispName;
            } 
            else { 
                displayNameElement.textContent = "error";
            }
        }
    }
    
    let url = `http://${ip}:3000/getUserData/${userNameInput}`;
    httpRequest.open('GET', url);
    httpRequest.send();
}