import React, { useState } from 'react';
import { Grid, Paper, Typography, Box, useTheme } from '@mui/material';
import PieChartComponent from './Charts/PieChartComponent';
import ShipHCULineChart from './Charts/ShipHCULineChart';
import ShipPurifierLineChart from './Charts/ShipPurifierLineChart';
import { DatePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const Dashboard = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, "days"), dayjs()]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: '#1a237e' }}>
        Ship Analytics Dashboard
      </Typography>

      {/* Unified Date Filter */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        {/* <RangePicker
          size="middle"
          value={dateRange}
          onChange={(dates) => dates && setDateRange(dates)}
          format="YYYY-MM-DD"
        /> */}
        <RangePicker
  size="middle"
  value={dateRange}
  onChange={(dates) => dates && setDateRange(dates)}
  format="YYYY-MM-DD"
  allowClear={false}
  ranges={{
    'Last 3 Months': [dayjs().subtract(3, 'month'), dayjs()],
    'Last 6 Months': [dayjs().subtract(6, 'month'), dayjs()],
    'Last 1 Year': [dayjs().subtract(1, 'year'), dayjs()],
    'Last 2 Year': [dayjs().subtract(2, 'year'), dayjs()],
  }}
/>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Sample Type Distribution">
            <PieChartComponent dateRange={dateRange} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Ship Purifier Sample Count">
            <ShipPurifierLineChart dateRange={dateRange} />
          </ChartCard>
        </Grid>

        <Grid item xs={12}>
          <ChartCard title="Ship HCU Sample Count" height={350}>
            <ShipHCULineChart dateRange={dateRange} />
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
