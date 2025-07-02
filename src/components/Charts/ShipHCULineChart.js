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

const ShipHCULineChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dates, setDates] = useState([dayjs().subtract(30, "days"), dayjs()]);

  const fetchData = async (startDate, endDate) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://127.0.0.1:5000/api/ship-hcu-count", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });

      const formattedData = Object.entries(response.data)
        .map(([ship, count]) => ({
          ship_name: ship,
          count: count,
        }))
        .sort((a, b) => b.count - a.count);

      setData(formattedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData(dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD"));
  }, [dates]);

  const handleDateChange = (newDates) => {
    if (!newDates) return;
    setDates(newDates);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1a237e",
          }}
        >
          Ship HCU Sample Count
        </span>
        <RangePicker
          size="small"
          value={dates}
          onChange={handleDateChange}
          allowClear={false}
          style={{ borderRadius: 6 }}
        />
      </div>

      {/* Loader */}
      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: 200,
            alignItems: "center",
          }}
        >
          <Spin size="large" />
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: "8px", borderRadius: 6 }}
        />
      )}

      {/* Chart */}
      {!loading && !error && (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="ship_name"
              angle={-60}
              textAnchor="end"
              interval={0}
              height={80}
              tick={{ fill: "#555", fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: "#555", fontSize: 11 }}
              label={{
                value: "Count",
                angle: -90,
                position: "insideLeft",
                offset: 10,
                style: { fill: "#333", fontSize: 12 },
              }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: 6,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
              cursor={{ fill: "rgba(24,144,255,0.1)" }}
            />
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "8px",
              }}
            />
            <Bar
              dataKey="count"
              name="HCU Count"
              fill="#1890ff"
              barSize={40}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ShipHCULineChart;
