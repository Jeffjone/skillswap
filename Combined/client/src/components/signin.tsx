import { Button } from "@nextui-org/button";
import { CardBody } from "@nextui-org/card";
import { Checkbox } from "@nextui-org/checkbox";
import { Input } from "@nextui-org/input";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { ValidateEmail } from "../api/validate";
import { useState, useEffect } from "react";

import { SignIn, SignInWithGoogle } from "../api/email";

import { EyeSlashFilledIcon, EyeFilledIcon } from "@/components/icons";
import {
    IconBrandGoogle,
    IconMail,
    IconKey,
    IconLogin,
} from "@tabler/icons-react";

export const SignInComponent = () => {
    const [submitting, setSubmitting] = useState(false);
    const [valid, setValid] = useState(false);
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [passwordInvalid, setPasswordInvalid] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [staySignedIn, setStaySignedIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
        } else if (password.length < 8) {
            setPasswordInvalid(true);
        } else {
            setPasswordInvalid(false);
        }

        if (ValidateEmail(email) && password.length >= 8) {
            setValid(true);
        } else {
            setValid(false);
        }
    }, [email, password]);

    const handleSubmit = async () => {
        try {
        setSubmitting(true);
        const result = await SignIn(email, password, staySignedIn);
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
                toast.success("Successfully signed in!", {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                sessionStorage.setItem("login", "true");
                window.location.href = "/dashboard";
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

    const handleGoogleSignIn = async () => {
        try {
        setSubmitting(true);
        const result = await SignInWithGoogle(staySignedIn);
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
                toast.success("Successfully signed in with Google!", {
                    position: "bottom-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                sessionStorage.setItem("login", "true");
                window.location.href = "/dashboard";
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
                <strong>Hey! Welcome Back 😄 </strong>
            </h1>
            <div className="flex flex-col w-full gap-y-4">
                <Input
                    className="text-bold"
                    type="email"
                    label={<strong>Email:</strong>}
                    labelPlacement="outside"
                    placeholder="example@gmail.com"
                    variant="bordered"
                    isInvalid={emailInvalid}
                    errorMessage={
                        !emailInvalid ? "" : "Please enter a valid email."
                    }
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
                        isInvalid={passwordInvalid}
                        errorMessage={
                            !passwordInvalid ? "" : "Password must be at least 8 characters long."
                        }
                    style={{
                        borderWidth: 0,
                        boxShadow: "none",
                        padding: 0,
                    }}
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
                    color="warning"
                    size="sm"
                    checked={staySignedIn}
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
                <IconLogin />
                {submitting ? "" : "Sign In"}
            </Button>
            <div className="relative mt-2 w-full">
                <div className="absolute left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 px-2 text-neutral-400 dark:text-secondary bg-foreground-100">
                    <strong>Or</strong>
                </div>
                <div className="border-b border-neutral-300 dark:border-secondary"></div>
            </div>
            <Button
                className="bg-black text-white font-semibold"
                color="secondary"
                onPress={handleGoogleSignIn}
            >
                <IconBrandGoogle size={20} />
                Sign In with Google
            </Button>
        </CardBody>
        </>
    );
};
