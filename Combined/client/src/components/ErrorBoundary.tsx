import React from "react";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Error caught by boundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
                    <h1>Something went wrong</h1>
                    <p>{this.state.error?.message}</p>
                    <button onClick={() => window.location.reload()}>Reload Page</button>
                    <pre style={{ marginTop: "20px", padding: "10px", background: "#f0f0f0", overflow: "auto" }}>
                        {this.state.error?.stack}
                    </pre>
                </div>
            );
        }

        return this.props.children;
    }
}