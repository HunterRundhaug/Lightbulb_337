




const postSectionObj = document.getElementById("postWrapperDiv");

window.onload = loadProfilePosts;

async function loadProfilePosts() {

    // collect the params from the url
    const urlParams = new URLSearchParams(window.location.search);
    const userQuery = urlParams.get('q');
    
     // Send request for search
     const response = await fetch(`http://localhost:3000/getUserPosts/${userQuery}`, {
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
       newResultDiv.className = "resultDiv";
       newResultDiv.innerHTML = `
        <div class="singlePost"> 
            <p class="postTimeStampP"{>${dateTime}</p>
            <p class="postContent">${result.content}</p>
        </div>
       `
       postSectionObj.appendChild(newResultDiv);
   });
}