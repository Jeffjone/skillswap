import { Button } from "@nextui-org/button";
import { CardBody } from "@nextui-org/card";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { ValidateEmail, ValidatePassword } from "../api/validate";
import { useState, useEffect } from "react";

import { SignUp, SignUpWithGoogle } from "../api/email";

import { EyeSlashFilledIcon, EyeFilledIcon } from "@/components/icons";
import {
    IconBrandGoogle,
    IconMail,
    IconKey,
    IconUpload,
} from "@tabler/icons-react";
import {
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
} from "@nextui-org/dropdown";
import { MemberType } from "@/types/membertypes";

export const SignUpComponent = () => {
    const [submitting, setSubmitting] = useState(false);
    const [valid, setValid] = useState(false);
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [passwordInvalid, setPasswordInvalid] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [staySignedIn, setStaySignedIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // Default to TeamMember for compatibility, but not shown in UI
    const [memberType] = useState<MemberType>(MemberType.TeamMember);

    useEffect(() => {
        if (email.length === 0) {
            setEmailInvalid(false);
        } else if (!ValidateEmail(email)) {
            setEmailInvalid(true);
        } else {
            setEmailInvalid(false);
        }

        if (password.length === 0) {
            setPasswordInvalid(false);
        } else if (!ValidatePassword(password)) {
            setPasswordInvalid(true);
        } else {
            setPasswordInvalid(false);
        }

        if (ValidateEmail(email) && ValidatePassword(password) && firstName.length > 0 && lastName.length > 0) {
            setValid(true);
        } else {
            setValid(false);
        }
    }, [email, password, firstName, lastName]);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const result = await SignUp(
                email,
                firstName + " " + lastName,
                password,
                staySignedIn,
                memberType
            );
            if (result.error) {
                toast.error(result.msg, {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.success("Successfully signed up!", {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                sessionStorage.setItem("signup", "true");
                window.location.href = "/signup-flow";
            }
        } catch (error) {
            toast.error("An unexpected error occurred", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleGoogleSubmit = async () => {
        try {
            setSubmitting(true);
            const result = await SignUpWithGoogle(staySignedIn, memberType);
            if (result.error) {
                toast.error(result.msg, {
                    position: "bottom-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            } else {
                toast.success("Successfully signed up with Google!", {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                sessionStorage.setItem("signup", "true");
                window.location.href = "/signup-flow";
            }
        } catch (error) {
            toast.error("An unexpected error occurred", {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <ToastContainer />
            <CardBody className="text-center gap-y-4 pb-10 px-10">
                <h1 className="text-left text-2xl">
                    <strong>Welcome! Glad your joining us. 👋</strong>
                </h1>
                <div className="flex flex-col w-full gap-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            className="text-bold"
                            type="first-name"
                            label={<strong>First Name:</strong>}
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="John"
                            description="Your first name"
                            isRequired
                            style={{
                                borderWidth: 0,
                                boxShadow: "none",
                                padding: 0,
                            }}
                            onInput={(e) => {
                                setFirstName(e.currentTarget.value);
                            }}
                        ></Input>
                        <Input
                            className="text-bold"
                            type="last-name"
                            label={<strong>Last Name:</strong>}
                            labelPlacement="outside"
                            variant="bordered"
                            placeholder="Doe"
                            description="Your last name"
                            isRequired
                            onInput={(e) => {
                                setLastName(e.currentTarget.value);
                            }}
                            style={{
                                borderWidth: 0,
                                boxShadow: "none",
                                padding: 0,
                            }}
                        ></Input>
                    </div>
                    <Input
                        className="text-bold"
                        type="email"
                        label={<strong>Email:</strong>}
                        labelPlacement="outside"
                        placeholder="example@gmail.com"
                        variant="bordered"
                        isInvalid={emailInvalid}
                        errorMessage={
                            !emailInvalid ? "" : "Please enter a valid email address (e.g., name@example.com)."
                        }
                        description="We'll use this to send you notifications about your sessions"
                        isRequired
                        style={{
                            borderWidth: 0,
                            boxShadow: "none",
                            padding: 0,
                        }}
                        onInput={(e) => {
                            setEmail(e.currentTarget.value);
                        }}
                        startContent={
                            <div>
                                <IconMail className="text-2xl text-default-400 pointer-events-none" />{" "}
                            </div>
                        }
                    />
                    <Input
                        label={<strong>Password:</strong>}
                        labelPlacement="outside"
                        placeholder="********"
                        type={showPassword ? "text" : "password"}
                        variant="bordered"
                        style={{
                            borderWidth: 0,
                            boxShadow: "none",
                            padding: 0,
                        }}
                        isInvalid={passwordInvalid}
                        errorMessage={
                            !passwordInvalid
                                ? ""
                                : "Password must be 8-16 characters long and contain at least one number and one special character (!@#$%^&*)."
                        }
                        description="Must be 8-16 characters with at least one number and special character"
                        isRequired
                        onInput={(e) => {
                            setPassword(e.currentTarget.value);
                        }}
                        startContent={
                            <IconKey className="text-2xl text-default-400 pointer-events-none" />
                        }
                        endContent={
                            <button
                                className="focus:outline-none"
                                type="button"
                                onClick={() => {
                                    setShowPassword(!showPassword);
                                }}
                                aria-label="toggle password visibility"
                            >
                                {showPassword ? (
                                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                ) : (
                                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                )}
                            </button>
                        }
                    ></Input>
                    <Checkbox
                        className="font-semibold"
                        size="sm"
                        checked={staySignedIn}
                        color="warning"
                        onValueChange={setStaySignedIn}
                    >
                        Keep me signed in
                    </Checkbox>
                </div>
                <Button
                    className="font-semibold"
                    style={{
                        background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                        color: "white"
                    }}
                    isDisabled={!valid}
                    onPress={handleSubmit}
                    isLoading={submitting}
                >
                    <IconUpload size={20} />
                    {submitting ? "" : "Sign Up"}
                </Button>
                <div className="relative mt-2 w-full">
                    <div className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2  px-2 text-neutral-400 dark:bg-foreground-100 dark:text-primary">
                        <strong>Or</strong>
                    </div>
                    <div className="border-b border-neutral-300 dark:border-primary"></div>
                </div>
                <Button
                    className="bg-black text-white font-semibold"
                    color="secondary"
                    onPress={handleGoogleSubmit}
                >
                    <IconBrandGoogle size={20} />
                    Sign Up with Google
                </Button>
            </CardBody>
        </>
    );
};
