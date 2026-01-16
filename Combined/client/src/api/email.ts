import { auth } from "./config";
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signInWithPopup,
    UserCredential,
} from "firebase/auth";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import StaySignedIn from "./stay";
import User from "./member";
import { db } from "./config";
import { httpsCallable } from "firebase/functions";
import { functions } from "./config";
import { MemberType } from "@/types/membertypes";

interface FirebaseError {
    code: string;
    message: string;
}

export async function SignUp(
    email: string,
    name: string,
    password: string,
    staySignedIn: boolean,
    memberType: MemberType
) {
    // Hardcoded test accounts
    if (email === 'dtable06@gmail.com' && password === 'zebra##45') {
        if (staySignedIn) {
            await StaySignedIn();
        }
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        localStorage.setItem('memberType', memberType);
        return {
            error: false,
            msg: "Signed up successfully",
        };
    }

    // Hardcoded manager account
    if (email === 'koifish789@gmail.com' && password === 'Watermelon$$78') {
        if (staySignedIn) {
            await StaySignedIn();
        }
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        localStorage.setItem('memberType', MemberType.TeamCaptain);
        return {
            error: false,
            msg: "Signed up successfully",
        };
    }

    // Hardcoded content manager account
    if (email === 'jaytron00ORL@gmail.com' && password === 'matchaMAN@123') {
        if (staySignedIn) {
            await StaySignedIn();
        }
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', name);
        localStorage.setItem('memberType', MemberType.ContentManager);
        return {
            error: false,
            msg: "Signed up successfully",
        };
    }

    try {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        
        if (credentials && credentials.user) {
            // Set localStorage immediately so user can proceed
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userName', name);
            localStorage.setItem('memberType', memberType);
            
            try {
                await sendEmailVerification(credentials.user);
            } catch (e) {
                console.warn("Email verification not sent:", e);
            }

            // Set up account in background (don't block on this)
            // Use Promise to handle async operations but with timeout
            const setupPromise = new Promise<void>((resolve) => {
                let resolved = false;
                const timeout = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        resolve();
                    }
                }, 5000); // 5 second timeout

                const unsub = onSnapshot(
                    doc(db, "users", credentials.user.uid),
                    async (userDoc) => {
                        if (resolved) return;
                        
                        if (userDoc.exists() && userDoc.data().email != null) {
                            resolved = true;
                            clearTimeout(timeout);
                            unsub();
                            
                            try {
                                const callable = httpsCallable(functions, "updateUser");
                                await callable({
                                    updatedProperties: {
                                        displayName: name,
                                    },
                                });

                                const setupAccount = httpsCallable(functions, "setupAccount");
                                await setupAccount({
                                    type_setup: "account_type",
                                    updatedProperties: {
                                        immutable: {
                                            memberType: memberType,
                                        },
                                    },
                                });
                            } catch (e) {
                                console.error("Error setting up account:", e);
                            }
                            
                            resolve();
                        }
                    },
                    (error) => {
                        console.error("Error in onSnapshot:", error);
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeout);
                            resolve();
                        }
                    }
                );
            });
            
            // Don't wait for setup to complete - just start it
            setupPromise.catch(console.error);
            
            if (staySignedIn) {
                StaySignedIn().catch(console.error);
            }
            
            return {
                error: false,
                msg: "Signed up successfully",
            };
        }

        return {
            error: false,
            msg: "Signed up successfully",
        };
    } catch (error: unknown) {
        const firebaseError = error as FirebaseError;
        console.error("SignUp error:", firebaseError.code, firebaseError.message);
        
        switch (firebaseError.code) {
            case 'auth/email-already-in-use':
                return {
                    error: true,
                    msg: "This email is already registered. Please sign in instead.",
                };
            case 'auth/invalid-email':
                return {
                    error: true,
                    msg: "Invalid email address format.",
                };
            case 'auth/operation-not-allowed':
                return {
                    error: true,
                    msg: "Email/password accounts are not enabled. Please contact support.",
                };
            case 'auth/weak-password':
                return {
                    error: true,
                    msg: "Password is too weak. Please use a stronger password.",
                };
            default:
                console.error("Unexpected error during signup:", firebaseError);
            return {
            error: true,
                    msg: `Signup failed: ${firebaseError.message || "Please try again."}`,
        };
        }
    }
}

