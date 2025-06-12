import React, { useState, useEffect } from "react";
import { DatePicker, Spin, Alert } from "antd";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const ShipPurifierLineChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([
    dayjs().subtract(30, "days"),
    dayjs()
  ]);

  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        "http://172.16.21.6:5000/api/purifier-count",
        {
          params: {
            start_date: startDate,
            end_date: endDate
          }
        }
      );

      const formattedData = Object.entries(response.data)
        .map(([ship, count]) => ({
          ship_name: ship,
          count: count
        }))
        .sort((a, b) => b.count - a.count);

      setData(formattedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch purifier data. Please try again later.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData(
      dates[0].format("YYYY-MM-DD"),
      dates[1].format("YYYY-MM-DD")
    );
  }, [dates]);

  const handleDateChange = (newDates) => {
    if (!newDates) return;
    setDates(newDates);
  };

  const customTooltipStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    border: "1px solid #e8e8e8",
    borderRadius: "4px",
    padding: "10px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={customTooltipStyle}>
          <p style={{ margin: 0, fontWeight: "600" }}>{label}</p>
          <p style={{ margin: "8px 0 0", color: "#52c41a" }}>
            Purifier Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1a237e',
          margin: 0
        }}>Ship Purifier Distribution</h3>
        <RangePicker
          value={dates}
          onChange={handleDateChange}
          allowClear={false}
          style={{ borderRadius: '8px' }}
        />
      </div>

      {loading && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%"
        }}>
          <Spin size="large" />
        </div>
      )}

      {error && <Alert
        message={error}
        type="error"
        showIcon
        style={{ marginBottom: "16px", borderRadius: "8px" }}
      />}

      {!loading && !error && (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 30, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="ship_name"
              angle={-65}
              textAnchor="end"
              interval={0}
              height={100}
              tick={{ fill: "#4b5563", fontSize: '12px', fontWeight: '500' }}
            />
            <YAxis
              label={{
                value: "Purifier Count",
                angle: -90,
                position: "insideLeft",
                offset: 15,
                style: { fill: "#4b5563", fontSize: '14px', fontWeight: '500' }
              }}
              allowDecimals={false}
              tick={{ fill: "#4b5563", fontSize: '12px' }}
            />
           <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                padding: '12px'
              }}
              cursor={{ fill: 'rgba(82,196,26,0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey="count"
              name="Purifier Sample Count"
              fill="#52c41a"
              barSize={50}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ShipPurifierLineChart;
