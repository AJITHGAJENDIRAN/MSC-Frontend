import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import axios from 'axios';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { Alert, AlertTitle } from '@mui/lab';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer, LabelList
} from 'recharts';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';


import {
  Box, Button, Typography, MenuItem, CircularProgress, Grid, Card, CardContent, TextField
} from '@mui/material';
import { DatePicker } from 'antd';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Autocomplete from '@mui/material/Autocomplete';

dayjs.extend(customParseFormat);
const { RangePicker } = DatePicker;
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
// new code
const Dashboard1 = () => {
  const [shipOptions, setShipOptions] = useState([]);
  const [selectedShip, setSelectedShip] = useState('');
  const [dateRange, setDateRange] = useState([
  dayjs().subtract(1, 'year'),
  dayjs()
]);

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showExceededModal, setShowExceededModal] = useState(false);

  
  const fetchShipOptions = async () => {
  try {
    const response = await axios.get('http://52.140.61.220:5000/api/ships');
    const ships = Array.isArray(response.data?.ships)
      ? response.data.ships
      : Array.isArray(response.data)
      ? response.data
      : [];

    const sortedShips = ships.sort((a, b) => a.localeCompare(b));
    setShipOptions(sortedShips);

    // ✅ Set default selected ship to the first one
    if (sortedShips.length > 0) {
      setSelectedShip(sortedShips[0]);
    }
  } catch (error) {
    console.error('Error fetching ship options:', error);
    setShipOptions([]);
  }
};

  const alertRef = useRef(null);

  const handleExceededLabelClick = () => {
  if (exceededCount > 0) setShowExceededModal(true);
};


  const fetchDashboardData = useCallback(async () => {
    if (!selectedShip || !dateRange?.[0] || !dateRange?.[1]) return;
    setLoading(true);
    try {
      const response = await axios.get('http://52.140.61.220:5000/api/ship-summary', {
      // const response = await axios.get('http://127.0.0.1:5000/api/ship-summary', {
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

  const filterSampleDetails = Array.isArray(dashboardData?.filter_sample_details)
    ? dashboardData.filter_sample_details.filter(d => d.Ship === selectedShip)
    : [];


  const { normalCount, exceededCount } = useMemo(() => {
    let normalCount = 0;
    let exceededCount = 0;
    filterSampleDetails.forEach(sample => {
      const isBefore = sample.Sample_Point === 'BEFORE FILTER';
      const isAfter = sample.Sample_Point === 'AFTER FILTER';
      const exceed14 = (isBefore && sample.Particle_Count_14_Micron > 15) || (isAfter && sample.Particle_Count_14_Micron > 13);
      const exceed6 = (isBefore && sample.Particle_Count_6_Micron > 19) || (isAfter && sample.Particle_Count_6_Micron > 16);
      if (exceed14 || exceed6) exceededCount++;
      else normalCount++;
    });
    return { normalCount, exceededCount };
  }, [filterSampleDetails]);

  const filterSamplePieData = [
    { name: 'Normal Samples', value: normalCount },
    { name: 'Exceeded Limit Samples', value: exceededCount }
  ];


  const exceededSampleBarData = useMemo(() => {
  return filterSampleDetails.map(sample => {
    const label = `${sample.Test_Date || 'N/A'} - ${sample.Sample_Point}`;
    return {
      label,
      fourMicron: sample.Particle_Count_4_Micron,
      sixMicron: sample.Particle_Count_6_Micron,
      fourteenMicron: sample.Particle_Count_14_Micron,
      samplePoint: sample.Sample_Point,
    };
  });
}, [filterSampleDetails]);


  const sampleTypeData = dashboardData?.sample_type_count?.[selectedShip]
    ? Object.entries(dashboardData.sample_type_count[selectedShip]).map(([type, count]) => ({
        name: type,
        value: count
      }))
    : [];

  // const radialBarData = [
  //   {
  //     name: 'Purifier',
  //     value: dashboardData?.purifier_count?.[selectedShip] || 0,
  //     fill: '#82ca9d'
  //   },
  //   {
  //     name: 'HCU',
  //     value: dashboardData?.hcu_count?.[selectedShip] || 0,
  //     fill: '#8884d8'
  //   }
  // ];

  const hcuDetails = Array.isArray(dashboardData?.hcu_details)
    ? dashboardData.hcu_details.filter((d) => d.Ship === selectedShip)
    : [];


  const hcuDetailsWithLabel = hcuDetails.map((item) => ({
  ...item,
  label: `${item.Test_Date || 'N/A'} - ${item.Sample_Point || ''}`
}));

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
  // Check exceed limits in Filtered Average Particle Counts
// const exceededLimits = filterLineData.flatMap((d) => {
//   const exceeded = [];

//   if (d.micron === '6 Micron') {
//     if (d.Before > 19) exceeded.push(`${d.micron} - Before: ${d.Before}`);
//     if (d.After > 16) exceeded.push(`${d.micron} - After: ${d.After}`);
//   }
//   if (d.micron === '14 Micron') {
//     if (d.Before > 15) exceeded.push(`${d.micron} - Before: ${d.Before}`);
//     if (d.After > 13) exceeded.push(`${d.micron} - After: ${d.After}`);
//   }

//   return exceeded;
// });
const exceededLimits = useMemo(() => {
  const limits = [];
  filterLineData.forEach((d) => {
    const { micron, Before, After } = d;
    if (micron === '6 Micron') {
      if (Before > 19) limits.push({ label: `${micron} - Before Filter`, actual: Before, limit: 19 });
      if (After > 16) limits.push({ label: `${micron} - After Filter`, actual: After, limit: 16 });
    }
    if (micron === '14 Micron') {
      if (Before > 15) limits.push({ label: `${micron} - Before Filter`, actual: Before, limit: 15 });
      if (After > 13) limits.push({ label: `${micron} - After Filter`, actual: After, limit: 13 });
    }
  });
  return limits;
}, [filterLineData]);


 useEffect(() => {
  if (exceededLimits.length > 0 && alertRef.current) {
    alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}, [exceededLimits]);


 const exportToPDF = async () => {
  const input = document.getElementById('dashboard-charts');
  if (!input || !selectedShip) return;

  // Capture the chart as a high-res image
  const canvas = await html2canvas(input, {
    useCORS: true,
    backgroundColor: '#ffffff', // no shadow effect
    scale: 2 // improves sharpness
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pdfWidth - margin * 2;

  // Load logo
  const logoImage = new Image();
  logoImage.src = '/images/logo-removebg-preview.png';

  logoImage.onload = () => {
    const logoWidth = 35;
    const logoHeight = 12;
    const headerHeight = 25;

    // === Header ===
    // Left: Logo
    pdf.addImage(logoImage, 'PNG', margin, margin, logoWidth, logoHeight);

    // Right: Website link
    const linkText = 'www.theviswagroup.com';
    pdf.setFontSize(10);
    const textWidth = pdf.getStringUnitWidth(linkText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
    pdf.textWithLink(linkText, pdfWidth - margin - textWidth, margin + 5, {
      url: 'https://theviswagroup.com/',
    });

    // Centered Title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Ship Performance Report', pdfWidth / 2, margin + logoHeight + 5, { align: 'center' });

    // === Chart ===
    const imgHeight = (canvas.height * contentWidth) / canvas.width;
    const availableHeight = pdfHeight - headerHeight - 10;
    const finalHeight = Math.min(imgHeight, availableHeight); // fit to page if too large

    const xCentered = (pdfWidth - contentWidth) / 2;
    const yStart = headerHeight + 10;

    pdf.addImage(imgData, 'PNG', xCentered, yStart, contentWidth, finalHeight);

    // Save
    const fileName = `Ship Performance Report - ${selectedShip}.pdf`;
    pdf.save(fileName);
  };
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
      {/* <Box display="flex" gap={2} mb={4} alignItems="center" flexWrap="wrap">
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
  allowClear={false}
  ranges={{
    'Last 3 Months': [dayjs().subtract(3, 'month'), dayjs()],
    'Last 6 Months': [dayjs().subtract(6, 'month'), dayjs()],
    'Last 1 Year': [dayjs().subtract(1, 'year'), dayjs()],
    'Last 2 Year': [dayjs().subtract(2, 'year'), dayjs()],
  }}
/>

        <Button variant="contained" onClick={fetchDashboardData} disabled={!selectedShip}>
          Refresh
        </Button>
        <Button variant="outlined" onClick={exportToPDF} disabled={!dashboardData}>Export PDF</Button>
        
      </Box> */}
      <Box
  display="flex"
  alignItems="center"
  gap={2}
  mb={4}
  sx={{
    flexWrap: 'nowrap',
    overflowX: 'auto',
    '& > *': { whiteSpace: 'nowrap' }
  }}
>
<Autocomplete
  sx={{ minWidth: 500, minHeight: 20 }}
  options={shipOptions}
  value={selectedShip}
  onChange={(e, value) => setSelectedShip(value || '')}
  renderInput={(params) => (
    <TextField
      {...params}
      placeholder="Select Ship"        // 👈 Use placeholder instead of label
      variant="outlined"
      InputLabelProps={{ shrink: false }}
    />
  )}
/>


  <RangePicker
    value={dateRange}
    onChange={(dates) => dates?.[0] && dates?.[1] && setDateRange(dates)}
    format="YYYY-MM-DD"
    allowClear={false}
    ranges={{
      'Last 3 Months': [dayjs().subtract(3, 'month'), dayjs()],
      'Last 6 Months': [dayjs().subtract(6, 'month'), dayjs()],
      'Last 1 Year': [dayjs().subtract(1, 'year'), dayjs()],
      'Last 2 Year': [dayjs().subtract(2, 'year'), dayjs()],
    }}
    style={{ minWidth: 250 }}
  />

  <Button variant="contained" onClick={fetchDashboardData} disabled={!selectedShip}>
    Refresh
  </Button>
  <Button variant="outlined" onClick={exportToPDF} disabled={!dashboardData}>
    Export PDF
  </Button>
</Box>
{/* <Button variant="outlined" onClick={exportToExcel} disabled={!dashboardData}>Export Excel</Button> */}
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
                      {sampleTypeData.length === 0 ? (
  <Typography align="center" color="textSecondary">No data available for this date range</Typography>
) : (
  <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sampleTypeData}
                            dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      label
                          >
                            {sampleTypeData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      )}
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
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        Filter Sample Classification
      </Typography>
      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {(normalCount + exceededCount) === 0 ? (
            <Typography align="center" color="textSecondary">
              No filter sample data available
            </Typography>
          ) : (
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box width="60%" height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={filterSamplePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                      label
                    >
                      {filterSamplePieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              <Box width="35%" display="flex" flexDirection="column" gap={1}>
               {filterSamplePieData.map((entry, index) => (
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
    sx={{ cursor: entry.name === 'Exceeded Limit Samples' ? 'pointer' : 'default' }}
    onClick={entry.name === 'Exceeded Limit Samples' ? handleExceededLabelClick : undefined}
  >
    <span>{entry.name}</span>
    <span>{entry.value}</span>
  </Box>
))}
              </Box>
            </Box>
          )}
          <Box mt={2} textAlign="center">
            <Typography variant="subtitle1" fontWeight="bold">
              Total Samples: {normalCount + exceededCount}
            </Typography>
          </Box>
        </>
      )}
    </CardContent>
  </Card>
</Grid>




<Grid item xs={12}>
  <Card>
    <CardContent>
      <Typography variant="h6">HCU Particle Count</Typography>
      {hcuDetailsWithLabel.length === 0 ? (
  <Typography align="center" color="textSecondary">No data available for this date range</Typography>
) : (
  <ResponsiveContainer width="100%" height={350}>
        <BarChart data={hcuDetailsWithLabel}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
  dataKey="label"
  interval={0}
  angle={-20}
  textAnchor="end"
  height={60}
  tick={{ fontSize: 10 }} // 👈 This controls the font size
/>

          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Particle_Count_4_Micron" fill="#8884d8">
  <LabelList dataKey="Particle_Count_4_Micron" position="top" style={{ fontSize: 10 }} />
</Bar>
<Bar dataKey="Particle_Count_6_Micron" fill="#82ca9d">
  <LabelList dataKey="Particle_Count_6_Micron" position="top" style={{ fontSize: 10 }} />
</Bar>
<Bar dataKey="Particle_Count_14_Micron" fill="#ffc658">
  <LabelList dataKey="Particle_Count_14_Micron" position="top" style={{ fontSize: 10 }} />
</Bar>
        </BarChart>
      </ResponsiveContainer>
      )}
    </CardContent>
  </Card>
</Grid>


            <Grid item xs={12}>
              <Card>
                
                <CardContent>
                  <Typography variant="h6">Average HCU Particle Counts</Typography>
                  {avgHCUCounts.length === 0 ? (
  <Typography align="center" color="textSecondary">No data available for this date range</Typography>
) : (
  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={avgHCUCounts}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="Sample_Point" interval={0} angle={-20} textAnchor="end" height={60} />

                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="Average_Particle_Count_4_Micron" stroke="#8884d8" />
                      <Line type="monotone" dataKey="Average_Particle_Count_6_Micron" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="Average_Particle_Count_14_Micron" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                  )}
                  {/* <Box mt={2} textAlign="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total Avg 4μ: {avgHCUCounts.reduce((sum, d) => sum + d.Average_Particle_Count_4_Micron, 0)} | 6μ: {avgHCUCounts.reduce((sum, d) => sum + d.Average_Particle_Count_6_Micron, 0)} | 14μ: {avgHCUCounts.reduce((sum, d) => sum + d.Average_Particle_Count_14_Micron, 0)}
                    </Typography>
                  </Box> */}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                {/* {exceededLimits.length > 0 && (
  <Box mt={2}>
    <Alert severity="error" variant="outlined" sx={{ backgroundColor: '#fff5f5' }}>
      <AlertTitle>
        ⚠️ <strong>Exceeded Limits Detected</strong>
      </AlertTitle>
      <Box component="ul" sx={{ pl: 2, mb: 0 }}>
        {exceededLimits.map((msg, idx) => (
          <li key={idx}>
            <Typography variant="body2" color="error">
              {msg}
            </Typography>
          </li>
        ))}
      </Box>
    </Alert>
  </Box>
)} */}
               {/* {exceededLimits.length > 0 && (
  <Box mt={2}>
    <Alert severity="error" variant="outlined" sx={{ backgroundColor: '#fff5f5' }}>
      <AlertTitle>
        ⚠️ <strong>Exceeded Limits Detected</strong>
      </AlertTitle>
      <Box component="ul" sx={{ pl: 2, mb: 0 }}>
        {exceededLimits.map((item, idx) => (
          <li key={idx}>
            <Typography variant="body2" color="error">
              <strong>{item.label}</strong>: Limit = {item.limit}, Actual = {item.actual}
            </Typography>
          </li>
        ))}
      </Box>
    </Alert>
  </Box>
)} */}
  {exceededLimits.length > 0 && (
  <Box mt={2} ref={alertRef}>
    <Alert severity="error" variant="outlined" sx={{ backgroundColor: '#fff5f5' }}>
      <AlertTitle>
        ⚠️ <strong>Exceeded Limits Detected</strong>
      </AlertTitle>
      <Box component="ul" sx={{ pl: 2, mb: 0 }}>
        {exceededLimits.map((item, idx) => (
          <li key={idx}>
            <Typography variant="body2" color="error">
              <strong>{item.label}</strong>:  Actual = {item.actual} , MAN Limit = {item.limit}
            </Typography>
          </li>
        ))}
      </Box>
    </Alert>
  </Box>
)}
                <CardContent>
                  <Typography variant="h6">Filtered Average Particle Counts</Typography>
                 {filterLineData.every(d => d.Before === 0 && d.After === 0) ? (
  <Typography align="center" color="textSecondary">No data available for this date range</Typography>
) : (
  <ResponsiveContainer width="100%" height={300}>
  <LineChart data={filterLineData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="micron" />
    <YAxis />
    <Tooltip />
    <Legend />

    <Line
      type="monotone"
      dataKey="Before"
      stroke="#8884d8"
      name="Before Filter"
      label={({ x, y, value, index }) => {
        const micron = filterLineData[index].micron;
        if (
          (micron === '6 Micron' && value > 19) ||
          (micron === '14 Micron' && value > 15)
        ) {
          return (
            <text x={x} y={y - 10} fill="red" fontSize={12} textAnchor="middle">
              Exceed Limit
            </text>
          );
        }
        return null;
      }}
    />

    <Line
      type="monotone"
      dataKey="After"
      stroke="#82ca9d"
      name="After Filter"
      label={({ x, y, value, index }) => {
        const micron = filterLineData[index].micron;
        if (
          (micron === '6 Micron' && value > 16) ||
          (micron === '14 Micron' && value > 13)
        ) {
          return (
            <text x={x} y={y - 10} fill="red" fontSize={12} textAnchor="middle">
              Exceed Limit
            </text>
          );
        }
        return null;
      }}
    />
  </LineChart>
</ResponsiveContainer>
)}

                  {/* <Box mt={2} textAlign="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Total Before: {filterLineData.reduce((sum, d) => sum + d.Before, 0)} | After: {filterLineData.reduce((sum, d) => sum + d.After, 0)}
                    </Typography>
                  </Box> */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <Typography color="error" mt={4}>
          No data available. Please select a ship and date range.
        </Typography>
      )}

     <Dialog open={showExceededModal} onClose={() => setShowExceededModal(false)} maxWidth="md" fullWidth>
  <DialogTitle>Exceeded Filter Sample Limits</DialogTitle>
  <DialogContent>
 {exceededSampleBarData.length > 0 && (
  <Box mb={2}>
    <Alert severity="error" variant="outlined" sx={{ backgroundColor: '#fff5f5' }}>
      <AlertTitle>
        ⚠️ <strong>Exceeded Limits Detected</strong>
      </AlertTitle>
      <Box component="ul" sx={{ pl: 2, mb: 0 }}>
        {exceededSampleBarData
          .filter(sample =>
            (sample.samplePoint === 'BEFORE FILTER' && (sample.sixMicron > 19 || sample.fourteenMicron > 15)) ||
            (sample.samplePoint === 'AFTER FILTER' && (sample.sixMicron > 16 || sample.fourteenMicron > 13))
          )
          .map((sample, idx) => {
            const exceededDetails = [];

            if (
              (sample.samplePoint === 'BEFORE FILTER' && sample.sixMicron > 19) ||
              (sample.samplePoint === 'AFTER FILTER' && sample.sixMicron > 16)
            ) {
              const limit = sample.samplePoint === 'BEFORE FILTER' ? 19 : 16;
              exceededDetails.push(`6μ: Actual = ${sample.sixMicron}, MAN Limit = ${limit}`);
            }

            if (
              (sample.samplePoint === 'BEFORE FILTER' && sample.fourteenMicron > 15) ||
              (sample.samplePoint === 'AFTER FILTER' && sample.fourteenMicron > 13)
            ) {
              const limit = sample.samplePoint === 'BEFORE FILTER' ? 15 : 13;
              exceededDetails.push(`14μ: Actual = ${sample.fourteenMicron}, MAN Limit = ${limit}`);
            }

            return (
              <li key={idx}>
                <Typography variant="body2" color="error">
                  <strong>{sample.label}</strong> — {exceededDetails.join(' | ')}
                </Typography>
              </li>
            );
          })}
      </Box>
    </Alert>
  </Box>
    )}

    {filterLineData.length === 0 ? (
      <Typography>No data available</Typography>
    ) : (
     <ResponsiveContainer width="100%" height={400}>
  <BarChart data={exceededSampleBarData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis
      dataKey="label"
      angle={-20}
      textAnchor="end"
      interval={0}
      height={80}
      tick={{ fontSize: 10 }}
    />
    <YAxis />
    <Tooltip />
    <Legend />

    {/* 4 Micron (no limit, default color, show label) */}
    <Bar dataKey="fourMicron" name="4 Micron" fill="#ffc658">
      <LabelList
        dataKey="fourMicron"
        position="top"
        formatter={(value) => `${value}`}
      />
    </Bar>

    {/* 6 Micron (limit logic + label) */}
    <Bar dataKey="sixMicron" name="6 Micron">
      {exceededSampleBarData.map((entry, index) => {
        const limit = entry.samplePoint === 'BEFORE FILTER' ? 19 : 16;
        return (
          <Cell
            key={`6-${index}`}
            fill={entry.sixMicron > limit ? 'red' : '#82ca9d'}
          />
        );
      })}
      <LabelList
        dataKey="sixMicron"
        position="top"
        formatter={(value) => `${value}`}
      />
    </Bar>

    {/* 14 Micron (limit logic + label) */}
    <Bar dataKey="fourteenMicron" name="14 Micron">
      {exceededSampleBarData.map((entry, index) => {
        const limit = entry.samplePoint === 'BEFORE FILTER' ? 15 : 13;
        return (
          <Cell
            key={`14-${index}`}
            fill={entry.fourteenMicron > limit ? 'red' : '#8884d8'}
          />
        );
      })}
      <LabelList
        dataKey="fourteenMicron"
        position="top"
        formatter={(value) => `${value}`}
      />
    </Bar>
  </BarChart>
</ResponsiveContainer>
    )}
  </DialogContent>
</Dialog>


    </Box>
  );
};

export default Dashboard1;