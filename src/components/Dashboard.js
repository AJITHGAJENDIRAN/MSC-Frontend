import React from 'react';
import { Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import PieChartComponent from './Charts/PieChartComponent';
import ShipHCULineChart from './Charts/ShipHCULineChart';
import ShipPurifierLineChart from './Charts/ShipPurifierLineChart';

const Dashboard = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1a237e' }}>
        Ship Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Row 1: Two Side-by-Side Charts */}
        <Grid item xs={12} md={6}>
          <ChartCard >
            <PieChartComponent />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard >
            <ShipPurifierLineChart />
          </ChartCard>
        </Grid>

        {/* Row 2: Full Width Chart */}
        <Grid item xs={12}>
          <ChartCard  height={350}>
            <ShipHCULineChart />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// ChartCard component with reusable styling
const ChartCard = ({ title, children, height = 360 }) => (
  <Paper
    elevation={3}
    sx={{
      p: 2,
      borderRadius: 3,
      height,
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(to right bottom, #ffffff, #f7f9fc)',
      transition: '0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 10px 24px rgba(0, 0, 0, 0.08)',
      },
    }}
  >
    <Typography
      variant="subtitle1"
      sx={{
        mb: 2,
        color: '#1a237e',
        fontWeight: 600,
        fontSize: '17px',
      }}
    >
      {title}
    </Typography>

    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>{children}</Box>
  </Paper>
);

export default Dashboard;