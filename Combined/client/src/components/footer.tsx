import { Link as RouterLink } from "react-router-dom";
import { useTheme } from "next-themes";

export const Footer = () => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <footer
            style={{
                width: "100%",
                padding: "40px 20px",
                marginTop: "100px",
                marginBottom: "50px",
                backgroundColor: isDark ? "#000000" : "#ffffff",
                textAlign: "left",
                fontSize: "14px",
                color: isDark ? "#ffffff" : "#000000",
                borderTop: `1px solid ${isDark ? "#333333" : "#eaeaea"}`,
            }}
        >
            <div
                style={{
                    marginBottom: "12px",
                    fontWeight: "bold",
                    fontSize: "24px",
                    background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                SkillSwap © {new Date().getFullYear()}
            </div>
            <div style={{ marginBottom: "8px" }}>
                <RouterLink 
                    to="/browse" 
                    style={{ 
                        marginRight: "16px", 
                        color: isDark ? "#bbbbbb" : "#666666",
                        textDecoration: "none",
                        transition: "color 0.2s ease"
                    }}
                >
                    Browse
                </RouterLink>
                <RouterLink 
                    to="/sessions" 
                    style={{ 
                        marginRight: "16px", 
                        color: isDark ? "#bbbbbb" : "#666666",
                        textDecoration: "none",
                        transition: "color 0.2s ease"
                    }}
                >
                    Sessions
                </RouterLink>
                <RouterLink 
                    to="/dashboard" 
                    style={{ 
                        marginRight: "16px", 
                        color: isDark ? "#bbbbbb" : "#666666",
                        textDecoration: "none",
                        transition: "color 0.2s ease"
                    }}
                >
                    Dashboard
                </RouterLink>
                <RouterLink 
                    to="/profile" 
                    style={{ 
                        marginRight: "16px", 
                        color: isDark ? "#bbbbbb" : "#666666",
                        textDecoration: "none",
                        transition: "color 0.2s ease"
                    }}
                >
                    Profile
                </RouterLink>
                <RouterLink 
                    to="/messaging" 
                    style={{ 
                        marginRight: "16px", 
                        color: isDark ? "#bbbbbb" : "#666666",
                        textDecoration: "none",
                        transition: "color 0.2s ease"
                    }}
                >
                    Messaging
                </RouterLink>
                <RouterLink 
                    to="/about" 
                    style={{ 
                        marginRight: "16px", 
                        color: isDark ? "#bbbbbb" : "#666666",
                        textDecoration: "none",
                        transition: "color 0.2s ease"
                    }}
                >
                    Teams
                </RouterLink>
                <RouterLink 
                    to="/blog" 
                    style={{ 
                        color: isDark ? "#bbbbbb" : "#666666",
                        textDecoration: "none",
                        transition: "color 0.2s ease"
                    }}
                >
                    Blog
                </RouterLink>
            </div>
            <div style={{ color: isDark ? "#bbbbbb" : "#666666", marginBottom: "24px" }}>
                Made with 💜 to help students learn and grow together.
            </div>
            
            {/* Project Information Section */}
            <div
                style={{
                    marginTop: "32px",
                    paddingTop: "24px",
                    borderTop: `1px solid ${isDark ? "#333333" : "#eaeaea"}`,
                }}
            >
                <div
                    style={{
                        fontWeight: "600",
                        fontSize: "16px",
                        marginBottom: "16px",
                        color: isDark ? "#ffffff" : "#000000",
                    }}
                >
                    Project Information
                </div>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "12px 24px",
                        fontSize: "13px",
                        lineHeight: "1.6",
                        color: isDark ? "#bbbbbb" : "#666666",
                    }}
                >
                    <div>
                        <span style={{ fontWeight: "600", color: isDark ? "#dddddd" : "#444444", marginRight: "12px" }}>
                            Chapter:
                        </span>
                        Lebanon Trail High School Gold (02-1423) & Lebanon Trail High School Green (02-1424)
                    </div>
                    <div>
                        <span style={{ fontWeight: "600", color: isDark ? "#dddddd" : "#444444", marginRight: "8px" }}>
                            Team Members:
                        </span>
                        Saket Dannana, Royce Gipson, Jeffrey Josh Jone Rajarupan, Justin Kwok
                    </div>
                    <div>
                        <span style={{ fontWeight: "600", color: isDark ? "#dddddd" : "#444444", marginRight: "8px" }}>
                            Theme:
                        </span>
                        White/Black & Blue
                    </div>
                    <div>
                        <span style={{ fontWeight: "600", color: isDark ? "#dddddd" : "#444444", marginRight: "8px" }}>
                            School:
                        </span>
                        Lebanon Trail High School
                    </div>
                    <div>
                        <span style={{ fontWeight: "600", color: isDark ? "#dddddd" : "#444444", marginRight: "8px" }}>
                            City:
                        </span>
                        Frisco
                    </div>
                    <div>
                        <span style={{ fontWeight: "600", color: isDark ? "#dddddd" : "#444444", marginRight: "8px" }}>
                            State:
                        </span>
                        Texas
                    </div>
                    <div>
                        <span style={{ fontWeight: "600", color: isDark ? "#dddddd" : "#444444", marginRight: "8px" }}>
                            Year:
                        </span>
                        2026
                    </div>
                </div>
            </div>
        </footer>
    );
}; 