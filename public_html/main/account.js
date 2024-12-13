/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: account.js
    Purpose: account.js loads the currently signed in users account data onto
    the page. Interacting with the DOM to update its contents on window load.
*/

// Initalizes Page for currently signed in user by grabbing DOM elements
const usernameObj = document.getElementById("usernameText");
const displayNameObj = document.getElementById("displayNameText");
const statusObj = document.getElementById("statusText");
const bioObj = document.getElementById("bioText");
const statusForm = document.getElementById("statusForm");
const displayNameForm = document.getElementById("setDisplayNameForm");
const bioForm = document.getElementById("setBioFrom");
const viewProfileButton = document.getElementById("viewProfileButton");

// Function to call server via GET to get user data and displays it.
// The inner section of this function sets innertext/value for different DOM objects
async function getCurrentlySignedInUser() {
    console.log("function called");
    try {
        const response = await fetch(`http://localhost:3000/getCurrentUser`);
        if (response.ok) {                      
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
            viewProfileButton.onclick = function () {
                goToProfile(userName);
            };
        }
        else
            console.log('The user is not authenticated.');
    }
    catch (error) {
        console.error('Error fetching current user clientSide: ', error);
    }
}

// Call the function when the page loads
window.onload = getCurrentlySignedInUser;

// Fetch request via POST to update account info
function updateUserInfo(event) {
    event.preventDefault(); // Stop the form from refreshing the page.

    // Creates JSON of data to send
    dataToSend = {
        status: statusForm.value, dispname: displayNameForm.value, bio: bioForm.value,
    };
    console.log(dataToSend);
    // Send post request with fetch
    fetch('http://localhost:3000/updateUserInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
        // returns a promise, check for any errors
        .then(response => {
            if (response.ok)
                getCurrentlySignedInUser();
            else
                alert(response.status);
        })
        .catch(error => {
            // Handle errors from the fetch call
            console.error('Error:', error);
        });

}