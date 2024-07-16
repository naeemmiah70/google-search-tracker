/*global chrome */
console.log(`contentScript.js loaded`);
let userQuery = "";

// remove checkedResults when the result page is loaded
localStorage.removeItem("checkedResults");

// Function to extract the search query from Google search page
const getQuery = () => {
  let searchQuery = "";
  const searchInputs = document.querySelectorAll('input[name="q"]'); // Select all search input fields
  // console.log("searchInputs", searchInputs);

  searchInputs.forEach((input) => {
    const query = input.value.trim();
    searchQuery = query;
  });
  return searchQuery;
};

//function to add color and checked input for already added result
const handlePrevioslyStoredQuery = (query) => {
  const contentObject = [];

  chrome.storage.local.get("searchResults", function (data) {
    let searchResults = data.searchResults || [];

    if (searchResults) {
      searchResults.forEach((item) => {
        if (item.query === query) {
          const results = document.querySelectorAll("div.g");
          results.forEach((result) => {
            const title = result.querySelector("h3");
            const input = result.querySelector("input");

            const contentData = {
              titles: title,
              inputs: input,
            };

            if (title && input) {
              contentObject.push(contentData);
            }
          });
          console.log("object", contentObject);
          const title = item.selectedResults.map((links) => links.title);

          contentObject.forEach((value) => {
            console.log("values", value);
            if (title.includes(value.titles.innerText)) {
              console.log("value", value);
              value.titles.style.backgroundColor = "#DFFF00";
              value.inputs.checked = true;
            }
          });
        } else {
          console.log("previosly not StoredThis Query", query);
        }
      });
    }
  });
};

// Function to store selected search results in the local storage from the google search results page
function getSelectedResults() {
  // getting search query
  const query = getQuery();

  console.log("queries", query);
  if (query) {
    userQuery = query;
    handlePrevioslyStoredQuery(query);
  }

  // Get all the search results
  const results = document.querySelectorAll("div.g");

  results.forEach((result, index) => {
    const link = result.querySelector("a");
    const title = result.querySelector("h3");

    if (link && title) {
      // Create checkbox for selecting link
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `checkbox-${index}`;
      checkbox.style.marginRight = "10px";

      // Insert checkbox before the title in the search result page
      title.parentElement.insertBefore(checkbox, title);

      // Save the selected results in the local storage when the check box is checked/unchecked
      checkbox.addEventListener("change", (event) => {
        const selectedResults =
          JSON.parse(localStorage.getItem("checkedResults")) || [];

        if (event.target.checked) {
          selectedResults.push({ title: title.innerText, link: link.href });
          // highlighting the selected link titile
          title.style.backgroundColor = "#DFFF00";
        } else {
          title.style.backgroundColor = "transparent";
          const indexToRemove = selectedResults.findIndex(
            (item) => item.link === link.href
          );
          if (indexToRemove > -1) {
            selectedResults.splice(indexToRemove, 1);
          }
        }

        localStorage.setItem("checkedResults", JSON.stringify(selectedResults));

        //ceating objeject with query and selected result for storing the checked result
        if (query && selectedResults) {
          const resultsData = {
            query: query,
            selectedResults: selectedResults,
          };

          //function to storing data to chrome local storage
          storeSearchResults(resultsData);
        }
      });
    }
  });

  return results;
}

function storeSearchResults(resultsData) {
  // console.log("resultsData", resultsData);

  chrome.storage.local.get("searchResults", function (data) {
    let searchResults = data.searchResults || [];

    const previoslyStoredThisQuery = searchResults.find(
      (item) => item.query === resultsData.query
    );
    console.log("previoslyStoredThisQuery", previoslyStoredThisQuery);
    //if the query data previosly stored then update the selected result otherwise add a new search result with selected link
    if (previoslyStoredThisQuery) {
      searchResults.find((item, index) => {
        console.log("forEach", item);
        if (item.query === resultsData.query) {
          searchResults[index].selectedResults = resultsData.selectedResults;
          chrome.storage.local.set({ searchResults: searchResults });
        }
      });
    } else {
      searchResults.unshift(resultsData);
      chrome.storage.local.set({ searchResults: searchResults });
    }
    console.log("stored data", searchResults);

    //data sending to background for just practicing
    try {
      chrome?.runtime?.sendMessage(
        {
          type: "selectedResults",
          data: searchResults,
        },
        (response) => {
          console.log(response);
          if (chrome.runtime.lastError) {
            // console.log("response", response);
          }
        }
      );
    } catch (error) {
      console.log(
        "error ocure while sending data to the contentScript to background"
      );
    }

    try {
      chrome?.runtime?.sendMessage(
        {
          type: "resultsStored",
          data: true,
        },
        (response) => {
          // console.log(response);
          if (chrome.runtime.lastError) {
            // console.log("response", response);
          }
        }
      );
    } catch (error) {
      console.log(
        "error ocure while sending data storing response to the app.js "
      );
    }
  });
}

const domContentLoaded = () => {
  getSelectedResults();
};
// calling function when the google reasult page content is loaded
domContentLoaded();

// reloading the page for removing the checked input and highlighted links
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("recieving message from app.js status", request.status);
  if (request.status) {
    window.location.reload();
  }
});

// Listen for messages from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log("recieving message from background.js", request.results);
  sendResponse({ reply: "recieved message from contentScript" });
});
