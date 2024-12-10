

const searchResultArea = document.getElementById("searchResults");

// Redirects client to search page with input search...

// Subscribe event Listener to (submit) action on the form object.
document.getElementById("userSearchForm").addEventListener('submit', (event) => {
    event.preventDefault();
    const searchInput = document.getElementById("userSearchInput").value.trim();
    console.log("searchInput reached " + searchInput);
    if (searchInput) {
        /* switches to search page... Inputting the search query into the url
           so it can be captured on the search page to be processed. */
        window.location.href = `/main/search.html?q=${encodeURIComponent(searchInput)}`;
    }
});


// if we are located at the search page, call the initiateSearch function
if(window.location.pathname === '/main/search.html'){
    initiateSearch();
}

// Send search request and process the response...
async function initiateSearch(){
    // collect the params from the url
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    // let them know what they searced for.
    const whatSearched = document.getElementById("whatWasSearched");
    whatSearched.innerText = searchQuery;
    
    dataToSend = {
        query: searchQuery,
    }

    // Send request for search
    const response = await fetch('http://localhost:3000/searchForUsers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
    })
    // returns a promise, check for any errors
    .then(async response => {
        if(response.ok){
            // where we catch the response
            const results = await response.json();
            // Append new html to searchResults...

            // Iterate through results, and generate html.
            results.forEach( result => {
                const newResultDiv = document.createElement("div");
                newResultDiv.className = "resultDiv";
                const buttonName = result.isFollowing ? "unfollow" : "follow";
                newResultDiv.innerHTML = `
                <p id="userNameResult"> ${result.userName} </p>
                <p id="dispNameResult"> ${result.dispName} </p>
                <p id="statusResult"> ${result.status} </p>
                <button> ${buttonName} </button>
                `
                searchResultArea.appendChild(newResultDiv);
            });

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

