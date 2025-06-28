import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import './App.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './components/Dashboard';
import HCUAnalytics from './components/HCUAnalytics';
import HCUAverage from './components/HCUAverage';
import ShipFilter from './components/ShipFilter';
import Dashboard1 from './components/Dashboard1';

const theme = createTheme();

const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('token') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="vh-100 gradient-custom">
        <div className="container">
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard />} />
              </Route>
              <Route
                path="/hcu-analytics"
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<HCUAnalytics />} />
              </Route>
              <Route
                path="/hcu-average"
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<HCUAverage />} />
              </Route>
              <Route
                path="/ship-filter"
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<ShipFilter />} />
              </Route>
              <Route
                path="/dashboard1"
                element={
                  <PrivateRoute>
                    <DashboardLayout />
                  </PrivateRoute>
                }
              >
                <Route index element={<Dashboard1 />} />
              </Route>
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default App;