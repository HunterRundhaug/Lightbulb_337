const postWrapper = document.getElementById("postWrapperDiv");

const usernameObj = document.getElementById("usernameText");
const displayNameObj = document.getElementById("displayNameText");
const statusObj = document.getElementById("statusText");
const bioObj = document.getElementById("bioText");

// Redirects client to search page with input search...
function goToProfile(userName){
    console.log(userName);
    window.location.href = `/main/profilePage.html?q=${encodeURIComponent(userName)}`;
}

// if we are located at the search page, call the initiateProfileFetch function
if(window.location.pathname === '/main/profilePage.html'){
    initiateProfileFetch();
}

// Send search request and process the response...
async function initiateProfileFetch(){
    // collect the params from the url
    const urlParams = new URLSearchParams(window.location.search);
    const userQuery = urlParams.get('q');
    // let them know what they searched for
    const titleObj = document.getElementById("currentProfileTitle");
    titleObj.innerText = userQuery;
    
    console.log(userQuery);
    // Send request for target users info
    const response = await fetch(`http://localhost:3000/getRequestedUsersInfo/${userQuery}`, {
        method: 'GET'
    })
    // returns a promise, check for any errors
    .then(async response => {
        if(response.ok){
            // Update the profile page with the user data...
            console.log("response to profile recieved");
            const user = await response.json();
            let userName = user.userName;
            let displayName = user.dispName;
            let status = user.status;
            let bio = user.bio;
            usernameObj.innerText = userName;
            displayNameObj.innerText = displayName;
            statusObj.innerText = status;
            bioObj.innerText = bio;

            const infoDiv = document.getElementById("infoDiv");

            const buttonTxt = user.isFollowing ? "unfollow" : "follow";

            infoDiv.insertAdjacentHTML('beforeend',`
                    <div id="followBtnDiv">
                        <form id="followForm" onsubmit="postFollowRequest(event, '${userName}', ${user.isMe}, ${user.isFollowing})">
                            <button id="followButton">${buttonTxt}</button>
                        </form>
                    </div>
                `)
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

