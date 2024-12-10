


function sendLoginRequest(event){

    event.preventDefault(); // Stop the form from refreshing the page.

    // Access the form element
    const form = event.target;
    // Get the username value from the form elements
    const userNameString = form.username.value; // Access by the "name" attribute

    const dataToSend = {username: userNameString};

    // Send post request with fetch...
    fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
    // returns a promise, check for any errors
    .then(response => {
        if(response.ok){
            if (response.redirected) {
                // Redirect the client to the new page
                window.location.href = response.url;
            }
        }
        else if (response.status === 404) {
            // Show alert if username is not found
            alert("Username not found.");
        } else {
            console.error("Unexpected error: ", response.statusText);
        }
    })
    .catch(error => {
        // Handle errors from the fetch call
        console.error('Error:', error);
    });

    
}