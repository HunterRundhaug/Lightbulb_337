
/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: commentPage.js
    Purpose: commentPage is responsible for dynamically loading most of the HTML onto
    a comment page. It makes fetch requests to get the data its needs to generate this HTML.
*/

// if we are on the comments page call to generate comment HTML.
if (window.location.pathname === '/main/commentPage.html') {
    initiateCommentFetch();
}

function goToCommentPage(postID) {
    console.log(postID);
    window.location.href = `/main/commentPage.html?q=${encodeURIComponent(postID)}`;
}

// Requests info for comment page setup
async function initiateCommentFetch() {
    // collect the params from the url
    const urlParams = new URLSearchParams(window.location.search);
    const paramPostID = urlParams.get('q');

    console.log(paramPostID);

    // Helper method call to grab info for post
    const post = await getPost(paramPostID);

    // Helper method call to grab comments associated with post
    const commentArray = await getComments(paramPostID);

    generatePostHTML(post);
    generateNewCommentSection(post);
    generateExistingComments(commentArray);
}


// Helper function to generate comments HTML
function generateExistingComments(commentArray) {
    const commentSectionDiv = document.getElementById("existingCommentsSection");
    // Iterate through results, and generate html.
    if (commentArray.length == 0) {
        console.log(commentArray);
        commentSectionDiv.innerHTML = "<p> no comments </p>";
    }
    else {
        console.log(commentArray);
        commentArray.forEach(comment => {
            const timeStamp = comment.timestamp;
            const dateTime = timeStamp.split('.')[0].replace('T', ' ');
            const newResultDiv = document.createElement("div");
            newResultDiv.className = "singleComment";
            newResultDiv.innerHTML = `
                <button class="commentAuthorButton" 
                onclick="goToProfile('${comment.associatedUser}')"> ${comment.associatedUser} 
                commented</button>
                <p id="postTimeStamp">${dateTime}</p>
                <p class="commentContents">${comment.content}</p>
            `
            commentSectionDiv.appendChild(newResultDiv);
        });
    }

}

// helper function to generate the section to make new posts.
function generateNewCommentSection(post) {
    const newCommentDivContainer = document.getElementById("makeNewCommentSection");
    const newCommentDiv = document.createElement('div');

    newCommentDiv.innerHTML = `
        <form onsubmit="postNewComment(event, '${post.postId}')">
            <div>
                <textarea id="newCommentTextArea" cols="60" rows="5"> </textarea>
            </div>
            <div id="postCommentButton">
                <button type="submit">post comment</button>
            </div>
        </form>
    `;

    newCommentDivContainer.appendChild(newCommentDiv);
}

// helper function to generate the post.
function generatePostHTML(post) {
    const postSectionDiv = document.getElementById("postSection");

    const timeStamp = post.timestamp;
    const dateTime = timeStamp.split('.')[0].replace('T', ' ');
    const newResultDiv = document.createElement("div");
    newResultDiv.className = "postInContentSection";
    newResultDiv.innerHTML = `
            <button onclick="goToProfile('${post.username}')" 
            class="userNameInPost">${post.username} Posted</button>
            <p class="postTimeStampP">${dateTime}</p>
            <p class="contentInPost">${post.content}</p>
            <div class="likeDislikeBox">
                <label id="likeBtn${post.postId}">${post.likes}</label>
                <button onclick="likePost('${post.postId}', 'likeBtn${post.postId}')" 
                type="checkbox" class="likeDislikeBtn"> <img class="likeDislikeImg" 
                src="./images/like.png" /></button>
                <label id="dislikeBtn${post.postId}" >${post.dislikes}</label>
                <button onclick="dislikePost('${post.postId}', 'dislikeBtn${post.postId}')" 
                type="checkbox" class="likeDislikeBtn"> <img class="likeDislikeImg" 
                src="./images/dislike.png" /> </button>
            </div>
        `
    postSectionDiv.appendChild(newResultDiv);
}

// Helper method for getting post info
async function getPost(paramPostID) {
    const response = await fetch(`http://localhost:3000/getUserPostByID/${paramPostID}`, {
        method: 'GET'
    });
    if (response.ok) {
        const post = await response.json();
        return post;
    }
    else {
        alert(response.status);
    }
}

// Helper method for getting comments associated with post ID
async function getComments(paramPostID) {
    const response = 
    await fetch(`http://localhost:3000/getCommentsAssociatedWithPostID/${paramPostID}`, {
        method: 'GET'
    });
    if (response.ok) {
        const commentArray = await response.json();
        return commentArray;
    }
    else {
        alert(response.status);
    }
}