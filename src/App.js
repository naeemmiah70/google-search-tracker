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
      console.log("search results from app.js", data);
      setResults(data?.searchResults);
    });
  }, [resultUpdated]);

  // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //   if (message.type === "resultsStored") {
  //     setReseultUpdated((resultUpdated) => !resultUpdated);
  //   }
  // });
  console.log("status", resultUpdated);

  //function to remove all data
  const handleClearData = () => {
    chrome.storage.local.remove("searchResults", function () {
      console.log("cleared chrome local storage data ");
      setReseultUpdated((resultUpdated) => !resultUpdated);
    });
  };
  console.log("searchResults from app", results);

  // function to remove the query
  const handleRemoveQuery = (index) => {
    console.log("remove index", index);

    if (index > -1 && index < results.length) {
      results.splice(index, 1);
    }
    console.log("updated results", results);
    hamdleUpdateResultStorage(results);
  };

  //function to update the storage after remove specific data
  const hamdleUpdateResultStorage = (results) => {
    chrome.storage.local.set({ searchResults: results });
    setReseultUpdated((resultUpdated) => !resultUpdated);
  };
  return (
    <section id="extension-body">
      <div className="extension-header">
        <h2>Search Tracker</h2>
        <hr />
        <h3>Yours last five queries with top five results:</h3>
      </div>
      {results.length ? (
        <div className="content-body">
          {results?.map((item, index) => (
            <div className="query-card">
              <div style={{ display: "flex", gap: "7px" }}>
                <h5>
                  <span>{index + 1}.</span> {item?.query}.
                </h5>
                <button
                  id="remove-btn"
                  onClick={() => handleRemoveQuery(index)}
                >
                  {" "}
                  <img src={deleteIcon} alt="" />
                </button>
              </div>
              <div>
                {show && cardNo === index && (
                  <div>
                    {item?.selectedResults?.map((data, index) => (
                      <div className="results-card">
                        <a href={data.link} target="_blank">
                          {data.title}
                        </a>
                        <button>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    setCardNo(index);
                    setShow((show) => !show);
                  }}
                  id="show-result-btn"
                >
                  {cardNo === index && show ? "Hide" : "See"} the results...
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
