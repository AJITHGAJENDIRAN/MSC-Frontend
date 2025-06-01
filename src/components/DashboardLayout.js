import React from 'react';
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar,
  List, Typography, Divider, IconButton, ListItem,
  ListItemIcon, ListItemText, Container
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard as DashboardIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 260;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = {
    primary: '#2563eb',
    secondary: '#f8fafc',
    text: '#1e293b',
    hover: '#dbeafe',
    error: '#ef4444',
    border: '#e2e8f0'
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Overview', icon: <DashboardIcon fontSize="small" />, path: '/dashboard' },
    { text: 'HCU Analytics', icon: <DashboardIcon fontSize="small" />, path: '/hcu-analytics' },
    { text: 'HCU Average', icon: <DashboardIcon fontSize="small" />, path: '/hcu-average' },
    { text: 'Ship Filtration Data', icon: <DashboardIcon fontSize="small" />, path: '/ship-filter' },
    { text: 'Logout', icon: <PersonIcon fontSize="small" />, onClick: handleLogout },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.secondary, py: 2 }}>
      <Toolbar sx={{
        backgroundColor: theme.primary,
        color: 'white',
        minHeight: '50px !important',
        justifyContent: 'center',
        mb: 2
      }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>ViswaGroup</Typography>
      </Toolbar>
      <Divider sx={{ mb: 2 }} />
      <List dense sx={{ px: 1 }}>
        {menuItems.filter(item => item.text !== 'Logout').map(item => (
          <ListItem
            button
            key={item.text}
            component={item.path ? Link : 'div'}
            to={item.path}
            onClick={item.onClick}
            sx={{
              borderRadius: 2,
              px: 1.5,
              py: 1,
              mb: 1,
              '&:hover': { backgroundColor: theme.hover },
              '& .MuiListItemIcon-root': { minWidth: '32px' }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontSize: 16, fontWeight: 400 }}
            />
          </ListItem>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 2 }} />
      <List dense sx={{ px: 1 }}>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            px: 1.5,
            py: 1,
            '&:hover': {
              backgroundColor: theme.error,
              color: 'white',
              '& .MuiListItemIcon-root': { color: 'white' }
            },
            '& .MuiListItemIcon-root': { minWidth: '32px' }
          }}
        >
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 16, fontWeight: 400 }}
          />
        </ListItem>
      </List>
    </Box>
  );

  // const getTitle = () => {
  //   const match = menuItems.find(item => location.pathname.startsWith(item.path));
  //   return match ? match.text : 'Dashboard';
  // };

  return (
    <Box sx={{ display: 'flex', backgroundColor: theme.secondary }}>
      <CssBaseline />

      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: 'white',
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important' }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ color: theme.text, fontWeight: 500 }}>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: theme.secondary
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '200vh',
          pt: 8, // Enough top space for AppBar
          pb: 4,
          px: { xs: 2, sm: 3, md: 5 },
          backgroundColor: theme.secondary
        }}
      >
        {/* <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, color: theme.text }}>
          {getTitle()}
        </Typography> */}

        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            p: { xs: 2, sm: 3, md: 4 },
            overflowX: 'auto',
            minHeight: 'calc(100vh - 160px)'
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
