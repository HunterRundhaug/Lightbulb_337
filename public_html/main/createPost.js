/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: createPost.js
    Purpose: createPost.js creates a new post for the user. It is reference from createPost.html.
        Using fetch POST requests.
*/

// function for creating a new post.
async function createAndSendPost(event) {
    event.preventDefault();     // Stop the form from refreshing the page

    // Grabs event target and text inside of form textarea
    const formObj = event.target;
    const postOBj = formObj.querySelector('textArea');

    // Creates JSON out of post text content
    const dataToSend = { content: postOBj.value }

    // Attempts to send a POST request to make new post
    try {
        const response = await fetch('http://localhost:3000/makeNewPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend)
        });
        if (response.ok) {
            alert("New Post Successfully Created!");        // Generates a success message
            window.location.href = '/main/index.html';      // Redirects to main page
        } else {
            alert(`Error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}