

// Sign out script


function signOutUser(){

    fetch('http://localhost:3000/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    // returns a promise, check for any errors
    .then(response => {
        if(response.ok){
            if(response.redirected){
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