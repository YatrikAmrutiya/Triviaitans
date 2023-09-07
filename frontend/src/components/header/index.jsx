import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import Badge from '@mui/material/Badge';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Popper from '@mui/material/Popper';
import { useNavigate } from 'react-router';
import { useEffect, useContext } from 'react';
import { getNotifications } from '../../apis/NotificationsAPI';
import { logout } from '../../apis/AuthenticationAPI';
import { ListItemButton } from '@mui/material';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import GroupsIcon from '@mui/icons-material/Groups';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import { getUsers } from '../../apis/TeamsAPI';
import Autocomplete from '@mui/material/Autocomplete';
import { grey } from "@mui/material/colors";
import { FirebaseAuthContext } from '../auth-providers/firebase-auth-provider';
import { useLocation } from 'react-router-dom';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

function ResponsiveAppBar() {
    /**
     * @type {{user: import("firebase/auth").User}}
     */
    // @ts-ignore
    const { user } = useContext(FirebaseAuthContext);
    const navigate = useNavigate();
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [anchorElNotification, setAnchorElNotification] = React.useState(null);
    const [notifications, setNotifications] = React.useState([]);
    const open = Boolean(anchorElNotification);
    const id = open ? 'simple-popper' : undefined;
    const [photoURL, setPhotoURL] = React.useState('');
    const [displayName, setDisplayName] = React.useState('');
    const [isHeaderShow, setIsHeaderShow] = React.useState(false);
    const [users, setUsers] = React.useState([]);
    const [email, setEmail] = React.useState('');

    const location = useLocation();

    const [isAdmin, setIsAdmin] = React.useState(false);

    useEffect(() => {
        const headerNoShowUrls = [
            '/',
            '/login',
            '/register',
            '/verify-email',
            '/verify-2fa',
            '/set-2fa',
            '/reset-password',
        ];
        if (user) {
            if (user.photoURL) {
                setPhotoURL(user.photoURL);
            }
            if (user.displayName) {
                setDisplayName(user.displayName);
            }
            user.getIdTokenResult(true).then((idTokenResult) => {
                if (idTokenResult.claims.isAdmin) {
                    // @ts-ignore
                    setIsAdmin(idTokenResult.claims.isAdmin);
                }
            });
            setIsHeaderShow(!headerNoShowUrls.includes(location.pathname));
            if (isHeaderShow) {
                getNotifications().then((response) => {
                    setNotifications(response.data.notifications);
                }).catch((error) => {
                    console.log(error);
                });
            }
            getUsers().then(
                (response) => {
                    setUsers(response.data.users);
                }
            ).catch((error) => {
                console.log(error);
            })
        }
    }, [user, setUsers, isHeaderShow, location.pathname]);

    const handleNotificationToggle = (event) => {
        setAnchorElNotification(anchorElNotification ? null : event.currentTarget);
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleTeamsClick = (event) => {
        navigate('/my-teams');
    };

    const handleGameLobbyClick = (event) => {
        navigate('/lobby');
    };
    const handleLeaderboardClick = (event) => {
        navigate('/leaderboard');
    };
    const handleAdminClick = (event) => {
        navigate('/question');
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogoClick = () => {
        navigate('/dashboard');
    };

    const handleProfileMenuItemClick = () => {
        navigate('/edit-profile');
    };

    const handleLogoutMenuItemClick = () => {
        logout().then(() => {
            navigate('/login');
        });
    };

    const handleEmailChange = (e) => {
        setEmail(e?.currentTarget?.innerText || "");
    };

    const handleUsers = async () => {
        navigate(`/users/${email}`);
        window.location.reload();
    };

    if (!isHeaderShow) {
        return <></>;
    }

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <IconButton
                        size="large"
                        color="inherit"
                        onClick={handleLogoClick}
                    >

                        <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                    </IconButton>
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/dashboard"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.1rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        TRIVIA TITANS
                    </Typography>

                    


                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        <Button
                            key="Teams"
                            onClick={handleTeamsClick}
                            sx={{ my: 2, color: 'white', display: 'block' }}
                        >
                            Teams
                        </Button>
                        <Button
                            key="Game lobby"
                            onClick={handleGameLobbyClick}
                            sx={{ my: 2, color: 'white', display: 'block' }}
                        >
                            Game lobby
                        </Button>
                        <Button
                            key="Leaderboard"
                            onClick={handleLeaderboardClick}
                            sx={{ my: 2, color: 'white', display: 'block' }}
                        >
                            Leaderboard
                        </Button>
                        {isAdmin && (
                            <Button
                                key="Game lobby"
                                onClick={handleAdminClick}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                Admin
                            </Button>
                        )}
                        <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={users}
                            onChange={handleEmailChange}
                            // @ts-ignore
                            getOptionLabel={(user) => user.email}
                            renderInput={(params) => <div ref={params.InputProps.ref}>
                                <TextField
                                    label="Search"
                                    variant="outlined"
                                    size="small"
                                    sx={{
                                        width: '550px',
                                        marginLeft: '20px',
                                        marginTop: '7px',
                                        '& .MuiInputBase-input': { color: 'white' },
                                        '& .MuiInputLabel-root': { color: 'white' },
                                        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                                    }}
                                    {...params.inputProps}
                                />
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: '15%',
                                        transform: 'translateY(-60%)',
                                        color: grey[100]
                                    }}
                                    onClick={handleUsers}
                                >
                                    <SearchIcon />
                                </IconButton>

                            </div>}
                        />
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <IconButton
                            size="large"
                            aria-label="show 17 new notifications"
                            color="inherit"
                            onClick={handleNotificationToggle}
                        >
                            <Badge badgeContent={notifications.length} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                        <Popper id={id} open={open} anchorEl={anchorElNotification}>
                            <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
                                {notifications.length === 0 ? (
                                    <Typography sx={{ color: 'gray' }}>No notifications</Typography>
                                ) : (
                                    notifications.map(
                                        (notification) => {
                                            switch (notification.type) {
                                                case "TEAM_INVITATION":
                                                    return (
                                                        <ListItemButton href={notification.link}>
                                                            <ListItemIcon>
                                                                <GroupsIcon />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary="You have been invited to a team!"
                                                            />
                                                        </ListItemButton>
                                                    );
                                                case "NEW_GAME_AVAILABILITY":
                                                    return (
                                                        <ListItemButton href={notification.link}>
                                                            <ListItemIcon>
                                                                <SportsEsportsIcon />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={`A new game is available to join ${notification.gameName} starting at time ${notification.startTime}!`}
                                                            />
                                                        </ListItemButton>
                                                    );
                                                case "GAME_INVITE":
                                                    return (
                                                        <ListItemButton href={notification.link}>
                                                            <ListItemIcon>
                                                                <EventAvailableIcon />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={`You have been invited to game ${notification.gameName} starting at time ${notification.startTime}!`}
                                                            />
                                                        </ListItemButton>
                                                    );
                                                case "TEAM_UPDATE":
                                                    return (
                                                        <ListItemButton href={notification.link}>
                                                            <ListItemIcon>
                                                                <GroupAddIcon />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={`New member ${notification.firstName} has joined the team ${notification.teamName}!`}
                                                            />
                                                        </ListItemButton>
                                                    );
                                                case "ACHIEVEMENT_UNLOCKED":
                                                    return (
                                                        <ListItemButton href={notification.link}>
                                                            <ListItemIcon>
                                                                <EmojiEventsIcon />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={`You have unlocked the achievement ${notification.achievementUnlockedName}!`}
                                                            />
                                                        </ListItemButton>
                                                    );
                                                default:
                                                    return (<>Something went wrong</>)

                                            }
                                        }
                                    )
                                )}
                            </Box>
                        </Popper>

                        <Tooltip title="Open settings">
                            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                <Avatar alt={displayName || ""} src={photoURL || "/static/images/avatar/2.jpg"} />
                            </IconButton>
                        </Tooltip>
                        <Menu
                            sx={{ mt: '45px' }}
                            id="menu-appbar"
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            <Typography variant="body2" sx={{ mx: 2, my: 1.5, fontWeight: "bold" }}>
                                {displayName}
                            </Typography>
                            <MenuItem onClick={handleProfileMenuItemClick}>
                                <Typography textAlign="center">Profile</Typography>
                            </MenuItem>
                            <MenuItem onClick={handleLogoutMenuItemClick}>
                                <Typography textAlign="center">Log out</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;
