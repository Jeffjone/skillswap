import { Link as RouterLink } from "react-router-dom";
import { motion } from "framer-motion";
import { IconArrowRight, IconUsers, IconExchange, IconCalendar, IconStar, IconSearch, IconCheck, IconMessageCircle, IconTrendingUp, IconShield, IconRocket } from "@tabler/icons-react";
import DefaultLayout from "@/layouts/default";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function IndexPage() {
    const { theme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark" || theme === "dark";
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
            },
        },
    };

    if (!mounted) return null;

    return (
        <DefaultLayout>
            <div style={{ 
                padding: "0 20px",
                color: isDark ? "#ffffff" : "#000000",
                overflow: "hidden",
            }}>
                {/* Hero Section with Background Animation */}
                <section style={{ 
                    textAlign: "center", 
                    marginBottom: "100px", 
                    paddingTop: "80px",
                    paddingBottom: "60px",
                    position: "relative",
                    minHeight: "60vh",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    {/* Animated Background Elements */}
                    <div style={{
                        position: "absolute",
                        width: "500px",
                        height: "500px",
                        borderRadius: "50%",
                        background: `radial-gradient(circle, ${isDark ? "rgba(56, 182, 255, 0.1)" : "rgba(56, 182, 255, 0.05)"} 0%, transparent 70%)`,
                        top: "-200px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        animation: "float 6s ease-in-out infinite",
                    }} />

                <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{ position: "relative", zIndex: 1, maxWidth: "900px", width: "100%" }}
                    >
                        <motion.h1 
                            variants={itemVariants}
                            style={{
                                fontSize: "clamp(42px, 8vw, 72px)", 
                                fontWeight: "bold",
                                marginBottom: "24px",
                                color: isDark ? "#ffffff" : "#000000",
                                lineHeight: "1.2"
                            }}
                        >
                            Welcome to{" "}
                            <span style={{
                                background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                                SkillSwap
                            </span>
                        </motion.h1>
                        <motion.p 
                            variants={itemVariants}
                            style={{ 
                                fontSize: "clamp(18px, 3vw, 24px)", 
                                marginBottom: "40px",
                                color: isDark ? "#cccccc" : "#555555",
                                maxWidth: "700px",
                                margin: "0 auto 40px auto",
                                lineHeight: "1.6"
                            }}
                        >
                            Connect, learn, and grow together. A platform where students exchange skills and build lasting learning partnerships.
                        </motion.p>
                        <motion.div 
                            variants={itemVariants}
                            style={{ marginTop: "40px" }}
                        >
                            <RouterLink to="/portal?tab=Sign Up">
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(56, 182, 255, 0.4)" }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{
                                        background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                        color: "white",
                                        padding: "16px 40px",
                                        border: "none",
                                        borderRadius: "50px",
                                        fontSize: "18px",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        boxShadow: "0 4px 14px rgba(56, 182, 255, 0.3)",
                                        transition: "all 0.3s ease",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "8px"
                                    }}
                                >
                                    Get Started
                                    <IconArrowRight size={20} />
                                </motion.button>
                            </RouterLink>
                        </motion.div>
                    </motion.div>
                </section>

                {/* Combined What & How Section */}
                <motion.section 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    style={{ 
                        maxWidth: "1200px", 
                        margin: "0 auto 100px auto"
                    }}
                >
                    <div style={{
                        background: isDark ? "#1a1a1a" : "#f8f9fa",
                        padding: "60px 40px",
                        borderRadius: "24px",
                        border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e7eb"
                    }}>
                        <motion.h2 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            style={{ 
                                fontSize: "clamp(32px, 5vw, 48px)", 
                                fontWeight: "bold", 
                                marginBottom: "20px",
                                textAlign: "center",
                                color: isDark ? "#ffffff" : "#000000"
                            }}
                        >
                            How It Works
                        </motion.h2>
                        <motion.p 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            style={{ 
                                fontSize: "18px", 
                                lineHeight: "1.8", 
                                color: isDark ? "#cccccc" : "#555555",
                                textAlign: "center",
                                maxWidth: "800px",
                                margin: "0 auto 50px auto"
                            }}
                        >
                            SkillSwap connects students who want to teach and learn. Share your expertise, discover new skills, and grow together in a supportive learning community.
                        </motion.p>

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                            gap: "30px",
                            marginTop: "50px"
                        }}>
                            {[
                                {
                                    icon: <IconStar size={40} />,
                                    title: "Add Your Skills",
                                    desc: "Create your profile and list skills you can teach and want to learn."
                                },
                                {
                                    icon: <IconSearch size={40} />,
                                    title: "Find Partners",
                                    desc: "Browse students and find perfect skill exchange matches."
                                },
                                {
                                    icon: <IconCalendar size={40} />,
                                    title: "Schedule Sessions",
                                    desc: "Set up meetings that work for both of you."
                                },
                                {
                                    icon: <IconExchange size={40} />,
                                    title: "Learn Together",
                                    desc: "Exchange knowledge and build your learning network."
                                },
                                {
                                    icon: <IconMessageCircle size={40} />,
                                    title: "Communicate Easily",
                                    desc: "Chat with your learning partners and coordinate sessions smoothly."
                                },
                                {
                                    icon: <IconTrendingUp size={40} />,
                                    title: "Track Progress",
                                    desc: "Monitor your skill development and celebrate your learning journey."
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
                                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                    style={{
                                        background: isDark ? "#0f0f0f" : "#ffffff",
                                        padding: "32px 24px",
                                        borderRadius: "16px",
                                        textAlign: "center",
                                        boxShadow: isDark ? "0 4px 12px rgba(0, 0, 0, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.08)",
                                        border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e7eb",
                                        transition: "all 0.3s ease",
                                        cursor: "default"
                                    }}
                                >
                                    <motion.div 
                                        style={{ 
                                            color: "#38b6ff",
                                            marginBottom: "20px",
                                            display: "flex",
                                            justifyContent: "center"
                                        }}
                                        animate={{ 
                                            rotate: [0, 5, -5, 0],
                                        }}
                                        transition={{ 
                                            duration: 3,
                                            repeat: Infinity,
                                            repeatDelay: 2,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        {item.icon}
                                    </motion.div>
                                    <h3 style={{ 
                                        fontSize: "20px",
                                        fontWeight: "600",
                                        marginBottom: "12px",
                                        color: isDark ? "#ffffff" : "#000000"
                                    }}>
                                        {item.title}
                                    </h3>
                                    <p style={{ 
                                        fontSize: "15px", 
                                        lineHeight: "1.6",
                                        color: isDark ? "#aaaaaa" : "#666666"
                                    }}>
                                        {item.desc}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Features Section - Streamlined */}
                <motion.section 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    style={{ 
                        maxWidth: "1000px", 
                        margin: "0 auto 100px auto"
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: "center", marginBottom: "50px" }}
                    >
                        <h2 style={{ 
                            fontSize: "clamp(32px, 5vw, 42px)", 
                            fontWeight: "bold", 
                            marginBottom: "16px",
                            color: isDark ? "#ffffff" : "#000000"
                        }}>
                            Why SkillSwap?
                        </h2>
                        <p style={{ 
                            fontSize: "18px",
                            color: isDark ? "#aaaaaa" : "#666666",
                            maxWidth: "600px",
                            margin: "0 auto"
                        }}>
                            Everything you need for seamless skill exchange
                        </p>
                    </motion.div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "24px"
                    }}>
                            {[
                                { title: "Student-Focused", desc: "Built for students, by students" },
                                { title: "Perfect Matching", desc: "Find your ideal learning partner" },
                                { title: "Flexible Times", desc: "Schedule around your calendar" },
                                { title: "Free Forever", desc: "Learn and teach at no cost" },
                                { title: "Safe & Secure", desc: "Your privacy and data protection are our priority" },
                                { title: "Growing Community", desc: "Join thousands of students learning together" }
                            ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                whileHover={{ scale: 1.03 }}
                                style={{
                                    padding: "28px 24px",
                                    background: isDark ? "#1a1a1a" : "#ffffff",
                                    borderRadius: "16px",
                                    border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e7eb",
                                    textAlign: "center",
                                    transition: "all 0.3s ease"
                                }}
                            >
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "12px",
                                    background: "linear-gradient(135deg, #38b6ff, #0099e6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    margin: "0 auto 16px auto",
                                }}>
                                    <IconCheck size={24} color="white" />
                                </div>
                                <h3 style={{ 
                                    fontSize: "18px",
                                    fontWeight: "600",
                                    marginBottom: "8px",
                                    color: isDark ? "#ffffff" : "#000000"
                                }}>
                                    {item.title}
                                </h3>
                                <p style={{ 
                                    fontSize: "14px", 
                                    color: isDark ? "#aaaaaa" : "#666666",
                                    lineHeight: "1.5"
                                }}>
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Mission Section - Elegant */}
                <motion.section 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8 }}
                    style={{ 
                        maxWidth: "900px", 
                        margin: "0 auto 80px auto",
                        textAlign: "center"
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{
                            padding: "60px 40px",
                            background: `linear-gradient(135deg, ${isDark ? "rgba(56, 182, 255, 0.08)" : "rgba(56, 182, 255, 0.03)"}, ${isDark ? "rgba(0, 153, 230, 0.08)" : "rgba(0, 153, 230, 0.03)"})`,
                            borderRadius: "24px",
                            border: isDark ? "1px solid rgba(56, 182, 255, 0.2)" : "1px solid rgba(56, 182, 255, 0.1)"
                        }}
                    >
                        <h2 style={{ 
                            fontSize: "clamp(28px, 4vw, 36px)", 
                            fontWeight: "bold", 
                            marginBottom: "24px",
                            color: isDark ? "#ffffff" : "#000000"
                        }}>
                            Our Mission
                        </h2>
                        <p style={{ 
                            fontSize: "18px", 
                            lineHeight: "1.8", 
                            color: isDark ? "#cccccc" : "#555555",
                            maxWidth: "700px",
                            margin: "0 auto"
                        }}>
                            We believe learning should be collaborative, accessible, and empowering. SkillSwap transforms skill acquisition into a shared experience where students support each other's growth through knowledge exchange.
                        </p>
                </motion.div>
                </motion.section>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateX(-50%) translateY(0px);
                    }
                    50% {
                        transform: translateX(-50%) translateY(-20px);
                    }
                }
            `}</style>
        </DefaultLayout>
    );
}
