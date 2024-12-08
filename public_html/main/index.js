


// Initalize Page for currently signed in user...
const currentUserElement = document.getElementById("currentUserName");


async function getCurrentlySignedInUser(){
    try{
        const response = await fetch('http://localhost:3000/getCurrentUser');
        if(response.ok){
            const user = await response.json();
            let displayName = user.dispName;
            currentUserElement.innerText = displayName;
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