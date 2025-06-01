import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { monthlyData } from '../../data/mockData';
import { Box, Typography } from '@mui/material';

const ScatterChartComponent = () => {
  const chartStyles = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)'
    }
  };

  const customTooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    border: 'none',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    padding: '12px',
    fontSize: '14px'
  };

  return (
    <Box sx={chartStyles}>
      <Typography variant="h5" component="h3" sx={{ mb: 3, color: '#2c3e50', fontWeight: 600 }}>
        Scatter Analysis
      </Typography>
      <ResponsiveContainer width="100%" height="80%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="x-axis"
            stroke="#666"
            tick={{ fill: '#666' }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="y-axis"
            stroke="#666"
            tick={{ fill: '#666' }}
          />
          <Tooltip 
            contentStyle={customTooltipStyle}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px'
            }}
          />
          <Scatter 
            name="Data Points" 
            data={monthlyData} 
            fill="#6366f1"
            fillOpacity={0.8}
            strokeWidth={1}
            stroke="#4f46e5"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ScatterChartComponent;