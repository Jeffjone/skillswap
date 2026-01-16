import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { Chip } from "@nextui-org/chip";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@nextui-org/modal";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@nextui-org/dropdown";
import DefaultLayout from "@/layouts/default";
import { useEffect, useState } from "react";
import {
    IconSend,
    IconMessage,
    IconSearch,
    IconUser,
    IconClock,
    IconUsers,
    IconPlus,
    IconCircleFilled,
    IconInfoCircle,
    IconX,
    IconMail,
    IconMapPin,
    IconStar,
    IconPlane,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { auth } from "@/api/config";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, Timestamp, orderBy } from "firebase/firestore";
import { db } from "@/api/config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Conversation {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    lastMessage?: string;
    lastMessageTime?: any;
    unreadCount: number;
    status?: "online" | "offline" | "typing";
    team?: string;
    purpose?: string;
    isGroup?: boolean;
    groupMembers?: string[];
}

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    content: string;
    timestamp: any;
    read: boolean;
}

export default function MessagingPage() {
    const { theme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark" || theme === "dark";
    const [user, setUser] = useState<any>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
    const [showNewChatDropdown, setShowNewChatDropdown] = useState(false);
    
    // Demo conversations with real user data
    const DEMO_CONVERSATIONS: Conversation[] = [
        {
            id: "demo1",
            userId: "demo_user_1",
            userName: "Sarah Johnson",
            userEmail: "sarah.j@email.com",
            lastMessage: "Thanks for the JavaScript session yesterday! It really helped.",
            lastMessageTime: Timestamp.now(),
            unreadCount: 0,
            status: "online",
            team: "Web Development Team",
            purpose: "Skill Exchange: JavaScript"
        },
        {
            id: "demo2",
            userId: "demo_user_2",
            userName: "Mike Chen",
            userEmail: "mike.c@email.com",
            lastMessage: "Looking forward to our guitar lesson this weekend!",
            lastMessageTime: Timestamp.fromMillis(Date.now() - 3600000),
            unreadCount: 2,
            status: "typing",
            team: "Music Club",
            purpose: "Skill Exchange: Guitar"
        },
        {
            id: "demo3",
            userId: "demo_user_3",
            userName: "Alex Rivera",
            userEmail: "alex.r@email.com",
            lastMessage: "Can we schedule a Python tutoring session?",
            lastMessageTime: Timestamp.fromMillis(Date.now() - 86400000),
            unreadCount: 1,
            status: "offline",
            team: "Coding Bootcamp",
            purpose: "Skill Exchange: Python"
        },
        {
            id: "demo_group",
            userId: "group_chat_1",
            userName: "Study Group - Spanish",
            userEmail: "",
            lastMessage: "Everyone: Let's meet at the library tomorrow at 3pm",
            lastMessageTime: Timestamp.fromMillis(Date.now() - 7200000),
            unreadCount: 5,
            status: "online",
            team: "Language Exchange Club",
            purpose: "Group Study Session",
            isGroup: true,
            groupMembers: ["Sarah Johnson", "Mike Chen", "Alex Rivera", "You"]
        }
    ];
    
    // Demo messages for conversations
    const DEMO_MESSAGES: { [key: string]: Message[] } = {
        demo1: [
            {
                id: "msg1",
                senderId: "demo_user_1",
                senderName: "Sarah Johnson",
                receiverId: user?.uid || "",
                content: "Hi! I saw you're offering JavaScript tutoring. Would you be available this week?",
                timestamp: Timestamp.fromMillis(Date.now() - 172800000),
                read: true
            },
            {
                id: "msg2",
                senderId: user?.uid || "",
                senderName: user?.displayName || "You",
                receiverId: "demo_user_1",
                content: "Sure! I'm available Wednesday afternoon. What specific topics would you like to cover?",
                timestamp: Timestamp.fromMillis(Date.now() - 172700000),
                read: true
            },
            {
                id: "msg3",
                senderId: "demo_user_1",
                senderName: "Sarah Johnson",
                receiverId: user?.uid || "",
                content: "I'd love to learn about async/await and Promises. Those always confuse me!",
                timestamp: Timestamp.fromMillis(Date.now() - 172600000),
                read: true
            },
            {
                id: "msg4",
                senderId: user?.uid || "",
                senderName: user?.displayName || "You",
                receiverId: "demo_user_1",
                content: "Perfect! I'll prepare some examples. See you Wednesday at 2pm in the library?",
                timestamp: Timestamp.fromMillis(Date.now() - 172500000),
                read: true
            },
            {
                id: "msg5",
                senderId: "demo_user_1",
                senderName: "Sarah Johnson",
                receiverId: user?.uid || "",
                content: "Thanks for the JavaScript session yesterday! It really helped.",
                timestamp: Timestamp.now(),
                read: false
            }
        ],
        demo2: [
            {
                id: "msg6",
                senderId: "demo_user_2",
                senderName: "Mike Chen",
                receiverId: user?.uid || "",
                content: "Hey! I noticed you're looking to learn guitar. I can help you get started!",
                timestamp: Timestamp.fromMillis(Date.now() - 259200000),
                read: true
            },
            {
                id: "msg7",
                senderId: user?.uid || "",
                senderName: user?.displayName || "You",
                receiverId: "demo_user_2",
                content: "That would be amazing! I'm a complete beginner. What should I bring?",
                timestamp: Timestamp.fromMillis(Date.now() - 259100000),
                read: true
            },
            {
                id: "msg8",
                senderId: "demo_user_2",
                senderName: "Mike Chen",
                receiverId: user?.uid || "",
                content: "Just bring yourself! I'll bring a spare guitar. We can start with basic chords.",
                timestamp: Timestamp.fromMillis(Date.now() - 259000000),
                read: true
            },
            {
                id: "msg9",
                senderId: user?.uid || "",
                senderName: user?.displayName || "You",
                receiverId: "demo_user_2",
                content: "Perfect! This weekend works for me. What time?",
                timestamp: Timestamp.fromMillis(Date.now() - 3600000),
                read: false
            },
            {
                id: "msg10",
                senderId: "demo_user_2",
                senderName: "Mike Chen",
                receiverId: user?.uid || "",
                content: "Looking forward to our guitar lesson this weekend!",
                timestamp: Timestamp.fromMillis(Date.now() - 1800000),
                read: false
            }
        ]
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                loadConversations(currentUser.uid);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (selectedConversation && user) {
            const unsubscribe = loadMessages(user.uid, selectedConversation.userId);
            return () => {
                if (unsubscribe) unsubscribe();
            };
        } else {
            setMessages([]);
        }
    }, [selectedConversation, user]);

    const loadConversations = async (currentUserId: string) => {
        try {
            setLoading(true);
            
            // Use demo conversations as fallback
            let loadedConversations: Conversation[] = [];
            
            try {
                // Try to load from Firestore
                const sentQuery = query(
                    collection(db, "messages"),
                    where("senderId", "==", currentUserId),
                    orderBy("timestamp", "desc")
                );
                
                const receivedQuery = query(
                    collection(db, "messages"),
                    where("receiverId", "==", currentUserId),
                    orderBy("timestamp", "desc")
                );

                const [sentSnapshot, receivedSnapshot] = await Promise.all([
                    getDocs(sentQuery),
                    getDocs(receivedQuery)
                ]);

                const conversationMap = new Map<string, Conversation>();

                // Process sent messages
                sentSnapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data();
                    const otherUserId = data.receiverId;
                    if (!conversationMap.has(otherUserId)) {
                        conversationMap.set(otherUserId, {
                            id: otherUserId,
                            userId: otherUserId,
                            userName: data.receiverName || "Unknown",
                            userEmail: data.receiverEmail || "",
                            lastMessage: data.content,
                            lastMessageTime: data.timestamp,
                            unreadCount: 0
                        });
                    }
                });

                // Process received messages
                receivedSnapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data();
                    const otherUserId = data.senderId;
                    const existing = conversationMap.get(otherUserId);
                    if (existing) {
                        if (!existing.lastMessageTime || data.timestamp?.toMillis() > existing.lastMessageTime.toMillis()) {
                            existing.lastMessage = data.content;
                            existing.lastMessageTime = data.timestamp;
                        }
                        if (!data.read) {
                            existing.unreadCount += 1;
                        }
                    } else {
                        conversationMap.set(otherUserId, {
                            id: otherUserId,
                            userId: otherUserId,
                            userName: data.senderName || "Unknown",
                            userEmail: data.senderEmail || "",
                            lastMessage: data.content,
                            lastMessageTime: data.timestamp,
                            unreadCount: data.read ? 0 : 1
                        });
                    }
                });

                loadedConversations = Array.from(conversationMap.values());
            } catch (error) {
                console.warn("Error loading from Firestore, using demo conversations:", error);
            }
            
            // Merge with demo conversations if Firestore is empty
            if (loadedConversations.length === 0) {
                loadedConversations = DEMO_CONVERSATIONS;
            } else {
                // Add demo conversations that don't exist in Firestore
                DEMO_CONVERSATIONS.forEach(demo => {
                    if (!loadedConversations.find(c => c.id === demo.id)) {
                        loadedConversations.push(demo);
                    }
                });
            }

            setConversations(loadedConversations);
        } catch (error) {
            console.error("Error loading conversations:", error);
            // Fallback to demo conversations
            setConversations(DEMO_CONVERSATIONS);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = (currentUserId: string, otherUserId: string) => {
        try {
            // Check if this is a demo conversation
            const demoConv = DEMO_CONVERSATIONS.find(c => c.id === otherUserId);
            if (demoConv && DEMO_MESSAGES[otherUserId]) {
                // Use demo messages
                setMessages(DEMO_MESSAGES[otherUserId] || []);
                return () => {}; // No-op unsubscribe
            }
            
            // Try to load from Firestore
            const messagesQuery = query(
                collection(db, "messages"),
                orderBy("timestamp", "asc")
            );

            const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
                const allMessages: Message[] = [];
                snapshot.forEach((docSnapshot) => {
                    const data = docSnapshot.data();
                    if (
                        (data.senderId === currentUserId && data.receiverId === otherUserId) ||
                        (data.senderId === otherUserId && data.receiverId === currentUserId)
                    ) {
                        allMessages.push({
                            id: docSnapshot.id,
                            ...data
                        } as Message);
                    }
                });
                
                // Fallback to demo if no messages found
                if (allMessages.length === 0 && DEMO_MESSAGES[otherUserId]) {
                    setMessages(DEMO_MESSAGES[otherUserId] || []);
                } else {
                    setMessages(allMessages);
                }
                
                // Mark messages as read (only for Firestore messages)
                allMessages.forEach((msg) => {
                    if (msg.receiverId === currentUserId && !msg.read && msg.id && !msg.id.startsWith("msg")) {
                        updateDoc(doc(db, "messages", msg.id), { read: true }).catch(console.error);
                    }
                });
            }, (error) => {
                console.warn("Error loading messages, using demo:", error);
                if (DEMO_MESSAGES[otherUserId]) {
                    setMessages(DEMO_MESSAGES[otherUserId] || []);
                }
            });

            return unsubscribe;
        } catch (error) {
            console.error("Error loading messages:", error);
            // Fallback to demo messages
            if (DEMO_MESSAGES[otherUserId]) {
                setMessages(DEMO_MESSAGES[otherUserId] || []);
            }
            return () => {}; // No-op unsubscribe
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation || !user) {
            return;
        }

        try {
            await addDoc(collection(db, "messages"), {
                senderId: user.uid,
                senderName: user.displayName || "Anonymous",
                senderEmail: user.email || "",
                receiverId: selectedConversation.userId,
                receiverName: selectedConversation.userName,
                receiverEmail: selectedConversation.userEmail,
                content: newMessage.trim(),
                timestamp: Timestamp.now(),
                read: false
            });
            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return "Yesterday";
        } else if (days < 7) {
            return date.toLocaleDateString([], { weekday: 'short' });
        } else {
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!user) {
        return (
            <DefaultLayout>
                <div style={{ textAlign: "center", padding: "40px", color: isDark ? "#ffffff" : "#000000" }}>
                    <p>Please log in to access messaging.</p>
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <ToastContainer />
            <div style={{ 
                maxWidth: "1400px", 
                margin: "0 auto", 
                padding: "20px",
                color: isDark ? "#ffffff" : "#000000",
                minHeight: "80vh"
            }}>
                <h1 style={{ 
                    fontSize: "32px", 
                    fontWeight: "bold", 
                    marginBottom: "30px",
                    color: isDark ? "#ffffff" : "#000000"
                }}>
                    Messages
                </h1>

                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "350px 1fr", 
                    gap: "20px",
                    height: "calc(100vh - 200px)",
                    minHeight: "600px"
                }}>
                    {/* Conversations List */}
                    <Card style={{ 
                        background: isDark ? "#1a1a1a" : "#ffffff",
                        border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e7eb"
                    }}>
                        <CardHeader style={{ 
                            borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
                            padding: "20px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px"
                        }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <Input
                                    placeholder="Search conversations..."
                                    value={searchTerm}
                                    onValueChange={setSearchTerm}
                                    startContent={<IconSearch size={18} />}
                                    variant="bordered"
                                    size="sm"
                                    style={{ flex: 1 }}
                                />
                                <Dropdown 
                                    isOpen={showNewChatDropdown}
                                    onOpenChange={setShowNewChatDropdown}
                                >
                                    <DropdownTrigger>
                                        <Button
                                            isIconOnly
                                            style={{
                                                background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                                color: "white"
                                            }}
                                            size="sm"
                                        >
                                            <IconPlane size={18} />
                                        </Button>
                                    </DropdownTrigger>
                                    <DropdownMenu 
                                        aria-label="New Chat Options"
                                        onAction={(key) => {
                                            if (key === "individual") {
                                                toast.info("Starting new individual chat... Select a user from Browse to message them!");
                                                setShowNewChatDropdown(false);
                                            } else if (key === "group") {
                                                toast.info("Group chat creation coming soon!");
                                                setShowNewChatDropdown(false);
                                            }
                                        }}
                                    >
                                        <DropdownItem key="individual" startContent={<IconUser size={18} />}>
                                            New Individual Chat
                                        </DropdownItem>
                                        <DropdownItem key="group" startContent={<IconUsers size={18} />}>
                                            New Group Chat
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                            <Button
                                variant="flat"
                                color="primary"
                                startContent={<IconUsers size={18} />}
                                size="sm"
                                onPress={() => {
                                    const groupChat = DEMO_CONVERSATIONS.find(c => c.isGroup);
                                    if (groupChat) {
                                        setSelectedConversation(groupChat);
                                    } else {
                                        toast.info("Group chat feature coming soon!");
                                    }
                                }}
                            >
                                New Group Chat
                            </Button>
                        </CardHeader>
                        <CardBody style={{ padding: "0", overflowY: "auto" }}>
                            {loading ? (
                                <div style={{ padding: "20px", textAlign: "center" }}>
                                    Loading...
                                </div>
                            ) : filteredConversations.length === 0 ? (
                                <div style={{ padding: "40px", textAlign: "center", color: isDark ? "#aaaaaa" : "#666666" }}>
                                    <IconMessage size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                                    <p>No conversations yet</p>
                                </div>
                            ) : (
                                filteredConversations.map((conv) => (
                                    <div
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        style={{
                                            padding: "16px 20px",
                                            cursor: "pointer",
                                            borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
                                            background: selectedConversation?.id === conv.id 
                                                ? (isDark ? "#2a2a2a" : "#f5f5f5") 
                                                : "transparent",
                                            transition: "background 0.2s ease"
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedConversation?.id !== conv.id) {
                                                e.currentTarget.style.background = isDark ? "#222222" : "#fafafa";
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedConversation?.id !== conv.id) {
                                                e.currentTarget.style.background = "transparent";
                                            }
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div style={{
                                                width: "48px",
                                                height: "48px",
                                                borderRadius: "50%",
                                                background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontWeight: "bold",
                                                fontSize: "18px"
                                            }}>
                                                {conv.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, minWidth: 0 }}>
                                                        <h3 style={{ 
                                                            fontSize: "16px", 
                                                            fontWeight: "600",
                                                            color: isDark ? "#ffffff" : "#000000",
                                                            margin: 0,
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "6px"
                                                        }}>
                                                            {conv.isGroup && <IconUsers size={14} />}
                                                            {conv.userName}
                                                        </h3>
                                                        {conv.status && (
                                                            <IconCircleFilled 
                                                                size={8} 
                                                                style={{ 
                                                                    color: conv.status === "online" ? "#10b981" : conv.status === "typing" ? "#f59e0b" : "#6b7280",
                                                                    flexShrink: 0
                                                                }} 
                                                            />
                                                        )}
                                                    </div>
                                                    {conv.lastMessageTime && (
                                                        <span style={{ 
                                                            fontSize: "12px",
                                                            color: isDark ? "#888888" : "#999999",
                                                            flexShrink: 0
                                                        }}>
                                                            {formatTime(conv.lastMessageTime)}
                                                        </span>
                                                    )}
                                                </div>
                                                {conv.team && (
                                                    <p style={{ 
                                                        fontSize: "12px",
                                                        color: isDark ? "#38b6ff" : "#38b6ff",
                                                        margin: "2px 0",
                                                        fontWeight: "500"
                                                    }}>
                                                        {conv.team} {conv.purpose && `• ${conv.purpose}`}
                                                    </p>
                                                )}
                                                <p style={{ 
                                                    fontSize: "14px",
                                                    color: isDark ? "#aaaaaa" : "#666666",
                                                    margin: 0,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }}>
                                                    {conv.status === "typing" ? (
                                                        <span style={{ fontStyle: "italic" }}>typing...</span>
                                                    ) : (
                                                        conv.lastMessage || "No messages yet"
                                                    )}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <Chip 
                                                        size="sm" 
                                                        color="primary"
                                                        style={{ marginTop: "4px" }}
                                                    >
                                                        {conv.unreadCount}
                                                    </Chip>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardBody>
                    </Card>

                    {/* Messages Area */}
                    <Card style={{ 
                        background: isDark ? "#1a1a1a" : "#ffffff",
                        border: isDark ? "1px solid #2a2a2a" : "1px solid #e5e7eb",
                        display: "flex",
                        flexDirection: "column"
                    }}>
                        {selectedConversation ? (
                            <>
                                <CardHeader style={{ 
                                    borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
                                    padding: "20px",
                                    cursor: "pointer"
                                }}
                                onClick={() => setShowUserDetailsModal(true)}
                                >
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                                            <div style={{
                                                width: "40px",
                                                height: "40px",
                                                borderRadius: "50%",
                                                background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "white",
                                                fontWeight: "bold"
                                            }}>
                                                {selectedConversation.userName.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{ 
                                                    fontSize: "18px", 
                                                    fontWeight: "600",
                                                    margin: 0,
                                                    color: isDark ? "#ffffff" : "#000000"
                                                }}>
                                                    {selectedConversation.userName}
                                                    {selectedConversation.status === "online" && (
                                                        <IconCircleFilled size={8} style={{ color: "#10b981", marginLeft: "6px" }} />
                                                    )}
                                                </h3>
                                                {selectedConversation.team && (
                                                    <p style={{ 
                                                        fontSize: "13px",
                                                        color: "#38b6ff",
                                                        margin: "2px 0",
                                                        fontWeight: "500"
                                                    }}>
                                                        {selectedConversation.team} {selectedConversation.purpose && `• ${selectedConversation.purpose}`}
                                                    </p>
                                                )}
                                                {selectedConversation.isGroup && selectedConversation.groupMembers && (
                                                    <p style={{ 
                                                        fontSize: "12px",
                                                        color: isDark ? "#aaaaaa" : "#666666",
                                                        margin: "2px 0"
                                                    }}>
                                                        {selectedConversation.groupMembers.length} members
                                                    </p>
                                                )}
                                                {!selectedConversation.isGroup && (
                                                    <p style={{ 
                                                        fontSize: "14px",
                                                        color: isDark ? "#aaaaaa" : "#666666",
                                                        margin: 0
                                                    }}>
                                                        {selectedConversation.userEmail}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            isIconOnly
                                            variant="light"
                                            size="sm"
                                            onPress={() => {
                                                setShowUserDetailsModal(true);
                                            }}
                                        >
                                            <IconInfoCircle size={20} />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardBody style={{ 
                                    flex: 1, 
                                    overflowY: "auto", 
                                    padding: "20px",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "12px"
                                }}>
                                    {messages.length === 0 ? (
                                        <div style={{ 
                                            textAlign: "center", 
                                            padding: "40px",
                                            color: isDark ? "#aaaaaa" : "#666666"
                                        }}>
                                            <IconMessage size={48} style={{ margin: "0 auto 16px", opacity: 0.5 }} />
                                            <p>No messages yet. Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg) => {
                                            const isOwnMessage = msg.senderId === user.uid;
                                            return (
                                                <div
                                                    key={msg.id}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
                                                        marginBottom: "8px"
                                                    }}
                                                >
                                                    <div style={{
                                                        maxWidth: "70%",
                                                        padding: "12px 16px",
                                                        borderRadius: "16px",
                                                        background: isOwnMessage
                                                            ? "linear-gradient(90deg, #38b6ff, #0099e6)"
                                                            : (isDark ? "#2a2a2a" : "#f5f5f5"),
                                                        color: isOwnMessage ? "white" : (isDark ? "#ffffff" : "#000000")
                                                    }}>
                                                        {!isOwnMessage && (
                                                            <p style={{ 
                                                                fontSize: "12px", 
                                                                fontWeight: "600",
                                                                margin: "0 0 4px 0",
                                                                opacity: 0.8
                                                            }}>
                                                                {msg.senderName}
                                                            </p>
                                                        )}
                                                        <p style={{ margin: 0, wordBreak: "break-word" }}>
                                                            {msg.content}
                                                        </p>
                                                        <p style={{ 
                                                            fontSize: "11px",
                                                            margin: "4px 0 0 0",
                                                            opacity: 0.7
                                                        }}>
                                                            {formatTime(msg.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </CardBody>
                                <div style={{ 
                                    borderTop: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
                                    padding: "16px 20px"
                                }}>
                                    <div style={{ display: "flex", gap: "12px" }}>
                                        <Input
                                            placeholder="Type a message..."
                                            value={newMessage}
                                            onValueChange={setNewMessage}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    sendMessage();
                                                }
                                            }}
                                            variant="bordered"
                                            fullWidth
                                        />
                                        <Button
                                            style={{
                                                background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                                color: "white"
                                            }}
                                            onPress={sendMessage}
                                            isIconOnly
                                        >
                                            <IconSend size={20} />
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div style={{ 
                                flex: 1, 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                color: isDark ? "#aaaaaa" : "#666666"
                            }}>
                                <div style={{ textAlign: "center" }}>
                                    <IconMessage size={64} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                                    <p>Select a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedConversation && (
                <Modal
                    isOpen={showUserDetailsModal}
                    onClose={() => setShowUserDetailsModal(false)}
                    size="lg"
                >
                    <ModalContent>
                        <ModalHeader>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "50%",
                                    background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontWeight: "bold",
                                    fontSize: "20px"
                                }}>
                                    {selectedConversation.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h2 style={{ margin: 0 }}>{selectedConversation.userName}</h2>
                                    {selectedConversation.status && (
                                        <Chip size="sm" color={selectedConversation.status === "online" ? "success" : "default"} variant="flat">
                                            {selectedConversation.status === "online" ? "Online" : selectedConversation.status === "typing" ? "Typing..." : "Offline"}
                                        </Chip>
                                    )}
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {selectedConversation.team && (
                                    <div>
                                        <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: isDark ? "#aaaaaa" : "#666666" }}>
                                            Team / Purpose
                                        </h4>
                                        <p style={{ margin: 0, color: "#38b6ff", fontWeight: "500" }}>
                                            {selectedConversation.team} {selectedConversation.purpose && `• ${selectedConversation.purpose}`}
                                        </p>
                                    </div>
                                )}
                                
                                {!selectedConversation.isGroup && selectedConversation.userEmail && (
                                    <div>
                                        <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: isDark ? "#aaaaaa" : "#666666" }}>
                                            <IconMail size={14} style={{ marginRight: "4px" }} />
                                            Email
                                        </h4>
                                        <p style={{ margin: 0 }}>{selectedConversation.userEmail}</p>
                                    </div>
                                )}

                                {selectedConversation.isGroup && selectedConversation.groupMembers && (
                                    <div>
                                        <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px", color: isDark ? "#aaaaaa" : "#666666" }}>
                                            <IconUsers size={14} style={{ marginRight: "4px" }} />
                                            Group Members ({selectedConversation.groupMembers.length})
                                        </h4>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                            {selectedConversation.groupMembers.map((member, idx) => (
                                                <Chip key={idx} size="sm" variant="flat">
                                                    {member}
                                                </Chip>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {messages.length > 0 && (
                                    <div>
                                        <h4 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "4px", color: isDark ? "#aaaaaa" : "#666666" }}>
                                            Conversation Info
                                        </h4>
                                        <p style={{ margin: 0, fontSize: "14px" }}>
                                            {messages.length} message{messages.length !== 1 ? "s" : ""} in this conversation
                                        </p>
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                color="primary"
                                onPress={() => setShowUserDetailsModal(false)}
                            >
                                Close
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            )}
        </DefaultLayout>
    );
}
