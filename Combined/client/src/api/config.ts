import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const firebaseConfig = {
    apiKey: "AIzaSyAJFCpZLZngYJ4Ief7L88fGEZj0G1ZA3ag",
    authDomain: "skillswap-a3bc8.firebaseapp.com",
    projectId: "skillswap-a3bc8",
    storageBucket: "skillswap-a3bc8.firebasestorage.app",
    messagingSenderId: "402673625450",
    appId: "1:402673625450:web:1289a5f4b897ca93e51d13",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Connect to Firebase emulators only if explicitly enabled via environment variable
// This prevents the app from hanging if emulators aren't running
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATOR === 'true') {
    try {
        connectAuthEmulator(getAuth(), "http://localhost:9099", { disableWarnings: true });
        connectFirestoreEmulator(getFirestore(), "localhost", 8080);
        connectFunctionsEmulator(getFunctions(), "localhost", 5001);
        console.log("Using local Firebase emulators.");
    } catch (error: any) {
        // Ignore "already been called" errors
        if (error?.message?.includes('already been called')) {
            console.log("Firebase emulators already connected.");
        } else {
            console.warn("Failed to connect to Firebase emulators, using production:", error?.message);
        }
    }
}
