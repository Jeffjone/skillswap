import { Button } from "@nextui-org/button";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { IconArrowLeft } from "@tabler/icons-react";
import { MemberType } from "@/types/membertypes";
import { Input } from "@nextui-org/input";
import { Textarea } from "@nextui-org/react";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

interface FeatureViewProps {
    featureTitle: string;
    memberType: MemberType;
    teamId: string;
    onBack: () => void;
}

type FeatureContent = {
    [key: string]: ReactNode;
};

export function FeatureView({ featureTitle, memberType, teamId, onBack }: FeatureViewProps) {
    // Health Tracking States
    const [steps, setSteps] = useState("7500");
    const [activeMinutes, setActiveMinutes] = useState("45");

    // Team Challenges States
    const [challengeProgress, setChallengeProgress] = useState("15");

    // Community States
    const [postContent, setPostContent] = useState("");
    const [posts, setPosts] = useState([
        { id: 1, author: "John Doe", content: "Just completed my 10k steps goal! 💪", likes: 5, comments: 2 }
    ]);

    // Personal Goals States
    const [newGoalTitle, setNewGoalTitle] = useState("");
    const [newGoalTarget, setNewGoalTarget] = useState("");
    const [newGoalUnit, setNewGoalUnit] = useState("");
    const [goals, setGoals] = useState([
        { id: 1, title: "Daily Steps", current: 7500, target: 10000, unit: "steps" },
        { id: 2, title: "Weekly Workouts", current: 3, target: 5, unit: "sessions" }
    ]);

    // Notifications States
    const [notificationSettings, setNotificationSettings] = useState({
        teamChallenges: true,
        goalReminders: true,
        teamMessages: true
    });

    // Team Member Features
    const healthTrackingContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Daily Activity Log</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-default-100 rounded-lg">
                                <h3 className="font-bold mb-2">Steps</h3>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        value={steps}
                                        onChange={(e) => setSteps(e.target.value)}
                                        className="w-24"
                                    />
                                    <span className="text-sm text-default-500">/ 10,000 steps</span>
                                </div>
                            </div>
                            <div className="p-4 bg-default-100 rounded-lg">
                                <h3 className="font-bold mb-2">Active Minutes</h3>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="number" 
                                        value={activeMinutes}
                                        onChange={(e) => setActiveMinutes(e.target.value)}
                                        className="w-24"
                                    />
                                    <span className="text-sm text-default-500">/ 60 minutes</span>
                                </div>
                            </div>
                        </div>
                        <Button 
                            color="primary" 
                            className="w-full"
                            onPress={() => {
                                toast.success("Progress saved successfully!");
                                // Here you would typically make an API call to save the data
                            }}
                        >
                            Save Progress
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const teamChallengesContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Active Challenges</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">30-Day Fitness Challenge</h3>
                            <div className="flex items-center gap-2 mb-2">
                                <Input 
                                    type="number" 
                                    value={challengeProgress}
                                    onChange={(e) => setChallengeProgress(e.target.value)}
                                    className="w-24"
                                />
                                <span className="text-sm text-default-500">/ 30 days</span>
                            </div>
                            <div className="w-full bg-default-200 rounded-full h-2 mt-2">
                                <div 
                                    className="bg-primary h-2 rounded-full" 
                                    style={{ width: `${(parseInt(challengeProgress) / 30) * 100}%` }}
                                ></div>
                            </div>
                            <Button 
                                color="primary" 
                                className="w-full mt-4"
                                onPress={() => {
                                    toast.success("Challenge progress updated!");
                                    // Here you would typically make an API call to update the progress
                                }}
                            >
                                Update Progress
                            </Button>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const communityContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Community Posts</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Create New Post</h3>
                            <Textarea 
                                placeholder="Share your achievements or thoughts..."
                                className="mb-4"
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button 
                                    color="primary"
                                    onPress={() => {
                                        toast.info("Photo upload feature coming soon!");
                                    }}
                                >
                                    Add Photo
                                </Button>
                                <Button 
                                    color="primary"
                                    onPress={() => {
                                        if (postContent.trim()) {
                                            setPosts([{
                                                id: posts.length + 1,
                                                author: "You",
                                                content: postContent,
                                                likes: 0,
                                                comments: 0
                                            }, ...posts]);
                                            setPostContent("");
                                            toast.success("Post created successfully!");
                                        } else {
                                            toast.error("Please enter some content first!");
                                        }
                                    }}
                                >
                                    Post
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Recent Posts</h3>
                            <div className="space-y-4">
                                {posts.map((post) => (
                                    <div key={post.id} className="border-b pb-4">
                                        <div className="font-bold">{post.author}</div>
                                        <p className="text-sm text-default-500">{post.content}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="light"
                                                onPress={() => {
                                                    toast.success("Liked post!");
                                                }}
                                            >
                                                Like ({post.likes})
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="light"
                                                onPress={() => {
                                                    toast.info("Comment feature coming soon!");
                                                }}
                                            >
                                                Comment ({post.comments})
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const personalGoalsContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Personal Goals</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Set New Goal</h3>
                            <div className="space-y-4">
                                <Input 
                                    placeholder="Goal Title"
                                    className="w-full"
                                    value={newGoalTitle}
                                    onChange={(e) => setNewGoalTitle(e.target.value)}
                                />
                                <div className="flex gap-4">
                                    <Input 
                                        type="number"
                                        placeholder="Target"
                                        className="w-1/2"
                                        value={newGoalTarget}
                                        onChange={(e) => setNewGoalTarget(e.target.value)}
                                    />
                                    <Input 
                                        placeholder="Unit (e.g., steps, minutes)"
                                        className="w-1/2"
                                        value={newGoalUnit}
                                        onChange={(e) => setNewGoalUnit(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    color="primary" 
                                    className="w-full"
                                    onPress={() => {
                                        if (newGoalTitle && newGoalTarget && newGoalUnit) {
                                            setGoals([...goals, {
                                                id: goals.length + 1,
                                                title: newGoalTitle,
                                                current: 0,
                                                target: parseInt(newGoalTarget),
                                                unit: newGoalUnit
                                            }]);
                                            setNewGoalTitle("");
                                            setNewGoalTarget("");
                                            setNewGoalUnit("");
                                            toast.success("New goal added!");
                                        } else {
                                            toast.error("Please fill in all fields!");
                                        }
                                    }}
                                >
                                    Add Goal
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Current Goals</h3>
                            <div className="space-y-4">
                                {goals.map((goal) => (
                                    <div key={goal.id} className="flex justify-between items-center">
                                        <div>
                                            <div className="font-bold">{goal.title}</div>
                                            <div className="text-sm text-default-500">
                                                {goal.current} / {goal.target} {goal.unit}
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            color="primary"
                                            onPress={() => {
                                                const newCurrent = prompt(`Enter new progress for ${goal.title}:`, goal.current.toString());
                                                if (newCurrent !== null) {
                                                    const updatedGoals = goals.map(g => 
                                                        g.id === goal.id 
                                                            ? { ...g, current: parseInt(newCurrent) }
                                                            : g
                                                    );
                                                    setGoals(updatedGoals);
                                                    toast.success("Goal progress updated!");
                                                }
                                            }}
                                        >
                                            Update
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const progressReportsContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Progress Reports</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Weekly Summary</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-default-500">Average Steps</div>
                                        <div className="text-2xl font-bold">8,500</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-default-500">Workouts Completed</div>
                                        <div className="text-2xl font-bold">4</div>
                                    </div>
                                </div>
                                <div className="w-full bg-default-200 rounded-full h-2">
                                    <div className="bg-primary h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                                <div className="text-sm text-default-500">85% of weekly goals achieved</div>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Export Report</h3>
                            <div className="flex gap-2">
                                <Button 
                                    color="primary"
                                    onPress={() => {
                                        toast.info("PDF download feature coming soon!");
                                    }}
                                >
                                    Download PDF
                                </Button>
                                <Button 
                                    color="primary"
                                    onPress={() => {
                                        toast.info("Team sharing feature coming soon!");
                                    }}
                                >
                                    Share with Team
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const notificationsContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Notifications</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Notification Settings</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span>Team Challenges</span>
                                    <Button 
                                        size="sm" 
                                        color="primary" 
                                        variant="light"
                                        onPress={() => {
                                            setNotificationSettings(prev => ({
                                                ...prev,
                                                teamChallenges: !prev.teamChallenges
                                            }));
                                            toast.success(`Team Challenges notifications ${!notificationSettings.teamChallenges ? 'enabled' : 'disabled'}!`);
                                        }}
                                    >
                                        {notificationSettings.teamChallenges ? 'Disable' : 'Enable'}
                                    </Button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Goal Reminders</span>
                                    <Button 
                                        size="sm" 
                                        color="primary" 
                                        variant="light"
                                        onPress={() => {
                                            setNotificationSettings(prev => ({
                                                ...prev,
                                                goalReminders: !prev.goalReminders
                                            }));
                                            toast.success(`Goal Reminders ${!notificationSettings.goalReminders ? 'enabled' : 'disabled'}!`);
                                        }}
                                    >
                                        {notificationSettings.goalReminders ? 'Disable' : 'Enable'}
                                    </Button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Team Messages</span>
                                    <Button 
                                        size="sm" 
                                        color="primary" 
                                        variant="light"
                                        onPress={() => {
                                            setNotificationSettings(prev => ({
                                                ...prev,
                                                teamMessages: !prev.teamMessages
                                            }));
                                            toast.success(`Team Messages ${!notificationSettings.teamMessages ? 'enabled' : 'disabled'}!`);
                                        }}
                                    >
                                        {notificationSettings.teamMessages ? 'Disable' : 'Enable'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Recent Notifications</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-default-200 rounded">
                                    <span>New team challenge started</span>
                                    <Button 
                                        size="sm" 
                                        color="primary" 
                                        variant="light"
                                        onPress={() => {
                                            toast.info("Viewing challenge details...");
                                        }}
                                    >
                                        View
                                    </Button>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-default-200 rounded">
                                    <span>Goal reminder: Daily steps</span>
                                    <Button 
                                        size="sm" 
                                        color="primary" 
                                        variant="light"
                                        onPress={() => {
                                            toast.info("Viewing goal details...");
                                        }}
                                    >
                                        View
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    // Team Captain States
    const [teamMembers, setTeamMembers] = useState([
        { id: 1, name: "John Doe", role: "Team Captain", status: "active" },
        { id: 2, name: "Jane Smith", role: "Content Manager", status: "active" },
        { id: 3, name: "Mike Johnson", role: "Member", status: "inactive" }
    ]);

    const [teamChallenges, setTeamChallenges] = useState([
        { id: 1, title: "30-Day Fitness Challenge", status: "active", participants: 15, progress: 75 },
        { id: 2, title: "Weekly Nutrition Goals", status: "upcoming", participants: 8, progress: 0 }
    ]);

    const [teamProgress, setTeamProgress] = useState({
        averageSteps: 8500,
        activeMembers: 12,
        completedChallenges: 3,
        teamRank: 2
    });

    const [teamEvents, setTeamEvents] = useState([
        { id: 1, title: "Team Meeting", date: "2024-03-20", type: "meeting", attendees: 8 },
        { id: 2, title: "Group Workout", date: "2024-03-25", type: "activity", attendees: 5 }
    ]);

    const [teamSettings, setTeamSettings] = useState({
        name: "Fitness Warriors",
        visibility: "public",
        joinRequests: true,
        notifications: true
    });

    const [teamMessages, setTeamMessages] = useState([
        { id: 1, author: "John Doe", content: "Great work everyone on the fitness challenge!", timestamp: "2024-03-15 14:30" },
        { id: 2, author: "Jane Smith", content: "Don't forget about tomorrow's team meeting!", timestamp: "2024-03-15 15:45" }
    ]);

    // Team Captain Features
    const teamManagementContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Team Management</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Team Members</h3>
                            <div className="space-y-2">
                                {teamMembers.map((member) => (
                                    <div key={member.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{member.name}</div>
                                            <div className="text-sm text-default-500">
                                                {member.role} • {member.status}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="light"
                                                onPress={() => {
                                                    toast.info("Edit member role feature coming soon!");
                                                }}
                                            >
                                                Edit Role
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="danger" 
                                                variant="light"
                                                onPress={() => {
                                                    setTeamMembers(teamMembers.filter(m => m.id !== member.id));
                                                    toast.success("Member removed from team!");
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const challengeCreationContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Challenge Creation</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Create New Challenge</h3>
                            <div className="space-y-4">
                                <Input 
                                    placeholder="Challenge Title"
                                    className="w-full"
                                />
                                <div className="flex gap-4">
                                    <Input 
                                        placeholder="Duration (days)"
                                        type="number"
                                        className="w-1/2"
                                    />
                                    <Input 
                                        placeholder="Target Goal"
                                        className="w-1/2"
                                    />
                                </div>
                                <Button 
                                    color="primary" 
                                    className="w-full"
                                    onPress={() => {
                                        toast.success("Challenge created successfully!");
                                    }}
                                >
                                    Create Challenge
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Active Challenges</h3>
                            <div className="space-y-2">
                                {teamChallenges.map((challenge) => (
                                    <div key={challenge.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{challenge.title}</div>
                                            <div className="text-sm text-default-500">
                                                {challenge.status} • {challenge.participants} participants • {challenge.progress}% complete
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="light"
                                                onPress={() => {
                                                    toast.info("Edit challenge feature coming soon!");
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="danger" 
                                                variant="light"
                                                onPress={() => {
                                                    setTeamChallenges(teamChallenges.filter(c => c.id !== challenge.id));
                                                    toast.success("Challenge removed!");
                                                }}
                                            >
                                                End
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const progressMonitoringContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Progress Monitoring</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Team Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-default-500">Average Steps</div>
                                    <div className="text-2xl font-bold">{teamProgress.averageSteps}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-default-500">Active Members</div>
                                    <div className="text-2xl font-bold">{teamProgress.activeMembers}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-default-500">Completed Challenges</div>
                                    <div className="text-2xl font-bold">{teamProgress.completedChallenges}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-default-500">Team Rank</div>
                                    <div className="text-2xl font-bold">#{teamProgress.teamRank}</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Member Progress</h3>
                            <div className="space-y-2">
                                {teamMembers.map((member) => (
                                    <div key={member.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{member.name}</div>
                                            <div className="text-sm text-default-500">
                                                {member.role} • {member.status}
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            color="primary" 
                                            variant="light"
                                            onPress={() => {
                                                toast.info("Detailed progress view coming soon!");
                                            }}
                                        >
                                            View Progress
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const teamCalendarContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Team Calendar</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Schedule Event</h3>
                            <div className="space-y-4">
                                <Input 
                                    placeholder="Event Title"
                                    className="w-full"
                                />
                                <div className="flex gap-4">
                                    <Input 
                                        type="date"
                                        className="w-1/2"
                                    />
                                    <Input 
                                        placeholder="Type (e.g., meeting, activity)"
                                        className="w-1/2"
                                    />
                                </div>
                                <Button 
                                    color="primary" 
                                    className="w-full"
                                    onPress={() => {
                                        toast.success("Event scheduled successfully!");
                                    }}
                                >
                                    Schedule Event
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Upcoming Events</h3>
                            <div className="space-y-2">
                                {teamEvents.map((event) => (
                                    <div key={event.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{event.title}</div>
                                            <div className="text-sm text-default-500">
                                                {event.type} • {event.date} • {event.attendees} attendees
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="light"
                                                onPress={() => {
                                                    toast.info("Edit event feature coming soon!");
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="danger" 
                                                variant="light"
                                                onPress={() => {
                                                    setTeamEvents(teamEvents.filter(e => e.id !== event.id));
                                                    toast.success("Event cancelled!");
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const teamSettingsContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Team Settings</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">General Settings</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Team Name</span>
                                    <Input 
                                        value={teamSettings.name}
                                        onChange={(e) => setTeamSettings({...teamSettings, name: e.target.value})}
                                        className="w-48"
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Team Visibility</span>
                                    <Button 
                                        size="sm" 
                                        color="primary" 
                                        variant="light"
                                        onPress={() => {
                                            setTeamSettings({
                                                ...teamSettings,
                                                visibility: teamSettings.visibility === "public" ? "private" : "public"
                                            });
                                            toast.success(`Team is now ${teamSettings.visibility === "public" ? "private" : "public"}!`);
                                        }}
                                    >
                                        {teamSettings.visibility === "public" ? "Public" : "Private"}
                                    </Button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Join Requests</span>
                                    <Button 
                                        size="sm" 
                                        color="primary" 
                                        variant="light"
                                        onPress={() => {
                                            setTeamSettings({
                                                ...teamSettings,
                                                joinRequests: !teamSettings.joinRequests
                                            });
                                            toast.success(`Join requests ${!teamSettings.joinRequests ? "enabled" : "disabled"}!`);
                                        }}
                                    >
                                        {teamSettings.joinRequests ? "Enabled" : "Disabled"}
                                    </Button>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Team Notifications</span>
                                    <Button 
                                        size="sm" 
                                        color="primary" 
                                        variant="light"
                                        onPress={() => {
                                            setTeamSettings({
                                                ...teamSettings,
                                                notifications: !teamSettings.notifications
                                            });
                                            toast.success(`Team notifications ${!teamSettings.notifications ? "enabled" : "disabled"}!`);
                                        }}
                                    >
                                        {teamSettings.notifications ? "Enabled" : "Disabled"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const teamCommunicationContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Team Communication</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Send Message</h3>
                            <div className="space-y-4">
                                <Textarea 
                                    placeholder="Type your message..."
                                    className="w-full"
                                />
                                <Button 
                                    color="primary" 
                                    className="w-full"
                                    onPress={() => {
                                        toast.success("Message sent successfully!");
                                    }}
                                >
                                    Send Message
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Recent Messages</h3>
                            <div className="space-y-2">
                                {teamMessages.map((message) => (
                                    <div key={message.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{message.author}</div>
                                            <div className="text-sm text-default-500">{message.content}</div>
                                            <div className="text-xs text-default-400">{message.timestamp}</div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            color="danger" 
                                            variant="light"
                                            onPress={() => {
                                                setTeamMessages(teamMessages.filter(m => m.id !== message.id));
                                                toast.success("Message deleted!");
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    // Content Manager Features
    const contentCreationContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Content Creation</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Create New Content</h3>
                            <div className="space-y-4">
                                <Button color="primary" className="w-full">New Article</Button>
                                <Button color="primary" className="w-full">New Challenge</Button>
                                <Button color="primary" className="w-full">New Event</Button>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    // Content Manager States
    const [mediaFiles, setMediaFiles] = useState([
        { id: 1, name: "workout-video.mp4", type: "video", size: "25MB", uploadDate: "2024-03-15" },
        { id: 2, name: "nutrition-guide.pdf", type: "document", size: "2MB", uploadDate: "2024-03-14" },
        { id: 3, name: "team-photo.jpg", type: "image", size: "1.5MB", uploadDate: "2024-03-13" }
    ]);

    const [challengeTemplates, setChallengeTemplates] = useState([
        { id: 1, title: "30-Day Fitness Challenge", type: "fitness", duration: "30 days", participants: 15 },
        { id: 2, title: "Weekly Nutrition Goals", type: "nutrition", duration: "7 days", participants: 8 }
    ]);

    const [contentCalendar, setContentCalendar] = useState([
        { id: 1, title: "Weekly Workout Guide", type: "article", date: "2024-03-20", status: "scheduled" },
        { id: 2, title: "Nutrition Tips", type: "post", date: "2024-03-22", status: "draft" }
    ]);

    const [contentAnalytics, setContentAnalytics] = useState({
        totalViews: 1250,
        engagement: 78,
        topContent: [
            { id: 1, title: "Beginner's Workout Guide", views: 450, likes: 45 },
            { id: 2, title: "Healthy Recipes", views: 380, likes: 32 }
        ]
    });

    const [pendingContent, setPendingContent] = useState([
        { id: 1, title: "New Workout Routine", author: "John Doe", type: "article", submitted: "2024-03-15" },
        { id: 2, title: "Nutrition Tips", author: "Jane Smith", type: "post", submitted: "2024-03-16" }
    ]);

    // Content Manager Features
    const mediaManagementContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Media Management</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Upload New Media</h3>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Button 
                                        color="primary"
                                        onPress={() => {
                                            toast.info("File upload dialog would open here");
                                        }}
                                    >
                                        Choose File
                                    </Button>
                                    <Button 
                                        color="primary"
                                        onPress={() => {
                                            toast.success("File uploaded successfully!");
                                        }}
                                    >
                                        Upload
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Media Library</h3>
                            <div className="space-y-2">
                                {mediaFiles.map((file) => (
                                    <div key={file.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{file.name}</div>
                                            <div className="text-sm text-default-500">
                                                {file.type} • {file.size} • {file.uploadDate}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="light"
                                                onPress={() => {
                                                    toast.info("Preview feature coming soon!");
                                                }}
                                            >
                                                Preview
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="danger" 
                                                variant="light"
                                                onPress={() => {
                                                    setMediaFiles(mediaFiles.filter(f => f.id !== file.id));
                                                    toast.success("File deleted successfully!");
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const challengeTemplatesContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Challenge Templates</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Create New Template</h3>
                            <div className="space-y-4">
                                <Input 
                                    placeholder="Template Title"
                                    className="w-full"
                                />
                                <div className="flex gap-4">
                                    <Input 
                                        placeholder="Type (e.g., fitness, nutrition)"
                                        className="w-1/2"
                                    />
                                    <Input 
                                        placeholder="Duration"
                                        className="w-1/2"
                                    />
                                </div>
                                <Button 
                                    color="primary" 
                                    className="w-full"
                                    onPress={() => {
                                        toast.success("Template created successfully!");
                                    }}
                                >
                                    Create Template
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Existing Templates</h3>
                            <div className="space-y-2">
                                {challengeTemplates.map((template) => (
                                    <div key={template.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{template.title}</div>
                                            <div className="text-sm text-default-500">
                                                {template.type} • {template.duration} • {template.participants} participants
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="light"
                                                onPress={() => {
                                                    toast.info("Edit feature coming soon!");
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="primary"
                                                onPress={() => {
                                                    toast.success("Challenge created from template!");
                                                }}
                                            >
                                                Use Template
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const contentCalendarContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Content Calendar</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Schedule New Content</h3>
                            <div className="space-y-4">
                                <Input 
                                    placeholder="Content Title"
                                    className="w-full"
                                />
                                <div className="flex gap-4">
                                    <Input 
                                        type="date"
                                        className="w-1/2"
                                    />
                                    <Input 
                                        placeholder="Type (e.g., article, post)"
                                        className="w-1/2"
                                    />
                                </div>
                                <Button 
                                    color="primary" 
                                    className="w-full"
                                    onPress={() => {
                                        toast.success("Content scheduled successfully!");
                                    }}
                                >
                                    Schedule
                                </Button>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Upcoming Content</h3>
                            <div className="space-y-2">
                                {contentCalendar.map((content) => (
                                    <div key={content.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{content.title}</div>
                                            <div className="text-sm text-default-500">
                                                {content.type} • {content.date} • {content.status}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="light"
                                                onPress={() => {
                                                    toast.info("Edit feature coming soon!");
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="danger" 
                                                variant="light"
                                                onPress={() => {
                                                    setContentCalendar(contentCalendar.filter(c => c.id !== content.id));
                                                    toast.success("Content removed from calendar!");
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const contentAnalyticsContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Content Analytics</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Overview</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm text-default-500">Total Views</div>
                                    <div className="text-2xl font-bold">{contentAnalytics.totalViews}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-default-500">Engagement Rate</div>
                                    <div className="text-2xl font-bold">{contentAnalytics.engagement}%</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Top Performing Content</h3>
                            <div className="space-y-2">
                                {contentAnalytics.topContent.map((content) => (
                                    <div key={content.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{content.title}</div>
                                            <div className="text-sm text-default-500">
                                                {content.views} views • {content.likes} likes
                                            </div>
                                        </div>
                                        <Button 
                                            size="sm" 
                                            color="primary" 
                                            variant="light"
                                            onPress={() => {
                                                toast.info("Detailed analytics coming soon!");
                                            }}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const contentApprovalContent = (
        <div className="space-y-4">
            <Card className="p-4">
                <CardHeader className="text-xl font-bold">Content Approval</CardHeader>
                <CardBody>
                    <div className="space-y-4">
                        <div className="p-4 bg-default-100 rounded-lg">
                            <h3 className="font-bold mb-2">Pending Approvals</h3>
                            <div className="space-y-2">
                                {pendingContent.map((content) => (
                                    <div key={content.id} className="flex justify-between items-center p-2 bg-default-200 rounded">
                                        <div>
                                            <div className="font-bold">{content.title}</div>
                                            <div className="text-sm text-default-500">
                                                {content.type} • By {content.author} • {content.submitted}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="light"
                                                onPress={() => {
                                                    toast.info("Preview feature coming soon!");
                                                }}
                                            >
                                                Preview
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="success"
                                                onPress={() => {
                                                    setPendingContent(pendingContent.filter(c => c.id !== content.id));
                                                    toast.success("Content approved!");
                                                }}
                                            >
                                                Approve
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                color="danger"
                                                onPress={() => {
                                                    setPendingContent(pendingContent.filter(c => c.id !== content.id));
                                                    toast.error("Content rejected!");
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const featureContent: FeatureContent = {
        // Team Member Features
        "Health Tracking": healthTrackingContent,
        "Team Challenges": teamChallengesContent,
        "Community": communityContent,
        "Personal Goals": personalGoalsContent,
        "Progress Reports": progressReportsContent,
        "Notifications": notificationsContent,

        // Team Captain Features
        "Team Management": teamManagementContent,
        "Challenge Creation": challengeCreationContent,
        "Progress Monitoring": progressMonitoringContent,
        "Team Calendar": teamCalendarContent,
        "Team Settings": teamSettingsContent,
        "Team Communication": teamCommunicationContent,

        // Content Manager Features
        "Content Creation": contentCreationContent,
        "Media Management": mediaManagementContent,
        "Challenge Templates": challengeTemplatesContent,
        "Content Calendar": contentCalendarContent,
        "Content Analytics": contentAnalyticsContent,
        "Content Approval": contentApprovalContent,
    };

    return featureContent[featureTitle] || <div>Feature content coming soon</div>;
} 