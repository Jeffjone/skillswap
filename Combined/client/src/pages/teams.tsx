import DefaultLayout from "@/layouts/default";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { useState, useEffect } from "react";
import { IconUsers, IconPlus, IconArrowRight, IconSearch, IconX } from "@tabler/icons-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "@/api/config";
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/api/config";

interface Team {
    id: string;
    name: string;
    description: string;
    classCode: string;
    captainId: string;
    captainName: string;
    members: string[];
    createdAt: any;
}

export default function TeamsPage() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [teamDescription, setTeamDescription] = useState("");
    const [classCode, setClassCode] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [creating, setCreating] = useState(false);
    const [joining, setJoining] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadTeams();
    }, []);

    const loadTeams = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;
            if (!user) {
                toast.error("You must be logged in to view teams");
                return;
            }

            // Load teams where user is a member or captain
            const teamsQuery = query(
                collection(db, "teams"),
                where("members", "array-contains", user.uid)
            );
            const snapshot = await getDocs(teamsQuery);
            
            const teamsList: Team[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                teamsList.push({
                    id: docSnap.id,
                    name: data.name || "",
                    description: data.description || "",
                    classCode: data.classCode || "",
                    captainId: data.captainId || "",
                    captainName: data.captainName || "",
                    members: data.members || [],
                    createdAt: data.createdAt,
                });
            });

            setTeams(teamsList);
        } catch (error: any) {
            console.error("Error loading teams:", error);
            toast.error("Failed to load teams");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async () => {
        if (!teamName.trim() || !classCode.trim()) {
            toast.error("Please provide a team name and class code");
            return;
        }

        try {
            setCreating(true);
            const user = auth.currentUser;
            if (!user) {
                toast.error("You must be logged in to create a team");
                return;
            }

            // Get user data for captain name
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userData = userDoc.data();
            const captainName = userData?.displayName || user.email || "Unknown";

            // Create team document
            const teamData = {
                name: teamName.trim(),
                description: teamDescription.trim() || "",
                classCode: classCode.trim(),
                captainId: user.uid,
                captainName: captainName,
                members: [user.uid],
                createdAt: new Date(),
            };

            await addDoc(collection(db, "teams"), teamData);
            
            toast.success("Team created successfully!");
            setShowCreateModal(false);
            setTeamName("");
            setTeamDescription("");
            setClassCode("");
            loadTeams();
        } catch (error: any) {
            console.error("Error creating team:", error);
            toast.error(error.message || "Failed to create team");
        } finally {
            setCreating(false);
        }
    };

    const handleJoinTeam = async () => {
        if (!joinCode.trim()) {
            toast.error("Please enter a class code");
            return;
        }

        try {
            setJoining(true);
            const user = auth.currentUser;
            if (!user) {
                toast.error("You must be logged in to join a team");
                return;
            }

            // Find team by class code
            const teamsQuery = query(
                collection(db, "teams"),
                where("classCode", "==", joinCode.trim())
            );
            const snapshot = await getDocs(teamsQuery);

            if (snapshot.empty) {
                toast.error("No team found with that class code");
                return;
            }

            const teamDoc = snapshot.docs[0];
            const teamData = teamDoc.data();

            // Check if user is already a member
            if (teamData.members && teamData.members.includes(user.uid)) {
                toast.info("You are already a member of this team");
                setShowJoinModal(false);
                setJoinCode("");
                loadTeams();
                return;
            }

            // Add user to team
            await updateDoc(doc(db, "teams", teamDoc.id), {
                members: arrayUnion(user.uid),
            });

            toast.success("Successfully joined the team!");
            setShowJoinModal(false);
            setJoinCode("");
            loadTeams();
        } catch (error: any) {
            console.error("Error joining team:", error);
            toast.error(error.message || "Failed to join team");
        } finally {
            setJoining(false);
        }
    };

    const filteredTeams = teams.filter((team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        team.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DefaultLayout>
            <ToastContainer />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Teams</h1>
                        <p className="text-default-600">
                            Create teams, join clubs, and collaborate with other students
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            color="primary"
                            startContent={<IconPlus size={18} />}
                            onPress={() => setShowCreateModal(true)}
                        >
                            Create Team
                        </Button>
                        <Button
                            color="secondary"
                            variant="bordered"
                            startContent={<IconUsers size={18} />}
                            onPress={() => setShowJoinModal(true)}
                        >
                            Join Team
                        </Button>
                    </div>
                </div>

                {teams.length > 0 && (
                    <div className="mb-4">
                        <Input
                            placeholder="Search teams..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            startContent={<IconSearch className="text-default-400" />}
                            className="max-w-xs"
                        />
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <p>Loading teams...</p>
                    </div>
                ) : filteredTeams.length === 0 ? (
                    <Card>
                        <CardBody className="text-center py-12">
                            <IconUsers size={48} className="mx-auto mb-4 text-default-400" />
                            <h3 className="text-xl font-semibold mb-2">
                                {teams.length === 0 ? "No teams yet" : "No teams found"}
                            </h3>
                            <p className="text-default-500 mb-4">
                                {teams.length === 0
                                    ? "Create your first team or join an existing one to get started"
                                    : "Try adjusting your search terms"}
                            </p>
                            <div className="flex gap-2 justify-center">
                                <Button
                                    color="primary"
                                    startContent={<IconPlus size={18} />}
                                    onPress={() => setShowCreateModal(true)}
                                >
                                    Create Team
                                </Button>
                                <Button
                                    color="secondary"
                                    variant="bordered"
                                    startContent={<IconUsers size={18} />}
                                    onPress={() => setShowJoinModal(true)}
                                >
                                    Join Team
                                </Button>
                            </div>
                        </CardBody>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map((team) => (
                            <Card key={team.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold mb-1">{team.name}</h3>
                                        <p className="text-sm text-default-500">
                                            Class Code: {team.classCode}
                                        </p>
                                    </div>
                                    {team.captainId === auth.currentUser?.uid && (
                                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                            Captain
                                        </span>
                                    )}
                                </CardHeader>
                                <CardBody>
                                    <p className="text-sm text-default-600 mb-4">
                                        {team.description || "No description provided"}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-default-500 mb-4">
                                        <div className="flex items-center gap-1">
                                            <IconUsers size={16} />
                                            <span>{team.members.length} member{team.members.length !== 1 ? "s" : ""}</span>
                                        </div>
                                        <span>Captain: {team.captainName}</span>
                                    </div>
                                    <Button
                                        color="primary"
                                        variant="flat"
                                        className="w-full"
                                        endContent={<IconArrowRight size={16} />}
                                        onPress={() => {
                                            window.location.href = `/team?code=${team.classCode}`;
                                        }}
                                    >
                                        View Team
                                    </Button>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Create Team Modal */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => {
                        setShowCreateModal(false);
                        setTeamName("");
                        setTeamDescription("");
                        setClassCode("");
                    }}
                    size="lg"
                >
                    <ModalContent>
                        <ModalHeader>Create New Team</ModalHeader>
                        <ModalBody>
                            <div className="space-y-4">
                                <Input
                                    label="Team Name"
                                    labelPlacement="outside"
                                    placeholder="e.g., Web Development Team"
                                    value={teamName}
                                    onValueChange={setTeamName}
                                    description="Give your team a descriptive name"
                                    isRequired
                                />
                                <Input
                                    label="Class Code"
                                    labelPlacement="outside"
                                    placeholder="e.g., CS101-2024"
                                    value={classCode}
                                    onValueChange={setClassCode}
                                    description="A unique code that others can use to join your team. Share this with your teammates!"
                                    isRequired
                                />
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        className="w-full px-3 py-2 min-h-[100px] rounded-lg border border-default-200 bg-transparent text-foreground placeholder:text-default-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        value={teamDescription}
                                        onChange={(e) => setTeamDescription(e.target.value)}
                                        placeholder="Describe your team's goals and interests..."
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={() => {
                                    setShowCreateModal(false);
                                    setTeamName("");
                                    setTeamDescription("");
                                    setClassCode("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleCreateTeam}
                                isLoading={creating}
                                isDisabled={!teamName.trim() || !classCode.trim()}
                            >
                                Create Team
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>

                {/* Join Team Modal */}
                <Modal
                    isOpen={showJoinModal}
                    onClose={() => {
                        setShowJoinModal(false);
                        setJoinCode("");
                    }}
                >
                    <ModalContent>
                        <ModalHeader>Join a Team</ModalHeader>
                        <ModalBody>
                            <Input
                                label="Class Code"
                                placeholder="Enter the team's class code"
                                value={joinCode}
                                onValueChange={setJoinCode}
                                description="Ask your team captain for the class code"
                                isRequired
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={() => {
                                    setShowJoinModal(false);
                                    setJoinCode("");
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleJoinTeam}
                                isLoading={joining}
                                isDisabled={!joinCode.trim()}
                            >
                                Join Team
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </div>
        </DefaultLayout>
    );
}
