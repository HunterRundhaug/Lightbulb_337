/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: loginScript.js
    Purpose: send request to server to login a user. If the login is 
        successful the user will be directed to the main page.
*/

// sends login request.
function sendLoginRequest(event) {
    event.preventDefault();     // Avoids refreshing page

    // Access the form element info
    const form = event.target;
    const userNameString = form.username.value;
    const dataToSend = { username: userNameString };

    // Send post request with fetch to login...
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
        .then(response => {
            if (response.ok) {
                if (response.redirected)
                    window.location.href = response.url; // Redirects the client to the new page
            }
            // Show alert if username is not found
            else if (response.status === 404) {
                alert("Username not found.");
            } else
                console.error("Unexpected error: ", response.statusText);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}