

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
function initiateSearch(){
    // collect the params from the url
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');

    // let them know what they searced for.
    const whatSearched = document.getElementById("whatWasSearched");
    whatSearched.innerText = searchQuery;
}