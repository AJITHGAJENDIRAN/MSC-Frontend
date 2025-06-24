import React, { useState, useEffect } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import {
  DatePicker,
  Select,
  Button,
  Spin,
  Alert,
  Typography
} from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import ErrorBoundary from '../ErrorBoundary';

const { Option } = Select;
const { Title } = Typography;

const HCUTrendchartContent = () => {
  const [ships, setShips] = useState([]);
  const [selectedShip, setSelectedShip] = useState(null);
  const [startYear, setStartYear] = useState(dayjs().subtract(1, 'year').format('YYYY'));
  const [endYear, setEndYear] = useState(dayjs().format('YYYY'));
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShips();
  }, []);

  const fetchShips = async () => {
    try {
      const response = await axios.get("http://52.140.61.220:5000/api/ships");
      
      setShips(response.data);
    } catch (error) {
      setError('Failed to fetch ships');
      console.error('Error fetching ships:', error);
    }
  };

  const fetchChartData = async () => {
    if (!selectedShip) {
      setError('Please select a ship');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://52.140.61.220:5000/api/ship-hcu-details", {
        params: {
          ship: selectedShip,
          startYear,
          endYear
        }
      });

      const formattedData = response.data.map(item => ({
        hcuName: `${item.Sample_Point} (${item.Test_Date})`,
        '4 Micron': item.Particle_Count_4_Micron,
        '6 Micron': item.Particle_Count_6_Micron,
        '14 Micron': item.Particle_Count_14_Micron
      }));

      setChartData(formattedData);
    } catch (error) {
      setError('Failed to fetch chart data');
      console.error(error);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: '32px', background: '#f4f6f8', minHeight: '100vh' }}>
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ marginBottom: '8px', color: '#1a1a1a' }}>
            HCU Trend Analysis
          </Title>
        </div>

        <div
  style={{
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginBottom: '24px',
    overflowX: 'auto',      // Enables scrolling if it overflows
    whiteSpace: 'nowrap'    // Prevents wrapping
  }}
>
  <Select
    placeholder="Select Ship"
    style={{ minWidth: 200 }}
    onChange={setSelectedShip}
    value={selectedShip}
    size="large"
  >
    {ships.map((ship) => (
      <Option key={ship} value={ship}>
        {ship}
      </Option>
    ))}
  </Select>

  <DatePicker.RangePicker
    picker="year"
    value={[dayjs().year(parseInt(startYear)), dayjs().year(parseInt(endYear))]}
    onChange={(dates) => {
      if (dates) {
        setStartYear(dates[0].format('YYYY'));
        setEndYear(dates[1].format('YYYY'));
      }
    }}
    size="large"
  />

  <Button
    type="primary"
    onClick={fetchChartData}
    loading={loading}
    size="large"
    style={{ borderRadius: '6px' }}
  >
    Update Chart
  </Button>
</div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{
              marginBottom: '24px',
              borderRadius: '8px'
            }}
          />
        )}

        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '100px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <Spin size="large" />
          </div>
        ) : chartData.length === 0 ? (
          <div
            style={{
              background: 'white',
              padding: '32px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              textAlign: 'center',
              minHeight: '200px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Alert
              message="No Data Available"
              description="No HCU sample is available for this ship"
              type="info"
              showIcon
              style={{ borderRadius: '8px' }}
            />
          </div>
        ) : (
          <div
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}
          >
            <ResponsiveContainer width="100%" height={500}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="hcuName"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis
                  label={{
                    value: 'Particle Count',
                    angle: -90,
                    position: 'insideLeft',
                    offset: 10,
                    style: { fill: '#666' }
                  }}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#333' }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ marginBottom: 20 }} />
                <Bar dataKey="4 Micron" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="6 Micron" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="14 Micron" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

const HCUTrendchart = () => (
  <ErrorBoundary>
    <HCUTrendchartContent />
  </ErrorBoundary>
);

export default HCUTrendchart;
