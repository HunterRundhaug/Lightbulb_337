


const mainFeedDomObj = document.getElementById("contentSection");

async function getMainFeed(){

     // Send request for getting main feed
     const response = await fetch(`http://localhost:3000/getFeed`, {
        method: 'GET',
    })
    // returns a promise, check for any errors
    .then(async response => {
        if(response.ok){
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

function generateHTML(results){
    // Iterate through results, and generate html.
    results.forEach( result => {
    const timeStamp = result.timestamp;
    const dateTime = timeStamp.split('.')[0].replace('T', ' ');
    const newResultDiv = document.createElement("div");
    newResultDiv.className = "postInContentSection";
        newResultDiv.innerHTML = `
            <p class="userNameInPost">${result.username}</p>
            <p class="contentInPost">${result.content}</p>
            <div class="likeDislikeBox">
                <button type="checkbox" class="likeDislikeBtn"> <img class="likeDislikeImg" src="./images/like.png" /></button>
                <button type="checkbox" class="likeDislikeBtn"> <img class="likeDislikeImg" src="./images/dislike.png" /> </button>
            </div>
        `
        mainFeedDomObj.appendChild(newResultDiv);
    });
}



window.addEventListener('load', getMainFeed);
