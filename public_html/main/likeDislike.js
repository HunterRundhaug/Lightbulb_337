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
    // returns a promise, check for any errors
    if (response.ok) {
        label.innerText = await response.json();
    }
    else {
        alert(response.status);
    }
}

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
    // returns a promise, check for any errors

    if (response.ok) {
        label.innerText = await response.json();
    }
    else {
        alert(response.status);
    }
}