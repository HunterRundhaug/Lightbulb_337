/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: loadProfilePosts.js
    Purpose: Meant to generate html on a the profile page depending on the profile visited.
        It send the request for this info to the server, and then generates the HTML.
*/


const postSectionObj = document.getElementById("postWrapperDiv");

// call loadProfilePosts when the page loads...
window.addEventListener('load', loadProfilePosts);

// sends GET request to get the posts from a specified user, then generates HTML for it.
async function loadProfilePosts() {
    
    // collect the params from the url
    const urlParams = new URLSearchParams(window.location.search);
    const userQuery = urlParams.get('q');
    // Send fetch...
    const response = await fetch(`http://localhost:3000/getUserPosts/${userQuery}`, {
        method: 'GET',
    })
        if (response.ok) {
        // Parse the response
        const results = await response.json();
        // Generate and append HTML to display results
        generateHTML(results);
    } else {
        // Handle HTTP error status codes
        console.error(`Error: ${response.status}`);
        alert(`Error: ${response.status}`);
    }
}


// Generate the HTML for a profiles posts
function generateHTML(results) {
    // Iterate through results, and generate html.
    results.forEach(result => {
        // process time data
        const timeStamp = result.timestamp;
        const dateTime = timeStamp.split('.')[0].replace('T', ' ');
        // generate HTML
        const newResultDiv = document.createElement("div");
        newResultDiv.className = "resultDiv";
        newResultDiv.innerHTML = `
        <div class="singlePost">
            <p class="postTimeStampP"{>${dateTime}</p>
            <p class="postContent">${result.content}</p>
            <div>
            <label id="likeBtn${result.postId}">${result.likes}</label>
            <button onclick="likePost('${result.postId}', 'likeBtn${result.postId}')" 
                type="checkbox" class="likeDislikeBtn"> <img class="likeDislikeImg" 
                src="./images/like.png" /></button>
            <label id="dislikeBtn${result.postId}">${result.dislikes}</label>
            <button onclick="dislikePost('${result.postId}', 'dislikeBtn${result.postId}')" 
                type="checkbox" class="likeDislikeBtn"> <img class="likeDislikeImg" 
                src="./images/dislike.png" /> </button>
            <button class="commentSectionButton" 
                onclick="goToCommentPage('${result.postId}')">See comment section</button>
            </div>
        </div>`
        postSectionObj.appendChild(newResultDiv);
    });
}