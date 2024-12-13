

/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: index.js
    Purpose: fetches info for the client to display who their signed in as.
        Meant to be the initialization of the main page for index.html.
        Responsible for generating the following section html.
*/




const currentUserElement = document.getElementById("currentUserName");
let currentUserFollowList;

// Initalize Page for currently signed in user...
async function getCurrentlySignedInUser() {
    try {

        const response = await fetch('http://localhost:3000/getCurrentUser');

        if (response.ok) {
            const user = await response.json(); // collect response
            let displayName = user.dispName;
            currentUserFollowList = user.followList;
            currentUserElement.innerText = displayName;

            // if we are at the main page, populate the sidebar...
            if (window.location.pathname === "/main/" || 
                window.location.pathname === "/main/index.html") {
                populateFollowingSidebar(currentUserFollowList);
            }
        }
        else {
            console.log('It seems the user is not authenticated.');
        }
    }
    catch (error) {
        console.error('Error fetching current user clientSide: ', error);
    }
}

// Generates HTML for the sidebar.
async function populateFollowingSidebar(followList) {

    // Gets sidebar HTML from index page
    const sideBar = document.getElementById("followingSection");

    // Iterates through the users followList
    followList.forEach(followedUser => {
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
