import { Card, CardBody } from "@nextui-org/card";
import { Tab, Tabs } from "@nextui-org/tabs";
import { useEffect, useState } from "react";
import Container from "@/components/container";
import User from "@/api/member";
import { IconLock, IconSettingsUp } from "@tabler/icons-react";
import { SignInComponent } from "@/components/signin";
import { SignUpComponent } from "@/components/signup";
import { Navbar } from "@/components/navbar";
import Loading from "@/components/loading";
import { MemberProperties, MemberType } from "@/types/membertypes";
import { useLocation, useNavigate } from "react-router-dom";

export default function Signup() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const initialTab = queryParams.get("tab") || "Sign In";
    const [selected, setSelected] = useState(initialTab);
    const [loading, setLoading] = useState(true);
    const [memberType, setMemberType] = useState<MemberType>();
    const [auth, setAuth] = useState(false);
    const [name, setName] = useState<string>();

    useEffect(() => {
        let mounted = true;
        
        // Check localStorage first
        const storedAuth = localStorage.getItem('isAuthenticated');
        if (storedAuth === 'true') {
            const storedName = localStorage.getItem('userName');
            const storedMemberType = localStorage.getItem('memberType');
            if (storedName) {
                setAuth(true);
                setName(storedName);
                if (storedMemberType) {
                    setMemberType(storedMemberType as MemberType);
                }
                setLoading(false);
                if (mounted) {
                    navigate("/dashboard");
                }
                return;
            }
        }

        // Then check Firebase (with timeout)
        const timeoutId = setTimeout(() => {
            if (mounted) {
                setLoading(false);
            }
        }, 2000);

        User()
            .then((user: MemberProperties | null) => {
                if (!mounted) return;
                
                clearTimeout(timeoutId);
                setLoading(false);

                if (user && user.immutable?.memberType) {
                    setMemberType(user.immutable.memberType);
                    setAuth(true);
                    setName(user.displayName || "");
                    navigate("/dashboard");
                }
            })
            .catch((error) => {
                console.error("Error checking user:", error);
                if (mounted) {
                    clearTimeout(timeoutId);
                    setLoading(false);
                }
            });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
        };
    }, [navigate]);

    useEffect(() => {
        if (selected === "Sign Up") {
            navigate(`${location.pathname}?tab=Sign Up`, { replace: true });
        } else {
            navigate(location.pathname, { replace: true });
        }
    }, [selected, location.pathname, navigate]);

    if (loading) return <Loading />;
    else
        return (
            <Container>
                <Navbar login={auth} memberType={memberType} name={name} />
                <div className="w-full h-full flex flex-col items-center justify-center">
                    <Card className="bg-foreground-100 w-[32%] min-w-96 mt-10">
                        <CardBody className="text-center pt-10 px-10">
                            <Tabs
                                variant="bordered"
                                className="font-semibold"
                                onSelectionChange={(key: React.Key) => {
                                    console.log(selected);
                                    setSelected(key as string);
                                    console.log(key);
                                }}
                                defaultSelectedKey={selected}
                            >
                                <Tab
                                    key="Sign In"
                                    title={
                                        <div className="flex items-center space-x-2">
                                            <IconLock />
                                            <span>Sign In</span>
                                        </div>
                                    }
                                />
                                <Tab
                                    key="Sign Up"
                                    title={
                                        <div className="flex items-center space-x-2">
                                            <IconSettingsUp />
                                            <span>Sign Up</span>
                                        </div>
                                    }
                                />
                            </Tabs>
                        </CardBody>
                        {selected === "Sign Up" ? (
                            <SignUpComponent />
                        ) : (
                            <SignInComponent />
                        )}
                    </Card>
                </div>
            </Container>
        );
}
