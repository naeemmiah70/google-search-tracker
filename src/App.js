/*global chrome */
import React, { useEffect, useState } from "react";
import "./App.css";
import deleteIcon from "./assets/delete.png";

function App() {
  const [results, setResults] = useState([]);
  const [resultUpdated, setReseultUpdated] = useState(false);
  const [show, setShow] = useState(false);
  const [cardNo, setCardNo] = useState();

  useEffect(() => {
    chrome.storage.local.get("searchResults", function (data) {
      // console.log("search results from app.js", data);
      setResults(data?.searchResults);
    });
  }, [resultUpdated]);


  //function to remove all data
  const handleClearData = () => {
    chrome.storage.local.remove("searchResults", function () {
      console.log("cleared chrome local storage data ");
      setReseultUpdated((resultUpdated) => !resultUpdated);
      handleDeletedStatus();
    });
  };
  // console.log("searchResults from app", results);

  // function to remove the query
  const handleRemoveQuery = (index) => {
    if (index > -1 && index < results?.length) {
      results?.splice(index, 1);
    }
    // console.log("updated results", results);
    handleUpdateResultStorage(results);
  };

  // function to remove the query results links
  const handleRemoveLink = (outerIndex, nestedIndex) => {
    console.log("link index", outerIndex, nestedIndex);

    if (outerIndex > -1 && outerIndex < results?.length) {
      let nestedArray = results[outerIndex]?.selectedResults;
      // console.log("nestedarray", nestedArray)
      if (nestedArray && nestedIndex > -1 && nestedIndex < nestedArray.length) {
        nestedArray.splice(nestedIndex, 1);
      }
    }
    // console.log("updatedLink", results);
    handleUpdateResultStorage(results);
  };

  //function to update the storage after remove specific data
  const handleUpdateResultStorage = (results) => {
    chrome.storage.local.set({ searchResults: results });
    setReseultUpdated((resultUpdated) => !resultUpdated);
  };

  const handleDeletedStatus = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { status: true },
        (response) => {
          console.log(response.reply);
        }
      );
    });
  };

  return (
    <section id="extension-body">
      <div className="extension-header">
        <h2>Search Tracker</h2>
        <hr />
        <h3>Yours last five queries with top five results:</h3>
      </div>
      {results?.length ? (
        <div className="content-body">
          {results?.map((item, outerIndex) => (
            <div className="query-card">
              <div>
                <h5>
                  <span>{outerIndex + 1}.</span> {item?.query}.
                  <button
                    id="remove-btn"
                    onClick={() => handleRemoveQuery(outerIndex)}
                  >
                    {" "}
                    <img src={deleteIcon} alt="" />
                  </button>
                </h5>
              </div>
              <div>
                {show && cardNo === outerIndex && (
                  <div>
                    {item?.selectedResults?.map((data, nestedIndex) => (
                      <div className="results-card">
                        <a href={data.link} target="_blank">
                          {data.title}
                        </a>
                        <button
                          id="remove-btn"
                          onClick={() =>
                            handleRemoveLink(outerIndex, nestedIndex)
                          }
                        >
                          {" "}
                          <img src={deleteIcon} alt="" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    setCardNo(outerIndex);
                    setShow((show) => !show);
                  }}
                  id="show-result-btn"
                >
                  {cardNo === outerIndex && show ? "Hide" : "See"} the
                  results...
                </button>
              </div>
            </div>
          ))}
          <div id="reset-btn">
            <button onClick={handleClearData}>Reset Data</button>
          </div>
        </div>
      ) : (
        <div id="no-data-section">
          <h4>No data available!</h4>
        </div>
      )}
    </section>
  );
}

export default App;
