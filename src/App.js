/*global chrome */
import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [results, setResults] = useState([]);
  const [resultUpdated, setReseultUpdated] = useState(false);

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

  const [show, setShow] = useState(false);
  const [cardNo, setCardNo] = useState();
  const handleClearData = () => {
    chrome.storage.local.remove("searchResults", function () {
      console.log("cleared chrome local storage data ");
      setReseultUpdated((resultUpdated) => !resultUpdated);
    });
  };
  console.log("searchResults from app", results);
  return (
    <section id="extension-body">
      <div className="extension-header">
        <h2>Search Tracker</h2>
        <hr />
        <h3>Yours last five queries with top five results:</h3>
      </div>
      {results ? (
        <div className="content-body">
          {results?.map((item, index) => (
            <div className="query-card">
              <h5>
                <span>{index + 1}.</span> {item?.query}.
              </h5>
              <div>
                {show && cardNo === index && (
                  <div>
                    {item?.selectedResults?.map((data) => (
                      <div className="results-card">
                        <a href={data.link} target="_blank">
                          {data.title}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => {
                    setCardNo(index);
                    setShow((show) => !show);
                  }}
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
