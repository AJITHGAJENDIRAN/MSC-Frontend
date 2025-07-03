import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  Box, Typography, CircularProgress, Dialog, DialogTitle, DialogContent,
  Alert, AlertTitle, Card, CardContent
} from '@mui/material';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, CartesianGrid, XAxis, YAxis, Legend, Bar, LabelList
} from 'recharts';

const COLORS = ['#00C49F', '#FF8042'];

const MultiShipFilterPieChart = ({ selectedShips, dateRange }) => {
  const [loading, setLoading] = useState(false);
  const [filterSampleDetails, setFilterSampleDetails] = useState([]);
  const [showExceededModal, setShowExceededModal] = useState(false);

  useEffect(() => {
    if (!dateRange?.[0] || !dateRange?.[1]) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params = {
          start_date: dateRange[0].format('YYYY-MM-DD'),
          end_date: dateRange[1].format('YYYY-MM-DD'),
        };
        if (selectedShips.length > 0) params.ship = selectedShips.join(',');

        const response = await axios.get('http://52.140.61.220:5000/api/ship-summary', { params });

        const details = Array.isArray(response.data?.filter_sample_details)
          ? (selectedShips.length > 0
            ? response.data.filter_sample_details.filter(d => selectedShips.includes(d.Ship))
            : response.data.filter_sample_details)
          : [];

        setFilterSampleDetails(details);
      } catch (error) {
        console.error('Error fetching sample details:', error);
        setFilterSampleDetails([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedShips, dateRange]);

  const { normalCount, exceededCount, exceededSampleBarData } = useMemo(() => {
    let normal = 0;
    let exceeded = 0;
    const barData = [];

    filterSampleDetails.forEach(sample => {
      const isBefore = sample.Sample_Point === 'BEFORE FILTER';
      const isAfter = sample.Sample_Point === 'AFTER FILTER';

      const exceed14 = (isBefore && sample.Particle_Count_14_Micron > 15) || (isAfter && sample.Particle_Count_14_Micron > 13);
      const exceed6 = (isBefore && sample.Particle_Count_6_Micron > 19) || (isAfter && sample.Particle_Count_6_Micron > 16);

      if (exceed14 || exceed6) {
        exceeded++;
        barData.push({
          label: `${sample.Ship} - ${sample.Sample_Point} (${sample.Test_Date})`,
          samplePoint: sample.Sample_Point,
          fourMicron: sample.Particle_Count_4_Micron,
          sixMicron: sample.Particle_Count_6_Micron,
          fourteenMicron: sample.Particle_Count_14_Micron,
        });
      } else {
        normal++;
      }
    });

    return {
      normalCount: normal,
      exceededCount: exceeded,
      exceededSampleBarData: barData
    };
  }, [filterSampleDetails]);

  const pieData = [
    { name: 'Normal Samples', value: normalCount },
    { name: 'Exceeded Limit Samples', value: exceededCount },
  ];

  const handleExceededLabelClick = () => {
    if (exceededCount > 0) setShowExceededModal(true);
  };

  return (
    <Card>
      <CardContent>
       
        {loading ? (
          <Box textAlign="center" mt={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {(normalCount + exceededCount) === 0 ? (
              <Typography align="center" color="textSecondary">
                Please Select the ship & Date Range
              </Typography>
            ) : (
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box width="60%" height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        paddingAngle={3}
                        label
                      >
                        {pieData.map((entry, index) => (
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
                  {pieData.map((entry, index) => (
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

        {/* Dialog for Exceeded Samples */}
        <Dialog open={showExceededModal} onClose={() => setShowExceededModal(false)} maxWidth="md" fullWidth>
          <DialogTitle>Exceeded Filter Sample Limits</DialogTitle>
          <DialogContent>
            {exceededSampleBarData.length > 0 && (
              <Box mb={2}>
                <Alert severity="error" variant="outlined" sx={{ backgroundColor: '#fff5f5' }}>
                  <AlertTitle>⚠️ <strong>Exceeded Limits Detected</strong></AlertTitle>
                  <Box component="ul" sx={{ pl: 2, mb: 0 }}>
                    {exceededSampleBarData.map((sample, idx) => {
                      const details = [];
                      const sixLimit = sample.samplePoint === 'BEFORE FILTER' ? 19 : 16;
                      const fourteenLimit = sample.samplePoint === 'BEFORE FILTER' ? 15 : 13;

                      if (sample.sixMicron > sixLimit) details.push(`6μ: ${sample.sixMicron} (MAN Limit: ${sixLimit})`);
                      if (sample.fourteenMicron > fourteenLimit) details.push(`14μ: ${sample.fourteenMicron} (MAN Limit: ${fourteenLimit})`);

                      return (
                        <li key={idx}>
                          <Typography variant="body2" color="error">
                            <strong>{sample.label}</strong> — {details.join(' | ')}
                          </Typography>
                        </li>
                      );
                    })}
                  </Box>
                </Alert>
              </Box>
            )}
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={exceededSampleBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" angle={-20} textAnchor="end" interval={0} height={80} tick={{ fontSize: 10 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="fourMicron" name="4 Micron" fill="#ffc658">
                  <LabelList dataKey="fourMicron" position="top" />
                </Bar>
                <Bar dataKey="sixMicron" name="6 Micron">
                  {exceededSampleBarData.map((entry, index) => {
                    const limit = entry.samplePoint === 'BEFORE FILTER' ? 19 : 16;
                    return (
                      <Cell key={`six-${index}`} fill={entry.sixMicron > limit ? 'red' : '#82ca9d'} />
                    );
                  })}
                  <LabelList dataKey="sixMicron" position="top" />
                </Bar>
                <Bar dataKey="fourteenMicron" name="14 Micron">
                  {exceededSampleBarData.map((entry, index) => {
                    const limit = entry.samplePoint === 'BEFORE FILTER' ? 15 : 13;
                    return (
                      <Cell key={`fourteen-${index}`} fill={entry.fourteenMicron > limit ? 'red' : '#8884d8'} />
                    );
                  })}
                  <LabelList dataKey="fourteenMicron" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default MultiShipFilterPieChart;
