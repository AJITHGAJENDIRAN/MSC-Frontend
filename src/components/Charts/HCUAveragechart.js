import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, DatePicker, Button, message } from 'antd';
import axios from 'axios';

const { Option } = Select;
const { RangePicker } = DatePicker;

const HCUAverageChart = () => {
  const [data, setData] = useState([]);
  const [ships, setShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState('');
  const [dates, setDates] = useState([]);

  useEffect(() => {
    fetchShips();
  }, []);

  const fetchShips = async () => {
    try {
      const response = await axios.get('http://14.97.168.235/api/ships');
      setShips(response.data);
    } catch (error) {
      console.error('Error fetching ships:', error);
      message.error('Error fetching ship names: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchData = async () => {
    if (dates.length !== 2) {
      message.error('Please select a valid date range');
      return;
    }

    const [startDate, endDate] = dates;
    try {
      const response = await axios.get('hhttp://14.97.168.235/api/average-particle-count', {
        params: {
          start_date: startDate.format('YYYY-MM-DD'),
          end_date: endDate.format('YYYY-MM-DD'),
          ship_name: selectedShip || 'all'
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      message.error(error.response?.data?.message || 'Error fetching data');
    }
  };

  return (
    <div className="chart-container" style={{
      background: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      margin: '20px'
    }}>
      <h3 style={{
        fontSize: '24px',
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: '24px'
      }}>HCU Average Particle Count Analysis</h3>
      <div style={{
  display: 'flex',
  flexWrap: 'nowrap',       // Ensures all elements stay in a single line
  gap: '16px',
  marginBottom: '24px',
  alignItems: 'center',
  justifyContent: 'flex-start', // Align items to the start of the container
  overflowX: 'auto'         // Allow horizontal scrolling if necessary
}}>
  <Select
    placeholder="Select Ship"
    style={{
      width: '240px',
      borderRadius: '6px',
    }}
    onChange={setSelectedShip}
    value={selectedShip}
    allowClear
  >
    {ships.map(ship => (
      <Option key={ship} value={ship}>{ship}</Option>
    ))}
  </Select>

  <RangePicker 
    onChange={setDates}
    style={{
      borderRadius: '6px',
    }}
  />

  <Button 
    type="primary" 
    onClick={fetchData}
    style={{
      borderRadius: '6px',
      height: '40px',
      padding: '0 24px',
      fontSize: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
  >
    Fetch Data
  </Button>
</div>


      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Sample_Point" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Average_Particle_Count_4_Micron" name="4 Micron" fill="#8884d8" />
          <Bar dataKey="Average_Particle_Count_6_Micron" name="6 Micron" fill="#82ca9d" />
          <Bar dataKey="Average_Particle_Count_14_Micron" name="14 Micron" fill="#ff7300" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HCUAverageChart;
