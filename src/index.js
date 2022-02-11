import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { MoralisProvider } from "react-moralis";
import "./index.scss";
// import Home from "./pages/Home";
import { MoralisDappProvider } from "./providers/MoralisDappProvider/MoralisDappProvider";

const APP_ID = process.env.REACT_APP_MORALIS_APPLICATION_ID || null;
const SERVER_URL = process.env.REACT_APP_MORALIS_SERVER_URL || null;

const Application = () => {
  if (APP_ID && SERVER_URL)
    return (
      <MoralisProvider appId={APP_ID} serverUrl={SERVER_URL}>
        <MoralisDappProvider>
          <App />
        </MoralisDappProvider>
      </MoralisProvider>
    );
  else {
    return (
      <div className="perfect_center">
        <p style={{ color: "white", textAlign: "center" }}>Get your free Moralis Account.</p>
        <a href="https://moralis.io/" target="_blank" rel="noreferrer" style={{ color: "white", textAlign: "center", display: "block", textDecoration: "underline" }}>Click here</a>
      </div>
    );
  }
};

/** Get your free Moralis Account https://moralis.io/ */
ReactDOM.render(
  <React.StrictMode>
    <Application />
  </React.StrictMode>,
  document.getElementById("root")
);