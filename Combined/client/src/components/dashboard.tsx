import DefaultLayout from "@/layouts/default";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Input } from "@nextui-org/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Select, SelectItem } from "@nextui-org/react";
import {
    IconArrowRight,
    IconPlus,
    IconSearch,
    IconClock,
    IconUser,
    IconCheck,
    IconStar,
    IconCalendar,
    IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth, functions } from "@/api/config";
import { httpsCallable } from "firebase/functions";
import { Skill } from "@/types/membertypes";
import { getUserSessionRequests, getUserSessionSchedules } from "@/api/sessionRequest";
import { SessionRequest, SessionStatus } from "@/types/session";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SKILL_CATEGORIES = [
    "Technology",
    "Design",
    "Business",
    "Language",
    "Music",
    "Art",
    "Sports",
    "Cooking",
    "Writing",
    "Other",
];

const PROFICIENCY_LEVELS = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
    { value: "expert", label: "Expert" },
];

export default function Dashboard() {
    const [authState, setAuthState] = useState(false);
    const [name, setName] = useState<string>("");
    const [skillsOffered, setSkillsOffered] = useState<Skill[]>([]);
    const [skillsSought, setSkillsSought] = useState<Skill[]>([]);
    const [pendingRequests, setPendingRequests] = useState<SessionRequest[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    // Skills management modal state
    const [showSkillsModal, setShowSkillsModal] = useState(false);
    const [skillType, setSkillType] = useState<"offered" | "sought">("offered");
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillCategory, setNewSkillCategory] = useState("");
    const [newSkillDescription, setNewSkillDescription] = useState("");
    const [newSkillProficiency, setNewSkillProficiency] = useState<"beginner" | "intermediate" | "advanced" | "expert">("beginner");
    const [savingSkills, setSavingSkills] = useState(false);

    useEffect(() => {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const userName = localStorage.getItem('userName');

        if (isAuthenticated === 'true' && userName) {
            setAuthState(true);
            setName(userName);
            loadDashboardData();
        } else {
            window.location.href = "/portal";
        }
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) return;

            // Load user profile
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setSkillsOffered(data.skillsOffered || []);
                setSkillsSought(data.skillsSought || []);
            } else {
                // If document doesn't exist, create it with empty skills
                setSkillsOffered([]);
                setSkillsSought([]);
            }

            // Load session requests
            const requestsResult = await getUserSessionRequests();
            if (!requestsResult.error && requestsResult.data) {
                const pending = requestsResult.data.filter(
                    (r: SessionRequest) => r.status === SessionStatus.PENDING
                );
                setPendingRequests(pending.slice(0, 5)); // Show latest 5
            }

            // Load upcoming sessions
            const schedulesResult = await getUserSessionSchedules();
            if (!schedulesResult.error && schedulesResult.data) {
                const upcoming = schedulesResult.data
                    .filter((s: any) => s.status === SessionStatus.ACCEPTED)
                    .slice(0, 5);
                setUpcomingSessions(upcoming);
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    const openSkillsModal = (type: "offered" | "sought") => {
        setSkillType(type);
        setShowSkillsModal(true);
        setNewSkillName("");
        setNewSkillCategory("");
        setNewSkillDescription("");
        setNewSkillProficiency("beginner");
    };

    const addSkill = async () => {
        if (!newSkillName.trim() || !newSkillCategory) {
            toast.error("Please fill in skill name and category");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            toast.error("You must be logged in to add skills");
            return;
        }

        try {
            setSavingSkills(true);
            const newSkill: Skill = {
                id: Date.now().toString(),
                name: newSkillName.trim(),
                category: newSkillCategory,
                description: newSkillDescription.trim() || undefined,
                proficiency: newSkillProficiency,
            };

            // Update local state
            if (skillType === "offered") {
                setSkillsOffered([...skillsOffered, newSkill]);
            } else {
                setSkillsSought([...skillsSought, newSkill]);
            }

            // Save to Firestore using Cloud Function
            try {
                const updateUserFunction = httpsCallable(functions, "updateUser");
                const updatedProperties = {
                    skillsOffered: skillType === "offered" ? [...skillsOffered, newSkill] : skillsOffered,
                    skillsSought: skillType === "sought" ? [...skillsSought, newSkill] : skillsSought,
                };

                await updateUserFunction({ updatedProperties });
                toast.success("Skill added successfully!");
                setShowSkillsModal(false);
                // Reset form
                setNewSkillName("");
                setNewSkillCategory("");
                setNewSkillDescription("");
                setNewSkillProficiency("beginner");
            } catch (cloudFunctionError: any) {
                console.warn("Cloud Function failed, trying direct Firestore write:", cloudFunctionError);
                // Fallback to direct Firestore write
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                const currentData = userDoc.exists() ? userDoc.data() : {};
                
                await setDoc(userRef, {
                    ...currentData,
                    skillsOffered: skillType === "offered" ? [...skillsOffered, newSkill] : (currentData.skillsOffered || []),
                    skillsSought: skillType === "sought" ? [...skillsSought, newSkill] : (currentData.skillsSought || []),
                }, { merge: true });
                
                toast.success("Skill added successfully!");
                setShowSkillsModal(false);
                setNewSkillName("");
                setNewSkillCategory("");
                setNewSkillDescription("");
                setNewSkillProficiency("beginner");
            }
        } catch (error: any) {
            console.error("Error adding skill:", error);
            // Revert local state on error
            if (skillType === "offered") {
                setSkillsOffered(skillsOffered);
            } else {
                setSkillsSought(skillsSought);
            }
            toast.error("Failed to add skill. Please try again.");
        } finally {
            setSavingSkills(false);
        }
    };

    const removeSkill = async (skillId: string, type: "offered" | "sought") => {
        const user = auth.currentUser;
        if (!user) {
            toast.error("You must be logged in to remove skills");
            return;
        }

        try {
            setSavingSkills(true);
            // Update local state
            if (type === "offered") {
                setSkillsOffered(skillsOffered.filter((s) => s.id !== skillId));
            } else {
                setSkillsSought(skillsSought.filter((s) => s.id !== skillId));
            }

            // Save to Firestore
            try {
                const updateUserFunction = httpsCallable(functions, "updateUser");
                const updatedProperties = {
                    skillsOffered: type === "offered" ? skillsOffered.filter((s) => s.id !== skillId) : skillsOffered,
                    skillsSought: type === "sought" ? skillsSought.filter((s) => s.id !== skillId) : skillsSought,
                };

                await updateUserFunction({ updatedProperties });
                toast.success("Skill removed successfully!");
            } catch (cloudFunctionError: any) {
                console.warn("Cloud Function failed, trying direct Firestore write:", cloudFunctionError);
                // Fallback to direct Firestore write
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                const currentData = userDoc.exists() ? userDoc.data() : {};
                
                await setDoc(userRef, {
                    ...currentData,
                    skillsOffered: type === "offered" ? skillsOffered.filter((s) => s.id !== skillId) : (currentData.skillsOffered || []),
                    skillsSought: type === "sought" ? skillsSought.filter((s) => s.id !== skillId) : (currentData.skillsSought || []),
                }, { merge: true });
                
                toast.success("Skill removed successfully!");
            }
        } catch (error: any) {
            console.error("Error removing skill:", error);
            // Revert local state on error
            if (type === "offered") {
                setSkillsOffered(skillsOffered);
            } else {
                setSkillsSought(skillsSought);
            }
            toast.error("Failed to remove skill. Please try again.");
        } finally {
            setSavingSkills(false);
        }
    };

    if (loading) {
        return (
            <DefaultLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p>Loading...</p>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <ToastContainer />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="flex items-start justify-between mb-8">
                    <div className="flex flex-col">
                        <div className="text-3xl font-bold mb-2">Welcome back, {name}!</div>
                        <div className="text-md font-thin">
                            Your SkillSwap dashboard - manage your skills and sessions
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/browse">
                            <Button color="primary" startContent={<IconSearch size={18} />}>
                                Browse Skills
                            </Button>
                        </Link>
                        <Button 
                            variant="bordered" 
                            startContent={<IconPlus size={18} />}
                            onPress={() => openSkillsModal("offered")}
                        >
                            Add Skills
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Skills Offered */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <IconStar size={20} />
                                <h3 className="text-xl font-semibold">Skills You Offer</h3>
                            </div>
                            <Button 
                                size="sm" 
                                variant="light"
                                onPress={() => openSkillsModal("offered")}
                            >
                                Manage
                            </Button>
                        </CardHeader>
                        <CardBody>
                            {skillsOffered.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-default-500 mb-4">No skills added yet</p>
                                    <Button 
                                        color="primary" 
                                        size="sm"
                                        onPress={() => openSkillsModal("offered")}
                                    >
                                        Add Skills
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {skillsOffered.slice(0, 8).map((skill) => (
                                        <Chip 
                                            key={skill.id} 
                                            color="primary" 
                                            variant="flat"
                                            onClose={() => removeSkill(skill.id, "offered")}
                                            endContent={<IconX size={14} />}
                                            className="cursor-pointer"
                                        >
                                            {skill.name}
                                        </Chip>
                                    ))}
                                    {skillsOffered.length > 8 && (
                                        <Chip variant="flat">+{skillsOffered.length - 8} more</Chip>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Skills Sought */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <IconClock size={20} />
                                <h3 className="text-xl font-semibold">Skills You're Learning</h3>
                            </div>
                            <Button 
                                size="sm" 
                                variant="light"
                                onPress={() => openSkillsModal("sought")}
                            >
                                Manage
                            </Button>
                        </CardHeader>
                        <CardBody>
                            {skillsSought.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-default-500 mb-4">No skills added yet</p>
                                    <Button 
                                        color="secondary" 
                                        size="sm"
                                        onPress={() => openSkillsModal("sought")}
                                    >
                                        Add Skills
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {skillsSought.slice(0, 8).map((skill) => (
                                        <Chip 
                                            key={skill.id} 
                                            color="secondary" 
                                            variant="flat"
                                            onClose={() => removeSkill(skill.id, "sought")}
                                            endContent={<IconX size={14} />}
                                            className="cursor-pointer"
                                        >
                                            {skill.name}
                                        </Chip>
                                    ))}
                                    {skillsSought.length > 8 && (
                                        <Chip variant="flat">+{skillsSought.length - 8} more</Chip>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Requests */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <IconClock size={20} />
                                <h3 className="text-xl font-semibold">Pending Requests</h3>
                            </div>
                            <Link to="/sessions">
                                <Button size="sm" variant="light">
                                    View All
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardBody>
                            {pendingRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-default-500 mb-4">No pending requests</p>
                                    <Link to="/browse">
                                        <Button color="primary" size="sm">
                                            Find Partners
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {pendingRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="p-3 border border-default-200 rounded-lg hover:bg-default-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <IconUser size={16} />
                                                        <span className="font-semibold">
                                                            {request.requesterId ===
                                                            (auth.currentUser?.uid ||
                                                                localStorage.getItem("userId"))
                                                                ? request.recipientName
                                                                : request.requesterName}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-default-600">
                                                        {request.skillOfferedName} ↔ {request.skillSoughtName}
                                                    </p>
                                                </div>
                                                {request.recipientId ===
                                                    (auth.currentUser?.uid ||
                                                        localStorage.getItem("userId")) && (
                                                    <div className="flex gap-1">
                                                        <Button
                                                            isIconOnly
                                                            size="sm"
                                                            color="success"
                                                            onPress={() => navigate("/sessions")}
                                                        >
                                                            <IconCheck size={16} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Upcoming Sessions */}
                    <Card>
                        <CardHeader className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <IconCalendar size={20} />
                                <h3 className="text-xl font-semibold">Upcoming Sessions</h3>
                            </div>
                            <Link to="/sessions">
                                <Button size="sm" variant="light">
                                    View All
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardBody>
                            {upcomingSessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-default-500 mb-4">No upcoming sessions</p>
                                    <Link to="/browse">
                                        <Button color="primary" size="sm">
                                            Find Sessions
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            className="p-3 border border-default-200 rounded-lg hover:bg-default-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold mb-1">{session.skillName}</h4>
                                                    <div className="flex items-center gap-3 text-sm text-default-600">
                                                        <span className="flex items-center gap-1">
                                                            <IconCalendar size={14} />
                                                            {session.scheduledDate?.toDate
                                                                ? session.scheduledDate
                                                                      .toDate()
                                                                      .toLocaleDateString()
                                                                : "TBD"}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <IconClock size={14} />
                                                            {session.scheduledTime}
                                                        </span>
                                                    </div>
                                                </div>
                                                <Link to="/sessions">
                                                    <Button size="sm" variant="light" startContent={<IconArrowRight size={14} />}>
                                                        View
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>

                {/* Skills Management Modal */}
                <Modal
                    isOpen={showSkillsModal}
                    onClose={() => setShowSkillsModal(false)}
                    size="lg"
                    scrollBehavior="inside"
                >
                    <ModalContent>
                        <ModalHeader>
                            Add {skillType === "offered" ? "Skill You Offer" : "Skill You Want to Learn"}
                        </ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Input
                                    label="Skill Name"
                                    value={newSkillName}
                                    onValueChange={setNewSkillName}
                                    placeholder={skillType === "offered" ? "e.g., JavaScript, Piano, Spanish" : "e.g., Python, Guitar, French"}
                                    isRequired
                                />
                                <Select
                                    label="Category"
                                    placeholder="Select a category"
                                    selectedKeys={newSkillCategory ? [newSkillCategory] : []}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        setNewSkillCategory(selected || "");
                                    }}
                                    isRequired
                                >
                                    {SKILL_CATEGORIES.map((cat) => (
                                        <SelectItem key={cat} value={cat}>
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Proficiency Level"
                                    placeholder="Select proficiency"
                                    selectedKeys={[newSkillProficiency]}
                                    onSelectionChange={(keys) => {
                                        const selected = Array.from(keys)[0] as string;
                                        setNewSkillProficiency(selected as typeof newSkillProficiency);
                                    }}
                                >
                                    {PROFICIENCY_LEVELS.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                                    <textarea
                                        className="w-full px-3 py-2 min-h-[80px] rounded-lg border border-default-200 bg-transparent text-foreground placeholder:text-default-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={newSkillDescription}
                                        onChange={(e) => setNewSkillDescription(e.target.value)}
                                        placeholder={skillType === "offered" ? "Brief description of your skill..." : "What level are you looking for?"}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={() => setShowSkillsModal(false)}>
                                Cancel
                            </Button>
                            <Button 
                                color="primary" 
                                onPress={addSkill}
                                isLoading={savingSkills}
                                isDisabled={!newSkillName.trim() || !newSkillCategory}
                            >
                                Add Skill
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </DefaultLayout>
    );
}