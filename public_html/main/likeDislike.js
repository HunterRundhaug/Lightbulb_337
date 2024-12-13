/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: likeDislike.js
    Purpose: responsible for sending post requests to server when a like/dislike button is
        clicked. This file is referenced anywhere where there might be a post, and therfore 
        like/dislike buttons.
*/

// makes POST request to like a post
async function likePost(postID, uniqueButtonId) {
    console.log("liked " + postID);

    const label = document.getElementById(uniqueButtonId);

    const response = await fetch('http://localhost:3000/like', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: postID }),
    });

    if (response.ok) {
        label.innerText = await response.json();
    }
    else {
        alert(response.status);
    }
}


// makes POST request to dislike a post
async function dislikePost(postID, uniqueButtonId) {
    console.log("disliked " + postID);

    const label = document.getElementById(uniqueButtonId);

    const response = await fetch('http://localhost:3000/dislike', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: postID }),
    })

    if (response.ok) {
        label.innerText = await response.json();
    }
    else {
        alert(response.status);
    }
}