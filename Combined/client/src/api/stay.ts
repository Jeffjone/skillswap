import { auth } from "./config";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

export default async function StaySignedIn() {
    try {
        await setPersistence(auth, browserLocalPersistence);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
