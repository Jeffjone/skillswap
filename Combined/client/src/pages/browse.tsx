import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Select, SelectItem } from "@nextui-org/react";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import {
    IconSearch,
    IconUser,
    IconMapPin,
    IconStar,
    IconClock,
    IconCheck,
} from "@tabler/icons-react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db, auth } from "@/api/config";
import { Skill } from "@/types/membertypes";
import { createSessionRequest, CreateSessionRequestParams } from "@/api/sessionRequest";
import { SessionType } from "@/types/session";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

// Demo users for showcase when Firestore fails or is empty
const DEMO_USERS: UserProfile[] = [
    {
        id: "demo1",
        displayName: "Alex Chen",
        email: "alex@example.com",
        bio: "Computer Science student at State University. Love web development and want to help others learn programming!",
        location: "San Francisco, CA",
        skillsOffered: [
            { id: "1", name: "JavaScript", category: "Technology", proficiency: "intermediate", description: "Learned React and Node.js in my courses" },
            { id: "2", name: "Python", category: "Technology", proficiency: "intermediate", description: "Good with data science libraries" }
        ],
        skillsSought: [
            { id: "3", name: "Guitar", category: "Music", proficiency: "beginner", description: "Just starting to learn acoustic guitar" },
            { id: "4", name: "Spanish", category: "Language", proficiency: "beginner", description: "Want to practice conversational Spanish" }
        ]
    },
    {
        id: "demo2",
        displayName: "Sarah Johnson",
        email: "sarah@example.com",
        bio: "Design student working on my portfolio. Excited to share what I've learned and learn from others!",
        location: "New York, NY",
        skillsOffered: [
            { id: "5", name: "UI/UX Design", category: "Design", proficiency: "intermediate", description: "Taking design courses, know Figma well" },
            { id: "6", name: "Photoshop", category: "Design", proficiency: "intermediate", description: "Been learning photo editing in my free time" }
        ],
        skillsSought: [
            { id: "7", name: "Coding", category: "Technology", proficiency: "beginner", description: "Want to learn web development basics" },
            { id: "8", name: "French", category: "Language", proficiency: "beginner", description: "Starting French classes next semester" }
        ]
    },
    {
        id: "demo3",
        displayName: "Michael Park",
        email: "michael@example.com",
        bio: "Music major in my second year. Played guitar since high school and love sharing music with others.",
        location: "Los Angeles, CA",
        skillsOffered: [
            { id: "9", name: "Guitar", category: "Music", proficiency: "advanced", description: "Can play acoustic and electric, learning jazz" },
            { id: "10", name: "Music Production", category: "Music", proficiency: "intermediate", description: "Learning Ableton in my music tech classes" }
        ],
        skillsSought: [
            { id: "11", name: "Video Editing", category: "Design", proficiency: "beginner", description: "Need help with Premiere Pro for video projects" },
            { id: "12", name: "Korean", category: "Language", proficiency: "beginner", description: "Want to learn Korean to talk with family" }
        ]
    },
    {
        id: "demo4",
        displayName: "Emily Rodriguez",
        email: "emily@example.com",
        bio: "International student studying languages. Native Spanish speaker happy to help others learn!",
        location: "Miami, FL",
        skillsOffered: [
            { id: "13", name: "Spanish", category: "Language", proficiency: "advanced", description: "Native speaker, can help with conversation" },
            { id: "14", name: "French", category: "Language", proficiency: "intermediate", description: "Taking French courses, conversational level" },
            { id: "15", name: "Portuguese", category: "Language", proficiency: "intermediate", description: "Learning Portuguese, intermediate level" }
        ],
        skillsSought: [
            { id: "16", name: "Web Design", category: "Design", proficiency: "beginner", description: "Want to learn HTML/CSS for personal projects" },
            { id: "17", name: "Piano", category: "Music", proficiency: "beginner", description: "Always wanted to learn piano basics" }
        ]
    },
    {
        id: "demo5",
        displayName: "David Kim",
        email: "david@example.com",
        bio: "CS sophomore who loves building web apps. Part of the coding club and always excited to share knowledge!",
        location: "Seattle, WA",
        skillsOffered: [
            { id: "18", name: "React", category: "Technology", proficiency: "intermediate", description: "Built a few projects with React and Next.js" },
            { id: "19", name: "Node.js", category: "Technology", proficiency: "intermediate", description: "Learned Express and MongoDB in my backend class" }
        ],
        skillsSought: [
            { id: "20", name: "Guitar", category: "Music", proficiency: "beginner", description: "Want to learn acoustic guitar as a hobby" },
            { id: "21", name: "Cooking", category: "Cooking", proficiency: "beginner", description: "Learning to cook Korean food for meal prep" }
        ]
    }
];

