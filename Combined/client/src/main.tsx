import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { Provider } from "./provider.tsx";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "@/styles/globals.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
    document.body.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif;">
            <h1>Error: Root element not found</h1>
            <p>Could not find element with id="root"</p>
        </div>
    `;
    throw new Error("Root element not found");
}

console.log("Initializing app...");
console.log("Root element found:", rootElement);

// Clear any existing content
rootElement.innerHTML = "";

try {
    const root = ReactDOM.createRoot(rootElement);
    
    console.log("Creating root element...");
    
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <BrowserRouter basename="/skillswap">
                    <Provider>
                        <App />
                    </Provider>
                </BrowserRouter>
            </ErrorBoundary>
        </React.StrictMode>
    );
    
    console.log("App rendered successfully");
    
    // Check after a short delay if React actually rendered
    setTimeout(() => {
        if (rootElement.innerHTML.trim() === "") {
            console.error("React did not render - root element is still empty");
            rootElement.innerHTML = `
                <div style="padding: 20px; font-family: sans-serif;">
                    <h1 style="color: red;">React did not render</h1>
                    <p>Check the browser console for errors.</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; cursor: pointer;">Reload Page</button>
                </div>
            `;
        }
    }, 2000);
    
} catch (error) {
    console.error("Failed to render app:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "";
    
    rootElement.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif; max-width: 800px; margin: 50px auto;">
            <h1 style="color: red;">Failed to load application</h1>
            <p><strong>Error:</strong> ${errorMsg}</p>
            <pre style="background: #f0f0f0; padding: 10px; overflow: auto; margin: 20px 0; white-space: pre-wrap;">${errorStack}</pre>
            <button onclick="window.location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">Reload Page</button>
        </div>
    `;
}
