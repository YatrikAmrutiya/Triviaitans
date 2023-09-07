import React from 'react';
import { Link } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemText, Toolbar } from '@mui/material';

const DrawerComponent = () => {
    return (
        <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0 }}>
            <Toolbar />
            <List>
                <ListItem component={Link} to="/question" button>
                    <ListItemText primary="Questions" />
                </ListItem>
                <ListItem component={Link} to="/games" button>
                    <ListItemText primary="Games" />
                </ListItem>
                <ListItem component={Link} to="/adminDashboard" button>
                    <ListItemText primary="Dashboard" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default DrawerComponent;
