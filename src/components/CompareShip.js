import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer,
  // Removed RadialBarChart as it's less suitable for direct multi-comparison without significant re-design
} from 'recharts';

import {
  Box, Button, Typography, CircularProgress, Grid, Card, CardContent, TextField
} from '@mui/material';
import { DatePicker } from 'antd';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Autocomplete from '@mui/material/Autocomplete';

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6347', '#3CB371', '#BA55D3']; // More colors for multiple shipsconst Dashboard1 = () => {
const Compareship = () => {
    const [shipOptions, setShipOptions] = useState([]);
  // Changed selectedShip to selectedShips (an array)
  const [selectedShips, setSelectedShips] = useState([]);
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  // dashboardData will now store aggregated data for all selected ships
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // Added error state for API calls
  const dashboardRef = useRef(null);

  // --- Fallback Mock Data for all charts if API fails/is unreachable (e.g., in Canvas) ---
  // This function now generates data for multiple ships
  const generateComprehensiveFallbackData = (ships, currentStartDate, currentEndDate) => {
    const aggregatedData = {
      sample_type_count: {}, // { 'Oil Sample': { 'Ship A': 10, 'Ship B': 12 }, ... }
      purifier_count: {}, // { 'Ship A': 5, 'Ship B': 6 }
      hcu_count: {}, // { 'Ship A': 3, 'Ship B': 4 }
      hcu_details: [], // Flat array with 'Ship' property
      average_hcu_counts: [], // Flat array with 'Ship' property
      filter_average_counts: [], // Flat array with 'Ship' property
      maintenanceCosts: [], // Flat array with 'Ship' property
      portVisits: [], // Flat array with 'Ship' property
    };

    ships.forEach(shipName => {
      const startMoment = dayjs(currentStartDate || '2023-01-01');
      const endMoment = dayjs(currentEndDate || '2024-12-31');
      const numMonths = endMoment.diff(startMoment, 'month') + 1;

      // Sample Type Count (for Pie Chart - aggregated)
      const shipSampleTypes = [
        { type: 'Oil Sample', count: Math.floor(Math.random() * 50) + 10 + (shipName.includes('CATERINA') ? 10 : 0) },
        { type: 'Water Sample', count: Math.floor(Math.random() * 40) + 5 + (shipName.includes('ALPHA') ? 8 : 0) },
        { type: 'Fuel Sample', count: Math.floor(Math.random() * 30) + 5 + (shipName.includes('BETA') ? 6 : 0) },
        { type: 'Air Sample', count: Math.floor(Math.random() * 20) + 2 },
      ].filter(d => d.count > 0);

      shipSampleTypes.forEach(item => {
        if (!aggregatedData.sample_type_count[item.type]) {
          aggregatedData.sample_type_count[item.type] = {};
        }
        aggregatedData.sample_type_count[item.type][shipName] = item.count;
      });

      // Purifier & HCU Count
      aggregatedData.purifier_count[shipName] = Math.floor(Math.random() * 10) + 1 + (shipName.includes('CATERINA') ? 2 : 0);
      aggregatedData.hcu_count[shipName] = Math.floor(Math.random() * 8) + 1 + (shipName.includes('ALPHA') ? 1 : 0);

      // HCU Details (for Bar Chart)
      let hcuDate = dayjs(startMoment);
      for (let i = 0; i < numMonths; i++) {
        if (hcuDate.isAfter(endMoment, 'month')) break;
        aggregatedData.hcu_details.push({
          Ship: shipName,
          Sample_Point: `Point ${hcuDate.format('MMM YY')}`, // Using month as sample point for mock
          Particle_Count_4_Micron: Math.floor(Math.random() * 100) + 20,
          Particle_Count_6_Micron: Math.floor(Math.random() * 80) + 15,
          Particle_Count_14_Micron: Math.floor(Math.random() * 60) + 10,
        });
        hcuDate = hcuDate.add(1, 'month');
      }

      // Average HCU Counts (for Line Chart)
      let avgHcuDate = dayjs(startMoment);
      for (let i = 0; i < numMonths; i++) {
        if (avgHcuDate.isAfter(endMoment, 'month')) break;
        aggregatedData.average_hcu_counts.push({
          Ship: shipName,
          Sample_Point: `Point ${avgHcuDate.format('MMM YY')}`,
          Average_Particle_Count_4_Micron: (Math.random() * 3) + 1,
          Average_Particle_Count_6_Micron: (Math.random() * 2.5) + 0.8,
          Average_Particle_Count_14_Micron: (Math.random() * 2) + 0.5,
        });
        avgHcuDate = avgHcuDate.add(1, 'month');
      }

      // Filter Average Counts (for Line Chart)
      aggregatedData.filter_average_counts.push({
        Ship: shipName,
        Sample_Point: 'BEFORE FILTER',
        Average_Particle_Count_4_Micron: Math.floor(Math.random() * 200) + 100,
        Average_Particle_Count_6_Micron: Math.floor(Math.random() * 150) + 70,
        Average_Particle_Count_14_Micron: Math.floor(Math.random() * 100) + 40,
      });
      aggregatedData.filter_average_counts.push({
        Ship: shipName,
        Sample_Point: 'AFTER FILTER',
        Average_Particle_Count_4_Micron: Math.floor(Math.random() * 80) + 20,
        Average_Particle_Count_6_Micron: Math.floor(Math.random() * 50) + 10,
        Average_Particle_Count_14_Micron: Math.floor(Math.random() * 30) + 5,
      });

      // Maintenance Costs
      aggregatedData.maintenanceCosts.push(
        { Ship: shipName, category: 'Engine', cost: Math.floor(Math.random() * 15000) + 5000 },
        { Ship: shipName, category: 'Hull', cost: Math.floor(Math.random() * 10000) + 3000 },
        { Ship: shipName, category: 'Navigation', cost: Math.floor(Math.random() * 7000) + 2000 },
        { Ship: shipName, category: 'Electrical', cost: Math.floor(Math.random() * 8000) + 2500 },
      );

      // Port Visit Durations
      ['Singapore', 'Rotterdam', 'Long Beach', 'Shanghai', 'Busan'].forEach(port => {
        aggregatedData.portVisits.push({
          Ship: shipName,
          name: port,
          durationDays: Math.floor(Math.random() * 10) + 1,
        });
      });
    });

    return aggregatedData;
  };

  // --- Fetch Ship Options ---
  const fetchShipOptions = async () => {
    try {
      const response = await axios.get('http://52.140.61.220:5000/api/ships');
      let ships = Array.isArray(response.data?.ships)
        ? response.data.ships
        : Array.isArray(response.data)
          ? response.data
          : [];
      
      ships.sort((a, b) => a.localeCompare(b));
      setShipOptions(ships);

      // Set 'MSC CATERINA' as the initial default if available
      if (ships.includes('MSC CATERINA')) {
        setSelectedShips(['MSC CATERINA']);
      } else if (ships.length > 0) {
        setSelectedShips([ships[0]]); // Select the first ship if MSC CATERINA is not found
      } else {
        setSelectedShips([]); // No ships available
        setError('No ships available from the API.');
      }
    } catch (error) {
      console.error('Error fetching ship options:', error);
      setShipOptions([]);
      setSelectedShips([]); // Clear selection on error
      setError('Failed to fetch ship options. Please check network and API endpoint.');
    }
  };

  // --- Fetch Dashboard Data for all selected ships ---
  const fetchDashboardData = useCallback(async () => {
    if (selectedShips.length === 0 || !dateRange?.[0] || !dateRange?.[1]) {
      setDashboardData(null);
      setLoading(false);
      setError('Please select at least one ship and a valid date range.');
      return;
    }

    setLoading(true);
    setError(null);
    setDashboardData(null); // Clear previous data

    const startDateFormatted = dayjs(dateRange[0]).format('YYYY-MM-DD');
    const endDateFormatted = dayjs(dateRange[1]).format('YYYY-MM-DD');

    try {
      const shipDataPromises = selectedShips.map(ship =>
        axios.get('http://127.0.0.1:5000/api/ship-summary', {
          params: {
            ship: ship,
            start_date: startDateFormatted,
            end_date: endDateFormatted
          }
        }).then(res => ({ shipName: ship, data: res.data }))
      );

      const results = await Promise.allSettled(shipDataPromises);

      const aggregatedData = {
        sample_type_count: {},
        purifier_count: {},
        hcu_count: {},
        hcu_details: [],
        average_hcu_counts: [],
        filter_average_counts: [],
        maintenanceCosts: [],
        portVisits: [],
      };

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const { shipName, data } = result.value;

          // Aggregate sample_type_count
          if (data.sample_type_count && data.sample_type_count[shipName]) {
            Object.entries(data.sample_type_count[shipName]).forEach(([type, count]) => {
              if (!aggregatedData.sample_type_count[type]) {
                aggregatedData.sample_type_count[type] = {};
              }
              aggregatedData.sample_type_count[type][shipName] = count;
            });
          }

          // Aggregate purifier_count and hcu_count
          if (data.purifier_count) {
            aggregatedData.purifier_count[shipName] = data.purifier_count[shipName] || 0;
          }
          if (data.hcu_count) {
            aggregatedData.hcu_count[shipName] = data.hcu_count[shipName] || 0;
          }

          // Aggregate hcu_details (flat array, add ship name)
          if (Array.isArray(data.hcu_details)) {
            data.hcu_details.forEach(item => aggregatedData.hcu_details.push({ ...item, Ship: shipName }));
          }

          // Aggregate average_hcu_counts (flat array, add ship name)
          if (Array.isArray(data.average_hcu_counts)) {
            data.average_hcu_counts.forEach(item => aggregatedData.average_hcu_counts.push({ ...item, Ship: shipName }));
          }

          // Aggregate filter_average_counts (flat array, add ship name)
          if (Array.isArray(data.filter_average_counts)) {
            data.filter_average_counts.forEach(item => aggregatedData.filter_average_counts.push({ ...item, Ship: shipName }));
          }

          // Aggregate maintenanceCosts (flat array, add ship name)
          if (Array.isArray(data.maintenanceCosts)) {
            data.maintenanceCosts.forEach(item => aggregatedData.maintenanceCosts.push({ ...item, Ship: shipName }));
          }

          // Aggregate portVisits (flat array, add ship name)
          if (Array.isArray(data.portVisits)) {
            data.portVisits.forEach(item => aggregatedData.portVisits.push({ ...item, Ship: shipName }));
          }

        } else {
          console.warn(`Failed to fetch data for ship: ${result.reason?.config?.params?.ship || 'unknown'}. Error: ${result.reason?.message}`);
          setError(prev => (prev ? prev + `\nFailed to load data for some ships.` : `Failed to load data for some ships.`));
        }
      });

      setDashboardData(aggregatedData);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check backend API and CORS settings.');
      setDashboardData(null); // Clear data on major error
    } finally {
      setLoading(false);
    }
  }, [selectedShips, dateRange]);

  useEffect(() => {
    fetchShipOptions();
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- Data preparation for Charts (now handles multiple ships) ---

  // Sample Type Distribution (Pie Chart - Total across selected ships)
  const sampleTypeData = Object.entries(dashboardData?.sample_type_count || {}).map(([type, shipCounts]) => ({
    name: type,
    value: Object.values(shipCounts).reduce((sum, count) => sum + count, 0),
  })).filter(d => d.value > 0);

  // Purifier vs HCU Count (Bar Chart - each ship gets its own bars)
  const purifierHcuData = selectedShips.flatMap((ship, index) => {
    const purifierValue = dashboardData?.purifier_count?.[ship] || 0;
    const hcuValue = dashboardData?.hcu_count?.[ship] || 0;
    return [
      { name: `${ship} - Purifier`, value: purifierValue, fill: COLORS[index % COLORS.length] },
      { name: `${ship} - HCU`, value: hcuValue, fill: COLORS[(index + 1) % COLORS.length] },
    ].filter(d => d.value > 0);
  });


  // HCU Particle Count (Bar Chart - now grouped by Sample_Point, with bars for each ship/micron)
  const hcuParticleData = [];
  if (dashboardData?.hcu_details) {
    const groupedBySamplePoint = dashboardData.hcu_details.reduce((acc, item) => {
      const key = item.Sample_Point;
      if (!acc[key]) acc[key] = {};
      acc[key][item.Ship] = {
        '4 Micron': item.Particle_Count_4_Micron,
        '6 Micron': item.Particle_Count_6_Micron,
        '14 Micron': item.Particle_Count_14_Micron,
      };
      return acc;
    }, {});

    Object.entries(groupedBySamplePoint).forEach(([samplePoint, shipData]) => {
      const entry = { Sample_Point: samplePoint };
      selectedShips.forEach((ship, shipIndex) => {
        if (shipData[ship]) {
          entry[`${ship} - 4µ`] = shipData[ship]['4 Micron'];
          entry[`${ship} - 6µ`] = shipData[ship]['6 Micron'];
          entry[`${ship} - 14µ`] = shipData[ship]['14 Micron'];
        }
      });
      hcuParticleData.push(entry);
    });
  }


  // Average HCU Particle Counts (Line Chart - multiple lines per micron, one per ship)
  const avgHCUCounts = [];
  if (dashboardData?.average_hcu_counts) {
    const groupedBySamplePoint = dashboardData.average_hcu_counts.reduce((acc, item) => {
      const key = item.Sample_Point;
      if (!acc[key]) acc[key] = {};
      acc[key][item.Ship] = {
        '4 Micron': item.Average_Particle_Count_4_Micron,
        '6 Micron': item.Average_Particle_Count_6_Micron,
        '14 Micron': item.Average_Particle_Count_14_Micron,
      };
      return acc;
    }, {});

    Object.entries(groupedBySamplePoint).forEach(([samplePoint, shipData]) => {
      const entry = { Sample_Point: samplePoint };
      selectedShips.forEach((ship) => {
        if (shipData[ship]) {
          entry[`${ship} - Avg 4µ`] = shipData[ship]['4 Micron'];
          entry[`${ship} - Avg 6µ`] = shipData[ship]['6 Micron'];
          entry[`${ship} - Avg 14µ`] = shipData[ship]['14 Micron'];
        }
      });
      avgHCUCounts.push(entry);
    });
  }

  // Filtered Average Particle Counts (Line Chart - multiple lines for Before/After per ship)
  const filterLineData = [];
  if (dashboardData?.filter_average_counts) {
    const groupedByMicron = {};
    selectedShips.forEach(ship => {
      const shipFilterData = dashboardData.filter_average_counts.filter(d => d.Ship === ship);
      const before = shipFilterData.find(d => d.Sample_Point === 'BEFORE FILTER');
      const after = shipFilterData.find(d => d.Sample_Point === 'AFTER FILTER');

      ['4 Micron', '6 Micron', '14 Micron'].forEach(micron => {
        if (!groupedByMicron[micron]) groupedByMicron[micron] = { micron };
        groupedByMicron[micron][`${ship} - Before`] = before ? before[`Average_Particle_Count_${micron.replace(' Micron', '')}_Micron`] : 0;
        groupedByMicron[micron][`${ship} - After`] = after ? after[`Average_Particle_Count_${micron.replace(' Micron', '')}_Micron`] : 0;
      });
    });
    filterLineData.push(...Object.values(groupedByMicron));
  }

  // Maintenance Costs (Bar Chart - grouped by category, with bars for each ship)
  const maintenanceCostsData = [];
  if (dashboardData?.maintenanceCosts) {
    const groupedByCategory = dashboardData.maintenanceCosts.reduce((acc, item) => {
      const key = item.category;
      if (!acc[key]) acc[key] = { category: key };
      acc[key][item.Ship] = item.cost;
      return acc;
    }, {});
    maintenanceCostsData.push(...Object.values(groupedByCategory));
  }

  // Port Visit Durations (Bar Chart - grouped by port, with bars for each ship)
  const portVisitsData = [];
  if (dashboardData?.portVisits) {
    const groupedByPort = dashboardData.portVisits.reduce((acc, item) => {
      const key = item.name;
      if (!acc[key]) acc[key] = { name: key };
      acc[key][item.Ship] = item.durationDays;
      return acc;
    }, {});
    portVisitsData.push(...Object.values(groupedByPort));
  }


  const exportToPDF = async () => {
    const input = document.getElementById('dashboard-charts');
    if (!input) return;
    const canvas = await html2canvas(input, { useCORS: true, logging: true, allowTaint: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    let position = 0;
    // Calculate total height of the content to determine if multiple pages are needed
    const contentHeight = imgProps.height;
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);

    // Add subsequent pages if content overflows
    let heightLeft = contentHeight - pdfHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }
    pdf.save('dashboard.pdf');
  };

 

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        Ship Performance Dashboard
      </Typography>

      {/* Controls */}
      <Box display="flex" gap={2} mb={4} alignItems="center" flexWrap="wrap">
        <Autocomplete
          multiple // Allow multiple selections
          fullWidth
          options={shipOptions}
          value={selectedShips} // Value is now an array
          onChange={(event, newValue) => {
            setSelectedShips(newValue); // newValue is an array of selected options
          }}
          renderInput={(params) => <TextField {...params} label="Select Ship(s)" variant="outlined" />}
          disabled={shipOptions.length === 0 && !loading}
        />

        <RangePicker
          value={dateRange}
          onChange={(dates) => dates?.[0] && dates?.[1] && setDateRange(dates)}
          format="YYYY-MM-DD"
        />

        <Button variant="contained" onClick={fetchDashboardData} disabled={selectedShips.length === 0 || loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Apply Filters'}
        </Button>
        <Button variant="outlined" onClick={exportToPDF} disabled={!dashboardData || loading}>Export PDF</Button>
      </Box>

      {/* Dashboard Charts */}
      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /><Typography>Loading dashboard data...</Typography></Box>
      ) : error ? (
        <Typography color="error" mt={4}>{error}</Typography>
      ) : dashboardData && selectedShips.length > 0 ? ( // Ensure ships are selected to show data
        <Box id="dashboard-charts">
          <Grid container spacing={3}>
            {/* Sample Type Distribution (Pie Chart - Total across selected ships) */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sample Type Distribution (Total)
                  </Typography>
                  {sampleTypeData.length > 0 ? (
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
                              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            >
                              {sampleTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            {/* <Legend layout="vertical" align="right" verticalAlign="middle" /> */}
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
                  ) : <Typography>No data for Sample Type Distribution.</Typography>}
                  <Box mt={2} textAlign="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total samples: {sampleTypeData.reduce((acc, item) => acc + item.value, 0)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Purifier vs HCU Count (Bar Chart - comparative) */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Purifier vs HCU Count (Comparative)</Typography>
                  {purifierHcuData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={purifierHcuData} layout="vertical" margin={{ left: 100 }}> {/* Increased left margin for long names */}
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} /> {/* Adjust width for Y-axis labels */}
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <Typography>No data for Purifier vs HCU Count.</Typography>}
                  <Box mt={2} textAlign="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total: {purifierHcuData.reduce((acc, item) => acc + item.value, 0)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* HCU Particle Count (Bar Chart - comparative) */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">HCU Particle Count (Comparative by Sample Point)</Typography>
                  {hcuParticleData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={hcuParticleData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="Sample_Point" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedShips.map((ship, shipIndex) => (
                          <>
                            <Bar key={`${ship}-4µ`} dataKey={`${ship} - 4µ`} fill={COLORS[shipIndex % COLORS.length]} name={`${ship} (4µ)`} />
                            <Bar key={`${ship}-6µ`} dataKey={`${ship} - 6µ`} fill={COLORS[(shipIndex + 1) % COLORS.length]} name={`${ship} (6µ)`} />
                            <Bar key={`${ship}-14µ`} dataKey={`${ship} - 14µ`} fill={COLORS[(shipIndex + 2) % COLORS.length]} name={`${ship} (14µ)`} />
                          </>
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <Typography>No data for HCU Particle Count.</Typography>}
                </CardContent>
              </Card>
            </Grid>

            {/* Average HCU Particle Counts (Line Chart - comparative) */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Average HCU Particle Counts (Comparative)</Typography>
                  {avgHCUCounts.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={avgHCUCounts}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="Sample_Point" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedShips.map((ship, shipIndex) => (
                          <>
                            <Line key={`${ship}-avg4µ`} type="monotone" dataKey={`${ship} - Avg 4µ`} stroke={COLORS[shipIndex % COLORS.length]} name={`${ship} (Avg 4µ)`} />
                            <Line key={`${ship}-avg6µ`} type="monotone" dataKey={`${ship} - Avg 6µ`} stroke={COLORS[(shipIndex + 1) % COLORS.length]} name={`${ship} (Avg 6µ)`} />
                            <Line key={`${ship}-avg14µ`} type="monotone" dataKey={`${ship} - Avg 14µ`} stroke={COLORS[(shipIndex + 2) % COLORS.length]} name={`${ship} (Avg 14µ)`} />
                          </>
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <Typography>No data for Average HCU Particle Counts.</Typography>}
                </CardContent>
              </Card>
            </Grid>

            {/* Filtered Average Particle Counts (Line Chart - comparative) */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Filtered Average Particle Counts (Comparative)</Typography>
                  {filterLineData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={filterLineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="micron" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {selectedShips.map((ship, shipIndex) => (
                          <>
                            <Line key={`${ship}-before`} type="monotone" dataKey={`${ship} - Before`} stroke={COLORS[shipIndex % COLORS.length]} name={`${ship} (Before)`} />
                            <Line key={`${ship}-after`} type="monotone" dataKey={`${ship} - After`} stroke={COLORS[(shipIndex + 1) % COLORS.length]} name={`${ship} (After)`} />
                          </>
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : <Typography>No data for Filtered Average Particle Counts.</Typography>}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Typography color="textSecondary" mt={4}>
          Select ship(s) and a date range to view dashboard data.
        </Typography>
      )}
    </Box>
  );
};

export default Compareship;