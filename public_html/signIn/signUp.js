

/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: signUp.js
    Purpose: sends request to the server to sign up a new user account. Uses fetch
    to send POST request. Alerts the status response from the server.
*/


// request to post a new user account to the server.
function requestSignUp(event) {
    event.preventDefault(); // Stop the form from refreshing the page.

    // Access the form elements
    const form = event.target;
    const userNameString = form.username.value; 
    const displayNameString = form.displayname.value;
    const dataToSend = { username: userNameString, displayName: displayNameString,}

    // Send Post request for creating new user
    fetch('http://localhost:3000/makeNewUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
        // returns a promise, check for any errors
        .then(response => {
            if (response.ok)
                alert("Success"); 
            else
                alert("Fail");
        })
        .catch(error => {
            console.error('Error:', error);
        });
}