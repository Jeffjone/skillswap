import { Card, CardBody, CardHeader, Progress, Badge } from "@heroui/react";
import { useState } from "react";

interface TeamMemberFeaturesProps {
    teamId: string;
}

export function TeamMemberFeatures({ teamId }: TeamMemberFeaturesProps) {
    // Mock data for testing
    const [teamData] = useState({
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

    return (
        <div className="space-y-6">
            {/* Team Members Section */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold">Team Members</h2>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {teamData.members.map((member) => (
                            <div key={member.id} className="flex justify-between items-center p-2 border rounded">
                                <div>
                                    <div className="font-semibold">{member.name}</div>
                                    <div className="text-sm text-gray-500">{member.id}</div>
                                </div>
                                <Badge color="primary">{member.role}</Badge>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>

            {/* Team Goals Section */}
            <Card>
                <CardHeader>
                    <h2 className="text-xl font-bold">Team Goals</h2>
                </CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        {teamData.goals.map((goal) => (
                            <div key={goal.id} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">{goal.title}</h3>
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
        </div>
    );
} 