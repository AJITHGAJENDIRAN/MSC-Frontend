import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import ParticleCountCharts from './Charts/ParticleCountCharts';
import axios from 'axios';

const ShipFilter = () => {
  const [particleData, setParticleData] = useState([]);

  useEffect(() => {
    // Fetch initial data
    fetchParticleData();
  }, []);

  const fetchParticleData = async () => {
    try {
      const response = await axios.get('http://172.16.21.6:5000/api/filtered-average-particle-count', {
        params: {
          start_date: '2022-03-01',
          end_date: '2025-03-15'
        }
      });
      setParticleData(response.data);
    } catch (error) {
      console.error('Error fetching particle data:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Ship Filtration Analysis
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <ParticleCountCharts data={particleData} />
        </Paper>
      </Box>
    </Container>
  );
       
};

export default ShipFilter;