import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/table";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import {
    IconUsers,
    IconTrendingUp,
    IconCalendar,
    IconStar,
    IconActivity,
    IconEdit,
    IconTrash,
    IconRefresh,
} from "@tabler/icons-react";
import { getPlatformStats, getAllUsers, getRecentActivity, adminUpdateUser, adminDeleteUser } from "@/api/admin";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth } from "@/api/config";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

interface PlatformStats {
    totalUsers: number;
    activeUsers: number;
    totalSessions: number;
    completedSessions: number;
    totalRatings: number;
    averageRating: number;
    pendingSessions: number;
    acceptedSessions: number;
}

interface ActivityItem {
    type: string;
    id: string;
    action: string;
    userId: string;
    userName: string;
    targetUserId?: string;
    targetUserName?: string;
    timestamp: any;
    data: any;
}

export default function AdminPage() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("dashboard");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                navigate("/");
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        // Check if user is admin - redirect if not
        // This check should ideally be done on the backend
        if (user) {
            loadData();
        }
    }, [activeTab, user]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === "dashboard") {
                const statsResult = await getPlatformStats();
                if (statsResult.error) {
                    if (statsResult.msg?.includes("admin")) {
                        toast.error("Access denied: Admin privileges required");
                        navigate("/");
                        return;
                    }
                    toast.error(statsResult.msg);
                } else {
                    setStats(statsResult.data as PlatformStats);
                }
            } else if (activeTab === "users") {
                const usersResult = await getAllUsers(100);
                if (usersResult.error) {
                    toast.error(usersResult.msg);
                } else {
                    setUsers(usersResult.data || []);
                }
            } else if (activeTab === "activity") {
                const activityResult = await getRecentActivity(50);
                if (activityResult.error) {
                    toast.error(activityResult.msg);
                } else {
                    setActivity(activityResult.data || []);
                }
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            return;
        }

        const result = await adminDeleteUser(userId);
        if (result.error) {
            toast.error(result.msg);
        } else {
            toast.success("User deleted successfully");
            loadData();
        }
    };

    const formatDate = (date: any) => {
        if (!date) return "N/A";
        const d = date?.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    };

    if (!user) {
        return null;
    }

    return (
        <DefaultLayout>
            <ToastContainer />
            <div className="max-w-7xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <Button
                        color="primary"
                        startContent={<IconRefresh size={18} />}
                        onPress={loadData}
                        isLoading={loading}
                    >
                        Refresh
                    </Button>
                </div>

                <Tabs
                    aria-label="Admin Options"
                    color="secondary"
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                >
                    <Tab
                        key="dashboard"
                        title={
                            <div className="flex items-center space-x-2">
                                <IconTrendingUp size={20} />
                                <span>Dashboard</span>
                            </div>
                        }
                    >
                        {loading ? (
                            <p className="text-center py-8">Loading statistics...</p>
                        ) : stats ? (
                            <div className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                    <Card>
                                        <CardBody>
                                            <div className="flex items-center gap-3">
                                                <IconUsers size={32} className="text-primary" />
                                                <div>
                                                    <p className="text-sm text-default-500">Total Users</p>
                                                    <p className="text-2xl font-bold">{stats.totalUsers}</p>
                                                    <p className="text-xs text-default-400">
                                                        {stats.activeUsers} active
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <Card>
                                        <CardBody>
                                            <div className="flex items-center gap-3">
                                                <IconCalendar size={32} className="text-primary" />
                                                <div>
                                                    <p className="text-sm text-default-500">Total Sessions</p>
                                                    <p className="text-2xl font-bold">{stats.totalSessions}</p>
                                                    <p className="text-xs text-default-400">
                                                        {stats.completedSessions} completed
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <Card>
                                        <CardBody>
                                            <div className="flex items-center gap-3">
                                                <IconStar size={32} className="text-yellow-400" />
                                                <div>
                                                    <p className="text-sm text-default-500">Average Rating</p>
                                                    <p className="text-2xl font-bold">
                                                        {stats.averageRating.toFixed(1)}
                                                    </p>
                                                    <p className="text-xs text-default-400">
                                                        {stats.totalRatings} total ratings
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    <Card>
                                        <CardBody>
                                            <div className="flex items-center gap-3">
                                                <IconActivity size={32} className="text-success" />
                                                <div>
                                                    <p className="text-sm text-default-500">Session Status</p>
                                                    <p className="text-lg font-semibold">
                                                        {stats.pendingSessions} pending
                                                    </p>
                                                    <p className="text-xs text-default-400">
                                                        {stats.acceptedSessions} accepted
                                                    </p>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                </div>
                            </div>
                        ) : (
                            <p className="text-center py-8">Failed to load statistics</p>
                        )}
                    </Tab>

                    <Tab
                        key="users"
                        title={
                            <div className="flex items-center space-x-2">
                                <IconUsers size={20} />
                                <span>Users</span>
                            </div>
                        }
                    >
                        <div className="mt-4">
                            {loading ? (
                                <p className="text-center py-8">Loading users...</p>
                            ) : users.length === 0 ? (
                                <Card>
                                    <CardBody className="text-center py-12">
                                        <p className="text-default-500">No users found</p>
                                    </CardBody>
                                </Card>
                            ) : (
                                <Table aria-label="Users table">
                                    <TableHeader>
                                        <TableColumn>NAME</TableColumn>
                                        <TableColumn>EMAIL</TableColumn>
                                        <TableColumn>ROLE</TableColumn>
                                        <TableColumn>RATING</TableColumn>
                                        <TableColumn>ACTIONS</TableColumn>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell>{user.displayName || "N/A"}</TableCell>
                                                <TableCell>{user.email || "N/A"}</TableCell>
                                                <TableCell>
                                                    <Chip size="sm" variant="flat">
                                                        {user.immutable?.memberType || "Member"}
                                                    </Chip>
                                                </TableCell>
                                                <TableCell>
                                                    {user.averageRating ? (
                                                        <div className="flex items-center gap-1">
                                                            <IconStar size={16} className="text-yellow-400" fill="currentColor" />
                                                            <span>{user.averageRating.toFixed(1)}</span>
                                                            <span className="text-xs text-default-400">
                                                                ({user.totalRatings || 0})
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-default-400">No ratings</span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="light"
                                                            color="danger"
                                                            startContent={<IconTrash size={16} />}
                                                            onPress={() => handleDeleteUser(user.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </Tab>

                    <Tab
                        key="activity"
                        title={
                            <div className="flex items-center space-x-2">
                                <IconActivity size={20} />
                                <span>Activity</span>
                            </div>
                        }
                    >
                        <div className="mt-4">
                            {loading ? (
                                <p className="text-center py-8">Loading activity...</p>
                            ) : activity.length === 0 ? (
                                <Card>
                                    <CardBody className="text-center py-12">
                                        <p className="text-default-500">No recent activity</p>
                                    </CardBody>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {activity.map((item) => (
                                        <Card key={item.id}>
                                            <CardBody>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Chip size="sm" variant="flat" color={
                                                                item.type === "rating" ? "success" : "primary"
                                                            }>
                                                                {item.type}
                                                            </Chip>
                                                            <span className="font-semibold">{item.userName}</span>
                                                            <span className="text-default-500">{item.action}</span>
                                                            {item.targetUserName && (
                                                                <>
                                                                    <span className="text-default-500">for</span>
                                                                    <span className="font-semibold">
                                                                        {item.targetUserName}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {item.data && (
                                                            <div className="text-sm text-default-600 mt-2">
                                                                {item.type === "session" && (
                                                                    <div>
                                                                        <span>Skill: {item.data.skillOffered} → {item.data.skillSought}</span>
                                                                    </div>
                                                                )}
                                                                {item.type === "rating" && (
                                                                    <div className="flex items-center gap-2">
                                                                        <IconStar size={16} className="text-yellow-400" fill="currentColor" />
                                                                        <span>{item.data.rating}/5 for {item.data.skill}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-default-400 mt-2">
                                                            {formatDate(item.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardBody>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Tab>
                </Tabs>
            </div>
        </DefaultLayout>
    );
}
