import { auth } from "./config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./config";
import { MemberProperties, MemberType } from "@/types/membertypes";

export default async function User() {
    const data: MemberProperties = {
        email: "",
        displayName: "",
        teams: [],
        photoURL: "",
        skillsOffered: [],
        skillsSought: [],
        immutable: {
            memberType: MemberType.TeamMember,
        },
    };

    const getData = new Promise<MemberProperties | null>((resolve, reject) => {
        let resolved = false;
        
        // Set a timeout to prevent hanging
        const timeout = setTimeout(() => {
            if (!resolved) {
                resolved = true;
                console.log("User check timeout, user not authenticated");
                resolve(null);
            }
        }, 3000);

        const unsubscribe = onAuthStateChanged(
            auth,
            async (user) => {
                if (resolved) return;
                
                try {
                    if (user) {
                        const userRef = doc(db, "users", user.uid);
                        const userDoc = await getDoc(userRef);
                        if (userDoc.exists()) {
                            const userData = userDoc.data();
                            data.email = userData.email ?? "";
                            data.displayName = userData.displayName ?? "";
                            data.photoURL = userData.photoURL ?? "";
                            data.teams = userData?.teams || [];
                            data.immutable = userData?.immutable || {
                                memberType: MemberType.TeamMember,
                            };
                            resolved = true;
                            clearTimeout(timeout);
                            resolve(data);
                            unsubscribe();
                            return;
                        }
                    }
                    // No user authenticated
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(null);
                    unsubscribe();
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        reject(error);
                        unsubscribe();
                    }
                }
            },
            (error) => {
                console.error("Auth state error:", error);
                if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    resolve(null);
                }
            }
        );
    });

    const result: any = await getData;
    return result;
}