interface UserProfile {
    id: string;
    displayName: string;
    email: string;
    bio?: string;
    location?: string;
    photoURL?: string;
    skillsOffered: Skill[];
    skillsSought: Skill[];
    isCurrentUser?: boolean;
}

export default function BrowsePage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSkill, setSelectedSkill] = useState("");
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
    const [selectedOfferedSkill, setSelectedOfferedSkill] = useState<Skill | null>(null);
    const [selectedSoughtSkill, setSelectedSoughtSkill] = useState<Skill | null>(null);
    const [proposedDate, setProposedDate] = useState("");
    const [proposedTime, setProposedTime] = useState("");
    const [duration, setDuration] = useState(60);
    const [location, setLocation] = useState("");
    const [meetingLink, setMeetingLink] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const categories = [
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

    // Skills mapping by category
    const skillsByCategory: Record<string, string[]> = {
        "Technology": ["Coding", "JavaScript", "Python", "React", "Node.js", "Web Development", "Data Science", "Mobile Development"],
        "Design": ["UI/UX Design", "Graphic Design", "Photoshop", "Illustrator", "Figma", "Web Design", "Video Editing"],
        "Business": ["Marketing", "Finance", "Entrepreneurship", "Business Strategy", "Accounting", "Sales"],
        "Language": ["Spanish", "French", "Mandarin", "Japanese", "German", "Korean", "Portuguese", "Italian"],
        "Music": ["Guitar", "Piano", "Violin", "Drums", "Music Production", "Singing", "DJing", "Songwriting"],
        "Art": ["Drawing", "Painting", "Sculpture", "Photography", "Digital Art", "Calligraphy"],
        "Sports": ["Basketball", "Tennis", "Swimming", "Yoga", "Martial Arts", "Running", "Cycling"],
        "Cooking": ["Baking", "Italian Cuisine", "Asian Cuisine", "Vegetarian Cooking", "Meal Prep", "Pastry"],
        "Writing": ["Creative Writing", "Copywriting", "Technical Writing", "Poetry", "Journalism"],
        "Other": ["Other"]
    };

    const availableSkills = selectedCategory ? (skillsByCategory[selectedCategory] || []) : [];

    useEffect(() => {
        loadUsers();
    }, [searchTerm, selectedCategory, selectedSkill]);

    // Reset skill selection when category changes
    useEffect(() => {
        setSelectedSkill("");
    }, [selectedCategory]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const currentUser = auth.currentUser;
            let usersList: UserProfile[] = [];

            // Try to load from Firestore first
            try {
                if (currentUser) {
                    let q = query(collection(db, "users"), limit(50));
                    const snapshot = await getDocs(q);

                    snapshot.forEach((doc) => {
                        const data = doc.data();
                        const user: UserProfile = {
                            id: doc.id,
                            displayName: data.displayName || "Anonymous",
                            email: data.email || "",
                            bio: data.bio,
                            location: data.location,
                            photoURL: data.photoURL,
                            skillsOffered: data.skillsOffered || [],
                            skillsSought: data.skillsSought || [],
                            isCurrentUser: doc.id === currentUser.uid, // Mark current user
                        };
                        // Include all users (current user too, so they can see themselves)
                        usersList.push(user);
                    });
                }
            } catch (firestoreError) {
                console.warn("Firestore query failed, using demo users:", firestoreError);
            }

            // If no users from Firestore, use demo users
            if (usersList.length === 0) {
                usersList = [...DEMO_USERS];
            } else {
                // Add demo users to the list for variety
                usersList = [...usersList, ...DEMO_USERS];
            }

            // Apply filters
            let filteredUsers = usersList;

            // Filter by search term
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                filteredUsers = filteredUsers.filter(user => {
                    return user.displayName.toLowerCase().includes(searchLower) ||
                        user.bio?.toLowerCase().includes(searchLower) ||
                        user.skillsOffered.some((s) => s.name.toLowerCase().includes(searchLower)) ||
                        user.skillsSought.some((s) => s.name.toLowerCase().includes(searchLower));
                });
            }

            // Filter by category
            if (selectedCategory) {
                filteredUsers = filteredUsers.filter(user => {
                    return user.skillsOffered.some((s) => s.category === selectedCategory) ||
                        user.skillsSought.some((s) => s.category === selectedCategory);
                });
            }

            // Filter by skill name
            if (selectedSkill) {
                filteredUsers = filteredUsers.filter(user => {
                    return user.skillsOffered.some((s) => s.name === selectedSkill) ||
                        user.skillsSought.some((s) => s.name === selectedSkill);
                });
            }

            setUsers(filteredUsers);
        } catch (error) {
            console.error("Error loading users:", error);
            // Use demo users as fallback
            setUsers(DEMO_USERS);
        } finally {
            setLoading(false);
        }
    };

    const openRequestModal = (user: UserProfile) => {
        setSelectedUser(user);
        setSelectedOfferedSkill(null);
        setSelectedSoughtSkill(null);
        setProposedDate("");
        setProposedTime("");
        setDuration(60);
        setLocation("");
        setMeetingLink("");
        setDescription("");
        setShowRequestModal(true);
    };

    const handleSendRequest = async () => {
        if (!selectedUser || !selectedOfferedSkill || !selectedSoughtSkill) {
            toast.error("Please select both skills");
            return;
        }

        if (!proposedDate || !proposedTime) {
            toast.error("Please select date and time");
            return;
        }

        // Validate date and time - ensure it's not in the past
        const selectedDateTime = new Date(`${proposedDate}T${proposedTime}`);
        const now = new Date();
        
        if (selectedDateTime <= now) {
            toast.error("Please select a date and time in the future");
            return;
        }

        try {
            setSubmitting(true);
            
            // Combine date and time into a single ISO string for proper serialization
            const dateTimeString = `${proposedDate}T${proposedTime}:00`;
            
            const params: CreateSessionRequestParams = {
                recipientId: selectedUser.id,
                skillOfferedId: selectedOfferedSkill.id,
                skillOfferedName: selectedOfferedSkill.name,
                skillSoughtId: selectedSoughtSkill.id,
                skillSoughtName: selectedSoughtSkill.name,
                sessionType: SessionType.SKILL_EXCHANGE,
                proposedDate: new Date(dateTimeString), // This will be serialized as ISO string
                proposedTime,
                duration,
                location: location || undefined,
                meetingLink: meetingLink || undefined,
                description: description || undefined,
            };

            console.log("Sending session request with params:", params);
            const result = await createSessionRequest(params);
            if (!result.error) {
                toast.success("Session request sent successfully!");
                setShowRequestModal(false);
                // Reset form
                setProposedDate("");
                setProposedTime("");
                setLocation("");
                setMeetingLink("");
                setDescription("");
                setSelectedOfferedSkill(null);
                setSelectedSoughtSkill(null);
            } else {
                console.error("Session request error:", result.msg);
                toast.error(result.msg || "Failed to send session request");
            }
        } catch (error: any) {
            console.error("Session request exception:", error);
            toast.error(error?.message || "Failed to send session request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <DefaultLayout>
            <ToastContainer />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-4">Browse Skill Partners</h1>
                    <div className="flex gap-4 mb-4 flex-wrap">
                        <Input
                            placeholder="Search by name, skill, or bio..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            startContent={<IconSearch className="text-default-400" />}
                            className="flex-1 min-w-[200px]"
                        />
                        <Select
                            label="Category"
                            placeholder="All Categories"
                            selectedKeys={selectedCategory ? [selectedCategory] : []}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                setSelectedCategory(selected || "");
                            }}
                            className="min-w-[150px]"
                            variant="bordered"
                        >
                            <SelectItem key="" value="">
                                All Categories
                            </SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                    {cat}
                                </SelectItem>
                            )) as any}
                        </Select>
                        <Select
                            label="Skill"
                            placeholder="All Skills"
                            selectedKeys={selectedSkill ? [selectedSkill] : []}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                setSelectedSkill(selected || "");
                            }}
                            isDisabled={!selectedCategory}
                            className="min-w-[150px]"
                            variant="bordered"
                        >
                            <SelectItem key="" value="">
                                All Skills
                            </SelectItem>
                            {availableSkills.map((skill) => (
                                <SelectItem key={skill} value={skill}>
                                    {skill}
                                </SelectItem>
                            )) as any}
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <p className="text-center py-8">Loading users...</p>
                ) : users.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <p className="text-default-500 mb-4">No users found</p>
                            <Button color="primary" onPress={() => {
                                setSearchTerm("");
                                setSelectedCategory("");
                                setSelectedSkill("");
                            }}>
                                Clear Filters
                            </Button>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {users.map((user) => (
                            <Card key={user.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: "linear-gradient(90deg, #38b6ff, #0099e6)" }}>
                                            {user.displayName.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{user.displayName}</h3>
                                                {user.isCurrentUser && (
                                                    <Chip size="sm" color="primary" variant="flat">
                                                        <IconCheck size={12} className="mr-1" />
                                                        You
                                                    </Chip>
                                                )}
                                            </div>
                                            {user.location && (
                                                <div className="flex items-center gap-1 text-sm text-default-500">
                                                    <IconMapPin size={14} />
                                                    {user.location}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    {user.bio && <p className="text-sm text-default-600 mb-4">{user.bio}</p>}

                                    {user.skillsOffered.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                <IconStar size={16} /> Skills Offered
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skillsOffered.slice(0, 3).map((skill) => (
                                                    <Chip key={skill.id} size="sm" color="primary" variant="flat">
                                                        {skill.name}
                                                    </Chip>
                                                ))}
                                                {user.skillsOffered.length > 3 && (
                                                    <Chip size="sm" variant="flat">
                                                        +{user.skillsOffered.length - 3}
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {user.skillsSought.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                                                <IconClock size={16} /> Skills Sought
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {user.skillsSought.slice(0, 3).map((skill) => (
                                                    <Chip key={skill.id} size="sm" color="secondary" variant="flat">
                                                        {skill.name}
                                                    </Chip>
                                                ))}
                                                {user.skillsSought.length > 3 && (
                                                    <Chip size="sm" variant="flat">
                                                        +{user.skillsSought.length - 3}
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        color="primary"
                                        className="w-full mt-4"
                                        onPress={() => openRequestModal(user)}
                                    >
                                        Request Session
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                {showRequestModal && selectedUser && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <CardHeader>
                                <div className="flex justify-between items-center w-full">
                                    <h2 className="text-2xl font-bold">Request Session with {selectedUser.displayName}</h2>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        onPress={() => setShowRequestModal(false)}
                                    >
                                        <IconClock size={20} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardBody className="gap-4">
                                <p className="text-sm text-default-600 mb-2">
                                    Select which skill you'll offer and which skill you'd like to learn from {selectedUser.displayName}.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">
                                            Skill You'll Offer <span className="text-danger">*</span>
                                        </label>
                                        <p className="text-xs text-default-500 mb-2">
                                            Choose from {selectedUser.displayName}'s skills they want to learn
                                        </p>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg border border-default-200 bg-transparent text-foreground"
                                            value={selectedOfferedSkill?.id || ""}
                                            onChange={(e) => {
                                                const skill = selectedUser.skillsSought.find(
                                                    (s) => s.id === e.target.value
                                                );
                                                setSelectedOfferedSkill(skill || null);
                                            }}
                                        >
                                            <option value="">Select a skill...</option>
                                            {selectedUser.skillsSought.map((skill) => (
                                                <option key={skill.id} value={skill.id}>
                                                    {skill.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1">
                                            Skill You Want to Learn <span className="text-danger">*</span>
                                        </label>
                                        <p className="text-xs text-default-500 mb-2">
                                            Choose from {selectedUser.displayName}'s offered skills
                                        </p>
                                        <select
                                            className="w-full px-4 py-2 rounded-lg border border-default-200 bg-transparent text-foreground"
                                            value={selectedSoughtSkill?.id || ""}
                                            onChange={(e) => {
                                                const skill = selectedUser.skillsOffered.find(
                                                    (s) => s.id === e.target.value
                                                );
                                                setSelectedSoughtSkill(skill || null);
                                            }}
                                        >
                                            <option value="">Select a skill...</option>
                                            {selectedUser.skillsOffered.map((skill) => (
                                                <option key={skill.id} value={skill.id}>
                                                    {skill.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Proposed Date"
                                        labelPlacement="outside"
                                        value={proposedDate}
                                        onValueChange={(value) => {
                                            setProposedDate(value);
                                            // If date is today and time is in the past, clear the time
                                            const today = new Date().toISOString().split('T')[0];
                                            if (value === today && proposedTime) {
                                                const now = new Date();
                                                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                                                if (proposedTime <= currentTime) {
                                                    setProposedTime("");
                                                }
                                            }
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        description="Select a future date for your session"
                                        isRequired
                                    />
                                    <Input
                                        type="time"
                                        label="Proposed Time"
                                        labelPlacement="outside"
                                        value={proposedTime}
                                        onValueChange={setProposedTime}
                                        min={proposedDate === new Date().toISOString().split('T')[0] ? new Date().toTimeString().slice(0, 5) : undefined}
                                        description={proposedDate === new Date().toISOString().split('T')[0] ? "Select a time in the future (if today)" : "Preferred time for the session"}
                                        isRequired
                                    />
                                </div>

                                <Input
                                    type="number"
                                    label="Duration (minutes)"
                                    labelPlacement="outside"
                                    value={duration.toString()}
                                    onValueChange={(v) => setDuration(parseInt(v) || 60)}
                                    min={15}
                                    step={15}
                                    description="Session length in minutes (minimum 15, increments of 15)"
                                />

                                <Input
                                    label="Location (Optional)"
                                    placeholder="e.g., Online, Coffee Shop, Library"
                                    value={location}
                                    onValueChange={setLocation}
                                />

                                <Input
                                    label="Meeting Link (Optional)"
                                    placeholder="https://..."
                                    value={meetingLink}
                                    onValueChange={setMeetingLink}
                                />

                                <div>
                                    <label className="block text-sm font-medium mb-2">Additional Notes (Optional)</label>
                                    <textarea
                                        className="w-full px-3 py-2 min-h-[100px] rounded-lg border border-default-200 bg-transparent text-foreground placeholder:text-default-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Any additional information..."
                                        rows={3}
                                    />
                                </div>

                                <div className="flex gap-2 justify-end mt-4">
                                    <Button variant="light" onPress={() => setShowRequestModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        color="primary"
                                        onPress={handleSendRequest}
                                        isLoading={submitting}
                                        isDisabled={!selectedOfferedSkill || !selectedSoughtSkill || !proposedDate || !proposedTime}
                                    >
                                        <IconCheck size={18} />
                                        Send Request
                                    </Button>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                )}
            </div>
        </DefaultLayout>
    );
}