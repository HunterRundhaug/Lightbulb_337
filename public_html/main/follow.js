
/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: follow.js
    Purpose: follow.js allows the client
        to send follow/unfollow toggle requests to the server.
        i.e Client-side script for handling follow and unfollow requests
*/

// Main async method for toggling the following status for a user
async function postFollowRequest(event, userName, isMe, alreadyFollowing) {
    event.preventDefault();
    const formElement = event.target;
    const formButton = formElement.querySelector('button[type="submit"]');

    console.log()

    if (isMe) {   // Prevents following self
        return;
    }

    // Contains name of user the session user wishes to follow or unfollow
    dataToSend = {
        userToToggle: userName
    }

    // Sends request to server
    response = await fetch("http://localhost:3000/toggleFollowUser", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
    });

    if (formButton.innerHTML === "follow") {
        formButton.innerHTML = `${userName} followed!`;
        formButton.disabled = true;
    }
    else {
        formButton.innerHTML = `${userName} unfollowed`;
        formButton.disabled = true;
    }

}