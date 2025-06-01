import React from 'react';
import { Box, Grid } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ParticleCountCharts = ({ data }) => {
  // Filter data for before and after measurements
  const beforeFilterData = data.filter(item => item.vlims_lo_samp_point_Desc === 'BEFORE FILTER');
  const afterFilterData = data.filter(item => item.vlims_lo_samp_point_Desc === 'AFTER FILTER');

  const createChartData = (filteredData, title) => ({
    labels: ['4 Micron', '6 Micron', '14 Micron'],
    datasets: filteredData.map(item => ({
      label: item.Ship,
      data: [
        item.Average_Particle_Count_4_Micron,
        item.Average_Particle_Count_6_Micron,
        item.Average_Particle_Count_14_Micron
      ],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }))
  });

  const chartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Particle Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Particle Size'
        }
      }
    }
  });

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Line 
            options={chartOptions('Before Filter Particle Count')} 
            data={createChartData(beforeFilterData, 'Before Filter')}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Line 
            options={chartOptions('After Filter Particle Count')} 
            data={createChartData(afterFilterData, 'After Filter')}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ParticleCountCharts;