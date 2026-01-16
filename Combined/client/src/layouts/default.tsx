import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useEffect, useState } from "react";
import { MemberProperties, MemberType } from "@/types/membertypes";
import User from "@/api/member";

export default function DefaultLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [memberType, setMemberType] = useState<MemberType>();
    const [auth, setAuth] = useState(false);
    const [name, setName] = useState<string>();

    useEffect(() => {
        // Check localStorage first for faster initial load
        try {
            const storedAuth = localStorage.getItem('isAuthenticated');
            const storedName = localStorage.getItem('userName');
            const storedMemberType = localStorage.getItem('memberType');

            if (storedAuth === 'true' && storedName) {
                setAuth(true);
                setName(storedName);
                if (storedMemberType) {
                    setMemberType(storedMemberType as MemberType);
                }
            }
        } catch (error) {
            console.warn("Error reading localStorage:", error);
        }

        // Then verify with Firebase asynchronously (non-blocking)
        let mounted = true;
        const timeoutId = setTimeout(() => {
            User()
                .then((user: MemberProperties) => {
                    if (!mounted) return;

                    if (user && user.immutable?.memberType) {
                        console.log("Signed In");
                        setMemberType(user.immutable.memberType);
                        setAuth(true);
                        setName(user.displayName);
                        // Update localStorage
                        try {
                            localStorage.setItem('isAuthenticated', 'true');
                            localStorage.setItem('userName', user.displayName);
                            localStorage.setItem('memberType', user.immutable.memberType);
                        } catch (e) {
                            console.warn("Error writing to localStorage:", e);
                        }
                    } else {
                        // Clear auth state if user not authenticated
                        setAuth(false);
                        try {
                            localStorage.removeItem('isAuthenticated');
                            localStorage.removeItem('userName');
                            localStorage.removeItem('memberType');
                        } catch (e) {
                            console.warn("Error clearing localStorage:", e);
                        }
                    }
                })
                .catch((error) => {
                    console.error("Error loading user:", error);
                    // Don't update state on error, just log it
                });
        }, 100); // Small delay to let the page render first

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="relative flex flex-col" style={{ position: "relative", minHeight: "100vh" }}>
            <AnimatedBackground />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
                <Navbar login={auth} name={name} memberType={memberType} />
                <div style={{ flex: "1 0 auto", minHeight: "calc(100vh - 64px)" }}>
                    <main 
                        className="container mx-auto max-w-7xl px-6 pt-16" 
                        style={{ 
                            paddingBottom: "4rem",
                            minHeight: "100%"
                        }}
                    >
                        {children}
                    </main>
                </div>
                <div style={{ flexShrink: 0 }}>
                    <Footer />
                </div>
            </div>
        </div>
    );
}
