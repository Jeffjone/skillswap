import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { IconUsersGroup, IconChartBar, IconTarget, IconArrowLeft } from "@tabler/icons-react";
import { TeamMemberFeatures } from "./team-member-features";
import { TeamCaptainFeatures } from "./team-captain-features";
import { MemberType } from "@/types/membertypes";
import { RoleFeatures } from "./role-features";
import { Button } from "@nextui-org/button";

interface TeamDashboardProps {
    teamCode: string;
    onBack: () => void;
}

export function TeamDashboard({ teamCode, onBack }: TeamDashboardProps) {
    const [memberId, setMemberId] = useState<string>("");
    const [memberType, setMemberType] = useState<MemberType>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userMemberType = localStorage.getItem('memberType');
        const userEmail = localStorage.getItem('userEmail');
        
        if (userMemberType && userEmail) {
            setMemberType(userMemberType as MemberType);
            setMemberId(userEmail);
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return <div>Loading Team Information...</div>;
    }

    // For testing, we'll use a sample team
    const teamInfo = {
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
    };

    return (
        <DefaultLayout>
            <div className="space-y-8">
                {/* Back Button */}
                <Button
                    color="primary"
                    variant="light"
                    startContent={<IconArrowLeft />}
                    onPress={onBack}
                    className="mb-4"
                >
                    Back to Teams
                </Button>

                {/* Team Header */}
                <div className="flex items-start justify-left">
                    <div className="flex flex-col pb-2">
                        <div className="text-3xl font-bold">{teamInfo.name}</div>
                        <div className="text-md font-thin w-[1/2]">
                            {teamInfo.description}
                        </div>
                    </div>
                </div>

                {/* Team Members */}
                <Card className="p-4">
                    <CardHeader className="flex gap-3">
                        <IconUsersGroup size={24} />
                        <div className="text-xl font-bold">Team Members</div>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            {teamInfo.members.map((member: any, index: number) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-default-100 rounded-lg">
                                    <div>
                                        <span className="font-medium">{member.name}</span>
                                        <div className="text-sm text-default-500">{member.id}</div>
                                    </div>
                                    <span className="text-sm text-default-500">{member.role}</span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Team Goals */}
                <Card className="p-4">
                    <CardHeader className="flex gap-3">
                        <IconUsersGroup size={24} />
                        <div className="text-xl font-bold">Team Goals</div>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            {teamInfo.goals.map((goal: any, index: number) => (
                                <div key={index} className="p-2 bg-default-100 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-medium">{goal.title}</span>
                                        <span className="text-sm text-default-500">
                                            {goal.progress} / {goal.target} {goal.unit}
                                        </span>
                                    </div>
                                    <div className="w-full bg-default-200 rounded-full h-2">
                                        <div 
                                            className="bg-primary h-2 rounded-full" 
                                            style={{ width: `${(goal.progress / goal.target) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Role Features */}
                {memberType && <RoleFeatures memberType={memberType} teamId={teamCode} />}
            </div>
        </DefaultLayout>
    );
}
