import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Tabs, Tab } from "@nextui-org/tabs";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import {
    IconClock,
    IconCheck,
    IconX,
    IconCalendar,
    IconMapPin,
    IconVideo,
    IconUser,
} from "@tabler/icons-react";
import { SessionRequest, SessionStatus, SessionType } from "@/types/session";
import {
    getUserSessionRequests,
    getSessionRequestsByStatus,
    updateSessionRequestStatus,
    getUserSessionSchedules,
    completeSession,
    cancelSessionSchedule,
} from "@/api/sessionRequest";

// Demo session data for showcase when Firestore fails or is empty
const DEMO_REQUESTS: SessionRequest[] = [];
const DEMO_SCHEDULES: any[] = [];
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import RatingModal from "@/components/RatingModal";
import { hasUserRatedSession } from "@/api/rating";
import Calendar from "@/components/Calendar";

export default function SessionsPage() {
    const [requests, setRequests] = useState<SessionRequest[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>("requests");
    const [ratingModal, setRatingModal] = useState<{
        isOpen: boolean;
        sessionRequestId: string;
        rateeId: string;
        rateeName: string;
        skillId: string;
        skillName: string;
    } | null>(null);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === "requests") {
                try {
                    const result = await getUserSessionRequests();
                    if (!result.error) {
                        setRequests(result.data || []);
                    } else {
                        // Use demo data if there's an error
                        console.warn("Failed to load requests from Firestore, using demo data:", result.msg);
                        setRequests(DEMO_REQUESTS);
                    }
                } catch (error) {
                    console.warn("Error loading requests, using demo data:", error);
                    setRequests(DEMO_REQUESTS);
                }
            } else if (activeTab === "schedules") {
                try {
                    const result = await getUserSessionSchedules();
                    if (!result.error && result.data && Array.isArray(result.data)) {
                        setSchedules(result.data);
                    } else {
                        // Use demo data if there's an error
                        console.warn("Failed to load schedules from Firestore, using demo data:", result.msg);
                        setSchedules(DEMO_SCHEDULES);
                    }
                } catch (error) {
                    console.warn("Error loading schedules, using demo data:", error);
                    setSchedules(DEMO_SCHEDULES);
                }
            }
        } catch (error) {
            console.error("Unexpected error loading data:", error);
            // Set empty arrays on unexpected errors
            if (activeTab === "requests") {
                setRequests(DEMO_REQUESTS);
            } else {
                setSchedules(DEMO_SCHEDULES);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (requestId: string) => {
        try {
            const result = await updateSessionRequestStatus(requestId, SessionStatus.ACCEPTED);
            if (!result.error) {
                toast.success("Session request accepted!");
                loadData();
            } else {
                toast.error(result.msg);
            }
        } catch (error) {
            toast.error("Failed to accept request");
        }
    };

    const handleRejectRequest = async (requestId: string) => {
        try {
            const result = await updateSessionRequestStatus(requestId, SessionStatus.REJECTED);
            if (!result.error) {
                toast.success("Session request rejected");
                loadData();
            } else {
                toast.error(result.msg);
            }
        } catch (error) {
            toast.error("Failed to reject request");
        }
    };

    const handleCancelRequest = async (requestId: string) => {
        try {
            const result = await updateSessionRequestStatus(requestId, SessionStatus.CANCELLED);
            if (!result.error) {
                toast.success("Session request cancelled");
                loadData();
            } else {
                toast.error(result.msg);
            }
        } catch (error) {
            toast.error("Failed to cancel request");
        }
    };

    const handleCompleteSession = async (scheduleId: string, request: any) => {
        try {
            const result = await completeSession(scheduleId);
            if (!result.error) {
                toast.success("Session marked as completed!");
                
                // Find the request to get the other user's info
                const currentUserId = localStorage.getItem("userId") || "";
                const rateeId = request.requesterId === currentUserId ? request.recipientId : request.requesterId;
                const rateeName = request.requesterId === currentUserId ? request.recipientName : request.requesterName;
                const skillId = request.skillSoughtId || "";
                const skillName = request.skillSoughtName || "";
                
                // Open rating modal
                setRatingModal({
                    isOpen: true,
                    sessionRequestId: request.id,
                    rateeId,
                    rateeName,
                    skillId,
                    skillName
                });
                
                loadData();
            } else {
                toast.error(result.msg);
            }
        } catch (error) {
            toast.error("Failed to complete session");
        }
    };

    const handleCancelSchedule = async (scheduleId: string) => {
        if (!confirm("Are you sure you want to cancel this session?")) {
            return;
        }

        try {
            const result = await cancelSessionSchedule(scheduleId);
            if (!result.error) {
                toast.success("Session cancelled successfully");
                loadData();
            } else {
                toast.error(result.msg);
            }
        } catch (error) {
            toast.error("Failed to cancel session");
        }
    };

    const getStatusColor = (status: SessionStatus) => {
        switch (status) {
            case SessionStatus.PENDING:
                return "warning";
            case SessionStatus.ACCEPTED:
                return "success";
            case SessionStatus.REJECTED:
                return "danger";
            case SessionStatus.COMPLETED:
                return "default";
            case SessionStatus.CANCELLED:
                return "danger";
            default:
                return "default";
        }
    };

    const formatDate = (date: Date | any) => {
        if (!date) return "N/A";
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const pendingRequests = requests.filter((r) => r.status === SessionStatus.PENDING);
    const acceptedRequests = requests.filter((r) => r.status === SessionStatus.ACCEPTED);
    const completedRequests = requests.filter((r) => r.status === SessionStatus.COMPLETED);

    return (
        <DefaultLayout>
            <ToastContainer />
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Sessions</h1>
                    <Link to="/browse">
                        <Button color="primary">Find Skill Partners</Button>
                    </Link>
                </div>

                <Tabs
                    aria-label="Session Options"
                    color="secondary"
                    selectedKey={activeTab}
                    onSelectionChange={(key) => setActiveTab(key as string)}
                >
                    <Tab
                        key="requests"
                        title={
                            <div className="flex items-center space-x-2">
                                <IconClock size={20} />
                                <span>Requests</span>
                                {pendingRequests.length > 0 && (
                                    <Chip size="sm" color="warning">
                                        {pendingRequests.length}
                                    </Chip>
                                )}
                            </div>
                        }
                    >
                        <div className="mt-4 space-y-4">
                            {loading ? (
                                <p className="text-center py-8">Loading...</p>
                            ) : requests.length === 0 ? (
                                <Card>
                                    <CardBody className="text-center py-12">
                                        <p className="text-default-500 mb-4">No session requests yet</p>
                                        <Link to="/browse">
                                            <Button color="primary">Browse Skills</Button>
                                        </Link>
                                    </CardBody>
                                </Card>
                            ) : (
                                <div className="space-y-4">
                                    {pendingRequests.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4">Pending Requests</h3>
                                            {pendingRequests.map((request) => (
                                                <Card key={request.id} className="mb-4">
                                                    <CardBody>
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <IconUser size={20} />
                                                                    <span className="font-semibold">
                                                                        {request.requesterId ===
                                                                        localStorage.getItem("userId")
                                                                            ? request.recipientName
                                                                            : request.requesterName}
                                                                    </span>
                                                                    <Chip size="sm" color={getStatusColor(request.status)}>
                                                                        {request.status}
                                                                    </Chip>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                                    <div>
                                                                        <p className="text-sm text-default-500">
                                                                            Skill Offered
                                                                        </p>
                                                                        <p className="font-semibold">
                                                                            {request.skillOfferedName}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-default-500">
                                                                            Skill Sought
                                                                        </p>
                                                                        <p className="font-semibold">
                                                                            {request.skillSoughtName}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="mt-4 flex items-center gap-4 text-sm text-default-600">
                                                                    <div className="flex items-center gap-1">
                                                                        <IconCalendar size={16} />
                                                                        {formatDate(request.proposedDate)}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <IconClock size={16} />
                                                                        {request.proposedTime}
                                                                    </div>
                                                                    {request.location && (
                                                                        <div className="flex items-center gap-1">
                                                                            <IconMapPin size={16} />
                                                                            {request.location}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {request.description && (
                                                                    <p className="mt-2 text-sm">{request.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2 ml-4">
                                                                {request.recipientId ===
                                                                    localStorage.getItem("userId") && (
                                                                    <>
                                                                        <Button
                                                                            color="success"
                                                                            size="sm"
                                                                            startContent={<IconCheck size={18} />}
                                                                            onPress={() =>
                                                                                handleAcceptRequest(request.id)
                                                                            }
                                                                        >
                                                                            Accept
                                                                        </Button>
                                                                        <Button
                                                                            color="danger"
                                                                            size="sm"
                                                                            variant="light"
                                                                            startContent={<IconX size={18} />}
                                                                            onPress={() =>
                                                                                handleRejectRequest(request.id)
                                                                            }
                                                                        >
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}
                                                                {request.requesterId ===
                                                                    localStorage.getItem("userId") && (
                                                                    <Button
                                                                        color="danger"
                                                                        size="sm"
                                                                        variant="light"
                                                                        onPress={() => handleCancelRequest(request.id)}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    )}

                                    {acceptedRequests.length > 0 && (
                                        <div>
                                            <h3 className="text-xl font-semibold mb-4 mt-8">Accepted Requests</h3>
                                            {acceptedRequests.map((request) => (
                                                <Card key={request.id} className="mb-4">
                                                    <CardBody>
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <IconUser size={20} />
                                                                    <span className="font-semibold">
                                                                        {request.requesterId ===
                                                                        localStorage.getItem("userId")
                                                                            ? request.recipientName
                                                                            : request.requesterName}
                                                                    </span>
                                                                    <Chip size="sm" color={getStatusColor(request.status)}>
                                                                        {request.status}
                                                                    </Chip>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4 mt-4">
                                                                    <div>
                                                                        <p className="text-sm text-default-500">
                                                                            Skill Offered
                                                                        </p>
                                                                        <p className="font-semibold">
                                                                            {request.skillOfferedName}
                                                                        </p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-default-500">
                                                                            Skill Sought
                                                                        </p>
                                                                        <p className="font-semibold">
                                                                            {request.skillSoughtName}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {request.meetingLink && (
                                                                    <div className="mt-4">
                                                                        <Link
                                                                            to={request.meetingLink}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                        >
                                                                            <Button
                                                                                color="primary"
                                                                                size="sm"
                                                                                startContent={<IconVideo size={18} />}
                                                                            >
                                                                                Join Meeting
                                                                            </Button>
                                                                        </Link>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Tab>

                    <Tab
                        key="schedules"
                        title={
                            <div className="flex items-center space-x-2">
                                <IconCalendar size={20} />
                                <span>My Schedule</span>
                            </div>
                        }
                    >
                        <div className="mt-4">
                            <Calendar
                                events={schedules.map(schedule => ({
                                    id: schedule.id,
                                    title: schedule.skillName || "Session",
                                    date: schedule.scheduledDate?.toDate ? schedule.scheduledDate.toDate() : new Date(schedule.scheduledDate),
                                    time: schedule.scheduledTime,
                                    duration: schedule.duration,
                                    type: "session"
                                }))}
                                onEventClick={(event) => {
                                    const schedule = schedules.find(s => s.id === event.id);
                                    if (schedule) {
                                        // Could open a modal or navigate to details
                                        console.log("Clicked event:", schedule);
                                    }
                                }}
                                onFileUpload={(file) => {
                                    toast.info(`Uploaded schedule file: ${file.name}`);
                                    // Here you would parse the file and add events to the calendar
                                    // For now, just show a toast
                                }}
                            />
                        </div>
                        
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4">Session Details</h3>
                            {loading ? (
                                <p className="text-center py-8">Loading...</p>
                            ) : schedules.length === 0 ? (
                                <Card>
                                    <CardBody className="text-center py-12">
                                        <p className="text-default-500">No scheduled sessions yet</p>
                                    </CardBody>
                                </Card>
                            ) : (
                                schedules.map((schedule) => (
                                    <Card key={schedule.id} className="mb-4">
                                        <CardBody>
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold text-lg">
                                                            {schedule.skillName}
                                                        </h3>
                                                        <Chip size="sm" color={getStatusColor(schedule.status)}>
                                                            {schedule.status}
                                                        </Chip>
                                                    </div>
                                                    <div className="mt-4 flex items-center gap-4 text-sm text-default-600">
                                                        <div className="flex items-center gap-1">
                                                            <IconCalendar size={16} />
                                                            {formatDate(schedule.scheduledDate)}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <IconClock size={16} />
                                                            {schedule.scheduledTime} ({schedule.duration} min)
                                                        </div>
                                                        {schedule.location && (
                                                            <div className="flex items-center gap-1">
                                                                <IconMapPin size={16} />
                                                                {schedule.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {schedule.meetingLink && (
                                                        <div className="mt-4">
                                                            <Link
                                                                to={schedule.meetingLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Button
                                                                    color="primary"
                                                                    size="sm"
                                                                    startContent={<IconVideo size={18} />}
                                                                >
                                                                    Join Meeting
                                                                </Button>
                                                            </Link>
                                                        </div>
                                                    )}
                                                    {schedule.notes && (
                                                        <p className="mt-2 text-sm">{schedule.notes}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-2">
                                                    {schedule.status === SessionStatus.ACCEPTED && (
                                                        <Button
                                                            color="success"
                                                            size="sm"
                                                            onPress={() => {
                                                                const request = requests.find(r => 
                                                                    r.id === schedule.sessionRequestId || 
                                                                    schedule.sessionRequestId === r.id
                                                                ) || null;
                                                                handleCompleteSession(schedule.id, request || schedule);
                                                            }}
                                                        >
                                                            Mark Complete
                                                        </Button>
                                                    )}
                                                    {(schedule.status === SessionStatus.ACCEPTED || schedule.status === SessionStatus.PENDING) && (
                                                        <Button
                                                            color="danger"
                                                            size="sm"
                                                            variant="light"
                                                            startContent={<IconX size={18} />}
                                                            onPress={() => handleCancelSchedule(schedule.id)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))
                            )}
                        </div>
                    </Tab>
                </Tabs>
                
                {ratingModal && (
                    <RatingModal
                        isOpen={ratingModal.isOpen}
                        onClose={() => setRatingModal(null)}
                        sessionRequestId={ratingModal.sessionRequestId}
                        rateeId={ratingModal.rateeId}
                        rateeName={ratingModal.rateeName}
                        skillId={ratingModal.skillId}
                        skillName={ratingModal.skillName}
                        onRatingSubmitted={() => {
                            setRatingModal(null);
                            loadData();
                        }}
                    />
                )}
            </div>
        </DefaultLayout>
    );
}