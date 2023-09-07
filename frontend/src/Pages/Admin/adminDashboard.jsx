import React from 'react';
import DrawerComponent from './drawerComponent';
import { Container } from '@mui/material';

const AdminDashboard = () => {
    return (<>

        <DrawerComponent />
        <Container style={{ width: '100vw', height: '100vh' }}>
            <iframe
                title='Admin Dashboard'
                src="https://lookerstudio.google.com/embed/reporting/a491c9b5-3ad0-49ef-b336-a51b58ca7a6f/page/wjYYD"
                frameBorder="0"
                style={{ width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                sandbox='allow-scripts allow-same-origin allow-popups allow-forms'
            />
        </Container>
    </>
    );
};

export default AdminDashboard;
