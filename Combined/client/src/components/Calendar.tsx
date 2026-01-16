import { useState } from "react";
import { Button } from "@nextui-org/button";
import { Card, CardBody } from "@nextui-org/card";
import { IconChevronLeft, IconChevronRight, IconUpload, IconCalendar as CalendarIcon } from "@tabler/icons-react";
import { useTheme } from "next-themes";

type ViewType = "month" | "week" | "day" | "list";

interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    time?: string;
    duration?: number;
    type?: string;
}

interface CalendarProps {
    events?: CalendarEvent[];
    onEventClick?: (event: CalendarEvent) => void;
    onFileUpload?: (file: File) => void;
}

export default function Calendar({ events = [], onEventClick, onFileUpload }: CalendarProps) {
    const { theme, resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark" || theme === "dark";
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<ViewType>("month");
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Add all days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const getWeekDays = (date: Date) => {
        const startOfWeek = new Date(date);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);

        const weekDays: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            weekDays.push(day);
        }
        return weekDays;
    };

    const getEventsForDate = (date: Date) => {
        if (!date) return [];
        return events.filter(event => {
            const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    };

    const navigateDate = (direction: "prev" | "next") => {
        const newDate = new Date(currentDate);
        if (view === "month") {
            newDate.setMonth(currentDate.getMonth() + (direction === "next" ? 1 : -1));
        } else if (view === "week") {
            newDate.setDate(currentDate.getDate() + (direction === "next" ? 7 : -7));
        } else if (view === "day") {
            newDate.setDate(currentDate.getDate() + (direction === "next" ? 1 : -1));
        }
        setCurrentDate(newDate);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onFileUpload) {
            onFileUpload(file);
        }
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    };

    const renderMonthView = () => {
        const days = getDaysInMonth(currentDate);
        const weeks: (Date | null)[][] = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7));
        }

        return (
            <div>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "8px",
                    marginBottom: "16px"
                }}>
                    {daysOfWeek.map(day => (
                        <div key={day} style={{
                            padding: "12px",
                            textAlign: "center",
                            fontWeight: "600",
                            fontSize: "14px",
                            color: isDark ? "#888888" : "#666666"
                        }}>
                            {day}
                        </div>
                    ))}
                </div>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "8px"
                }}>
                    {days.map((day, idx) => {
                        const dayEvents = day ? getEventsForDate(day) : [];
                        const isToday = day && day.toDateString() === new Date().toDateString();
                        const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();

                        return (
                            <div
                                key={idx}
                                onClick={() => day && setSelectedDate(day)}
                                style={{
                                    minHeight: "100px",
                                    padding: "8px",
                                    borderRadius: "8px",
                                    background: !day
                                        ? "transparent"
                                        : isSelected
                                        ? "linear-gradient(135deg, rgba(56, 182, 255, 0.2), rgba(0, 153, 230, 0.2))"
                                        : isDark ? "#1a1a1a" : "#f9f9f9",
                                    border: day && isToday
                                        ? `2px solid #38b6ff`
                                        : day
                                        ? `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`
                                        : "none",
                                    cursor: day ? "pointer" : "default",
                                    transition: "all 0.2s ease"
                                }}
                                onMouseEnter={(e) => {
                                    if (day) {
                                        e.currentTarget.style.background = isDark ? "#222222" : "#f0f0f0";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (day && !isSelected && !isToday) {
                                        e.currentTarget.style.background = isDark ? "#1a1a1a" : "#f9f9f9";
                                    }
                                }}
                            >
                                {day && (
                                    <>
                                        <div style={{
                                            fontSize: "14px",
                                            fontWeight: isToday ? "bold" : "normal",
                                            color: isToday ? "#38b6ff" : (isDark ? "#ffffff" : "#000000"),
                                            marginBottom: "4px"
                                        }}>
                                            {day.getDate()}
                                        </div>
                                        {dayEvents.slice(0, 2).map(event => (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEventClick?.(event);
                                                }}
                                                style={{
                                                    fontSize: "11px",
                                                    padding: "2px 6px",
                                                    borderRadius: "4px",
                                                    background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                                    color: "white",
                                                    marginBottom: "2px",
                                                    cursor: "pointer",
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap"
                                                }}
                                                title={event.title}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                        {dayEvents.length > 2 && (
                                            <div style={{
                                                fontSize: "11px",
                                                color: isDark ? "#888888" : "#666666",
                                                marginTop: "2px"
                                            }}>
                                                +{dayEvents.length - 2} more
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const weekDays = getWeekDays(currentDate);
        return (
            <div>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    gap: "12px"
                }}>
                    {weekDays.map((day, idx) => {
                        const dayEvents = getEventsForDate(day);
                        const isToday = day.toDateString() === new Date().toDateString();
                        return (
                            <div key={idx} style={{
                                border: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
                                borderRadius: "8px",
                                padding: "12px",
                                background: isDark ? "#1a1a1a" : "#ffffff",
                                minHeight: "400px"
                            }}>
                                <div style={{
                                    fontSize: "14px",
                                    fontWeight: isToday ? "bold" : "600",
                                    color: isToday ? "#38b6ff" : (isDark ? "#ffffff" : "#000000"),
                                    marginBottom: "12px",
                                    paddingBottom: "8px",
                                    borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`
                                }}>
                                    <div>{daysOfWeek[day.getDay()]}</div>
                                    <div style={{ fontSize: "20px", marginTop: "4px" }}>{day.getDate()}</div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                    {dayEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => onEventClick?.(event)}
                                            style={{
                                                padding: "8px",
                                                borderRadius: "6px",
                                                background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                                color: "white",
                                                cursor: "pointer",
                                                fontSize: "13px"
                                            }}
                                        >
                                            {event.time && <div style={{ fontSize: "11px", opacity: 0.9 }}>{event.time}</div>}
                                            <div style={{ fontWeight: "600" }}>{event.title}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const dayEvents = getEventsForDate(currentDate);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div style={{
                border: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
                borderRadius: "8px",
                overflow: "hidden"
            }}>
                <div style={{
                    padding: "16px",
                    background: isDark ? "#1a1a1a" : "#f9f9f9",
                    borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`
                }}>
                    <div style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: isDark ? "#ffffff" : "#000000"
                    }}>
                        {currentDate.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </div>
                </div>
                <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    {hours.map(hour => {
                        const hourEvents = dayEvents.filter(event => {
                            if (!event.time) return false;
                            const eventHour = parseInt(event.time.split(":")[0]);
                            return eventHour === hour;
                        });

                        return (
                            <div key={hour} style={{
                                display: "flex",
                                borderBottom: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
                                minHeight: "60px"
                            }}>
                                <div style={{
                                    width: "80px",
                                    padding: "8px",
                                    borderRight: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
                                    fontSize: "12px",
                                    color: isDark ? "#888888" : "#666666",
                                    display: "flex",
                                    alignItems: "center"
                                }}>
                                    {hour.toString().padStart(2, "0")}:00
                                </div>
                                <div style={{ flex: 1, padding: "8px" }}>
                                    {hourEvents.map(event => (
                                        <div
                                            key={event.id}
                                            onClick={() => onEventClick?.(event)}
                                            style={{
                                                padding: "8px 12px",
                                                borderRadius: "6px",
                                                background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                                color: "white",
                                                cursor: "pointer",
                                                marginBottom: "4px",
                                                fontSize: "14px"
                                            }}
                                        >
                                            {event.title} {event.time && `(${event.time})`}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderListView = () => {
        const sortedEvents = [...events].sort((a, b) => {
            const dateA = a.date instanceof Date ? a.date : new Date(a.date);
            const dateB = b.date instanceof Date ? b.date : new Date(b.date);
            return dateA.getTime() - dateB.getTime();
        });

        return (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {sortedEvents.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "40px",
                        color: isDark ? "#aaaaaa" : "#666666"
                    }}>
                        No events scheduled
                    </div>
                ) : (
                    sortedEvents.map(event => {
                        const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
                        return (
                            <Card
                                key={event.id}
                                style={{
                                    background: isDark ? "#1a1a1a" : "#ffffff",
                                    border: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`
                                }}
                            >
                                <CardBody>
                                    <div
                                        onClick={() => onEventClick?.(event)}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <div>
                                            <h3 style={{
                                                fontSize: "16px",
                                                fontWeight: "600",
                                                marginBottom: "4px",
                                                color: isDark ? "#ffffff" : "#000000"
                                            }}>
                                                {event.title}
                                            </h3>
                                            <div style={{
                                                fontSize: "14px",
                                                color: isDark ? "#aaaaaa" : "#666666"
                                            }}>
                                                {formatDate(eventDate)} {event.time && `at ${event.time}`}
                                            </div>
                                        </div>
                                        <CalendarIcon size={20} style={{ color: "#38b6ff" }} />
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    })
                )}
            </div>
        );
    };

    const getViewTitle = () => {
        if (view === "month") {
            return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else if (view === "week") {
            const weekDays = getWeekDays(currentDate);
            return `${formatDate(weekDays[0])} - ${formatDate(weekDays[6])}`;
        } else if (view === "day") {
            return formatDate(currentDate);
        } else {
            return "All Events";
        }
    };

    return (
        <div style={{ color: isDark ? "#ffffff" : "#000000" }}>
            {/* Calendar Controls */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "12px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Button
                        isIconOnly
                        variant="flat"
                        onPress={() => navigateDate("prev")}
                    >
                        <IconChevronLeft size={20} />
                    </Button>
                    <h2 style={{
                        fontSize: "24px",
                        fontWeight: "bold",
                        minWidth: "200px",
                        textAlign: "center"
                    }}>
                        {getViewTitle()}
                    </h2>
                    <Button
                        isIconOnly
                        variant="flat"
                        onPress={() => navigateDate("next")}
                    >
                        <IconChevronRight size={20} />
                    </Button>
                    <Button
                        variant="flat"
                        size="sm"
                        onPress={() => setCurrentDate(new Date())}
                    >
                        Today
                    </Button>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* View Buttons */}
                    <div style={{
                        display: "flex",
                        gap: "4px",
                        background: isDark ? "#1a1a1a" : "#f5f5f5",
                        padding: "4px",
                        borderRadius: "8px"
                    }}>
                        {(["month", "week", "day", "list"] as ViewType[]).map(v => (
                            <Button
                                key={v}
                                size="sm"
                                variant={view === v ? "solid" : "light"}
                                style={view === v ? {
                                    background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                    color: "white"
                                } : {}}
                                onPress={() => setView(v)}
                            >
                                {v.charAt(0).toUpperCase() + v.slice(1)}
                            </Button>
                        ))}
                    </div>

                    {/* Upload Button */}
                    <label>
                        <input
                            type="file"
                            accept=".ics,.csv"
                            onChange={handleFileUpload}
                            style={{ display: "none" }}
                        />
                        <Button
                            style={{
                                background: "linear-gradient(90deg, #38b6ff, #0099e6)",
                                color: "white"
                            }}
                            startContent={<IconUpload size={18} />}
                            size="sm"
                            as="span"
                        >
                            Upload Schedule
                        </Button>
                    </label>
                </div>
            </div>

            {/* Calendar View */}
            <Card style={{
                background: isDark ? "#1a1a1a" : "#ffffff",
                border: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`
            }}>
                <CardBody>
                    {view === "month" && renderMonthView()}
                    {view === "week" && renderWeekView()}
                    {view === "day" && renderDayView()}
                    {view === "list" && renderListView()}
                </CardBody>
            </Card>
        </div>
    );
}
