import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { MemberType } from "@/types/membertypes";
import {
    IconUsersGroup,
    IconChartBar,
    IconTrophy,
    IconArticle,
    IconCalendar,
    IconSettings,
    IconMessage,
    IconEdit,
    IconPhoto,
    IconVideo,
    IconPresentation,
    IconTarget,
    IconBell,
    IconChartPie,
    IconUserCheck,
    IconClipboardCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { FeatureView } from "./feature-view";

interface RoleFeaturesProps {
    memberType: MemberType;
    teamId: string;
}

export function RoleFeatures({ memberType, teamId }: RoleFeaturesProps) {
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

    const handleFeatureClick = (featureTitle: string) => {
        setSelectedFeature(featureTitle);
    };

    const handleClose = () => {
        setSelectedFeature(null);
    };

    const teamMemberFeatures = [
        {
            title: "Health Tracking",
            description: "Track your daily activities, workouts, and wellness metrics",
            icon: <IconChartBar className="text-primary" />,
            action: () => handleFeatureClick("Health Tracking"),
        },
        {
            title: "Team Challenges",
            description: "Participate in team challenges and track progress",
            icon: <IconTrophy className="text-primary" />,
            action: () => handleFeatureClick("Team Challenges"),
        },
        {
            title: "Community",
            description: "Connect with team members and share achievements",
            icon: <IconUsersGroup className="text-primary" />,
            action: () => handleFeatureClick("Community"),
        },
        {
            title: "Personal Goals",
            description: "Set and track your personal wellness goals",
            icon: <IconTarget className="text-primary" />,
            action: () => handleFeatureClick("Personal Goals"),
        },
        {
            title: "Progress Reports",
            description: "View detailed reports of your wellness journey",
            icon: <IconChartPie className="text-primary" />,
            action: () => handleFeatureClick("Progress Reports"),
        },
        {
            title: "Notifications",
            description: "Stay updated with team activities and achievements",
            icon: <IconBell className="text-primary" />,
            action: () => handleFeatureClick("Notifications"),
        },
    ];

    const teamCaptainFeatures = [
        {
            title: "Team Management",
            description: "Manage team members and their roles",
            icon: <IconUsersGroup className="text-primary" />,
            action: () => handleFeatureClick("Team Management"),
        },
        {
            title: "Challenge Creation",
            description: "Create and manage team challenges",
            icon: <IconTrophy className="text-primary" />,
            action: () => handleFeatureClick("Challenge Creation"),
        },
        {
            title: "Progress Monitoring",
            description: "Monitor team and individual progress",
            icon: <IconChartBar className="text-primary" />,
            action: () => handleFeatureClick("Progress Monitoring"),
        },
        {
            title: "Team Calendar",
            description: "Schedule team events and activities",
            icon: <IconCalendar className="text-primary" />,
            action: () => handleFeatureClick("Team Calendar"),
        },
        {
            title: "Team Settings",
            description: "Configure team preferences and rules",
            icon: <IconSettings className="text-primary" />,
            action: () => handleFeatureClick("Team Settings"),
        },
        {
            title: "Team Communication",
            description: "Manage team announcements and messages",
            icon: <IconMessage className="text-primary" />,
            action: () => handleFeatureClick("Team Communication"),
        },
    ];

    const contentManagerFeatures = [
        {
            title: "Content Creation",
            description: "Create engaging wellness content and articles",
            icon: <IconEdit className="text-primary" />,
            action: () => handleFeatureClick("Content Creation"),
        },
        {
            title: "Media Management",
            description: "Upload and manage images and videos",
            icon: <IconPhoto className="text-primary" />,
            action: () => handleFeatureClick("Media Management"),
        },
        {
            title: "Challenge Templates",
            description: "Design and manage challenge templates",
            icon: <IconPresentation className="text-primary" />,
            action: () => handleFeatureClick("Challenge Templates"),
        },
        {
            title: "Content Calendar",
            description: "Plan and schedule content releases",
            icon: <IconCalendar className="text-primary" />,
            action: () => handleFeatureClick("Content Calendar"),
        },
        {
            title: "Content Analytics",
            description: "Track content engagement and performance",
            icon: <IconChartBar className="text-primary" />,
            action: () => handleFeatureClick("Content Analytics"),
        },
        {
            title: "Content Approval",
            description: "Review and approve team content",
            icon: <IconClipboardCheck className="text-primary" />,
            action: () => handleFeatureClick("Content Approval"),
        },
    ];

    const features = {
        [MemberType.TeamMember]: teamMemberFeatures,
        [MemberType.TeamCaptain]: teamCaptainFeatures,
        [MemberType.ContentManager]: contentManagerFeatures,
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features[memberType].map((feature, index) => (
                    <Card 
                        key={index} 
                        className="hover:scale-105 transition-transform cursor-pointer"
                        isPressable
                        onPress={feature.action}
                    >
                        <CardHeader className="flex gap-3">
                            {feature.icon}
                            <div className="text-xl font-bold">{feature.title}</div>
                        </CardHeader>
                        <CardBody>
                            <p className="text-default-500">{feature.description}</p>
                        </CardBody>
                    </Card>
                ))}
            </div>

            <Modal 
                isOpen={selectedFeature !== null} 
                onClose={handleClose}
                size="3xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    {(onClose: () => void) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                {selectedFeature}
                                <p className="text-sm text-default-500">
                                    {memberType === MemberType.TeamMember && "Track and manage your wellness journey"}
                                    {memberType === MemberType.TeamCaptain && "Manage your team and their progress"}
                                    {memberType === MemberType.ContentManager && "Create and manage team content"}
                                </p>
                            </ModalHeader>
                            <ModalBody>
                                {selectedFeature && (
                                    <FeatureView
                                        featureTitle={selectedFeature}
                                        memberType={memberType}
                                        teamId={teamId}
                                        onBack={onClose}
                                    />
                                )}
                            </ModalBody>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
} 