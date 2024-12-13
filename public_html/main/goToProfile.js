/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: gotToProfile
    Purpose: allows interactivity for clicking on usernames to direct clients to
        the page of the user that they clicked on. It then generates the HTML on the profile
        page after the client is re-routed.
*/

// collect DOM objects needed
const postWrapper = document.getElementById("postWrapperDiv");
const usernameOb = document.getElementById("usernameText");
const displayNameOb = document.getElementById("displayNameText");
const statusOb = document.getElementById("statusText");
const bioOb = document.getElementById("bioText");

// Redirects client to search page with input search...
function goToProfile(userName) {
    window.location.href = `/main/profilePage.html?q=${encodeURIComponent(userName)}`;
}

// if we are located at the search page, call the initiateProfileFetch function
if (window.location.pathname === '/main/profilePage.html') {
    initiateProfileFetch();
}

// Send search request and process the response...
async function initiateProfileFetch() {
    
    // Collects the params from the url & lets them know what they searched for
    const urlParams = new URLSearchParams(window.location.search);
    const userQuery = urlParams.get('q');
    const titleObj = document.getElementById("currentProfileTitle");
    titleObj.innerText = userQuery;

    // Send request for target users info
    const response = await fetch(`http://localhost:3000/getRequestedUsersInfo/${userQuery}`, {
        method: 'GET'
    })
        .then(async response => {     // Updates the profile page with the user data
            if (response.ok) {
                const user = await response.json();
                usernameOb.innerText = user.userName
                displayNameOb.innerText = user.dispName;
                statusOb.innerText = user.status;
                bioOb.innerText = user.bio;
                const infoDiv = document.getElementById("infoDiv");
                let buttonTxt = user.isFollowing ? "unfollow" : "follow";
                infoDiv.insertAdjacentHTML('beforeend', `
                    <div id="followBtnDiv">
                        <form id="followForm" onsubmit="postFollowRequest(event, '${user.userName}', 
                        ${user.isMe}, ${user.isFollowing})">
                            <button id="followButton" type="submit">${buttonTxt}</button>
                        </form>
                    </div>
                `);
                if (user.isMe)
                    infoDiv.removeChild(document.getElementById("followBtnDiv"));
            }
            else
                alert(response.status);
        })
        .catch(error => {
            console.error('Error:', error);    // Handle errors from the fetch call
        });
}