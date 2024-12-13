/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: commentPage.js
    Purpose: feed.js is what is responsible for fetching and generating the 
        feed content on the main page. It dynamically generates the posts of people
        that a user follows.
*/

// Grabs main feed div for later use in client-side JS
const mainFeedDomObj = document.getElementById("contentSection");

// Fetch request to get the main feed data
async function getMainFeed() {

    // Send request for getting main feed
    const response = await fetch(`http://localhost:3000/getFeed`, {
        method: 'GET',
    })
        // returns a promise, check for any errors
        .then(async response => {
            if (response.ok) {
                // where we catch the response
                const results = await response.json();
                // Append new html to searchResults...
                generateHTML(results);
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

// generate HTML for each post in the post section.
function generateHTML(results) {

    // Iterate through results, and generate html
    results.forEach(result => {
        const timeStamp = result.timestamp;
        const dateTime = timeStamp.split('.')[0].replace('T', ' ');
        const newResultDiv = document.createElement("div");
        newResultDiv.className = "postInContentSection";
        newResultDiv.innerHTML = `
            <button onclick="goToProfile('${result.username}')" 
            class="userNameInPost">${result.username}</button>
            <p class="contentInPost">${result.content}</p>
            <div class="likeDislikeBox">
                <label id="likeBtn${result.postId}">${result.likes}</label>
                <button onclick="likePost('${result.postId}', 'likeBtn${result.postId}')" 
                type="checkbox" class="likeDislikeBtn"> <img class="likeDislikeImg" 
                src="./images/like.png" /></button>
                <label id="dislikeBtn${result.postId}">${result.dislikes}</label>
                <button onclick="dislikePost('${result.postId}', 'dislikeBtn${result.postId}')" 
                type="checkbox" class="likeDislikeBtn"> <img 
                class="likeDislikeImg" src="./images/dislike.png" /> </button>
                <button class="commentSectionButton" 
                onclick="goToCommentPage('${result.postId}')">See comment section</button>
            </div>
        `
        // Appends generated HTML to main feed div (referenced at top of this file)
        mainFeedDomObj.appendChild(newResultDiv);
    });
}

// Adds event listener for window on load, and calls getMainFeed when occurs
window.addEventListener('load', getMainFeed);