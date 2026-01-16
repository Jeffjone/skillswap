import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface ParticleConfig {
    key: number;
    size: number;
    left: number;
    top: number;
    duration: number;
    delay: number;
    moveX: number;
    moveY: number;
    opacity1: number;
    opacity2: number;
    animationName: string;
    backgroundOpacity: number;
}

export default function AnimatedBackground() {
    const { theme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark" || theme === "dark";
    const [mounted, setMounted] = useState(false);
    const [particles, setParticles] = useState<ParticleConfig[]>([]);

    useEffect(() => {
        setMounted(true);
        
        // Generate particle configurations - distribute across full width
        const particleConfigs: ParticleConfig[] = Array.from({ length: 25 }).map((_, i) => {
            const size = Math.random() * 10 + 4;
            // Distribute evenly across screen width, with some randomness
            const left = (i / 25) * 100 + (Math.random() * 3 - 1.5); // Even distribution with slight variation
            const top = Math.random() * 100;
            const duration = Math.random() * 20 + 15;
            const delay = Math.random() * 5;
            const moveX = Math.random() * 300 - 150; // Larger movement range
            const moveY = Math.random() * 300 - 150;
            const opacity1 = Math.random() * 0.4 + 0.4; // More visible
            const opacity2 = Math.random() * 0.3 + 0.7; // Even more visible at peak
            const backgroundOpacity = Math.random() * 0.4 + 0.5; // More prominent blue
            
            return {
                key: i,
                size,
                left,
                top,
                duration,
                delay,
                moveX,
                moveY,
                opacity1,
                opacity2,
                animationName: `particleFloat${i}`,
                backgroundOpacity,
            };
        });
        
        setParticles(particleConfigs);
    }, []);

    useEffect(() => {
        // Inject CSS animations into the document
        const styleId = "animated-background-styles";
        if (document.getElementById(styleId)) return;

        const style = document.createElement("style");
        style.id = styleId;
        
        // Base animations
        let animations = `
            @keyframes float1 {
                0%, 100% {
                    transform: translate(0, 0) scale(1);
                }
                33% {
                    transform: translate(150px, 150px) scale(1.15);
                }
                66% {
                    transform: translate(-100px, 200px) scale(0.9);
                }
            }

            @keyframes float2 {
                0%, 100% {
                    transform: translate(0, 0) scale(1);
                }
                33% {
                    transform: translate(-200px, -120px) scale(1.2);
                }
                66% {
                    transform: translate(150px, -80px) scale(0.85);
                }
            }

            @keyframes float3 {
                0%, 100% {
                    transform: translate(0, 0) scale(1);
                }
                50% {
                    transform: translate(-80px, -100px) scale(1.25);
                }
            }

            @keyframes wave1 {
                0%, 100% {
                    transform: rotate(-45deg) translateX(-100px);
                    opacity: 0.3;
                }
                50% {
                    transform: rotate(-45deg) translateX(100px);
                    opacity: 0.6;
                }
            }

            @keyframes wave2 {
                0%, 100% {
                    transform: rotate(45deg) translateX(100px);
                    opacity: 0.3;
                }
                50% {
                    transform: rotate(45deg) translateX(-100px);
                    opacity: 0.6;
                }
            }
        `;

        // Add particle animations
        particles.forEach((particle) => {
            animations += `
                @keyframes ${particle.animationName} {
                    0%, 100% {
                        transform: translate(0, 0);
                        opacity: ${particle.opacity1};
                    }
                    50% {
                        transform: translate(${particle.moveX}px, ${particle.moveY}px);
                        opacity: ${particle.opacity2};
                    }
                }
            `;
        });

        style.textContent = animations;
        document.head.appendChild(style);

        return () => {
            const existingStyle = document.getElementById(styleId);
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, [particles]);

    if (!mounted) return null;

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                zIndex: 0,
                overflow: "hidden",
                pointerEvents: "none",
            }}
        >
            {/* Animated Gradient Orbs - Distributed across screen */}
            <div
                style={{
                    position: "absolute",
                    width: "500px",
                    height: "500px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56, 182, 255, 0.6) 0%, rgba(0, 153, 230, 0.4) 40%, transparent 70%)",
                    top: "-250px",
                    left: "10%",
                    animation: "float1 20s ease-in-out infinite",
                    opacity: isDark ? 0.25 : 0.15,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: "450px",
                    height: "450px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56, 182, 255, 0.5) 0%, rgba(0, 153, 230, 0.35) 40%, transparent 70%)",
                    bottom: "-225px",
                    right: "15%",
                    animation: "float2 25s ease-in-out infinite",
                    opacity: isDark ? 0.25 : 0.15,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56, 182, 255, 0.55) 0%, rgba(0, 153, 230, 0.3) 50%, transparent 70%)",
                    top: "30%",
                    left: "70%",
                    animation: "float3 30s ease-in-out infinite",
                    opacity: isDark ? 0.25 : 0.15,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: "350px",
                    height: "350px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56, 182, 255, 0.5) 0%, rgba(0, 153, 230, 0.3) 40%, transparent 70%)",
                    top: "60%",
                    left: "5%",
                    animation: "float2 22s ease-in-out infinite",
                    opacity: isDark ? 0.2 : 0.12,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: "380px",
                    height: "380px",
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(56, 182, 255, 0.45) 0%, rgba(0, 153, 230, 0.25) 45%, transparent 70%)",
                    top: "15%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    animation: "float1 28s ease-in-out infinite",
                    opacity: isDark ? 0.2 : 0.12,
                }}
            />

            {/* Animated Wave-like Shapes */}
            <div
                style={{
                    position: "absolute",
                    width: "120%",
                    height: "200px",
                    background: "linear-gradient(90deg, transparent, rgba(56, 182, 255, 0.1), transparent)",
                    top: "20%",
                    left: "-10%",
                    transform: "rotate(-45deg)",
                    animation: "wave1 15s ease-in-out infinite",
                    opacity: isDark ? 0.1 : 0.05,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    width: "120%",
                    height: "150px",
                    background: "linear-gradient(90deg, transparent, rgba(0, 153, 230, 0.1), transparent)",
                    bottom: "30%",
                    right: "-10%",
                    transform: "rotate(45deg)",
                    animation: "wave2 18s ease-in-out infinite",
                    opacity: isDark ? 0.1 : 0.05,
                }}
            />

            {/* Floating Particles */}
            {particles.map((particle) => (
                <div
                    key={particle.key}
                    style={{
                        position: "absolute",
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        borderRadius: "50%",
                        background: `rgba(56, 182, 255, ${particle.backgroundOpacity})`,
                        boxShadow: `0 0 ${particle.size * 2}px rgba(56, 182, 255, ${particle.backgroundOpacity * 0.8})`,
                        left: `${particle.left}%`,
                        top: `${particle.top}%`,
                        animation: `${particle.animationName} ${particle.duration}s ease-in-out infinite`,
                        animationDelay: `${particle.delay}s`,
                        opacity: isDark ? 0.7 : 0.5,
                    }}
                />
            ))}
        </div>
    );
}
