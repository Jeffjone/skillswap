import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { Card, Button, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { CalendarEvent } from '../types/calendar';

const localizer = momentLocalizer(moment);

export const TeamCalendar: React.FC = () => {
    const { currentUser } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [showEventModal, setShowEventModal] = useState(false);
    const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
        title: '',
        description: '',
        startTime: new Date(),
        endTime: new Date(Date.now() + 60 * 60 * 1000),
        type: 'team',
        isRecurring: false
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            const result = await window.firebase.functions().httpsCallable('getTeamCalendarEvents')();
            setEvents(result.data);
        } catch (error) {
            console.error('Failed to load events:', error);
        }
    };

    const handleCreateEvent = async () => {
        try {
            await window.firebase.functions().httpsCallable('createTeamEvent')(newEvent);
            setShowEventModal(false);
            loadEvents();
        } catch (error) {
            console.error('Failed to create event:', error);
        }
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        let backgroundColor = '#3174ad';
        switch (event.type) {
            case 'challenge':
                backgroundColor = '#28a745';
                break;
            case 'system':
                backgroundColor = '#dc3545';
                break;
        }

        return {
            style: {
                backgroundColor,
                borderRadius: '3px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
            }
        };
    };

    return (
        <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Team Calendar</h5>
                <Button variant="primary" onClick={() => setShowEventModal(true)}>
                    Add Event
                </Button>
            </Card.Header>
            <Card.Body>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="startTime"
                    endAccessor="endTime"
                    style={{ height: 500 }}
                    eventPropGetter={eventStyleGetter}
                />
            </Card.Body>

            <Modal show={showEventModal} onHide={() => setShowEventModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Team Event</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Title</Form.Label>
                            <Form.Control
                                type="text"
                                value={newEvent.title}
                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={newEvent.description}
                                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Start Time</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={moment(newEvent.startTime).format('YYYY-MM-DDTHH:mm')}
                                onChange={(e) => setNewEvent({ ...newEvent, startTime: new Date(e.target.value) })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>End Time</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={moment(newEvent.endTime).format('YYYY-MM-DDTHH:mm')}
                                onChange={(e) => setNewEvent({ ...newEvent, endTime: new Date(e.target.value) })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Recurring Event"
                                checked={newEvent.isRecurring}
                                onChange={(e) => setNewEvent({ ...newEvent, isRecurring: e.target.checked })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEventModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleCreateEvent}>
                        Create Event
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
}; 