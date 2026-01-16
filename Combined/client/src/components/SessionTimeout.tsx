import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Alert, Modal, Button } from 'react-bootstrap';

export const SessionTimeout: React.FC = () => {
    const { currentUser, logout } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUser) return;

        // Start session and get session ID
        const startSession = async () => {
            try {
                const result = await window.firebase.functions().httpsCallable('startSession')();
                setSessionId(result.data.sessionId);
            } catch (error) {
                console.error('Failed to start session:', error);
            }
        };

        startSession();

        // Check session status every minute
        const interval = setInterval(async () => {
            if (!sessionId) return;

            try {
                const result = await window.firebase.functions().httpsCallable('checkSessionTimeout')({
                    sessionId
                });

                if (result.data.shouldLogout) {
                    clearInterval(interval);
                    await logout();
                    window.location.href = '/login';
                } else if (result.data.isExpiring) {
                    setShowWarning(true);
                    setTimeLeft(result.data.timeLeft);
                }
            } catch (error) {
                console.error('Failed to check session timeout:', error);
            }
        }, 60000);

        return () => {
            clearInterval(interval);
            if (sessionId) {
                window.firebase.functions().httpsCallable('endSession')({ sessionId });
            }
        };
    }, [currentUser, sessionId, logout]);

    const handleStayLoggedIn = async () => {
        if (!sessionId) return;

        try {
            await window.firebase.functions().httpsCallable('updateSessionActivity')({
                sessionId
            });
            setShowWarning(false);
        } catch (error) {
            console.error('Failed to update session activity:', error);
        }
    };

    const formatTimeLeft = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Modal show={showWarning} onHide={() => setShowWarning(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Session Timeout Warning</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert variant="warning">
                    Your session will expire in {formatTimeLeft(timeLeft)}. Would you like to stay logged in?
                </Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowWarning(false)}>
                    Logout Now
                </Button>
                <Button variant="primary" onClick={handleStayLoggedIn}>
                    Stay Logged In
                </Button>
            </Modal.Footer>
        </Modal>
    );
}; 