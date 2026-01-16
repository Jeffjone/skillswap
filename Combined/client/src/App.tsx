import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import TeamsPage from "@/pages/teams";
import Portal from "@/pages/portal";
import Dashboard from "@/components/dashboard";
import { TeamDashboard } from "@/components/team-dashboard";
import ProfilePage from "@/pages/profile";
import SessionsPage from "@/pages/sessions";
import BrowsePage from "@/pages/browse";
import AdminPage from "@/pages/admin";
import MessagingPage from "@/pages/messaging";
import SignupFlowPage from "@/pages/signup-flow";

function App() {
    console.log("App component rendering");
    return (
        <Routes>
            <Route element={<IndexPage />} path="/" />
            <Route element={<DocsPage />} path="/docs" />
            <Route element={<BlogPage />} path="/blog" />
            <Route element={<AboutPage />} path="/about" />
            <Route element={<TeamsPage />} path="/teams" />
            <Route element={<Portal />} path="/portal" />
            <Route element={<SignupFlowPage />} path="/signup-flow" />
            <Route element={<Dashboard />} path="/dashboard" />
            <Route 
                element={
                    <TeamDashboard 
                        teamCode={new URLSearchParams(window.location.search).get("code") || ""} 
                        onBack={() => window.history.back()} 
                    />
                } 
                path="/team" 
            />
            <Route element={<ProfilePage />} path="/profile" />
            <Route element={<SessionsPage />} path="/sessions" />
            <Route element={<BrowsePage />} path="/browse" />
            <Route element={<AdminPage />} path="/admin" />
            <Route element={<MessagingPage />} path="/messaging" />
        </Routes>
    );
}

export default App;
