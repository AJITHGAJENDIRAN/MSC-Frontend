import React from 'react';
import {
  Box, CssBaseline, Drawer, AppBar, Toolbar,
  List, Typography, Divider, IconButton, ListItem,
  ListItemIcon, ListItemText, Container
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  BarChart as BarChartIcon, // For Analytics
  Assessment as AssessmentIcon, // For Average (or another chart icon)
  LocalShipping as LocalShippingIcon, // For Ship Filtration
} from '@mui/icons-material';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShip } from '@fortawesome/free-solid-svg-icons'; // Import the specific ship icon


const drawerWidth = 260;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location for active link styling

  // Using a theme object like this is okay for small apps,
  // but for larger apps, consider MUI's ThemeProvider for global theming.
  const theme = {
    primary: '#2563eb', // Indigo-like blue
    secondary: '#f8fafc', // Light gray/off-white background
    text: '#1e293b', // Dark text
    hover: '#e0edff', // Light blue for hover
    active: '#bfdbfe', // Slightly darker blue for active state
    error: '#ef4444', // Red for error/logout
    border: '#e2e8f0', // Light border color
    white: '#ffffff',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)' // Subtle shadow
  };

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Updated menuItems with more specific icons
  const menuItems = [
    { text: 'Overview', icon: <FontAwesomeIcon icon={faShip} fontSize="small" />, path: '/dashboard' },
    { text: 'HCU Analytics', icon: <BarChartIcon fontSize="small" />, path: '/hcu-analytics' },
    { text: 'HCU Average', icon: <AssessmentIcon fontSize="small" />, path: '/hcu-average' },
    { text: 'Ship Filtration Data', icon: <LocalShippingIcon fontSize="small" />, path: '/ship-filter' },
  ];

  const drawer = (
    <Box sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.secondary,
      py: 2,
      overflowY: 'auto', // Use overflowY to only scroll vertically
      overflowX: 'hidden' // Prevent horizontal scroll
    }}>
      {/* Drawer Header/Branding - Using just the image */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '40px', // Provide a minimum height for the logo area
        mb: 2,
        px: 1 // Add horizontal padding for consistency
      }}>
        <img
          src="/images/loginimage-8fc45073.png" // Path relative to the 'public' folder
          alt="ViswaGroup Logo"
          style={{
              maxHeight: '60px', // Adjust max height as needed
              width: '200px' // Maintain aspect ratio
          }}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      <List dense sx={{ px: 1 }}>
        {menuItems.map(item => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            // Add styling for the active link
            sx={{
              borderRadius: 2,
              px: 2,
              py: 1.2,
              mb: 1,
              color: location.pathname === item.path ? theme.text : theme.text, // Text color always dark
              backgroundColor: location.pathname === item.path ? theme.active : 'transparent', // Active background
              '&:hover': {
                backgroundColor: location.pathname === item.path ? theme.active : theme.hover, // Maintain active bg on hover
              },
              '& .MuiListItemIcon-root': {
                minWidth: '35px', // Adjusted to 35px as per your last code
                color: location.pathname === item.path ? theme.primary : theme.text, // Icon color changes for active
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} /> {/* Pushes logout to bottom */}
      <Divider sx={{ my: 2 }} />

      <List dense sx={{ px: 1 }}>
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            px: 2,
            py: 1.2,
            '&:hover': {
              backgroundColor: theme.error,
              color: theme.white,
              '& .MuiListItemIcon-root': { color: theme.white }
            },
            '& .MuiListItemIcon-root': { minWidth: '32px', color: theme.text }
          }}
        >
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', backgroundColor: theme.secondary }}>
      <CssBaseline />

      {/* Top AppBar */}
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
        <Toolbar sx={{ minHeight: '75px !important' }}>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ color: '#1e293b', fontWeight: 550 }}>
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
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
          minHeight: '100vh',
          pt: 8, // Padding-top to clear the AppBar
          pb: 4, // Padding-bottom for content below fold
          px: { xs: 2, sm: 3, md: 5 }, // Horizontal padding responsive
          backgroundColor: theme.secondary,
          overflow: 'hidden' // Prevents horizontal scroll for the main content area itself
        }}
      >
        <Container
          maxWidth="xl"
          disableGutters
          sx={{
            backgroundColor: theme.white,
            borderRadius: 2,
            boxShadow: theme.shadow,
            p: { xs: 2, sm: 3, md: 4 },
            minHeight: 'calc(100vh - 160px)', // Adjust height considering AppBar and overall padding
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default DashboardLayout;