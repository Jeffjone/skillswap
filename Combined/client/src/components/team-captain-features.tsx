import { Card, CardBody, CardHeader, Progress, Badge, Button } from "@heroui/react";
import { IconUsersGroup, IconTarget, IconSettings, IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input } from "@heroui/react";
import { useState } from "react";

interface TeamCaptainFeaturesProps {
    teamId: string;
}

export function TeamCaptainFeatures({ teamId }: TeamCaptainFeaturesProps) {
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newGoalTitle, setNewGoalTitle] = useState("");
    const [newGoalTarget, setNewGoalTarget] = useState("");
    const [newGoalUnit, setNewGoalUnit] = useState("");

    // Mock data for testing
    const [teamData, setTeamData] = useState({
        name: "Health & Wellness Team",
        description: "A team focused on health and wellness",
        members: [
            { id: "koifish789@gmail.com", name: "Team Captain", role: "Team Captain" },
            { id: "jaytron00ORL@gmail.com", name: "Content Manager", role: "Content Manager" },
            { id: "dtable06@gmail.com", name: "Team Member", role: "Team Member" }
        ],
        goals: [
            { id: 1, title: "Daily Steps", target: 10000, unit: "steps", progress: 7500 },
            { id: 2, title: "Weekly Workouts", target: 5, unit: "sessions", progress: 3 }
        ]
    });

    const handleAddMember = () => {
        if (newMemberEmail) {
            setTeamData(prev => ({
                ...prev,
                members: [...prev.members, { id: newMemberEmail, name: newMemberEmail, role: "Team Member" }]
            }));
            setNewMemberEmail("");
            setIsAddMemberModalOpen(false);
        }
    };

    const handleAddGoal = () => {
        if (newGoalTitle && newGoalTarget && newGoalUnit) {
            setTeamData(prev => ({
                ...prev,
                goals: [...prev.goals, {
                    id: prev.goals.length + 1,
                    title: newGoalTitle,
                    target: parseInt(newGoalTarget),
                    unit: newGoalUnit,
                    progress: 0
                }]
            }));
            setNewGoalTitle("");
            setNewGoalTarget("");
            setNewGoalUnit("");
            setIsAddGoalModalOpen(false);
        }
    };

    const handleRemoveMember = (memberId: string) => {
        // Don't allow removing the team captain
        if (memberId === "koifish789@gmail.com") return;
        
        setTeamData(prev => ({
            ...prev,
            members: prev.members.filter(member => member.id !== memberId)
        }));
    };

    return (
        <div className="space-y-6">
            {/* Team Members Section */}
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Team Members</h2>
                    <Button
                        startContent={<IconPlus />}
                        color="primary"
                        onPress={() => setIsAddMemberModalOpen(true)}
                    >
                        Add Member
                    </Button>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {teamData.members.map((member) => (
                            <div key={member.id} className="flex justify-between items-center p-2 border rounded">
                                <div>
                                    <div className="font-semibold">{member.name}</div>
                                    <div className="text-sm text-gray-500">{member.id}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge color="primary">{member.role}</Badge>
                                    {member.role !== "Team Captain" && (
                                        <Button
                                            isIconOnly
                                            color="danger"
                                            variant="light"
                                            onPress={() => handleRemoveMember(member.id)}
                                        >
                                            <IconTrash />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Team Goals Section */}
            <Card>
                <CardHeader className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Team Goals</h2>
                    <Button
                        startContent={<IconPlus />}
                        color="primary"
                        onPress={() => setIsAddGoalModalOpen(true)}
                    >
                        Add Goal
                    </Button>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {teamData.goals.map((goal) => (
                            <div key={goal.id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">{goal.title}</h3>
                                    <Button
                                        isIconOnly
                                        color="primary"
                                        variant="light"
                                    >
                                        <IconEdit />
                                    </Button>
                                </div>
                                <Progress
                                    value={(goal.progress / goal.target) * 100}
                                    className="max-w-md"
                                />
                                <div className="text-sm text-gray-500">
                                    {goal.progress} / {goal.target} {goal.unit}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Add Member Modal */}
            <Modal isOpen={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
                <ModalContent>
                    <ModalHeader>Add Team Member</ModalHeader>
                    <ModalBody>
                        <Input
                            label="Email"
                            placeholder="Enter member's email"
                            value={newMemberEmail}
                            onChange={(e) => setNewMemberEmail(e.target.value)}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={() => setIsAddMemberModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleAddMember}>
                            Add Member
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Add Goal Modal */}
            <Modal isOpen={isAddGoalModalOpen} onOpenChange={setIsAddGoalModalOpen}>
                <ModalContent>
                    <ModalHeader>Add Team Goal</ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <Input
                                label="Goal Title"
                                placeholder="Enter goal title"
                                value={newGoalTitle}
                                onChange={(e) => setNewGoalTitle(e.target.value)}
                            />
                            <Input
                                label="Target Value"
                                type="number"
                                placeholder="Enter target value"
                                value={newGoalTarget}
                                onChange={(e) => setNewGoalTarget(e.target.value)}
                            />
                            <Input
                                label="Unit"
                                placeholder="Enter unit (e.g., steps, km)"
                                value={newGoalUnit}
                                onChange={(e) => setNewGoalUnit(e.target.value)}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="light" onPress={() => setIsAddGoalModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button color="primary" onPress={handleAddGoal}>
                            Add Goal
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
} 