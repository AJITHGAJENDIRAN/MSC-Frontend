import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import { DatePicker } from 'antd';
import {
  Box, Button, Typography, CircularProgress, Grid, Card, CardContent, TextField, Dialog, DialogTitle, DialogContent, Alert, AlertTitle, Divider
} from '@mui/material';
import { LabelList } from 'recharts';
import Autocomplete from '@mui/material/Autocomplete';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const { RangePicker } = DatePicker;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF', '#FF6347', '#3CB371', '#BA55D3'];

const Compareship = () => {
  const [shipOptions, setShipOptions] = useState([]);
  const [selectedShips, setSelectedShips] = useState({ ship1: '', ship2: '', ship3: '', ship4: '' });
  const [dateRange, setDateRange] = useState([
  dayjs().subtract(1, 'year'),
  dayjs(),
]);

  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedShipList = Object.values(selectedShips).filter(Boolean);

  const getFilteredOptions = (currentKey) => {
    return shipOptions.filter(
      (ship) => !Object.entries(selectedShips).some(([key, val]) => key !== currentKey && val === ship)
    );
  };

  const handleShipChange = (key, value) => {
    setSelectedShips((prev) => ({ ...prev, [key]: value || '' }));
  };

  const fetchShipOptions = async () => {
    try {
      const response = await axios.get('http://52.140.61.220:5000/api/ships');
      const ships = Array.isArray(response.data?.ships) ? response.data.ships : response.data || [];
      ships.sort((a, b) => a.localeCompare(b));
      setShipOptions(ships);
    } catch (err) {
      setError('Failed to fetch ship options.');
    }
  };

  const fetchDashboardData = useCallback(async () => {
    if (!selectedShipList.length || !dateRange[0] || !dateRange[1]) {
      setDashboardData({});
      setError('Please select at least one ship and valid date range.');
      return;
    }

    setLoading(true);
    setError(null);
    setDashboardData({});

    const startDate = dayjs(dateRange[0]).format('YYYY-MM-DD');
    const endDate = dayjs(dateRange[1]).format('YYYY-MM-DD');

    if (
  !selectedShipList.length ||
  !Array.isArray(dateRange) ||
  !dateRange[0]?.isValid?.() ||
  !dateRange[1]?.isValid?.()
) {
  setDashboardData({});
  setError('Please select at least one ship and a valid date range.');
  return;
}

    try {
      const promises = selectedShipList.map(ship =>
        axios.get('http://52.140.61.220:5000/api/ship-summary', {
          params: { ship, start_date: startDate, end_date: endDate }
        }).then(res => {
          const raw = res.data;
          const sampleTypeCount = raw.sample_type_count?.[ship] || {};
          const hcuDetails = raw.hcu_details?.filter(d => d.Ship === ship) || [];
          const avgHCUCounts = raw.average_hcu_counts?.filter(d => d.Ship === ship) || [];
          const filterSamples = raw.filter_sample_details?.filter(d => d.Ship === ship) || [];
          const filterAverages = raw.filter_average_counts?.filter(d => d.Ship === ship) || [];

          const hcuDetailsWithLabel = hcuDetails.map(d => ({
            label: d.Sample_Point,
            Particle_Count_4_Micron: d.Particle_Count_4_Micron,
            Particle_Count_6_Micron: d.Particle_Count_6_Micron,
            Particle_Count_14_Micron: d.Particle_Count_14_Micron,
          }));

          const before = filterAverages.find(f => f.Sample_Point === 'BEFORE FILTER') || {};
          const after = filterAverages.find(f => f.Sample_Point === 'AFTER FILTER') || {};

          const filterLineData = [
            { micron: '4 Micron', Before: before.Average_Particle_Count_4_Micron, After: after.Average_Particle_Count_4_Micron },
            { micron: '6 Micron', Before: before.Average_Particle_Count_6_Micron, After: after.Average_Particle_Count_6_Micron },
            { micron: '14 Micron', Before: before.Average_Particle_Count_14_Micron, After: after.Average_Particle_Count_14_Micron }
          ];

          const exceededLimits = [];
          filterLineData.forEach(d => {
            if (d.micron === '6 Micron') {
              if (d.Before > 19) exceededLimits.push({ label: 'Before 6 Micron', actual: d.Before, limit: 19 });
              if (d.After > 16) exceededLimits.push({ label: 'After 6 Micron', actual: d.After, limit: 16 });
            }
            if (d.micron === '14 Micron') {
              if (d.Before > 15) exceededLimits.push({ label: 'Before 14 Micron', actual: d.Before, limit: 15 });
              if (d.After > 13) exceededLimits.push({ label: 'After 14 Micron', actual: d.After, limit: 13 });
            }
          });

          let exceeded = 0, normal = 0;
          // const filterBarChartData = filterSamples.map(s => {
          //   const date = dayjs(s.testdate).format('YYYY-MM-DD');
          //   const label = `${s.vlims_lo_samp_point_Desc} (${date})`;

          //   let limit6 = 0, limit14 = 0;
          //   if (s.vlims_lo_samp_point_Desc === 'BEFORE FILTER') {
          //     limit6 = 19;
          //     limit14 = 15;
          //   } else {
          //     limit6 = 16;
          //     limit14 = 13;
          //   }

          //   const isExceeded = s.Particle_Count_6_Micron > limit6 || s.Particle_Count_14_Micron > limit14;
          //   isExceeded ? exceeded++ : normal++;

          //   return {
          //     label,
          //     Particle_Count_6_Micron: s.Particle_Count_6_Micron,
          //     Particle_Count_14_Micron: s.Particle_Count_14_Micron,
          //     limit6,
          //     limit14,
          //   };
          // });
              const filterBarChartData = filterSamples.map(s => {
  const date = dayjs(s.testdate || s.Test_Date || s.Sample_Date).format('YYYY-MM-DD');
  const samplePoint = s.vlims_lo_samp_point_Desc || s.Sample_Point || s.sample_point || 'UNKNOWN';
const label = `${samplePoint.toUpperCase()} (${date})`;



  let limit4 = 0, limit6 = 0, limit14 = 0;
  if (s.vlims_lo_samp_point_Desc === 'BEFORE FILTER') {
    limit4 = 25; // example, change if needed
    limit6 = 19;
    limit14 = 15;
  } else {
    limit4 = 20; // example, change if needed
    limit6 = 16;
    limit14 = 13;
  }

  const exceed4 = s.Particle_Count_4_Micron > limit4;
  const exceed6 = s.Particle_Count_6_Micron > limit6;
  const exceed14 = s.Particle_Count_14_Micron > limit14;

  const isExceeded = exceed4 || exceed6 || exceed14;
  isExceeded ? exceeded++ : normal++;

  return {
    label,
    Particle_Count_4_Micron: s.Particle_Count_4_Micron,
    Particle_Count_6_Micron: s.Particle_Count_6_Micron,
    Particle_Count_14_Micron: s.Particle_Count_14_Micron,
    exceed4,
    exceed6,
    exceed14
  };
});

          const filterSamplePieData = [
            { name: 'Exceeded Limit Samples', value: exceeded },
            { name: 'Normal Samples', value: normal }
          ];

          return {
            shipName: ship,
            data: {
              sample_type_count: sampleTypeCount,
              hcu_details_with_label: hcuDetailsWithLabel,
              avg_hcu_counts: avgHCUCounts,
              filter_line_data: filterLineData,
              filter_sample_pie_data: filterSamplePieData,
              filter_sample_bar_data: filterBarChartData,
              exceeded_limits: exceededLimits
            }
          };
        })
      );

      const results = await Promise.allSettled(promises);
      const aggregated = {};
      results.forEach(r => {
        if (r.status === 'fulfilled') {
          aggregated[r.value.shipName] = r.value.data;
        }
      });

      setDashboardData(aggregated);
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [selectedShipList, dateRange]);

  useEffect(() => { fetchShipOptions(); }, []);
  useEffect(() => { fetchDashboardData(); }, [selectedShips, dateRange]);

  return (
    <Box p={4}>
      <Typography variant="h5">Compare Ships Dashboard</Typography>

      <Grid container spacing={2} mb={2}>
        {['ship1', 'ship2', 'ship3', 'ship4'].map((key, idx) => (
          <Grid item xs={12} sm={6} md={3} key={key}>
            <Autocomplete
              options={getFilteredOptions(key)}
              value={selectedShips[key]}
              onChange={(e, val) => handleShipChange(key, val)}
              renderInput={(params) => <TextField {...params} label={`Ship ${idx + 1}`} />}
            />
          </Grid>
        ))}
        <Grid item xs={12} md={4}>
         <RangePicker
  value={dateRange}
  onChange={(dates) => {
    if (dates?.[0] && dates?.[1]) {
      setDateRange(dates);
    }
  }}
  format="YYYY-MM-DD"
  allowClear={false}
  ranges={{
    'Last 3 Months': [dayjs().subtract(3, 'month'), dayjs()],
    'Last 6 Months': [dayjs().subtract(6, 'month'), dayjs()],
    'Last 1 Year': [dayjs().subtract(1, 'year'), dayjs()],
    'Last 2 Years': [dayjs().subtract(2, 'year'), dayjs()],
  }}
  style={{ minWidth: 250 }}
/>

        </Grid>
        {(!dateRange[0] || !dateRange[1]) && (
  <Typography color="error" mt={2}>
    Please select a valid date range.
  </Typography>
)}
      </Grid>

      {loading ? <CircularProgress /> : error ? <Typography color="error">{error}</Typography> : (
        <Grid container spacing={3}>
          {selectedShipList.map(ship => (
            <Grid item xs={12} sm={6} md={6} key={ship}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{ship}</Typography>

                  {/* <Typography variant="subtitle2">Sample Type Count</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={Object.entries(dashboardData[ship]?.sample_type_count || {}).map(([name, value]) => ({ name, value }))}
                        dataKey="value"
                        nameKey="name"
                        label
                      >
                        {Object.entries(dashboardData[ship]?.sample_type_count || {}).map((_, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer> */}

                  {/* <Typography variant="subtitle2">Filter Sample Pie</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={dashboardData[ship]?.filter_sample_pie_data} dataKey="value" nameKey="name" label>
                        {dashboardData[ship]?.filter_sample_pie_data?.map((entry, idx) => (
                          <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>

                  <Typography variant="subtitle2">Filter Sample Details</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData[ship]?.filter_sample_bar_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" interval={0} angle={-20} height={60} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Particle_Count_6_Micron" fill="#8884d8" />
                      <Bar dataKey="Particle_Count_14_Micron" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>

                  <Typography variant="subtitle2">Before vs After Filter Averages</Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={dashboardData[ship]?.filter_line_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="micron" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      
                      <Line type="monotone" dataKey="Before" stroke="#ff7300" />
                      <Line type="monotone" dataKey="After" stroke="#387908" />
                    </LineChart>
                  </ResponsiveContainer> */}
                  {!dashboardData[ship]?.filter_sample_bar_data?.length ? (
  <Alert severity="info" sx={{ mt: 2 }}>
    During this date range, no samples are available for this ship: <strong>{ship}</strong>
  </Alert>
) : (
  <>
    <Typography variant="subtitle2">Filter Sample Pie-chart</Typography>
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={dashboardData[ship]?.filter_sample_pie_data} dataKey="value" nameKey="name" label>
          {dashboardData[ship]?.filter_sample_pie_data?.map((entry, idx) => (
            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
<Divider sx={{ my: 2 }} />
   <Typography variant="subtitle2">Filter Sample Details</Typography>
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={dashboardData[ship]?.filter_sample_bar_data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis
  dataKey="label"
  interval={0}
  angle={-10}
  textAnchor="end"
  height={80}
  tick={{
    fontSize: 9,
    fill: '#333',
  }}
/>
    <YAxis />
    <Tooltip />
    <Legend />

    {/* 4 Micron */}
    <Bar dataKey="Particle_Count_4_Micron" name="4 Micron" fill="#FFBB28">
      <LabelList
        content={({ x, y, value, index }) => {
          const item = dashboardData[ship]?.filter_sample_bar_data?.[index];
          return (
            <text
              x={x + 15}
              y={y - 5}
              fill={item?.exceed4 ? 'red' : 'black'}
              textAnchor="middle"
              fontSize={10}
            >
              {value}
            </text>
          );
        }}
      />
    </Bar>

    {/* 6 Micron */}
    <Bar dataKey="Particle_Count_6_Micron" name="6 Micron" fill="#8884d8">
      <LabelList
        content={({ x, y, value, index }) => {
          const item = dashboardData[ship]?.filter_sample_bar_data?.[index];
          return (
            <text
              x={x + 15}
              y={y - 5}
              fill={item?.exceed6 ? 'red' : 'black'}
              textAnchor="middle"
              fontSize={10}
            >
              {value}
            </text>
          );
        }}
      />
    </Bar>

    {/* 14 Micron */}
    <Bar dataKey="Particle_Count_14_Micron" name="14 Micron" fill="#82ca9d">
      <LabelList
        content={({ x, y, value, index }) => {
          const item = dashboardData[ship]?.filter_sample_bar_data?.[index];
          return (
            <text
              x={x + 15}
              y={y - 5}
              fill={item?.exceed14 ? 'red' : 'black'}
              textAnchor="middle"
              fontSize={10}
            >
              {value}
            </text>
          );
        }}
      />
    </Bar>
  </BarChart>
</ResponsiveContainer>
{dashboardData[ship]?.exceeded_limits?.length > 0 && (
  <Box mt={2}>
    <Alert severity="error" variant="outlined" sx={{ backgroundColor: '#fff5f5' }}>
      <AlertTitle>
        ⚠️ <strong>Exceeded Limits Detected</strong>
      </AlertTitle>
      <Box component="ul" sx={{ pl: 2, mb: 0 }}>
        {dashboardData[ship].exceeded_limits.map((item, idx) => (
          <li key={idx}>
            <Typography variant="body2" color="error">
              <strong>{item.label}</strong>: Actual = {item.actual} , MAN Limit = {item.limit}
            </Typography>
          </li>
        ))}
      </Box>
    </Alert>
  </Box>
)}
<Divider sx={{ my: 2 }} />
    <Typography variant="subtitle2">Before vs After Filter Averages</Typography>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={dashboardData[ship]?.filter_line_data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="micron" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
  type="monotone"
  dataKey="Before"
  stroke="#ff7300"
  name="Before Filter"
  label={({ x, y, value, index }) => {
    const micron = dashboardData[ship]?.filter_line_data?.[index]?.micron;
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
  stroke="#387908"
  name="After Filter"
  label={({ x, y, value, index }) => {
    const micron = dashboardData[ship]?.filter_line_data?.[index]?.micron;
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
    </>
)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Compareship;
