


// Initalize Page for currently signed in user...
const usernameObj = document.getElementById("usernameText");
const displayNameObj = document.getElementById("displayNameText");
const statusObj = document.getElementById("statusText");
const bioObj = document.getElementById("bioText");

const statusForm = document.getElementById("statusForm");
const displayNameForm = document.getElementById("setDisplayNameForm");
const bioForm = document.getElementById("setBioFrom");

async function getCurrentlySignedInUser(){
    console.log("function called");
    try{
        const response = await fetch('http://localhost:3000/getCurrentUser');
        if(response.ok){
            const user = await response.json();
            let userName = user.userName;
            let displayName = user.dispName;
            let status = user.status;
            let bio = user.bio;
            usernameObj.innerText = userName;
            displayNameObj.innerText = displayName;
            statusObj.innerText = status;
            bioObj.innerText = bio;
            
            statusForm.value = status;
            displayNameForm.value = displayName;
            bioForm.innerText = bio;

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


function updateUserInfo(event){

    event.preventDefault(); // Stop the form from refreshing the page.

    dataToSend = { status: statusForm.value, dispname: 
        displayNameForm.value, 
        bio: bioForm.value,
    };
    console.log(dataToSend);
    // Send post request with fetch...
    fetch('http://localhost:3000/updateUserInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
    // returns a promise, check for any errors
    .then(response => {
        if(response.ok){
            getCurrentlySignedInUser();
        }
         else {
            alert(response.status);
        }
    })
    .catch(error => {
        // Handle errors from the fetch call
        console.error('Error:', error);
    });

}