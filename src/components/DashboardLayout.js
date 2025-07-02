// DashboardLayout.jsx (Improved UI Version)
import React from 'react';
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar,
  List, Typography, Divider, IconButton, ListItem,
  ListItemIcon, ListItemText, Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShip } from '@fortawesome/free-solid-svg-icons';

const drawerWidth = 260;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const theme = {
    primary: '#2563eb',
    secondary: '#f8fafc',
    text: '#1e293b',
    hover: '#e0edff',
    active: '#bfdbfe',
    error: '#ef4444',
    border: '#e2e8f0',
    white: '#ffffff',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    radius: '12px'
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <AssessmentIcon fontSize="small" />, path: '/dashboard1' },
    { text: 'Overallview', icon: <FontAwesomeIcon icon={faShip} fontSize="small" />, path: '/dashboard' },
  ];

  const drawer = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.secondary,
      py: 2,
      px: 1,
      overflowY: 'auto'
    }}>
     <Box
  sx={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    mb: 3,
    height: 60, // Fixed height for vertical alignment
    px: 2 // Optional horizontal padding
  }}
>
  <Box
    component="img"
    src="/images/logo-removebg-preview.png"
    alt="ViswaGroup Logo"
    sx={{
      maxHeight: '150%',
      maxWidth: '150%',
      objectFit: 'contain'
    }}
  />
</Box>

      <Divider sx={{ mb: 2 }} />

      <List dense>
        {menuItems.map(item => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            aria-label={`Go to ${item.text}`}
            aria-current={location.pathname === item.path ? 'page' : undefined}
            sx={{
              borderRadius: theme.radius,
              mb: 1,
              px: 2,
              py: 1.2,
              backgroundColor: location.pathname === item.path ? theme.active : 'transparent',
              '&:hover': {
                backgroundColor: location.pathname === item.path ? theme.active : theme.hover,
                transform: 'scale(1.02)',
                transition: 'all 0.2s ease-in-out',
              },
              '& .MuiListItemIcon-root': {
                minWidth: '35px',
                color: location.pathname === item.path ? theme.primary : theme.text,
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider sx={{ my: 2 }} />

      <List dense>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: theme.radius,
            px: 2,
            py: 1.2,
            '&:hover': {
              backgroundColor: theme.error,
              color: theme.white,
              '& .MuiListItemIcon-root': { color: theme.white, transform: 'rotate(-15deg)', transition: '0.2s' }
            },
            '& .MuiListItemIcon-root': { minWidth: '32px', color: theme.text }
          }}
        >
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', backgroundColor: theme.secondary }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          backgroundColor: theme.white,
          borderBottom: `1px solid ${theme.border}`,
          boxShadow: theme.shadow
        }}
      >
        <Toolbar sx={{ minHeight: '75px !important', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton edge="start" onClick={handleDrawerToggle} sx={{ display: { sm: 'none' } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ color: theme.text, fontWeight: 600 }}>
              Viswa Ship Analytics
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', backgroundColor: theme.secondary }
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
              backgroundColor: theme.secondary,
              borderRight: `1px solid ${theme.border}`
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          pt: 8,
          pb: 4,
          px: { xs: 2, sm: 3, md: 5 },
          backgroundColor: theme.secondary,
          overflow: 'hidden'
        }}
      >
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            backgroundColor: theme.white,
            borderRadius: theme.radius,
            boxShadow: theme.shadow,
            p: { xs: 2, sm: 3, md: 4 },
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
