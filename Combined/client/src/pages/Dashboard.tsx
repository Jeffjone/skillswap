import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { TeamCalendar } from '../components/TeamCalendar';
import { SessionTimeout } from '../components/SessionTimeout';

export const Dashboard: React.FC = () => {
    return (
        <Container fluid>
            <SessionTimeout />
            <Row>
                <Col>
                    <TeamCalendar />
                </Col>
            </Row>
        </Container>
    );
}; 