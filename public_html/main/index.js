// Initalize Page for currently signed in user...
const currentUserElement = document.getElementById("currentUserName");
let currentUserFollowList;

async function getCurrentlySignedInUser(){
    try{
        const response = await fetch('http://localhost:3000/getCurrentUser');
        if(response.ok){
            const user = await response.json();
            let displayName = user.dispName;
            currentUserFollowList = user.followList;
            currentUserElement.innerText = displayName;
            populateFollowingSidebar(currentUserFollowList);
        }
        else{
            console.log('It seems the user is not authenticated.');
        }
    }
    catch(error){
        console.error('Error fetching current user clientSide: ', error);
    }
}

async function populateFollowingSidebar(followList) {

    // Gets sidebar HTML from index page
    const sideBar = document.getElementById("followingSection");

    // Iterates through the users followList
    followList.forEach( followedUser => {
        const followedUserDiv = document.createElement("div");
        followedUserDiv.className = "userInFollowingSection";
        followedUserDiv.innerHTML = `
        <button type="button" onclick="goToProfile('${followedUser}')">${followedUser}</button>
        `
        sideBar.appendChild(followedUserDiv);
    });
}

// Call the function when the page loads
window.onload = getCurrentlySignedInUser;
// TODO: Call sidebar load
// TODO: Call(s) to load main feed