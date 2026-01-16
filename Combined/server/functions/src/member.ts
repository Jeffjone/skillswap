import { HttpsError, onCall } from "firebase-functions/v2/https";
import { error as logError } from "firebase-functions/logger";
import { firestore } from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { auth } from "firebase-functions";
import { MemberProperties, MemberType } from "./types/membertypes";

const store = firestore();

/**
 * Creates a userdata when a new Firebase authentication user is created.
 * @param user The newly created Firebase authentication user.
 * @returns A Promise that resolves when the user is created.
 */

export const onCreateNewUser = auth.user().onCreate(async (user) => {
    try {
        const memberProperties: MemberProperties = {
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            teams: [],
            skillsOffered: [],
            skillsSought: [],
            immutable: {
                memberType: MemberType.None,
            },
        };

        await store.collection("users").doc(user.uid).set(memberProperties);
        return memberProperties;
    } catch (error) {
        logError("[AuraHealth-Firebase]: Error creating new user", error);
        return new HttpsError("internal", "Error creating new user");
    }
});

/**
 * Deletes userdata when a Firebase authentication user is deleted.
 * @param user The deleted Firebase authentication user.
 * @returns A Promise that resolves when the user is deleted.
 */
export const onUserDelete = auth.user().onDelete(async (user) => {
    try {
        return await store.collection("users").doc(user.uid).delete();
    } catch (error) {
        logError("[AuraHealth-Firebase]: Error deleting user", error);
        return new HttpsError("internal", "Error deleting user");
    }
});

/**
 * Updates a user's properties.
 * @param request The request object containing the user's authentication information and updated properties.
 * @returns A Promise that resolves with the updated user object.
 */
export const updateUser = onCall(async (request) => {
    try {
        if (request.auth === undefined || request.auth.uid === undefined) {
            throw new HttpsError(
                "unauthenticated",
                "User is not authenticated."
            );
        }
        const userData = await store
            .collection("users")
            .doc(request.auth.uid)
            .get();
        if (!userData.exists) {
            throw new HttpsError("not-found", "User not found.");
        }

        console.log("Received updatedProperties:", request.data.updatedProperties);
        console.log("Full request data:", request.data);

        const userDataObj = userData.data();
        const updatedProperties = request.data.updatedProperties as Partial<MemberProperties>;
        
        // Build update object with only the properties that should be updated
        // Exclude immutable properties from updates - they should never change
        const { immutable, ...propertiesToUpdate } = updatedProperties;
        
        // Prepare the update data, removing undefined values (Firestore update() doesn't accept undefined)
        const updateData: any = {
            updatedAt: FieldValue.serverTimestamp(),
        };
        
        // Only include defined values in the update
        Object.keys(propertiesToUpdate).forEach((key) => {
            const value = (propertiesToUpdate as any)[key];
            if (value !== undefined && value !== null) {
                updateData[key] = value;
            }
        });
        
        // Ensure immutable is never overwritten
        if (immutable && userDataObj?.immutable) {
            // Only allow immutable updates if they're not already set (shouldn't happen, but be safe)
            console.warn("Attempted to update immutable properties - ignoring");
        }

        console.log("Updating user with:", updateData);
        await store.collection("users").doc(request.auth.uid).update(updateData);
        
        // Fetch the updated document to return (with server timestamp resolved)
        const updatedDoc = await store.collection("users").doc(request.auth.uid).get();
        return updatedDoc.data();
    } catch (error: any) {
        logError("[Homebowls-Firebase]: Error updating user", error);
        // If it's already an HttpsError, re-throw it
        if (error instanceof HttpsError) {
            throw error;
        }
        // Otherwise, throw a new HttpsError
        throw new HttpsError("internal", "Error updating user");
    }
});

/**
 * Sets up a user account based on the provided setup type.
 *
 * @param request - The request object containing authentication and data.
 * @returns The updated user properties or an error if the setup fails.
 *
 * @throws {HttpsError} If the user is not authenticated.
 * @throws {HttpsError} If the user is not found.
 * @throws {HttpsError} If the user account type is already set.
 * @throws {HttpsError} If required fields are missing in the request data.
 * @throws {HttpsError} If the setup type is invalid.
 * @throws {HttpsError} If there is an internal error during account setup.
 */
export const setupAccount = onCall(async (request) => {
    try {
        if (request.auth === undefined || request.auth.uid === undefined) {
            throw new HttpsError(
                "unauthenticated",
                "User is not authenticated."
            );
        }

        const userData = await store
            .collection("users")
            .doc(request.auth.uid)
            .get();
        if (!userData.exists) {
            throw new HttpsError("not-found", "User not found.");
        }

        const userDataObj = userData.data();
        const user: MemberProperties = userDataObj as MemberProperties;

        console.log(request.data);
        if (
            request.data === undefined ||
            request.data === null ||
            request.data.type_setup === undefined
        ) {
            throw new HttpsError("invalid-argument", "Missing required fields");
        }

        console.log(1);
        if (request.data.type_setup == "account_type") {
            if (user.immutable.memberType !== MemberType.None) {
                throw new HttpsError(
                    "already-exists",
                    "User account type already set"
                );
            }
            console.log(2);
            console.log(request.data);
            const updatedUser: MemberProperties = {
                ...user,
                immutable: {
                    ...user.immutable,
                    memberType: request.data.updatedProperties.immutable
                        .memberType as MemberType,
                },
            };

            console.log(3);
            await store
                .collection("users")
                .doc(request.auth.uid)
                .set(updatedUser);
            return updatedUser;
        }

        return new HttpsError("invalid-argument", "Invalid setup type");
    } catch (error) {
        logError("[Homebowls-Firebase]: Error setting up account", error);
        return new HttpsError("internal", "Error setting up account");
    }
});
