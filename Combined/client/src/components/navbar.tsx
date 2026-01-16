import { Button } from "@nextui-org/button";
import { Link } from "@nextui-org/link";
import {
    Navbar as NextUINavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenuToggle,
    NavbarMenu,
    NavbarMenuItem,
} from "@nextui-org/navbar";
import {
    Dropdown,
    DropdownMenu,
    DropdownTrigger,
    DropdownItem,
} from "@nextui-org/dropdown";
import { useNavigate } from "react-router-dom";
import { link as linkStyles } from "@nextui-org/theme";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import {
    IconDashboard,
    IconKey,
    IconUpload,
    IconUser,
    IconLogout,
    IconArticle,
    IconChevronDown,
    IconSwitch,
    IconPlus,
    IconMessage,
    IconSettings,
} from "@tabler/icons-react";
import Logout from "@/api/logout";
import { MemberType } from "@/types/membertypes";
import { auth } from "@/api/config";
import { signOut } from "firebase/auth";

interface Account {
    email: string;
    name: string;
    memberType: string;
}

interface NavbarProps {
    login?: boolean;
    memberType?: string | null;
    name?: string | null;
}

export const Navbar = (props: NavbarProps) => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [savedAccounts, setSavedAccounts] = useState<Account[]>([]);

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem('isAuthenticated');
            const name = localStorage.getItem('userName');
            const email = localStorage.getItem('userEmail');
            const memberType = localStorage.getItem('memberType');
            
            setIsAuthenticated(authStatus === 'true');
            setUserName(name);
            setUserEmail(email);

            // Load saved accounts
            const accounts = localStorage.getItem('savedAccounts');
            if (accounts) {
                setSavedAccounts(JSON.parse(accounts));
            }

            // If user is authenticated, add current account to saved accounts if not already present
            if (authStatus === 'true' && email && name && memberType) {
                const currentAccount: Account = { email, name, memberType };
                const accounts = localStorage.getItem('savedAccounts');
                let savedAccounts: Account[] = accounts ? JSON.parse(accounts) : [];
                
                // Check if account already exists
                const accountExists = savedAccounts.some(acc => acc.email === email);
                if (!accountExists) {
                    savedAccounts.push(currentAccount);
                    localStorage.setItem('savedAccounts', JSON.stringify(savedAccounts));
                    setSavedAccounts(savedAccounts);
                }
            }
        };

        checkAuth();
        
        // Listen for auth state changes
        const unsubscribe = auth.onAuthStateChanged(() => {
            checkAuth();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        try {
            // Sign out from Firebase
            await signOut(auth);
            
            // Clear localStorage
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('memberType');
            
            // Update state
            setIsAuthenticated(false);
            setUserName(null);
            setUserEmail(null);
            
            // Redirect to home page
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error);
            // Still clear local storage and redirect even if Firebase signout fails
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('userName');
            localStorage.removeItem('memberType');
            setIsAuthenticated(false);
            setUserName(null);
            setUserEmail(null);
            navigate("/");
        }
    };

    const switchAccount = (account: Account) => {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', account.email);
        localStorage.setItem('userName', account.name);
        localStorage.setItem('memberType', account.memberType);
        window.location.reload();
    };

    // Get first initial from name
    const getInitial = () => {
        if (!userName) return "?";
        return userName.charAt(0).toUpperCase();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
        <NextUINavbar maxWidth="xl" position="sticky">
            <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
                <NavbarBrand className="gap-3 max-w-fit">
                    <Link
                        className="flex justify-start items-center gap-1"
                        color="foreground"
                        href="/"
                    >
                        <Logo />
                        <p className="font-bold" style={{ background: "linear-gradient(90deg, #38b6ff, #0099e6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            SkillSwap
                        </p>
                    </Link>
                </NavbarBrand>
                <div className="hidden lg:flex gap-4 justify-start ml-2">
                    {siteConfig.navItems
                        .filter((item) => {
                            // Hide Dashboard from header navigation (it's in profile dropdown when logged in)
                            if (item.href === "/dashboard") {
                                return false;
                            }
                            return true;
                        })
                        .map((item) => (
                            <NavbarItem key={item.href}>
                                <Link
                                    className={clsx(
                                        linkStyles({ color: "foreground" }),
                                        "data-[active=true]:text-primary data-[active=true]:font-medium"
                                    )}
                                    color="foreground"
                                    href={item.href}
                                >
                                    <b>{item.label}</b>
                                </Link>
                            </NavbarItem>
                        ))}
                </div>
            </NavbarContent>

            <NavbarContent
                className="hidden sm:flex basis-1/5 sm:basis-full"
                justify="end"
            >
                <NavbarItem className="hidden sm:flex gap-2">
                    <ThemeSwitch />
                    </NavbarItem>
                    {isAuthenticated ? (
                        <>
                            {/* Dashboard Link */}
                            <NavbarItem className="hidden sm:flex">
                                <Link
                                    className={clsx(
                                        linkStyles({ color: "foreground" }),
                                        "data-[active=true]:text-primary data-[active=true]:font-medium"
                                    )}
                                    color="foreground"
                                    href="/dashboard"
                                >
                                    <div className="flex items-center gap-2">
                                        <IconDashboard size={18} />
                                        <b>Dashboard</b>
                                    </div>
                                </Link>
                            </NavbarItem>
                            {/* Profile Dropdown */}
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        style={{ background: "linear-gradient(90deg, #38b6ff, #0099e6)", color: "white" }}
                                        className="text-sm font-bold"
                                        radius="full"
                                    >
                                        {getInitial()}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu 
                                    aria-label="Profile Actions"
                                    items={[
                                        {
                                            key: "profile",
                                            content: "Profile",
                                            startContent: <IconUser size={18} />,
                                            onPress: () => navigate("/profile")
                                        },
                                        {
                                            key: "tracking",
                                            content: "Tracking",
                                            startContent: <IconSettings size={18} />,
                                            onPress: () => navigate("/sessions")
                                        },
                                        {
                                            key: "messaging",
                                            content: "Messaging",
                                            startContent: <IconMessage size={18} />,
                                            onPress: () => navigate("/messaging")
                                        },
                                        {
                                            key: "logout",
                                            content: "Logout",
                                            startContent: <IconLogout size={18} />,
                                            className: "text-danger",
                                            color: "danger",
                                            onPress: handleLogout
                                        }
                                    ]}
                                >
                                    {(item) => (
                                        <DropdownItem
                                            key={item.key}
                                            startContent={item.startContent}
                                            onPress={item.onPress}
                                            className={item.className}
                                            color={item.color as "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined}
                                        >
                                            {item.content}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </>
                    ) : (
                        <>
                            <Button
                                style={{
                                    background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                    color: "white"
                                }}
                                onPress={() => {
                                    navigate("/portal?tab=Sign Up");
                                }}
                                endContent={<IconUpload />}
                            >
                                <b>Sign Up</b>
                            </Button>
                            <Button
                                color="primary"
                                variant="bordered"
                                onPress={() => {
                                    navigate("/portal?tab=Sign In");
                                }}
                                endContent={<IconKey />}
                            >
                                <b>Sign In</b>
                            </Button>
                        </>
                    )}
            </NavbarContent>

            <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
                <ThemeSwitch />
                <NavbarMenuToggle />
                    {isAuthenticated ? (
                        <>
                            {/* Dashboard Link for Mobile */}
                            <NavbarItem className="sm:hidden">
                                <Link
                                    color="foreground"
                                    href="/dashboard"
                                >
                                    <div className="flex items-center gap-1">
                                        <IconDashboard size={16} />
                                        <span className="text-sm font-semibold">Dashboard</span>
                                    </div>
                                </Link>
                            </NavbarItem>
                            {/* Profile Dropdown for Mobile */}
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        style={{ background: "linear-gradient(90deg, #38b6ff, #0099e6)", color: "white" }}
                                        className="text-sm font-bold"
                                        radius="full"
                                        size="sm"
                                    >
                                        {getInitial()}
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu 
                                    aria-label="Profile Actions"
                                    items={[
                                        {
                                            key: "profile",
                                            content: "Profile",
                                            startContent: <IconUser size={18} />,
                                            onPress: () => navigate("/profile")
                                        },
                                        {
                                            key: "tracking",
                                            content: "Tracking",
                                            startContent: <IconSettings size={18} />,
                                            onPress: () => navigate("/sessions")
                                        },
                                        {
                                            key: "messaging",
                                            content: "Messaging",
                                            startContent: <IconMessage size={18} />,
                                            onPress: () => navigate("/messaging")
                                        },
                                        {
                                            key: "logout",
                                            content: "Logout",
                                            startContent: <IconLogout size={18} />,
                                            className: "text-danger",
                                            color: "danger",
                                            onPress: handleLogout
                                        }
                                    ]}
                                >
                                    {(item) => (
                                        <DropdownItem
                                            key={item.key}
                                            startContent={item.startContent}
                                            onPress={item.onPress}
                                            className={item.className}
                                            color={item.color as "default" | "primary" | "secondary" | "success" | "warning" | "danger" | undefined}
                                        >
                                            {item.content}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        </>
                    ) : (
                    <>
                        <Button
                                color="secondary"
                            onPress={() => {
                                navigate("/portal?tab=Sign Up");
                            }}
                                endContent={<IconUpload />}
                        >
                                <b>Sign Up</b>
                        </Button>
                        <Button
                            color="primary"
                                variant="bordered"
                            onPress={() => {
                                navigate("/portal?tab=Sign In");
                            }}
                                endContent={<IconKey />}
                        >
                                <b>Sign In</b>
                        </Button>
                    </>
                )}
            </NavbarContent>

            <NavbarMenu>
                <div className="mx-4 mt-2 flex flex-col gap-2">
                    {siteConfig.navMenuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item}-${index}`}>
                            <Link
                                color={
                                    index === 2
                                        ? "primary"
                                        : index ===
                                            siteConfig.navMenuItems.length - 1
                                          ? "danger"
                                          : "foreground"
                                }
                                href="#"
                                size="lg"
                            >
                                {item.label}
                            </Link>
                        </NavbarMenuItem>
                    ))}
                </div>
            </NavbarMenu>
        </NextUINavbar>
        </motion.div>
    );
};
