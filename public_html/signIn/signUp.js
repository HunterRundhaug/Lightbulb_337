



function requestSignUp(event){
    console.log("called requestSignUp");
    event.preventDefault(); // Stop the form from refreshing the page.

    // Access the form element
    const form = event.target;
    // Get the username value from the form elements
    const userNameString = form.username.value; // Access by the "name" attribute
    const displayNameString = form.displayname.value;

    const dataToSend = {
        username: userNameString,
        displayName: displayNameString,
    }

    fetch('http://localhost:3000/makeNewUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
    // returns a promise, check for any errors
    .then(response => {
        if(response.ok){
            alert("Success"); // might not work correctly???
        }
        else {
            alert("Fail");
        }
    })
    .catch(error => {
        // Handle errors from the fetch call
        console.error('Error:', error);
    });

}