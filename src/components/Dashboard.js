import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import PieChartComponent from './Charts/PieChartComponent';
import ShipHCULineChart from './Charts/ShipHCULineChart';
import ShipPurifierLineChart from './Charts/ShipPurifierLineChart';

const Dashboard = () => {
  return (
    
      

      <Grid container spacing={12}>
        <Grid item xs={16} sm={20} md={16}>
          <ChartCard title="Distribution Overview">
            <PieChartComponent />
          </ChartCard>
        </Grid>

        <Grid item xs={16} sm={20} md={16}>
          <ChartCard title="Ship HCU Trends">
            <ShipHCULineChart />
          </ChartCard>
        </Grid>

        <Grid item xs={16} sm={20} md={16}>
          <ChartCard title="Ship Purifier Analysis">
            <ShipPurifierLineChart />
          </ChartCard>
        </Grid>
      </Grid>
    
  );
};

const ChartCard = ({ title, children }) => (
  <Paper
    elevation={3}
    sx={{
      p: { xs: 4, sm: 4, md: 4 },
      borderRadius: 2,
      height: 520,
      background: 'linear-gradient(to right bottom, #ffffff, #f7f9fc)',
      transition: '0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.08)'
      }
    }}
  >
    <Typography
      variant="h6"
      sx={{
        mb: 3,
        color: '#1a237e',
        fontWeight: 600,
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          bottom: '-8px',
          left: 0,
          width: '40px',
          height: '3px',
          background: 'linear-gradient(45deg, #1a237e 30%, #3f51b5 90%)'
        }
      }}
    >
      {title}
    </Typography>
    {children}
  </Paper>
);

export default Dashboard;
