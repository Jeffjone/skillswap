import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Switch } from "@nextui-org/switch";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import {
    IconUser,
    IconTrash,
    IconMail,
    IconPhone,
    IconShield,
    IconMapPin,
    IconLock,
    IconPhoto,
    IconCamera,
    IconStar,
} from "@tabler/icons-react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db, auth, functions } from "@/api/config";
import { httpsCallable } from "firebase/functions";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getUserRatingSummary } from "@/api/rating";


export default function ProfilePage() {
    const [userName, setUserName] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [bio, setBio] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [photoURL, setPhotoURL] = useState<string>("");
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [averageRating, setAverageRating] = useState<number>(0);
    const [totalRatings, setTotalRatings] = useState<number>(0);
    const [privacyMode, setPrivacyMode] = useState<boolean>(false);
    const [hideProfile, setHideProfile] = useState<boolean>(false);
    const [restrictMessaging, setRestrictMessaging] = useState<boolean>(false);
    const [hideContactInfo, setHideContactInfo] = useState<boolean>(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteCountdown, setDeleteCountdown] = useState(10);
    const [canDelete, setCanDelete] = useState(false);

    useEffect(() => {
        loadUserProfile();
    }, []);

    useEffect(() => {
        if (isDeleteModalOpen && !canDelete) {
            const interval = setInterval(() => {
                setDeleteCountdown((prev) => {
                    if (prev <= 1) {
                        setCanDelete(true);
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isDeleteModalOpen, canDelete]);

    const loadUserProfile = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;
            
            // Always try localStorage first as fallback
            const storedName = localStorage.getItem('userName');
            const storedEmail = localStorage.getItem('userEmail');
            
            if (!user) {
                // Fallback to localStorage only
                if (storedName) setUserName(storedName);
                if (storedEmail) setUserEmail(storedEmail);
                setLoading(false);
                return;
            }

            try {
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setUserName(data.displayName || storedName || "");
                    setUserEmail(data.email || storedEmail || "");
                    setBio(data.bio || "");
                    setLocation(data.location || "");
                    setPhoneNumber(data.phoneNumber || "");
                    setPhotoURL(data.photoURL || user.photoURL || "");
                    
                    // Load privacy settings
                    setPrivacyMode(data.privacyMode || false);
                    setHideProfile(data.hideProfile || false);
                    setRestrictMessaging(data.restrictMessaging || false);
                    setHideContactInfo(data.hideContactInfo || false);
                    
                    // Load rating summary (don't block on error)
                    getUserRatingSummary(user.uid).then(ratingResult => {
                        if (!ratingResult.error && ratingResult.data) {
                            setAverageRating(ratingResult.data.averageRating);
                            setTotalRatings(ratingResult.data.totalRatings);
                        }
                    }).catch(console.error);
                } else {
                    // Document doesn't exist yet - use localStorage or create defaults
                    setUserName(storedName || user.displayName || "");
                    setUserEmail(storedEmail || user.email || "");
                    // Create a basic profile document
                    try {
                        await updateDoc(doc(db, "users", user.uid), {
                            email: user.email || "",
                            displayName: storedName || user.displayName || "",
                            bio: "",
                            location: "",
                            phoneNumber: "",
                            photoURL: user.photoURL || "",
                            privacyMode: false,
                            hideProfile: false,
                            restrictMessaging: false,
                            hideContactInfo: false,
                        });
                    } catch (e) {
                        console.warn("Could not create profile document:", e);
                    }
                }
            } catch (firestoreError) {
                console.warn("Firestore error, using localStorage:", firestoreError);
                // Use localStorage as fallback
                if (storedName) setUserName(storedName);
                if (storedEmail) setUserEmail(storedEmail);
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            // Don't show error toast, just use localStorage fallback
            const storedName = localStorage.getItem('userName');
            const storedEmail = localStorage.getItem('userEmail');
            if (storedName) setUserName(storedName);
            if (storedEmail) setUserEmail(storedEmail);
        } finally {
            setLoading(false);
        }
    };

    const saveProfile = async () => {
        try {
            setSaving(true);
            const user = auth.currentUser;
            if (!user) {
                toast.error("You must be logged in to save your profile");
                setSaving(false);
                return;
            }

            // Prepare profile data (don't include updatedAt - let backend set it)
            const profileData = {
                email: user.email || userEmail,
                displayName: userName,
                bio: bio || "",
                privacyMode: privacyMode || false,
                hideProfile: hideProfile || false,
                restrictMessaging: restrictMessaging || false,
                hideContactInfo: hideContactInfo || false,
                location: location || "",
                phoneNumber: phoneNumber || "",
                photoURL: photoURL || "",
                // Don't send updatedAt - backend will set it with serverTimestamp
            };

            // Try using Firebase Cloud Function first (preferred method)
            try {
                const updateUserFunction = httpsCallable(functions, "updateUser");
                console.log("Calling updateUser Cloud Function with data:", profileData);
                
                const result = await updateUserFunction({ updatedProperties: profileData });
                console.log("Cloud Function success:", result);
                
                // Update auth profile photoURL if it changed
                if (photoURL && photoURL !== user.photoURL) {
                    try {
                        await updateProfile(user, { photoURL });
                    } catch (photoError) {
                        console.warn("Failed to update auth photoURL:", photoError);
                        // Don't fail the whole operation if photo update fails
                    }
                }

                // Update localStorage
                localStorage.setItem('userName', userName);
                if (user.email) localStorage.setItem('userEmail', user.email);

                toast.success("Profile updated successfully!");
                return; // Exit early on success
            } catch (cloudFunctionError: any) {
                console.error("Cloud Function error details:", {
                    code: cloudFunctionError?.code,
                    message: cloudFunctionError?.message,
                    details: cloudFunctionError?.details,
                    stack: cloudFunctionError?.stack
                });
                
                // If it's a permission error or function not found, try direct Firestore write
                if (cloudFunctionError?.code === 'permission-denied' || 
                    cloudFunctionError?.code === 'not-found' ||
                    cloudFunctionError?.code === 'unavailable') {
                    console.log("Cloud Function unavailable, trying direct Firestore write...");
                    
                    try {
                        const userRef = doc(db, "users", user.uid);
                        
                        // Use setDoc with merge to create document if it doesn't exist
                        // Firestore will handle the timestamp automatically
                        await setDoc(userRef, profileData, { merge: true });
                        console.log("Direct Firestore write successful");

                        // Update auth profile photoURL if it changed
                        if (photoURL && photoURL !== user.photoURL) {
                            try {
                                await updateProfile(user, { photoURL });
                            } catch (photoError) {
                                console.warn("Failed to update auth photoURL:", photoError);
                            }
                        }

                        // Update localStorage
                        localStorage.setItem('userName', userName);
                        if (user.email) localStorage.setItem('userEmail', user.email);
                        
                        toast.success("Profile updated successfully!");
                        return; // Exit early on success
                    } catch (firestoreError: any) {
                        console.error("Direct Firestore write also failed:", firestoreError);
                        // Re-throw to be caught by outer catch
                        throw firestoreError;
                    }
                } else {
                    // For other errors, re-throw to be caught by outer catch
                    throw cloudFunctionError;
                }
            }
        } catch (error: any) {
            console.error("Error saving profile - Full error:", error);
            console.error("Error code:", error?.code);
            console.error("Error message:", error?.message);
            
            // Provide more specific error message based on error type
            let errorMsg = "Failed to save profile. Please try again.";
            
            if (error?.code === 'permission-denied') {
                errorMsg = "Permission denied. Please ensure you're logged in and try again. If the issue persists, the Firestore rules may need to be deployed.";
            } else if (error?.code === 'unauthenticated') {
                errorMsg = "You must be logged in to save your profile. Please sign in and try again.";
            } else if (error?.code === 'not-found') {
                errorMsg = "User profile not found. Please contact support.";
            } else if (error?.code === 'unavailable') {
                errorMsg = "Service temporarily unavailable. Please try again in a moment.";
            } else if (error?.message) {
                errorMsg = error.message;
            }
            
            toast.error(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        try {
            setUploadingPhoto(true);
            const user = auth.currentUser;
            if (!user) {
                toast.error("You must be logged in to upload a photo");
                return;
            }

            const storage = getStorage();
            const storageRef = ref(storage, `profile-pictures/${user.uid}/${Date.now()}_${file.name}`);
            
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            
            setPhotoURL(downloadURL);
            toast.success("Photo uploaded successfully! Don't forget to save your profile.");
        } catch (error: any) {
            console.error("Error uploading photo:", error);
            toast.error("Failed to upload photo. Please try again.");
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <DefaultLayout>
            <ToastContainer />
            <div className="max-w-4xl mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

                <Tabs aria-label="Profile Options" color="secondary">
                    <Tab
                        key="personal"
                        title={
                            <div className="flex items-center space-x-2">
                                <IconUser size={20} />
                                <span>Personal Information</span>
                            </div>
                        }
                    >
                        <Card className="mt-4">
                            <CardBody className="gap-4">
                                {totalRatings > 0 && (
                                    <div className="mb-4 p-4 bg-default-100 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <IconStar size={24} className="text-yellow-400" fill="currentColor" />
                                                <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
                                            </div>
                                            <div className="text-sm text-default-600">
                                                Based on {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="Full Name"
                                        value={userName}
                                        onValueChange={setUserName}
                                        startContent={<IconUser className="text-default-400" />}
                                        isDisabled={loading}
                                    />
                                    <Input
                                        label="Email"
                                        value={userEmail}
                                        startContent={<IconMail className="text-default-400" />}
                                        isReadOnly
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={phoneNumber}
                                        onValueChange={setPhoneNumber}
                                        placeholder="+1 (555) 000-0000"
                                        startContent={<IconPhone className="text-default-400" />}
                                        isDisabled={loading}
                                    />
                                    <Input
                                        label="Location"
                                        value={location}
                                        onValueChange={setLocation}
                                        placeholder="City, State"
                                        startContent={<IconMapPin className="text-default-400" />}
                                        isDisabled={loading}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Bio</label>
                                    <textarea
                                        className="w-full px-3 py-2 min-h-[100px] rounded-lg border border-default-200 bg-transparent text-foreground placeholder:text-default-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                        disabled={loading}
                                        rows={4}
                                    />
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button color="primary" onPress={saveProfile} isLoading={saving}>
                                        Save Changes
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    <Tab
                        key="personalization"
                        title={
                            <div className="flex items-center space-x-2">
                                <IconPhoto size={20} />
                                <span>Personalization</span>
                            </div>
                        }
                    >
                        <Card className="mt-4">
                            <CardHeader>
                                <h3 className="text-xl font-semibold">Profile Personalization</h3>
                            </CardHeader>
                            <CardBody className="gap-6">
                                {/* Profile Picture Section */}
                                <div className="space-y-4">
                                    <h4 className="text-lg font-semibold flex items-center gap-2">
                                        <IconCamera size={20} />
                                        Profile Picture
                                    </h4>
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div 
                                                className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold overflow-hidden"
                                                style={{
                                                    backgroundImage: photoURL ? `url(${photoURL})` : undefined,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                }}
                                            >
                                                {!photoURL && (userName ? userName.charAt(0).toUpperCase() : "?")}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium mb-2">
                                                    Upload a new profile picture
                                                </label>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handlePhotoUpload}
                                                    className="hidden"
                                                    id="photo-upload"
                                                    disabled={uploadingPhoto}
                                                />
                                                <Button
                                                    as="label"
                                                    htmlFor="photo-upload"
                                                    color="primary"
                                                    variant="bordered"
                                                    startContent={<IconPhoto size={18} />}
                                                    isLoading={uploadingPhoto}
                                                    isDisabled={uploadingPhoto}
                                                    className="cursor-pointer"
                                                >
                                                    {uploadingPhoto ? "Uploading..." : "Choose Photo"}
                                                </Button>
                                                <p className="text-xs text-default-500 mt-2">
                                                    Supported formats: JPG, PNG, GIF (Max 5MB)
                                                </p>
                                            </div>
                                            {photoURL && (
                                                <Button
                                                    color="danger"
                                                    variant="light"
                                                    size="sm"
                                                    onPress={() => setPhotoURL("")}
                                                >
                                                    Remove Photo
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-default-200 pt-4">
                                    <div className="text-sm text-default-600">
                                        <p className="mb-2">
                                            <strong>Tip:</strong> Your profile picture will be visible to other users when they view your profile or see you in search results.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button color="primary" onPress={saveProfile} isLoading={saving}>
                                        Save Changes
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>

                    <Tab
                        key="privacy"
                        title={
                            <div className="flex items-center space-x-2">
                                <IconShield size={20} />
                                <span>Privacy & Security</span>
                            </div>
                        }
                    >
                        <Card className="mt-4">
                            <CardBody className="gap-4">
                                <div className="space-y-6">
                                    {/* Privacy Settings for Younger Users */}
                                    <div>
                                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                            <IconLock size={24} />
                                            Privacy Settings
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-4 bg-default-100 dark:bg-default-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold mb-1">Enhanced Privacy Mode</h4>
                                                    <p className="text-sm text-default-600">
                                                        Enable additional privacy protections for younger users
                                                    </p>
                                                </div>
                                                <Switch
                                                    isSelected={privacyMode}
                                                    onValueChange={setPrivacyMode}
                                                    color="primary"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-default-100 dark:bg-default-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold mb-1">Hide Profile from Search</h4>
                                                    <p className="text-sm text-default-600">
                                                        Your profile won't appear in search results or browse pages
                                                    </p>
                                                </div>
                                                <Switch
                                                    isSelected={hideProfile}
                                                    onValueChange={setHideProfile}
                                                    color="primary"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-default-100 dark:bg-default-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold mb-1">Restrict Messaging</h4>
                                                    <p className="text-sm text-default-600">
                                                        Only accept messages from users you've had sessions with
                                                    </p>
                                                </div>
                                                <Switch
                                                    isSelected={restrictMessaging}
                                                    onValueChange={setRestrictMessaging}
                                                    color="primary"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 bg-default-100 dark:bg-default-50 rounded-lg">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold mb-1">Hide Contact Information</h4>
                                                    <p className="text-sm text-default-600">
                                                        Keep your email, phone, and location private
                                                    </p>
                                                </div>
                                                <Switch
                                                    isSelected={hideContactInfo}
                                                    onValueChange={setHideContactInfo}
                                                    color="primary"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-default-200 dark:border-default-100 pt-6">
                                        <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                                            <h3 className="font-semibold text-danger mb-2">Delete Account</h3>
                                            <p className="text-sm text-default-500 mb-4">
                                                Once you delete your account, there is no going back. Please be certain.
                                            </p>
                                            <Button
                                                color="danger"
                                                variant="flat"
                                                startContent={<IconTrash size={20} />}
                                                onPress={() => {
                                                    setIsDeleteModalOpen(true);
                                                    setDeleteCountdown(10);
                                                    setCanDelete(false);
                                                }}
                                            >
                                                Delete Account
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4">
                                    <Button color="primary" onPress={saveProfile} isLoading={saving}>
                                        Save Changes
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>

            {/* Delete Account Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setDeleteCountdown(10);
                    setCanDelete(false);
                }}
                size="lg"
                isDismissable={false}
                hideCloseButton={!canDelete}
            >
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">
                        <span className="text-danger text-xl font-bold">⚠️ Delete Account</span>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <p className="text-lg font-semibold">This action cannot be undone!</p>
                            <p className="text-default-600">
                                Deleting your account will permanently remove:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-default-600 ml-4">
                                <li>Your profile and all personal information</li>
                                <li>All your skills and session history</li>
                                <li>Your messages and conversations</li>
                                <li>All ratings and reviews you've received</li>
                            </ul>
                            <div className="p-4 bg-danger-50 dark:bg-danger-900/20 rounded-lg mt-4">
                                <p className="text-sm text-danger font-semibold mb-2">
                                    Please confirm you understand this action:
                                </p>
                                <p className="text-sm text-danger">
                                    {canDelete ? (
                                        "✅ You can now confirm deletion"
                                    ) : (
                                        `⏳ Please wait ${deleteCountdown} seconds before you can confirm...`
                                    )}
                                </p>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            color="default"
                            variant="light"
                            onPress={() => {
                                setIsDeleteModalOpen(false);
                                setDeleteCountdown(10);
                                setCanDelete(false);
                            }}
                            isDisabled={!canDelete}
                        >
                            Cancel
                        </Button>
                        <Button
                            color="danger"
                            onPress={async () => {
                                try {
                                    const user = auth.currentUser;
                                    if (user) {
                                        // Delete user from Firebase Auth
                                        await user.delete();
                                        // Note: User document will be deleted by Firebase trigger
                                        // Clear localStorage
                                        localStorage.removeItem('isAuthenticated');
                                        localStorage.removeItem('userEmail');
                                        localStorage.removeItem('userName');
                                        localStorage.removeItem('memberType');
                                        toast.success("Account deleted successfully");
                                        // Redirect to home
                                        window.location.href = "/";
                                    }
                                } catch (error: any) {
                                    console.error("Error deleting account:", error);
                                    toast.error(error.message || "Failed to delete account");
                                }
                            }}
                            isDisabled={!canDelete}
                            startContent={<IconTrash size={20} />}
                        >
                            {canDelete ? "Delete My Account Forever" : `Wait ${deleteCountdown}s`}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </DefaultLayout>
    );
}