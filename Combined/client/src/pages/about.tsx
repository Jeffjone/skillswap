import DefaultLayout from "@/layouts/default";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { IconUsers, IconUserPlus, IconCheck, IconArrowRight } from "@tabler/icons-react";

export default function AboutPage() {
    const { theme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark" || theme === "dark";

    return (
        <DefaultLayout>
            <div style={{ 
                padding: "40px 20px",
                color: isDark ? "#ffffff" : "#000000",
                maxWidth: "1200px",
                margin: "0 auto"
            }}>
                {/* Hero Section */}
                <section style={{ textAlign: "center", marginBottom: "60px", paddingTop: "40px" }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 style={{ 
                            fontSize: "48px", 
                            fontWeight: "bold",
                            marginBottom: "20px",
                            color: isDark ? "#ffffff" : "#000000"
                        }}>
                            <span style={{
                                background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}>Teams</span> & Group Sessions
                        </h1>
                        <p style={{ 
                            maxWidth: "700px", 
                            margin: "20px auto", 
                            fontSize: "20px", 
                            lineHeight: "1.6",
                            color: isDark ? "#cccccc" : "#333333"
                        }}>
                            Create teams, join clubs, and participate in group sessions to learn together with other students.
                        </p>
                    </motion.div>
                </section>

                {/* Why Build Teams Section */}
                <section style={{ marginBottom: "60px" }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 style={{ 
                            fontSize: "32px", 
                            fontWeight: "bold", 
                            marginBottom: "24px",
                            textAlign: "center",
                            color: isDark ? "#ffffff" : "#000000"
                        }}>
                            Teams & Group Sessions
                        </h2>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "25px",
                            marginTop: "40px"
                        }}>
                            {[
                                {
                                    icon: <IconUsers size={40} />,
                                    title: "Collaborative Learning",
                                    desc: "Learn together with peers who share your interests and goals. Team learning creates accountability and motivation."
                                },
                                {
                                    icon: <IconUserPlus size={40} />,
                                    title: "Knowledge Sharing",
                                    desc: "Pool your collective skills and expertise. Each team member brings unique knowledge to the group."
                                },
                                {
                                    icon: <IconCheck size={40} />,
                                    title: "Structured Progress",
                                    desc: "Set team goals, track progress together, and celebrate achievements as a group."
                                },
                                {
                                    icon: <IconUsers size={40} />,
                                    title: "Group Sessions",
                                    desc: "Organize group learning sessions where multiple students can participate together and learn from each other."
                                },
                                {
                                    icon: <IconUserPlus size={40} />,
                                    title: "Join Clubs",
                                    desc: "Find and join clubs based on your interests. Connect with like-minded students and participate in regular club activities."
                                },
                                {
                                    icon: <IconCheck size={40} />,
                                    title: "Collaborative Projects",
                                    desc: "Work on projects together, share resources, and learn through hands-on collaboration with your team."
                                }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        background: isDark ? "#1a1a1a" : "#f9f9f9",
                                        padding: "30px",
                                        borderRadius: "16px",
                                        textAlign: "center",
                                        border: isDark ? "1px solid #333" : "1px solid #e0e0e0",
                                    }}
                                >
                                    <div style={{ 
                                        color: "#38b6ff",
                                        marginBottom: "20px",
                                        display: "flex",
                                        justifyContent: "center"
                                    }}>
                                        {item.icon}
                                    </div>
                                    <h3 style={{ 
                                        fontSize: "22px",
                                        fontWeight: "bold",
                                        marginBottom: "16px",
                                        color: isDark ? "#ffffff" : "#000000"
                                    }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ 
                                        fontSize: "16px", 
                                        lineHeight: "1.6",
                                        color: isDark ? "#cccccc" : "#666666"
                                    }}>
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* How to Build a Team Section */}
                <section style={{ 
                    background: isDark ? "#1a1a1a" : "#f5f5f5",
                    padding: "50px 40px",
                    borderRadius: "20px",
                    marginBottom: "60px"
                }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <h2 style={{ 
                            fontSize: "32px", 
                            fontWeight: "bold", 
                            marginBottom: "32px",
                            textAlign: "center",
                            color: isDark ? "#ffffff" : "#000000"
                        }}>
                            How to Build Your Team
                        </h2>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "30px",
                            maxWidth: "800px",
                            margin: "0 auto"
                        }}>
                            {[
                                {
                                    step: "1",
                                    title: "Create a Team",
                                    desc: "Start by creating your team. Give it a name and description that reflects your learning goals."
                                },
                                {
                                    step: "2",
                                    title: "Invite Members",
                                    desc: "Invite fellow students who share your interests. You can search for users by their skills or invite them directly."
                                },
                                {
                                    step: "3",
                                    title: "Set Team Goals",
                                    desc: "Define what your team wants to learn together. Set milestones and track progress as a group."
                                },
                                {
                                    step: "4",
                                    title: "Start Learning",
                                    desc: "Begin skill exchange sessions, share resources, and support each other's learning journey."
                                }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        display: "flex",
                                        gap: "20px",
                                        alignItems: "flex-start"
                                    }}
                                >
                                    <div style={{
                                        background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                        color: "white",
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "50%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: "bold",
                                        fontSize: "20px",
                                        flexShrink: 0
                                    }}>
                                        {item.step}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ 
                                            fontSize: "22px",
                                            fontWeight: "bold",
                                            marginBottom: "12px",
                                            color: isDark ? "#ffffff" : "#000000"
                                        }}>
                                            {item.title}
                                        </h3>
                                        <p style={{ 
                                            fontSize: "16px", 
                                            lineHeight: "1.6",
                                            color: isDark ? "#cccccc" : "#666666"
                                        }}>
                                            {item.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </section>

                {/* Call to Action */}
                <section style={{ textAlign: "center", marginTop: "60px" }}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <h2 style={{ 
                            fontSize: "32px", 
                            fontWeight: "bold", 
                            marginBottom: "24px",
                            color: isDark ? "#ffffff" : "#000000"
                        }}>
                            Ready to Build Your Team?
                        </h2>
                        <p style={{ 
                            fontSize: "18px", 
                            marginBottom: "30px",
                            color: isDark ? "#cccccc" : "#333333"
                        }}>
                            Start collaborating with other students and accelerate your learning journey together.
                        </p>
                        <Link to="/teams">
                            <button
                                style={{
                                    background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                    color: "white",
                                    padding: "16px 36px",
                                    border: "none",
                                    borderRadius: "30px",
                                    fontSize: "18px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
                                    transition: "transform 0.2s ease"
                                }}
                                onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                                onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
                            >
                                Create Your Team <IconArrowRight style={{ display: "inline", marginLeft: "8px", verticalAlign: "middle" }} size={20} />
                            </button>
                        </Link>
                    </motion.div>
                </section>
            </div>
        </DefaultLayout>
    );
}
