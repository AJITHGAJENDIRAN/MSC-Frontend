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
    try {
      const response = await axios.get(
        'http://localhost:5000/api/filtered-average-particle-count',
        {
          params: { start_date: startDate, end_date: endDate },
        }
      );

      const ships = Array.from(new Set(response.data.map(item => item.Ship)));
      setShipOptions(ships);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredData = data.filter(item => item.Ship === selectedShip);
  const beforeFilterData = filteredData.filter(
    item => item.vlims_lo_samp_point_Desc === 'BEFORE FILTER'
  );
  const afterFilterData = filteredData.filter(
    item => item.vlims_lo_samp_point_Desc === 'AFTER FILTER'
  );

  const createChartData = (filteredData, title) => {
    return {
      labels: ['4 Micron', '6 Micron', '14 Micron'],
      datasets: filteredData.map((item, index) => ({
        label: `${item.Ship} - ${item.vlims_lo_samp_point_Desc}`,
        data: [
          item.Average_Particle_Count_4_Micron,
          item.Average_Particle_Count_6_Micron,
          item.Average_Particle_Count_14_Micron,
        ],
        backgroundColor: `Lightblue`,
      })),
    };
  };

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

        <Grid item>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Select Ship</InputLabel>
            <Select
              value={selectedShip}
              onChange={e => setSelectedShip(e.target.value)}
              label="Select Ship"
            >
              {shipOptions.map((ship, index) => (
                <MenuItem key={index} value={ship}>
                  {ship}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {selectedShip && (
        <Grid container spacing={2} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <Bar
              options={chartOptions('Before Filter Particle Count')}
              data={createChartData(beforeFilterData, 'Before Filter')}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Bar
              options={chartOptions('After Filter Particle Count')}
              data={createChartData(afterFilterData, 'After Filter')}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ParticleCountCharts;
