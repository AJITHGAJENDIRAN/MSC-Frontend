import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ParticleCountCharts = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedShip, setSelectedShip] = useState('');
  const [shipOptions, setShipOptions] = useState([]);

  const fetchData = async () => {
    if (!startDate || !endDate) {
      alert('Please select both start and end dates.');
      return;
    }

    try {
      const response = await axios.get(
        'http://127.0.0.1:5000/api/filtered-average-particle-count',
        {
          params: { start_date: startDate, end_date: endDate },
        }
      );

      const ships = Array.from(new Set(response.data.map(item => item.Ship)));
      setShipOptions(ships);
      setData(response.data);
      setSelectedShip(''); // reset ship selection on new fetch
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Filter data for selected ship only
  const filteredData = data.filter(item => item.Ship === selectedShip);

  // Separate before and after filter data
  const beforeFilterData = filteredData.filter(
    item => item.vlims_lo_samp_point_Desc === 'BEFORE FILTER'
  );
  const afterFilterData = filteredData.filter(
    item => item.vlims_lo_samp_point_Desc === 'AFTER FILTER'
  );

  // Prepare chart data for Chart.js
  const createChartData = filterData => ({
    labels: ['4 Micron', '6 Micron', '14 Micron'],
    datasets: filterData.map(item => ({
      label: `${item.Ship} - ${item.vlims_lo_samp_point_Desc}`,
      data: [
        item.Average_Particle_Count_4_Micron,
        item.Average_Particle_Count_6_Micron,
        item.Average_Particle_Count_14_Micron,
      ],
      backgroundColor: item.vlims_lo_samp_point_Desc === 'BEFORE FILTER' ? 'rgba(54, 162, 235, 0.7)' : 'rgba(255, 99, 132, 0.7)',
    })),
  });

  const chartOptions = title => ({
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Particle Count' },
      },
      x: {
        title: { display: true, text: 'Particle Size' },
      },
    },
  });

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <TextField
            label="Start Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </Grid>

        <Grid item>
          <TextField
            label="End Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </Grid>

        <Grid item>
          <Button variant="contained" onClick={fetchData}>
            Fetch Data
          </Button>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl fullWidth>
            <InputLabel id="select-ship-label">Select Ship</InputLabel>
            <Select
              labelId="select-ship-label"
              value={selectedShip}
              onChange={e => setSelectedShip(e.target.value)}
              label="Select Ship"
            >
              {shipOptions.map((ship, idx) => (
                <MenuItem key={idx} value={ship}>
                  {ship}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {selectedShip ? (
        <Grid container spacing={2} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            {beforeFilterData.length > 0 ? (
              <Bar
                options={chartOptions('Before Filter Particle Count')}
                data={createChartData(beforeFilterData)}
              />
            ) : (
              <Typography>No BEFORE FILTER data for selected ship.</Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            {afterFilterData.length > 0 ? (
              <Bar
                options={chartOptions('After Filter Particle Count')}
                data={createChartData(afterFilterData)}
              />
            ) : (
              <Typography>No AFTER FILTER data for selected ship.</Typography>
            )}
          </Grid>
        </Grid>
      ) : (
        <Typography sx={{ mt: 4 }}>
          Select a ship to view particle count charts.
        </Typography>
      )}
    </Box>
  );
};

export default ParticleCountCharts;