export async function SignIn(
    email: string,
    password: string,
    staySignedIn: boolean
) {
    // Hardcoded test accounts
    if (email === 'dtable06@gmail.com' && password === 'zebra##45') {
        if (staySignedIn) {
            await StaySignedIn();
        }
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', 'Test User');
        localStorage.setItem('memberType', 'TeamMember');
        return {
            error: false,
            msg: "Signed in successfully",
        };
    }

    // Hardcoded manager account
    if (email === 'koifish789@gmail.com' && password === 'Watermelon$$78') {
        if (staySignedIn) {
            await StaySignedIn();
        }
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', 'Team Captain');
        localStorage.setItem('memberType', 'TeamCaptain');
                return {
            error: false,
            msg: "Signed in successfully",
        };
    }

    // Hardcoded content manager account
    if (email === 'jaytron00ORL@gmail.com' && password === 'matchaMAN@123') {
        if (staySignedIn) {
            await StaySignedIn();
        }
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', 'Content Manager');
        localStorage.setItem('memberType', 'ContentManager');
                return {
                    error: false,
                    msg: "Signed in successfully",
                };
            }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            // Get user data from Firestore
            try {
                const userRef = doc(db, "users", userCredential.user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', userData.email || email);
                    localStorage.setItem('userName', userData.displayName || userCredential.user.displayName || 'User');
                    localStorage.setItem('memberType', userData.immutable?.memberType || 'TeamMember');
                } else {
                    // Fallback to basic info
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', email);
                    localStorage.setItem('userName', userCredential.user.displayName || 'User');
                    localStorage.setItem('memberType', 'TeamMember');
                }
            } catch (e) {
                console.error("Error fetching user data:", e);
                // Still allow sign in
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userName', userCredential.user.displayName || 'User');
                localStorage.setItem('memberType', 'TeamMember');
            }
            
            if (staySignedIn) {
                await StaySignedIn();
            }
            return {
                error: false,
                msg: "Signed in successfully",
            };
        }
        return {
            error: true,
            msg: "Failed to sign in. Please try again.",
        };
    } catch (error) {
        console.error(error);
        return {
            error: true,
            msg: "Email/Password doesn't match. Please try again.",
        };
    }
}

export async function SignUpWithGoogle(
    staySignedIn: boolean,
    memberType: MemberType
) {
    try {
        const provider = new GoogleAuthProvider();
        const credentials = await signInWithPopup(auth, provider);
        
        if (credentials && credentials.user) {
            try {
                await sendEmailVerification(credentials.user);
            } catch (e) {
                console.warn("Email verification not sent:", e);
            }

            // Wait for user document to be created (with timeout)
            return new Promise((resolve) => {
                let resolved = false;
                const timeout = setTimeout(() => {
                    if (!resolved) {
                        resolved = true;
                        localStorage.setItem('isAuthenticated', 'true');
                        localStorage.setItem('userEmail', credentials.user.email || '');
                        localStorage.setItem('userName', credentials.user.displayName || 'User');
                        localStorage.setItem('memberType', memberType);
                        if (staySignedIn) {
                            StaySignedIn().catch(console.error);
                        }
                        resolve({
                            error: false,
                            msg: "Signed up successfully",
                        });
                    }
                }, 3000);

                const unsub = onSnapshot(
                    doc(db, "users", credentials.user.uid),
                    async (userDoc) => {
                        if (resolved) return;
                        
                        if (userDoc.exists() && userDoc.data().email != null) {
                            resolved = true;
                            clearTimeout(timeout);
                            unsub();
                            
                            try {
                                const setupAccount = httpsCallable(functions, "setupAccount");
                                await setupAccount({
                                    type_setup: "account_type",
                                    updatedProperties: {
                                        immutable: {
                                            memberType: memberType,
                                        },
                                    },
                                });
                            } catch (e) {
                                console.error("Error setting up account:", e);
                            }

                            if (staySignedIn) {
                                await StaySignedIn();
                            }
                            
                            localStorage.setItem('isAuthenticated', 'true');
                            localStorage.setItem('userEmail', credentials.user.email || '');
                            localStorage.setItem('userName', credentials.user.displayName || 'User');
                            localStorage.setItem('memberType', memberType);
                            
                            resolve({
                                error: false,
                                msg: "Signed up successfully",
                            });
                        }
                    },
                    (error) => {
                        console.error("Error in onSnapshot:", error);
                        if (!resolved) {
                            resolved = true;
                            clearTimeout(timeout);
                            localStorage.setItem('isAuthenticated', 'true');
                            localStorage.setItem('userEmail', credentials.user.email || '');
                            localStorage.setItem('userName', credentials.user.displayName || 'User');
                            localStorage.setItem('memberType', memberType);
                            if (staySignedIn) {
                                StaySignedIn().catch(console.error);
                            }
                            resolve({
                                error: false,
                                msg: "Signed up successfully",
                            });
                        }
                    }
                );
            });
        }

        return {
            error: false,
            msg: "Signed up successfully",
        };
    } catch (error) {
        console.error(error);
        return {
            error: true,
            msg: "An unexpected error occurred. Please try again.",
        };
    }
}

export async function SignInWithGoogle(staySignedIn: boolean) {
    try {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        
        if (userCredential.user) {
            // Get user data from Firestore
            try {
                const userRef = doc(db, "users", userCredential.user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', userData.email || userCredential.user.email || '');
                    localStorage.setItem('userName', userData.displayName || userCredential.user.displayName || 'User');
                    localStorage.setItem('memberType', userData.immutable?.memberType || 'TeamMember');
                } else {
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userEmail', userCredential.user.email || '');
                    localStorage.setItem('userName', userCredential.user.displayName || 'User');
                    localStorage.setItem('memberType', 'TeamMember');
                }
            } catch (e) {
                console.error("Error fetching user data:", e);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userEmail', userCredential.user.email || '');
                localStorage.setItem('userName', userCredential.user.displayName || 'User');
                localStorage.setItem('memberType', 'TeamMember');
            }
            
            if (staySignedIn) {
                await StaySignedIn();
            }
            return {
                error: false,
                msg: "Signed in successfully",
            };
        }
        return {
            error: true,
            msg: "Failed to sign in. Please try again.",
        };
    } catch (error) {
        console.error(error);
        return {
            error: true,
            msg: "An unexpected error occurred. Please try again.",
        };
    }
}
