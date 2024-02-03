import {
    CancellationToken,
    Uri,
    Webview,
    WebviewView,
    WebviewViewProvider,
    WebviewViewResolveContext,
} from "vscode";
import { getUri } from "../utilities/getUri";
import { getNonce } from "../utilities/getNonce";

export class PendSidebarProvider implements WebviewViewProvider {
    public static readonly viewType = "pend.sidebar";

    constructor(private readonly _extensionUri: Uri) { }

    public resolveWebviewView(
        webviewView: WebviewView,
        context: WebviewViewResolveContext,
        _token: CancellationToken
    ) {
        // Allow scripts in the webview
        webviewView.webview.options = {
            // Enable JavaScript in the webview
            enableScripts: true,
            // Restrict the webview to only load resources from the `out` directory
            localResourceRoots: [Uri.joinPath(this._extensionUri, "out")],
        };

        // Set the HTML content that will fill the webview view
        webviewView.webview.html = this._getWebviewContent(webviewView.webview, this._extensionUri);

        // Sets up an event listener to listen for messages passed from the webview view context
        // and executes code based on the message that is recieved
        this._setWebviewMessageListener(webviewView);
    }

    private _getWebviewContent(webview: Webview, extensionUri: Uri) {
        const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
        const stylesUri = getUri(webview, extensionUri, ["out", "styles.css"]);
        const nonce = getNonce();

        // Tip: Install the es6-string-html VS Code extension to enable code highlighting below
        return /*html*/ `
        <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <link rel="stylesheet" href="${stylesUri}">
                <title>Pend 4</title>
            </head>
            <body>
                <h1>Pend 5</h1>
                <section id="test-container">
                    <vscode-button id="test-button">Test Button</vscode-button>
                </section>
                <h2>Reply</h2>
                <section id="message-container">
                    <p id="message-text"></p>
                </section>
                <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
            </body>
        </html>
        `;
    }

    private _setWebviewMessageListener(webviewView: WebviewView) {
        webviewView.webview.onDidReceiveMessage((message) => {
            const command = message.command;
            const text = message.text;

            switch (command) {
                case "test":
                    webviewView.webview.postMessage({
                        command: "test",
                        payload: `well, ${text} to you too!`,
                        message: "ok"
                    });
                    break;
            }
        });
    }
}