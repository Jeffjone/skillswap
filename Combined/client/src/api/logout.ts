import { auth } from "./config";
import { signOut } from "firebase/auth";

export default async function Logout() {
    try {
        await signOut(auth);
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('memberType');
        return {
            error: false,
            msg: "Signed out successfully",
        };
    } catch (error) {
        console.error(error);
        return {
            error: true,
            msg: "An unexpected error occurred. Please try again.",
        };
    }
}
