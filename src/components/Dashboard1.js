import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from 'recharts';

import {
  Box, Button, Typography, MenuItem, CircularProgress, Grid, Card, CardContent, TextField
} from '@mui/material';
import { DatePicker } from 'antd';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Autocomplete from '@mui/material/Autocomplete';

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard1 = () => {
  const [shipOptions, setShipOptions] = useState([]);
  const [selectedShip, setSelectedShip] = useState('');
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchShipOptions = async () => {
    try {
      const response = await axios.get('http://52.140.61.220:5000/api/ships');
      const ships = Array.isArray(response.data?.ships)
        ? response.data.ships
        : Array.isArray(response.data)
        ? response.data
        : [];
      setShipOptions(ships.sort((a, b) => a.localeCompare(b)));
    } catch (error) {
      console.error('Error fetching ship options:', error);
      setShipOptions([]);
    }
  };

  const fetchDashboardData = useCallback(async () => {
    if (!selectedShip || !dateRange?.[0] || !dateRange?.[1]) return;
    setLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/ship-summary', {
        params: {
          ship: selectedShip,
          start_date: dayjs(dateRange[0]).format('YYYY-MM-DD'),
          end_date: dayjs(dateRange[1]).format('YYYY-MM-DD')
        }
      });
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedShip, dateRange]);

  useEffect(() => {
    fetchShipOptions();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const sampleTypeData = dashboardData?.sample_type_count?.[selectedShip]
    ? Object.entries(dashboardData.sample_type_count[selectedShip]).map(([type, count]) => ({
        name: type,
        value: count
      }))
    : [];

  const radialBarData = [
    {
      name: 'Purifier',
      value: dashboardData?.purifier_count?.[selectedShip] || 0,
      fill: '#82ca9d'
    },
    {
      name: 'HCU',
      value: dashboardData?.hcu_count?.[selectedShip] || 0,
      fill: '#8884d8'
    }
  ];

  const hcuDetails = Array.isArray(dashboardData?.hcu_details)
    ? dashboardData.hcu_details.filter((d) => d.Ship === selectedShip)
    : [];

  const avgHCUCounts = Array.isArray(dashboardData?.average_hcu_counts)
    ? dashboardData.average_hcu_counts.filter((d) => d.Ship === selectedShip)
    : [];

  const filterAvgData = Array.isArray(dashboardData?.filter_average_counts)
    ? dashboardData.filter_average_counts.filter((d) => d.Ship === selectedShip)
    : [];

  const filterLineData = ['4 Micron', '6 Micron', '14 Micron'].map((micron) => {
    const before = filterAvgData.find(d => d.Sample_Point === 'BEFORE FILTER');
    const after = filterAvgData.find(d => d.Sample_Point === 'AFTER FILTER');
    return {
      micron,
      Before: before ? before[`Average_Particle_Count_${micron.replace(' Micron', '')}_Micron`] : 0,
      After: after ? after[`Average_Particle_Count_${micron.replace(' Micron', '')}_Micron`] : 0
    };
  });

  const exportToPDF = async () => {
    const input = document.getElementById('dashboard-charts');
    if (!input) return;
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('dashboard.pdf');
  };

//   const exportToExcel = () => {
//     const sheetData = [
//       ...sampleTypeData.map((d) => ({ Category: d.name, Count: d.value })),
//       ...radialBarData.map((d) => ({ Category: d.name, Count: d.value })),
//       ...hcuDetails,
//       ...avgHCUCounts,
//       ...filterAvgData
//     ];
//     const worksheet = XLSX.utils.json_to_sheet(sheetData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Dashboard');
//     XLSX.writeFile(workbook, 'dashboard.xlsx');
//   };

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        Ship Performance Dashboard
      </Typography>

      {/* Controls */}
      <Box display="flex" gap={2} mb={4} alignItems="center" flexWrap="wrap">
        <Autocomplete
          fullWidth
          options={shipOptions}
          value={selectedShip}
          onChange={(e, value) => setSelectedShip(value || '')}
          renderInput={(params) => <TextField {...params} label="Select Ship" variant="outlined" />}
        />

        <RangePicker
          value={dateRange}
          onChange={(dates) => dates?.[0] && dates?.[1] && setDateRange(dates)}
          format="YYYY-MM-DD"
        />

        <Button variant="contained" onClick={fetchDashboardData} disabled={!selectedShip}>
          Refresh
        </Button>
        <Button variant="outlined" onClick={exportToPDF} disabled={!dashboardData}>Export PDF</Button>
        {/* <Button variant="outlined" onClick={exportToExcel} disabled={!dashboardData}>Export Excel</Button> */}
      </Box>

      {/* Dashboard Charts */}
      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : dashboardData ? (
        <Box id="dashboard-charts">
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sample Type Distribution
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box width="60%" height={300}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sampleTypeData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={2}
                          >
                            {sampleTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                    <Box width="35%" display="flex" flexDirection="column" gap={1}>
                      {sampleTypeData.map((entry, index) => (
                        <Box
                          key={entry.name}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          bgcolor={COLORS[index % COLORS.length]}
                          px={2}
                          py={1}
                          borderRadius={1}
                          color="#fff"
                          fontWeight={600}
                        >
                          <span>{entry.name}</span>
                          <span>{entry.value}</span>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Box mt={2} textAlign="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                Total sample:{sampleTypeData.reduce((acc, item) => acc + item.value, 0)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card><CardContent>
                <Typography variant="h6">Purifier vs HCU Count</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={radialBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12}>
              <Card><CardContent>
                <Typography variant="h6">HCU Particle Count</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hcuDetails}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Sample_Point" />
                    <YAxis />
                    <Tooltip /><Legend />
                    <Bar dataKey="Particle_Count_4_Micron" fill="#8884d8" />
                    <Bar dataKey="Particle_Count_6_Micron" fill="#82ca9d" />
                    <Bar dataKey="Particle_Count_14_Micron" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12}>
              <Card><CardContent>
                <Typography variant="h6">Average HCU Particle Counts</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={avgHCUCounts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="Sample_Point" />
                    <YAxis />
                    <Tooltip /><Legend />
                    <Line type="monotone" dataKey="Average_Particle_Count_4_Micron" stroke="#8884d8" />
                    <Line type="monotone" dataKey="Average_Particle_Count_6_Micron" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="Average_Particle_Count_14_Micron" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </Grid>

            <Grid item xs={12}>
              <Card><CardContent>
                <Typography variant="h6">Filtered Average Particle Counts</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filterLineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="micron" />
                    <YAxis />
                    <Tooltip /><Legend />
                    <Line type="monotone" dataKey="Before" stroke="#8884d8" />
                    <Line type="monotone" dataKey="After" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent></Card>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Typography color="error" mt={4}>
          No data available. Please select a ship and date range.
        </Typography>
      )}
    </Box>
  );
};

export default Dashboard1;