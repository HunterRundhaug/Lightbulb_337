
/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: signOut.js
    Purpose: functionality for signing a user out. Redirects to route
        specified by server response.
*/

// sends request to sign out the current user.
function signOutUser() {

    // send POST fetch request
    fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        // returns a promise, check for any errors
        .then(response => {
            if (response.ok) {
                if (response.redirected) {
                    window.location.href = response.url;
                }
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