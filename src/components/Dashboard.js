import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, useTheme, Autocomplete, TextField,
} from '@mui/material';
import { DatePicker } from 'antd';
import dayjs from 'dayjs';
import axios from 'axios';

import PieChartComponent from './Charts/PieChartComponent';
import ShipHCULineChart from './Charts/ShipHCULineChart';
import ShipPurifierLineChart from './Charts/ShipPurifierLineChart';
import MultiShipFilterPieChart from './Charts/MultiShipFilterPieChart';

const { RangePicker } = DatePicker;

const Dashboard = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, "days"), dayjs()]);
  const [shipOptions, setShipOptions] = useState([]);
  const [selectedShips, setSelectedShips] = useState([]);

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const response = await axios.get("http://52.140.61.220:5000/api/ships");
        const ships = (response.data || []).sort((a, b) => a.localeCompare(b));
        setShipOptions(ships);
      } catch (error) {
        console.error("Error fetching ships:", error);
      }
    };

    fetchShips();
  }, []);

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 3, sm: 4 },
        backgroundColor: '#f4f6f8',
        minHeight: '100vh',
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: 700, color: '#1a237e' }}
      >
        Ship Analytics Dashboard
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 3,
          }}
        >
          <Autocomplete
            multiple
            options={shipOptions}
            value={selectedShips}
            onChange={(event, newValue) => setSelectedShips(newValue)}
            filterSelectedOptions
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Select Ships"
                placeholder="Ships"
              />
            )}
            sx={{ minWidth: 400 }}
          />

          <RangePicker
            size="middle"
            value={dateRange}
            onChange={(dates) => dates && setDateRange(dates)}
            format="YYYY-MM-DD"
            allowClear={false}
            style={{ minWidth: 300 }}
            ranges={{
              'Last 3 Months': [dayjs().subtract(3, 'month'), dayjs()],
              'Last 6 Months': [dayjs().subtract(6, 'month'), dayjs()],
              'Last 1 Year': [dayjs().subtract(1, 'year'), dayjs()],
              'Last 2 Years': [dayjs().subtract(2, 'year'), dayjs()],
            }}
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ChartCard title="Sample Type Distribution">
            <PieChartComponent dateRange={dateRange} selectedShips={selectedShips} />
          </ChartCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartCard title="Filter Sample Classification">
            <MultiShipFilterPieChart dateRange={dateRange} selectedShips={selectedShips} />
          </ChartCard>
        </Grid>

        <Grid item xs={12}>
          <ChartCard title="Ship HCU Sample Count" height={380}>
            <ShipHCULineChart dateRange={dateRange} selectedShips={selectedShips} />
          </ChartCard>
        </Grid>

        <Grid item xs={12}>
          <ChartCard title="Ship Purifier Sample Count" height={380}>
            <ShipPurifierLineChart dateRange={dateRange} selectedShips={selectedShips} />
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
};

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
