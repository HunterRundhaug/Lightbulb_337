


// Initalize Page for currently signed in user...
const usernameObj = document.getElementById("usernameText");
const displayNameObj = document.getElementById("displayNameText");
const statusObj = document.getElementById("statusText");


async function getCurrentlySignedInUser(){
    console.log("function called");
    try{
        const response = await fetch('http://localhost:3000/getCurrentUser');
        if(response.ok){
            const user = await response.json();
            let userName = user.userName;
            let displayName = user.dispName;
            let status = user.status;
            usernameObj.innerText = userName;
            displayNameObj.innerText = displayName;
            statusObj.innerText = status;
        }
        else{
            console.log('It seems the user is not authenticated.');
        }
    }
    catch(error){
        console.error('Error fetching current user clientSide: ', error);
    }
}


// Call the function when the page loads
window.onload = getCurrentlySignedInUser;