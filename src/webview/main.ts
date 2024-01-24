import {
  provideVSCodeDesignSystem,
  Button,
  Dropdown,
  ProgressRing,
  TextField,
  vsCodeButton,
  vsCodeDropdown,
  vsCodeOption,
  vsCodeTextField,
  vsCodeProgressRing,
} from "@vscode/webview-ui-toolkit";

// In order to use the Webview UI Toolkit web components they
// must be registered with the browser (i.e. webview) using the
// syntax below.
provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeDropdown(),
  vsCodeOption(),
  vsCodeProgressRing(),
  vsCodeTextField()
);

// Get access to the VS Code API from within the webview context
const vscode = acquireVsCodeApi();

// Just like a regular webpage we need to wait for the webview
// DOM to load before we can reference any of the HTML elements
// or toolkit components
window.addEventListener("load", main);

// Main function that gets executed once the webview DOM loads
function main() {
  // To get improved type annotations/IntelliSense the associated class for
  // a given toolkit component can be imported and used to type cast a reference
  // to the element (i.e. the `as Button` syntax)
  const testButton = document.getElementById("test-button") as Button;
  testButton.addEventListener("click", postTestMessage);

  setVSCodeMessageListener();
}

function postTestMessage() {
  // Passes a message back to the extension context with the location that
  // should be searched for and the degree unit (F or C) that should be returned
  vscode.postMessage({
    command: "test",
    text: "yowza"
  });

  displayLoadingState();
}

// Sets up an event listener to listen for messages passed from the extension context
// and executes code based on the message that is recieved
function setVSCodeMessageListener() {
  window.addEventListener("message", (event) => {
    const command = event.data.command;

    switch (command) {
      case "test":
        const text = event.data.payload;
        displayMessage(text);
        break;
      case "error":
        displayError(event.data.message);
        break;
    }
  });
}

function displayLoadingState() {
  const loading = document.getElementById("loading") as ProgressRing;
  const icon = document.getElementById("icon");
  const summary = document.getElementById("summary");
  if (loading && icon && summary) {
    loading.classList.remove("hidden");
    icon.classList.add("hidden");
    summary.textContent = "Getting weather...";
  }
}

function displayMessage(text: string) {
  const messageElm = document.getElementById("message-text");
  if (messageElm) {
    messageElm.textContent = text;
  }
}

function displayError(errorMsg: string) {
  const messageElm = document.getElementById("message-text");
  if (messageElm) {
    messageElm.textContent = `<strong>Error:</strong> ${errorMsg}`;
  }
}


