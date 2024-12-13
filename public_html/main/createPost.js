
/*
    Authors: Hunter Rundhaug & Theodore Reyes.
    File: createPost.js
    Purpose: createPost.js creates a new post for the user. It is reference from createPost.html.
        Using fetch POST requests.
*/

// function for creating a new post.
async function createAndSendPost(event) {

    event.preventDefault();

    const formObj = event.target;
    const postOBj = formObj.querySelector('textArea');

    const dataToSend = {
        content: postOBj.value,
    }

    try { // try send a POST request to make a new post.
        const response = await fetch('http://localhost:3000/makeNewPost', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });

        if (response.ok) {
            alert("New Post Successfully Created!");
            window.location.href = '/main/index.html';
        } else {
            alert(`Error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}