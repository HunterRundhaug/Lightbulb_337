// Client-side script for handling follow and unfollow requests

// Main async method for toggling the following status for a user
async function postFollowRequest(event, userName, isMe, alreadyFollowing){
    event.preventDefault(); 
    const formElement = event.target;
    const formButton = formElement.querySelector('button[type="submit"]');

    console.log()

    if(isMe) {   // Prevents following self
        return;
    }


    // Contains name of user the session user wishes to follow or unfollow
    dataToSend = {
        userToToggle: userName
    }

    // Sends request to server
    await fetch("http://localhost:3000/toggleFollowUser", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
    });

    window.location.reload();
}