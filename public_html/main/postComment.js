
console.log("hello");

async function postNewComment(event, postId){
    event.preventDefault();
    const form = event.target;
    const postContent = form.querySelector("textarea").value;

    await fetch('http://localhost:3000/createComment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            postId: postId,
            postContent: postContent,
        }),
    })
    // returns a promise, check for any errors
    .then(response => {
        if(response.ok){
            window.location.reload();
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




